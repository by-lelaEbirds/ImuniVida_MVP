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
    const navIconData = document.getElementById('nav-icon-data');
    const navIcons = {
        home: {
            outline: navIconData.dataset.homeOutline,
            fill: navIconData.dataset.homeFill
        },
        incentives: {
            outline: navIconData.dataset.incentivesOutline,
            fill: navIconData.dataset.incentivesFill
        }
    };
    const navIconImgs = {
        home: document.getElementById('nav-icon-home'),
        incentives: document.getElementById('nav-icon-incentives')
    };

    const rootPages = ['page-dashboard', 'page-incentives']; 
    const lightThemePages = ['page-login', 'page-add-dependent', 'page-schedule', 'page-calendar-ana', 'page-calendar-joao', 'page-calendar-generic'];

    // --- Funções Principais ---

    /**
     * Função de navegação principal (V10)
     * Corrigida para eliminar bugs de sobreposição
     */
    function showPage(pageId, direction = 'forward', originPageId = null) {
        const currentPage = document.querySelector('.page.active');
        const nextPage = document.getElementById(pageId);

        if (!nextPage || (currentPage && currentPage.id === pageId)) return;

        const isTabSwitch = rootPages.includes(currentPage.id) && rootPages.includes(pageId);

        // 1. Limpa todas as páginas
        allPages.forEach(page => {
            page.classList.remove('active', 'inactive-left', 'inactive-right', 'tab-transition');
            if (page.id !== currentPage.id) {
                page.style.zIndex = 1; // Reseta z-index
                page.style.opacity = 0; // Esconde
            }
        });

        // 2. Lógica de Animação
        if (isTabSwitch) {
            // Troca de aba (Início <-> Incentivos)
            currentPage.classList.add('tab-transition');
            nextPage.classList.add('tab-transition');
            
            currentPage.classList.remove('active');
            currentPage.style.opacity = 0;
            currentPage.style.zIndex = 1;
            
            nextPage.classList.add('active');
            nextPage.style.opacity = 1;
            nextPage.style.zIndex = 10;

        } else if (direction === 'forward') {
            // Navegação "para frente"
            currentPage.classList.remove('active');
            currentPage.classList.add('inactive-left'); // Animação de saída
            
            nextPage.classList.add('active');
            nextPage.style.opacity = 1;
            nextPage.style.zIndex = 10;

        } else if (direction === 'back') {
            // Navegação "para trás"
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
     * Atualiza os ícones da barra de navegação (V10 - Prova de falhas)
     */
    function updateBottomNav(pageId) {
        const navButtons = document.querySelectorAll('.nav-item');
        navButtons.forEach(button => button.classList.remove('active'));

        // Reseta todos para "outline"
        navIconImgs.home.src = navIcons.home.outline;
        navIconImgs.incentives.src = navIcons.incentives.outline;

        if (pageId === 'page-dashboard') {
            navButtons[0].classList.add('active');
            navIconImgs.home.src = navIcons.home.fill; // Ativo
        } else if (pageId === 'page-incentives') {
            navButtons[1].classList.add('active');
            navIconImgs.incentives.src = navIcons.incentives.fill; // Ativo
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
        
        // 1. Atualiza Pontos
        const pointsDisplay = document.getElementById('user-points-display');
        if (pointsDisplay) {
            pointsDisplay.innerText = data.points;
        }

        // 2. Atualiza Botões de Resgate
        const rewardFarmaciaBtn = document.querySelector('#reward-farmacia .btn-redeem');
        if (rewardFarmaciaBtn) {
            rewardFarmaciaBtn.disabled = data.points < 1000;
        }
        const rewardIrBtn = document.querySelector('#reward-ir .btn-redeem');
        if (rewardIrBtn) {
            rewardIrBtn.disabled = data.points < 5000;
        }

        // 3. Atualiza Medalhas
        data.badges.forEach(badgeId => {
            const badgeEl = document.querySelector(`[data-badge-id="${badgeId}"]`);
            if (badgeEl) {
                badgeEl.classList.remove('locked');
            }
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
            <div class="card" data-page="page-calendar-generic" data-name="${dependent.name}">
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
    
    // --- Event Listeners ---

    simulator.addEventListener('click', (e) => {
        const navTrigger = e.target.closest('[data-page]');
        const actionTrigger = e.target.closest('#btn-confirm-vaccine');

        // Caso 1: Clique de Navegação
        if (navTrigger) {
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
            
            // 1. Adiciona Pontos
            gameData.points += 100;
            alert("Agendamento Confirmado! 🏆 +100 Pontos Imuni!");

            // 2. Desbloqueia Medalha
            if (!gameData.badges.includes('first-dose')) {
                gameData.badges.push('first-dose');
                alert("Medalha Desbloqueada: Primeira Dose!");
            }
            
            // 3. Salva e atualiza UI
            saveGameData(gameData);
            document.getElementById('incentive-locked').style.display = 'none';
            document.getElementById('incentive-unlocked').style.display = 'block';
            
            showPage('page-incentives', 'forward');
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
    simulator.classList.remove('nav-is-visible');
    simulator.dataset.theme = 'dark';
});
