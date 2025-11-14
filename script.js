document.addEventListener('DOMContentLoaded', () => {
    
    // --- Variáveis Globais ---
    const simulator = document.querySelector('.iphone-simulator');
    const allPages = document.querySelectorAll('.page');
    const formAddDependent = document.getElementById('form-add-dependent');
    const dependentListContainer = document.getElementById('dependent-list-container');
    const scheduleBackButton = document.getElementById('schedule-back-button');
    const STORAGE_KEY = 'imuniVidaDependents';
    
    const rootPages = ['page-dashboard', 'page-incentives']; 
    const lightThemePages = ['page-login', 'page-add-dependent', 'page-schedule', 'page-calendar-ana', 'page-calendar-joao', 'page-calendar-generic'];

    // --- Funções Principais ---

    function showPage(pageId, direction = 'forward', originPageId = null) {
        const currentPage = document.querySelector('.page.active');
        const nextPage = document.getElementById(pageId);

        if (!nextPage || (currentPage && currentPage.id === pageId)) return;

        // *** CORREÇÃO DO BUG DE SOBREPOSIÇÃO ***
        allPages.forEach(page => {
            if (page.id !== pageId && page.id !== currentPage.id) {
                page.classList.remove('active', 'inactive-left');
                page.classList.add('inactive-right');
            }
        });

        // 1. Lógica de Animação
        if (direction === 'forward') {
            currentPage.classList.remove('active');
            currentPage.classList.add('inactive-left');
            nextPage.classList.remove('inactive-right');
            nextPage.classList.add('active');
        } else if (direction === 'back') {
            currentPage.classList.remove('active');
            currentPage.classList.add('inactive-right');
            nextPage.classList.remove('inactive-left', 'inactive-right');
            nextPage.classList.add('active');
        }

        // 2. Atualiza Tema da Status Bar (Corrigido para Home)
        simulator.dataset.theme = lightThemePages.includes(pageId) ? 'light' : 'dark';

        // 3. Lógica do Botão Voltar
        if (pageId === 'page-schedule' && originPageId) {
            scheduleBackButton.dataset.page = originPageId;
        }
        
        // 4. Controla visibilidade da Tab Bar
        simulator.classList.toggle('nav-is-visible', rootPages.includes(pageId));

        // 5. Atualiza o ícone ativo da Tab Bar
        updateBottomNav(pageId);

        // 6. Atualiza o estado global
        simulator.dataset.currentPage = pageId;
    }

    function updateBottomNav(pageId) {
        const navButtons = document.querySelectorAll('.nav-item');
        const icons = [navButtons[0].querySelector('ion-icon'), navButtons[1].querySelector('ion-icon')];
        
        navButtons.forEach(button => button.classList.remove('active'));

        if (pageId === 'page-dashboard') {
            navButtons[0].classList.add('active');
            icons[0].setAttribute('name', 'home');
            icons[1].setAttribute('name', 'star-outline');
        } else if (pageId === 'page-incentives') {
            navButtons[1].classList.add('active');
            icons[0].setAttribute('name', 'home-outline');
            icons[1].setAttribute('name', 'star');
        } else {
            icons[0].setAttribute('name', 'home-outline');
            icons[1].setAttribute('name', 'star-outline');
        }
    }


    // --- Lógica de Dependentes (localStorage) ---

    function loadDependents() {
        const dependents = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        dependents.forEach(renderDependentCard);
    }

    function saveDependent(dependent) {
        const dependents = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        dependents.push(dependent);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dependents));
    }

    function renderDependentCard(dependent) {
        const age = new Date().getFullYear() - new Date(dependent.dob).getFullYear();
        const ageText = age > 0 ? `${age} anos` : 'menos de 1 ano';
        
        const cardHTML = `
            <div class="card" data-page="page-calendar-generic" data-name="${dependent.name}">
                <ion-icon name="person-circle-outline" class="card-icon"></ion-icon>
                <div class="card-info">
                    <strong>${dependent.name} (${ageText})</strong>
                    <span>Calendário pendente</span>
                    <span class="status-pendente">Simulado</span>
                </div>
                <ion-icon name="chevron-forward-outline" class="card-arrow"></ion-icon>
            </div>
        `;
        dependentListContainer.insertAdjacentHTML('beforeend', cardHTML);
    }
    

    // --- Event Listeners ---

    // *** OUVINTE DE NAVEGAÇÃO PRINCIPAL (CORRIGIDO V7) ***
    // Lida com cliques de NAVEGAÇÃO e cliques de AÇÃO.
    simulator.addEventListener('click', (e) => {
        const navTrigger = e.target.closest('[data-page]');
        const actionTrigger = e.target.closest('#btn-confirm-vaccine');

        // Caso 1: Clique de Navegação (botões, cards, etc.)
        if (navTrigger) {
            e.preventDefault();
            e.stopPropagation();

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
            e.preventDefault();
            e.stopPropagation();
            
            // Simula o desbloqueio do benefício
            alert("Agendamento Confirmado!\n\n(Simulação) Após a aplicação na UBS, o sistema confirmará a dose e desbloqueará o incentivo.");
            document.getElementById('incentive-locked').style.display = 'none';
            document.getElementById('incentive-unlocked').style.display = 'block';

            // Simula a Gamificação
            const firstDoseBadge = document.getElementById('badge-first-dose');
            if (firstDoseBadge.classList.contains('locked')) { // Só roda se estiver bloqueada
                alert("🏆 Medalha Desbloqueada: Primeira Dose!");
                firstDoseBadge.classList.remove('locked');
            }
            
            showPage('page-incentives', 'forward'); // Leva para a tela de incentivos
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
    updateBottomNav(simulator.dataset.currentPage);

});
