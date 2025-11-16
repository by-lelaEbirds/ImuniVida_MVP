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
    const navItems = {
        home: document.querySelector('.nav-item[data-page="page-dashboard"]'),
        incentives: document.querySelector('.nav-item[data-page="page-incentives"]')
    };

    // --- NOVO (Item 2): Variáveis do Toast ---
    const toastElement = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    let toastTimeout; // Variável para controlar o timer do toast
    
    const rootPages = ['page-dashboard', 'page-incentives']; 
    const lightThemePages = ['page-login', 'page-add-dependent', 'page-schedule', 'page-calendar-ana', 'page-calendar-joao', 'page-calendar-generic'];

    // --- Variáveis de Refinamento (Login Simulado) ---
    const btnLoginGov = document.getElementById('btn-login-gov');
    const btnLoginGovOriginalHTML = btnLoginGov.innerHTML; // Salva o estado original do botão

    // --- Funções Principais ---

    /**
     * =================================================
     * NOVA FUNÇÃO: showToast (Item 2)
     * Substitui todos os 'alert()'.
     * =================================================
     */
    function showToast(message) {
        if (!toastElement || !toastMessage) return;

        // Limpa qualquer toast anterior
        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }

        toastMessage.innerText = message;
        toastElement.classList.add('show');

        // Esconde o toast depois de 2.5 segundos
        toastTimeout = setTimeout(() => {
            toastElement.classList.remove('show');
        }, 2500);
    }


    /**
     * Função de navegação principal
     */
    function showPage(pageId, direction = 'forward', originPageId = null) {
        const currentPage = document.querySelector('.page.active');
        const nextPage = document.getElementById(pageId);

        if (!nextPage || (currentPage && currentPage.id === pageId)) return;

        const isTabSwitch = rootPages.includes(currentPage?.id) && rootPages.includes(pageId);

        // 1. Limpa classes de animação de todas as páginas
        allPages.forEach(page => {
            page.classList.remove('inactive-left', 'inactive-right', 'tab-transition');
            if (page.id !== currentPage?.id) {
                page.style.opacity = 0;
                page.style.zIndex = 1;
            }
        });

        // 2. Lógica de Animação
        if (isTabSwitch) {
            if (currentPage) {
                currentPage.classList.remove('active');
                currentPage.style.opacity = 0;
                currentPage.style.zIndex = 1;
            }
            nextPage.classList.add('active');
            nextPage.style.opacity = 1;
            nextPage.style.zIndex = 10;

        } else if (direction === 'forward') {
            if (currentPage) {
                currentPage.classList.remove('active');
                currentPage.classList.add('inactive-left');
            }
            nextPage.classList.add('active');
            nextPage.style.opacity = 1;
            nextPage.style.zIndex = 10;

        } else if (direction === 'back') {
            if (currentPage) {
                currentPage.classList.remove('active');
                currentPage.classList.add('inactive-right');
            }
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
     * Lógica dos Ícones de Navegação
     */
    function updateBottomNav(pageId) {
        // Reseta ambos
        if (navItems.home) navItems.home.classList.remove('active');
        if (navItems.incentives) navItems.incentives.classList.remove('active');

        // Ativa o correto
        if (pageId === 'page-dashboard') {
            if (navItems.home) navItems.home.classList.add('active');
        } else if (pageId === 'page-incentives') {
            if (navItems.incentives) navItems.incentives.classList.add('active');
        }
    }

    // --- Lógica de Gamificação e Dependentes ---

    function getGameData() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY_GAME)) || { points: 0, badges: [] };
    }

    function saveGameData(data) {
        localStorage.setItem(STORAGE_KEY_GAME, JSON.stringify(data));
    }

    function updateIncentivesPage() {
        const data = getGameData();
        
        const pointsDisplay = document.getElementById('user-points-display');
        if (pointsDisplay) {
            pointsDisplay.innerText = data.points;
        }

        const rewardFarmaciaBtn = document.querySelector('#reward-farmacia .btn-redeem');
        if (rewardFarmaciaBtn) rewardFarmaciaBtn.disabled = data.points < 1000;
        
        const rewardIrBtn = document.querySelector('#reward-ir .btn-redeem');
        if (rewardIrBtn) rewardIrBtn.disabled = data.points < 5000;

        document.querySelectorAll('.badge').forEach(b => b.classList.add('locked'));
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

    /**
     * Cálculo de Idade (Sem alteração)
     */
    function renderDependentCard(dependent) {
        const today = new Date();
        const birthDate = new Date(dependent.dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        let ageText;
        if (age > 0) {
            ageText = `${age} ano${age > 1 ? 's' : ''}`;
        } else {
            // Calcula a idade em meses se for menor que 1 ano
            let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
            months -= birthDate.getMonth();
            months += today.getMonth();
            
            // Ajuste para o dia do mês
            if (today.getDate() < birthDate.getDate()) {
                months--;
            }
            
            if (months > 0) {
                ageText = `${months} me${months > 1 ? 'ses' : 's'}`;
            } else {
                ageText = 'Recém-nascido';
            }
        }
        
        const cardHTML = `
            <div class="card" data-page="page-calendar-generic" data-name="${dependent.name}" data-direction="forward">
                <img class="card-icon-img" src="https://picsum.photos/seed/${dependent.id}/80/80" alt="${dependent.name}">
                <div class="card-info">
                    <strong>${dependent.name} (${ageText})</strong>
                    <span>Calendário pendente</span>
                    <span class="status-pendente">Simulado</span>
                </div>
                <i class="card-arrow sf-font">❯</i>
            </div>
        `;
        if (dependentListContainer) {
            dependentListContainer.insertAdjacentHTML('beforeend', cardHTML);
        }
    }
    
    /*
    =================================================
    BLOCO: EFEITO 3D MOUSE-MOVE
    =================================================
    */
    
    const originalTransform = 'rotateX(3deg) rotateY(-4deg)';
    
    document.body.addEventListener('mousemove', (e) => {
        if (!simulator) return;

        const { clientX, clientY } = e;
        const { offsetWidth, offsetHeight } = document.body;
        const x = (clientX / offsetWidth) - 0.5;
        const y = (clientY / offsetHeight) - 0.5;
        
        // --- INÍCIO DA CORREÇÃO ---
        const maxRotate = 8; 
        const mouseRotateX = -1 * y * maxRotate;
        const mouseRotateY = x * maxRotate;
        
        // Soma a rotação base (do CSS) com a rotação do mouse
        const finalRotateX = 3 + mouseRotateX;
        const finalRotateY = -4 + mouseRotateY;
        
        simulator.style.transition = 'none';
        simulator.style.transform = `rotateX(${finalRotateX}deg) rotateY(${finalRotateY}deg)`;
        // --- FIM DA CORREÇÃO ---
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

    if(simulator) {
        simulator.addEventListener('click', (e) => {
            
            const loginTrigger = e.target.closest('#btn-login-gov');
            const navTrigger = e.target.closest('[data-page]');
            const actionTrigger = e.target.closest('#btn-confirm-vaccine');
            const redeemTrigger = e.target.closest('.btn-redeem');

            // Caso 0: Clique de Login Simulado
            if (loginTrigger && !loginTrigger.disabled) {
                e.preventDefault();
                e.stopPropagation();
                
                loginTrigger.disabled = true;
                
                loginTrigger.classList.add('is-loading'); 
                loginTrigger.innerHTML = '<i class="ph-spin">🔄</i> Autenticando...';

                setTimeout(() => {
                    showPage('page-dashboard', 'forward');
                    loginTrigger.disabled = false;
                    loginTrigger.classList.remove('is-loading');
                    loginTrigger.innerHTML = btnLoginGovOriginalHTML;
                }, 2000);
            }

            // Caso 1: Clique de Navegação
            else if (navTrigger && !actionTrigger && !redeemTrigger && !loginTrigger) {
                e.preventDefault(); 
                e.stopPropagation();
                const targetPage = navTrigger.dataset.page;
                const direction = navTrigger.dataset.direction || 'forward';
                const originPage = simulator.dataset.currentPage;

                if (targetPage === 'page-calendar-generic') {
                    const dependentName = navTrigger.dataset.name || 'Dependente';
                    const titleEl = document.getElementById('generic-calendar-title');
                    if(titleEl) titleEl.innerText = `Calendário (${dependentName})`;
                }
                showPage(targetPage, direction, originPage);
            
            // Caso 2: Clique de Ação (Confirmar Agendamento)
            } else if (actionTrigger) {
                e.preventDefault(); 
                e.stopPropagation();
                
                let gameData = getGameData();
                gameData.points += 100;
                
                showToast("Agendamento Confirmado! 🏆 +100 Pontos Imuni!");

                if (!gameData.badges.includes('first-dose')) {
                    gameData.badges.push('first-dose');
                    setTimeout(() => {
                        showToast("Medalha Desbloqueada: Primeira Dose!");
                    }, 1000);
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
                    showToast(`Recompensa resgatada! Você gastou ${cost} pontos.`);
                } else {
                    showToast('Pontos insuficientes para resgatar esta recompensa.');
                }
            }
        });
    }

    // Formulário de Adicionar Dependente
    if (formAddDependent) {
        formAddDependent.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('input-name');
            const dobInput = document.getElementById('input-dob');
            
            if(!nameInput || !dobInput) return;

            const name = nameInput.value;
            const dob = dobInput.value;
            if (!name || !dob) return; 

            const newDependent = { id: Date.now(), name: name, dob: dob };
            saveDependent(newDependent);
            renderDependentCard(newDependent); 
            showPage('page-dashboard', 'back'); 
            formAddDependent.reset();
        });
    }

    /*
    =================================================
    MÁGICA DO SCROLL (Collapsing Header)
    =================================================
    */
    function initializeScrollMagic() {
        const pagesWithNav = document.querySelectorAll('.page-with-nav');
        
        pagesWithNav.forEach(page => {
            const contentArea = page.querySelector('.content');
            if (contentArea) {
                contentArea.addEventListener('scroll', () => {
                    const scrollTop = contentArea.scrollTop;
                    const scrollThreshold = 30;
                    if (scrollTop > scrollThreshold) {
                        page.classList.add('scrolled');
                    } else {
                        page.classList.remove('scrolled');
                    }
                });
            }
        });
    }

    // --- Inicialização ---
    loadDependents(); 
    updateIncentivesPage();
    initializeScrollMagic();
    
    // Inicia na tela de homescreen (simulação de boot)
    updateBottomNav('page-homescreen'); // Garante que nenhum ícone esteja ativo
    if(simulator) {
        simulator.classList.remove('nav-is-visible');
        simulator.dataset.theme = 'dark';
    }
});
