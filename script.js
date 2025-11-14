document.addEventListener('DOMContentLoaded', () => {
    
    // --- Variáveis Globais ---
    const simulator = document.querySelector('.iphone-simulator');
    const allPages = document.querySelectorAll('.page');
    const formAddDependent = document.getElementById('form-add-dependent');
    const dependentListContainer = document.getElementById('dependent-list-container');
    const scheduleBackButton = document.getElementById('schedule-back-button');
    const STORAGE_KEY_DEPENDENTS = 'imuniVidaDependents';
    const STORAGE_KEY_GAME = 'imuniVidaGame';
    
    const rootPages = ['page-dashboard', 'page-incentives']; 
    const lightThemePages = ['page-login', 'page-add-dependent', 'page-schedule', 'page-calendar-ana', 'page-calendar-joao', 'page-calendar-generic'];

    // --- Funções Principais ---

    /**
     * Função de navegação principal (V12)
     * Lógica de troca de aba instantânea para evitar bugs de sobreposição.
     */
    function showPage(pageId, direction = 'forward', originPageId = null) {
        const currentPage = document.querySelector('.page.active');
        const nextPage = document.getElementById(pageId);

        if (!nextPage || (currentPage && currentPage.id === pageId)) return;

        const isTabSwitch = rootPages.includes(currentPage.id) && rootPages.includes(pageId);

        // 1. Limpa classes de animação de todas as páginas
        allPages.forEach(page => {
            page.classList.remove('inactive-left', 'inactive-right', 'tab-transition');
            if (page.id !== currentPage.id) {
                page.style.opacity = 0;
                page.style.zIndex = 1;
            }
        });

        // 2. Lógica de Animação
        if (isTabSwitch) {
            // Troca de aba (Início <-> Incentivos) - INSTANTÂNEA
            currentPage.classList.add('tab-transition'); // Adiciona classe para transição de opacidade
            nextPage.classList.add('tab-transition');
            
            currentPage.classList.remove('active');
            currentPage.style.opacity = 0;
            currentPage.style.zIndex = 1;
            
            nextPage.classList.add('active');
            nextPage.style.opacity = 1;
            nextPage.style.zIndex = 10;

        } else if (direction === 'forward') {
            // Navegação "para frente" (Slide)
            currentPage.classList.remove('active');
            currentPage.classList.add('inactive-left');
            
            nextPage.classList.add('active');
            nextPage.style.opacity = 1;
            nextPage.style.zIndex = 10;

        } else if (direction === 'back') {
            // Navegação "para trás" (Slide)
            currentPage.classList.remove('active');
            currentPage.classList.add('inactive-right');
            
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

        // 8. Atualiza UIs dinâmicas
        if (pageId === 'page-incentives') {
            updateIncentivesPage();
        }
        if (pageId === 'page-dashboard') {
            checkDashboardStatus(); // Atualiza o header dinâmico
        }
    }

    /**
     * Atualiza os ícones da barra de navegação (V12)
     * CORRIGIDO: Seleciona os ícones toda vez para evitar "stale references"
     */
    function updateBottomNav(pageId) {
        const navButtons = document.querySelectorAll('.nav-item');
        const homeButton = navButtons[0];
        const incentivesButton = navButtons[1];
        
        // CORREÇÃO: Encontra o ícone <i> DENTRO do botão toda vez
        const homeIcon = homeButton.querySelector('i');
        const incentivesIcon = incentivesButton.querySelector('i');

        // Reseta todos
        homeButton.classList.remove('active');
        incentivesButton.classList.remove('active');
        if (homeIcon) homeIcon.className = 'ph-regular ph-house';
        if (incentivesIcon) incentivesIcon.className = 'ph-regular ph-star';

        // Seta o ativo
        if (pageId === 'page-dashboard') {
            homeButton.classList.add('active');
            if (homeIcon) homeIcon.className = 'ph-fill ph-house'; // Preenchido
        } else if (pageId === 'page-incentives') {
            incentivesButton.classList.add('active');
            if (incentivesIcon) incentivesIcon.className = 'ph-fill ph-star'; // Preenchido
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
        
        document.getElementById('user-points-display').innerText = data.points;

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

    /**
     * NOVO (V12): Verifica o status do dashboard para o Header Dinâmico
     */
    function checkDashboardStatus() {
        const header = document.querySelector('#page-dashboard .header-main');
        if (!header) return;
        
        // Procura por qualquer card de dependente com status 'atrasada'
        const hasOverdue = document.querySelector('#dependent-list-container .status-atrasada');
        
        if (hasOverdue) {
            header.dataset.status = 'warning';
        } else {
            header.dataset.status = 'normal';
        }
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
        
        // Simula se o novo dependente tem vacina atrasada
        const isOverdue = Math.random() < 0.3; // 30% de chance de estar atrasado
        const statusClass = isOverdue ? 'status-atrasada' : 'status-pendente';
        const statusText = isOverdue ? 'Vacina atrasada!' : 'Calendário pendente';

        const cardHTML = `
            <div class="card" data-page="page-calendar-generic" data-name="${dependent.name}">
                <img class="card-icon-img" src="https://picsum.photos/seed/${dependent.id}/80/80" alt="${dependent.name}">
                <div class="card-info">
                    <strong>${dependent.name} (${ageText})</strong>
                    <span>${statusText}</span>
                    <span class="${statusClass}">Simulado</span>
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
            document.getElementById('incentive-locked').style.display = 'none';
            document.getElementById('incentive-unlocked').style.display = 'block';
            
            showPage('page-incentives', 'forward');
        }
    });

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
    updateIncentivesPage();
    checkDashboardStatus(); // Verifica o status do header ao carregar
    simulator.classList.remove('nav-is-visible');
    simulator.dataset.theme = 'dark';
});
