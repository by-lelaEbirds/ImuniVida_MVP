document.addEventListener('DOMContentLoaded', () => {
    
    // --- Variáveis Globais ---
    const simulator = document.querySelector('.iphone-simulator');
    const formAddDependent = document.getElementById('form-add-dependent');
    const dependentListContainer = document.getElementById('dependent-list-container');
    const scheduleBackButton = document.getElementById('schedule-back-button');
    const STORAGE_KEY = 'imuniVidaDependents';
    
    // Páginas que mostram a Tab Bar inferior
    const rootPages = ['page-dashboard', 'page-incentives']; 

    // --- Funções Principais ---

    /**
     * Função principal para trocar de página com animação
     */
    function showPage(pageId, direction = 'forward', originPageId = null) {
        const currentPage = document.querySelector('.page.active');
        const nextPage = document.getElementById(pageId);

        if (!nextPage || (currentPage && currentPage.id === pageId)) return;

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

        // 2. Atualiza Tema da Status Bar
        const lightThemePages = ['page-homescreen', 'page-login', 'page-add-dependent', 'page-schedule', 'page-calendar-ana', 'page-calendar-joao', 'page-calendar-generic'];
        simulator.dataset.theme = lightThemePages.includes(pageId) ? 'light' : 'dark';

        // 3. Lógica do Botão Voltar (Correção de Fluxo)
        if (pageId === 'page-schedule' && originPageId) {
            scheduleBackButton.dataset.page = originPageId;
        }
        
        // 4. Controla visibilidade da Tab Bar (Navegação Inferior)
        if (rootPages.includes(pageId)) {
            simulator.classList.add('nav-is-visible');
        } else {
            simulator.classList.remove('nav-is-visible');
        }

        // 5. Atualiza o ícone ativo da Tab Bar
        updateBottomNav(pageId);

        // 6. Atualiza o estado global
        simulator.dataset.currentPage = pageId;
    }

    /**
     * Atualiza o estado ativo da navegação inferior (Tab Bar)
     */
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
        
        // Criamos o HTML do novo card
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
        // Simplesmente inserimos o HTML. O Event Delegation vai cuidar do clique.
        dependentListContainer.insertAdjacentHTML('beforeend', cardHTML);
    }
    

    // --- Event Listeners ---

    // *** OUVINTE DE NAVEGAÇÃO PRINCIPAL (EVENT DELEGATION) ***
    // Este é o único ouvinte de clique para toda a navegação.
    // Ele é mais eficiente e corrige o bug de novos dependentes.
    simulator.addEventListener('click', (e) => {
        // Encontra o elemento clicável mais próximo que tenha [data-page]
        const trigger = e.target.closest('[data-page]');
        
        if (trigger) {
            e.preventDefault();
            e.stopPropagation();

            const targetPage = trigger.dataset.page;
            const direction = trigger.dataset.direction || 'forward';
            const originPage = simulator.dataset.currentPage;

            // Lógica especial para o calendário genérico
            if (targetPage === 'page-calendar-generic') {
                const dependentName = trigger.dataset.name || 'Dependente';
                document.getElementById('generic-calendar-title').innerText = `Calendário (${dependentName})`;
            }

            // Lógica especial para o botão de confirmação
            if (trigger.id === 'btn-confirm-vaccine') {
                alert("Agendamento Confirmado!\n\n(Simulação) Após a aplicação na UBS, o sistema confirmará a dose e desbloqueará o incentivo.");
                document.getElementById('incentive-locked').style.display = 'none';
                document.getElementById('incentive-unlocked').style.display = 'block';
                showPage('page-incentives', 'forward'); // Navega para incentivos
            } else {
                // Navegação normal
                showPage(targetPage, direction, originPage);
            }
        }
    });

    // Formulário de Adicionar Dependente
    formAddDependent.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('input-name').value;
        const dob = document.getElementById('input-dob').value;
        
        if (!name || !dob) return; // Validação simples

        const newDependent = { id: Date.now(), name: name, dob: dob };

        saveDependent(newDependent);
        renderDependentCard(newDependent); // Renderiza o card
        
        showPage('page-dashboard', 'back'); // Volta para a dashboard
        formAddDependent.reset();
    });

    // --- Inicialização ---
    loadDependents(); // Carrega os dependentes salvos ao iniciar
    updateBottomNav(simulator.dataset.currentPage); // Garante que a Tab Bar esteja no estado correto (oculta)

});
