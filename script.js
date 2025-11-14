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

        const isTabSwitch = rootPages.includes(currentPage.id) && rootPages.includes(pageId);

        // 1. Limpa classes de transição de todas as páginas
        allPages.forEach(page => {
            page.classList.remove('inactive-left', 'inactive-right', 'fade-transition');
            // Só esconde as que não são a atual ou a próxima
            if (page.id !== currentPage.id && page.id !== pageId) {
                page.style.opacity = 0;
                page.style.zIndex = 1;
            }
        });

        // 2. Lógica de Animação
        if (isTabSwitch) {
            // Troca de aba (Início <-> Incentivos)
            currentPage.classList.add('fade-transition');
            nextPage.classList.add('fade-transition');
            
            currentPage.classList.remove('active');
            currentPage.style.opacity = 0; // Garante que a antiga saia
            currentPage.style.zIndex = 1;
            
            nextPage.classList.add('active');
            nextPage.style.opacity = 1;
            nextPage.style.zIndex = 10;

        } else if (direction === 'forward') {
            // Navegação "para frente"
            currentPage.classList.remove('active');
            currentPage.classList.add('inactive-left');
            
            nextPage.classList.remove('inactive-right'); // Remove estado de "espera"
            nextPage.classList.add('active');
            nextPage.style.opacity = 1;
            nextPage.style.zIndex = 10;

        } else if (direction === 'back') {
            // Navegação "para trás"
            currentPage.classList.remove('active');
            currentPage.classList.add('inactive-right');
            
            nextPage.classList.remove('inactive-left', 'inactive-right');
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
    }

    function updateBottomNav(pageId) {
        const navButtons = document.querySelectorAll('.nav-item');
        const icons = [navButtons[0].querySelector('i'), navButtons[1].querySelector('i')];
        
        navButtons.forEach(button => button.classList.remove('active'));

        // Reseta os ícones para "regular" (vazado)
        icons[0].className = 'ph-regular ph-house';
        icons[1].className = 'ph-regular ph-star';

        if (pageId === 'page-dashboard') {
            navButtons[0].classList.add('active');
            icons[0].className = 'ph-fill ph-house'; // Preenchido
        } else if (pageId === 'page-incentives') {
            navButtons[1].classList.add('active');
            icons[1].className = 'ph-fill ph-star'; // Preenchido
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
                <i class="ph-fill ph-user-circle card-icon"></i>
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

    // Ouvinte de Navegação Principal (Event Delegation)
    simulator.addEventListener('click', (e) => {
        const navTrigger = e.target.closest('[data-page]');
        const actionTrigger = e.target.closest('#btn-confirm-vaccine');

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
        
        } else if (actionTrigger) {
            e.preventDefault();
            e.stopPropagation();
            
            alert("Agendamento Confirmado!\n\n(Simulação) Após a aplicação na UBS, o sistema confirmará a dose e desbloqueará o incentivo.");
            document.getElementById('incentive-locked').style.display = 'none';
            document.getElementById('incentive-unlocked').style.display = 'block';

            const firstDoseBadge = document.querySelector('[data-badge-id="first-dose"]');
            if (firstDoseBadge && firstDoseBadge.classList.contains('locked')) {
                alert("🏆 Medalha Desbloqueada: Primeira Dose!");
                firstDoseBadge.classList.remove('locked');
            }
            
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
    // Garante que a página inicial (Home) não tenha a Tab Bar
    simulator.classList.remove('nav-is-visible');
    // Define o tema inicial (Home)
    simulator.dataset.theme = 'dark';
});
