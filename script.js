document.addEventListener('DOMContentLoaded', () => {
    
    // --- Variáveis Globais ---
    const simulator = document.querySelector('.iphone-simulator');
    const allPages = document.querySelectorAll('.page');
    const formAddDependent = document.getElementById('form-add-dependent');
    const dependentListContainer = document.getElementById('dependent-list-container');
    const scheduleBackButton = document.getElementById('schedule-back-button');
    const STORAGE_KEY_DEPENDENTS = 'imuniVidaDependents';
    const STORAGE_KEY_GAME = 'imuniVidaGame';
    
    // Ícones da Barra de Navegação
    const navIcons = {
        home: document.querySelector('.nav-item[data-page="page-dashboard"] i'),
        incentives: document.querySelector('.nav-item[data-page="page-incentives"] i')
    };
    
    const rootPages = ['page-dashboard', 'page-incentives']; 
    const lightThemePages = ['page-login', 'page-add-dependent', 'page-schedule', 'page-calendar-ana', 'page-calendar-joao', 'page-calendar-generic'];

    // --- Variáveis de Refinamento (Login Simulado) ---
    const btnLoginGov = document.getElementById('btn-login-gov');
    const btnLoginGovOriginalHTML = btnLoginGov.innerHTML; // Salva o estado original do botão

    // --- Funções Principais ---

    /**
     * Função de navegação principal (V11)
     * Bug de sobreposição CORRIGIDO
     */
    function showPage(pageId, direction = 'forward', originPageId = null) {
        const currentPage = document.querySelector('.page.active');
        const nextPage = document.getElementById(pageId);

        if (!nextPage || (currentPage && currentPage.id === pageId)) return;

        const isTabSwitch = rootPages.includes(currentPage.id) && rootPages.includes(pageId);

        // 1. Limpa classes de animação de todas as páginas
        allPages.forEach(page => {
            page.classList.remove('inactive-left', 'inactive-right', 'tab-transition');
            // Esconde todas as páginas que não são a atual
            if (page.id !== currentPage.id) {
                page.style.opacity = 0;
                page.style.zIndex = 1;
            }
        });

        // 2. Lógica de Animação
        if (isTabSwitch) {
            // *** CORREÇÃO DO BUG DE SOBREPOSIÇÃO ***
            // Troca de aba é INSTANTÂNEA. Sem animação, sem sobreposição.
            currentPage.classList.remove('active');
            currentPage.style.opacity = 0;
            currentPage.style.zIndex = 1;
            
            nextPage.classList.add('active');
            nextPage.style.opacity = 1;
            nextPage.style.zIndex = 10;

        } else if (direction === 'forward') {
            // Navegação "para frente" (Slide)
            currentPage.classList.remove('active');
            currentPage.classList.add('inactive-left'); // Animação de saída
            
            nextPage.classList.add('active');
            nextPage.style.opacity = 1;
            nextPage.style.zIndex = 10;

        } else if (direction === 'back') {
            // Navegação "para trás" (Slide)
            currentPage.classList.remove('active');
            currentPage.classList.add('inactive-right'); // Animação de saída
            
            nextPage.classList.add('active');
            nextPage.style.opacity = 1;
            nextPage.style.zIndex = 10;
        }

        // 3. Atualiza Tema da Status Bar
        simulator.dataset.theme = lightThemePages.includes(pageId) ? 'light' : 'dark';

        // 4. Lógica do Botão Voltar
        if (pageId === 'page-schedule' && originPageId) {
            scheduleBackButton.dataset.page = originPageId;
        }
        
        // 5. Controla visibilidade da Tab Bar
        simulator.classList.toggle('nav-is-visible', rootPages.includes(pageId));

        // 6. Atualiza o ícone ativo da Tab Bar
        updateBottomNav(pageId);

        // 7. Atualiza o estado global
        simulator.dataset.currentPage = pageId;

        // 8. Se for a tela de incentivos, atualiza os pontos
        if (pageId === 'page-incentives') {
            updateIncentivesPage();
        }
    }

    /**
     * Atualiza os ícones da barra de navegação (V11 - Phosphor)
     * CORRIGIDO para o bug do ícone invisível
     */
    function updateBottomNav(pageId) {
        const navButtons = document.querySelectorAll('.nav-item');
        navButtons.forEach(button => button.classList.remove('active'));

        // Reseta todos os ícones para "regular" (vazado)
        navIcons.home.className = 'ph-regular ph-house';
        navIcons.incentives.className = 'ph-regular ph-star';

        if (pageId === 'page-dashboard') {
            navButtons[0].classList.add('active');
            navIcons.home.className = 'ph-fill ph-house'; // Preenchido
        } else if (pageId === 'page-incentives') {
            navButtons[1].classList.add('active');
            navIcons.incentives.className = 'ph-fill ph-star'; // Preenchido
        }
    }

    // --- Lógica de Gamificação e Dependentes ---

    function getGameData() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_GAME)) || { points: 0, badges: [] };
    }

    function saveGameData(data) {
        localStorage.setItem(STORAGE_KEY_GAME, JSON.stringify(data));
    }

    /**
     * Atualiza a UI da tela de Incentivos com dados do localStorage
     */
    function updateIncentivesPage() {
        const data = getGameData();
        
        document.getElementById('user-points-display').innerText = data.points;

        const rewardFarmaciaBtn = document.querySelector('#reward-farmacia .btn-redeem');
        if (rewardFarmaciaBtn) rewardFarmaciaBtn.disabled = data.points < 1000;
        
        const rewardIrBtn = document.querySelector('#reward-ir .btn-redeem');
        if (rewardIrBtn) rewardIrBtn.disabled = data.points < 5000;

        // Reseta todas as medalhas para 'locked'
        document.querySelectorAll('.badge').forEach(b => b.classList.add('locked'));
        // Desbloqueia as que estão no save
        data.badges.forEach(badgeId => {
            const badgeEl = document.querySelector(`[data-badge-id="${badgeId}"]`);
            if (badgeEl) badgeEl.classList.remove('locked');
        });
    }

    function loadDependents() {
        const dependents = JSON.parse(localStorage.getItem(STORAGE_KEY_DEPENDENTS)) || [];
        dependents.forEach(renderDependentCard);
    }

    function saveDependent(dependent) {
        const dependents = JSON.parse(localStorage.getItem(STORAGE_KEY_DEPENDENTS)) || [];
        dependents.push(dependent);
        localStorage.setItem(STORAGE_KEY_DEPENDENTS, JSON.stringify(dependents));
    }

    function renderDependentCard(dependent) {
        const age = new Date().getFullYear() - new Date(dependent.dob).getFullYear();
        const ageText = age > 0 ? `${age} anos` : 'menos de 1 ano';
        
        const cardHTML = `
            <div class="card" data-page="page-calendar-generic" data-name="${dependent.name}" data-direction="forward">
                <img class="card-icon-img" src="https://picsum.photos/seed/${dependent.id}/80/80" alt="${dependent.name}">
                <div class="card-info">
                    <strong>${dependent.name} (${ageText})</strong>
                    <span>Calendário pendente</span>
                    <span class="status-pendente">Simulado</span>
                </div>
                <i class="ph ph-caret-right card-arrow"></i>
            </div>
        `;
        dependentListContainer.insertAdjacentHTML('beforeend', cardHTML);
    }
    
    /*
    =================================================
    BLOCO: EFEITO 3D MOUSE-MOVE (Adicionado anteriormente)
    =================================================
    */
    
    const originalTransform = 'rotateX(3deg) rotateY(-4deg)';
    
    document.body.addEventListener('mousemove', (e) => {
        if (!simulator) return;

        const { clientX, clientY } = e;
        const { offsetWidth, offsetHeight } = document.body;
        const x = (clientX / offsetWidth) - 0.5;
        const y = (clientY / offsetHeight) - 0.5;
        const maxRotate = 8; 
        const rotateX = -1 * y * maxRotate;
        const rotateY = x * maxRotate;

        simulator.style.transition = 'none';
        simulator.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    document.body.addEventListener('mouseleave', () => {
        if (!simulator) return;
        simulator.style.transition = 'transform 0.3s ease-out';
        simulator.style.transform = originalTransform;
    });

    /*
    =================================================
    FIM DO BLOCO 3D
    =================================================
    */

    // --- Event Listeners ---

    simulator.addEventListener('click', (e) => {
        
        // --- REFINAMENTO: Lógica de Simulação de Login ---
        // Variáveis de gatilho
        const loginTrigger = e.target.closest('#btn-login-gov');
        const navTrigger = e.target.closest('[data-page]');
        const actionTrigger = e.target.closest('#btn-confirm-vaccine');
        const redeemTrigger = e.target.closest('.btn-redeem');

        // Caso 0: Clique de Login Simulado (DEVE VIR PRIMEIRO)
        if (loginTrigger && !loginTrigger.disabled) {
            e.preventDefault();
            e.stopPropagation();
            
            // Desabilita e mostra o loading
            loginTrigger.disabled = true;
            loginTrigger.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Autenticando...';

            // Simula a autenticação (2 segundos)
            setTimeout(() => {
                showPage('page-dashboard', 'forward');
                
                // Reseta o botão para o estado original
                loginTrigger.disabled = false;
                loginTrigger.innerHTML = btnLoginGovOriginalHTML;
            }, 2000);
        }

        // Caso 1: Clique de Navegação (Padrão)
        // (Garante que os outros gatilhos não sejam de navegação)
        else if (navTrigger && !actionTrigger && !redeemTrigger && !loginTrigger) {
            e.preventDefault(); e.stopPropagation();
            const targetPage = navTrigger.dataset.page;
            const direction = navTrigger.dataset.direction || 'forward';
            const originPage = simulator.dataset.currentPage;

            if (targetPage === 'page-calendar-generic') {
                const dependentName = navTrigger.dataset.name || 'Dependente';
                document.getElementById('generic-calendar-title').innerText = `Calendário (${dependentName})`;
            }
            showPage(targetPage, direction, originPage);
        
        // Caso 2: Clique de Ação (Confirmar Agendamento)
        } else if (actionTrigger) {
            e.preventDefault(); e.stopPropagation();
            
            let gameData = getGameData();
            gameData.points += 100;
            alert("Agendamento Confirmado! 🏆 +100 Pontos Imuni!");

            if (!gameData.badges.includes('first-dose')) {
                gameData.badges.push('first-dose');
                alert("Medalha Desbloqueada: Primeira Dose!");
            }
            
            saveGameData(gameData);
            showPage('page-dashboard', 'back');
        
        // Caso 3: Clique de Resgate de Recompensa
        } else if (redeemTrigger && !redeemTrigger.disabled) {
            e.preventDefault();
            e.stopPropagation();
            const rewardCard = redeemTrigger.closest('.reward-card');
            const cost = rewardCard.id === 'reward-farmacia' ? 1000 : 5000;
            let gameData = getGameData();

            if (gameData.points >= cost) {
                gameData.points -= cost;
                saveGameData(gameData);
                updateIncentivesPage();
                alert(`Recompensa resgatada! Você gastou ${cost} pontos.`);
            } else {
                alert('Pontos insuficientes para resgatar esta recompensa.');
            }
        }
    });

    // Formulário de Adicionar Dependente
    formAddDependent.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('input-name').value;
        const dob = document.getElementById('input-dob').value;
        if (!name || !dob) return; 

        const newDependent = { id: Date.now(), name: name, dob: dob };
        saveDependent(newDependent);
        renderDependentCard(newDependent); 
        showPage('page-dashboard', 'back'); 
        formAddDependent.reset();
    });

    // --- Inicialização ---
    loadDependents(); 
    updateIncentivesPage(); // Carrega pontos e medalhas
    simulator.classList.remove('nav-is-visible');
    simulator.dataset.theme = 'dark';
});
