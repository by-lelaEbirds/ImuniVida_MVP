document.addEventListener('DOMContentLoaded', () => {
    
    // --- Variáveis Globais ---
    const simBody = document.querySelector('.iphone-simulator');
    const allNavTriggers = document.querySelectorAll('[data-page]');
    const confirmVaccineButton = document.getElementById('btn-confirm-vaccine');
    const formAddDependent = document.getElementById('form-add-dependent');
    const dependentListContainer = document.getElementById('dependent-list-container');
    const scheduleBackButton = document.getElementById('schedule-back-button');
    const STORAGE_KEY = 'imuniVidaDependents';
    
    let currentPageId = 'page-homescreen'; // Página inicial agora é a home

    // --- Funções Principais ---

    /**
     * Função principal para trocar de página com animação
     * @param {string} pageId - O ID da página para a qual navegar
     * @param {string} direction - 'forward' (da direita) or 'back' (da esquerda)
     * @param {string} originPageId - (Opcional) A página de onde viemos, para configurar botões de "voltar"
     */
    function showPage(pageId, direction = 'forward', originPageId = null) {
        if (!pageId || pageId === currentPageId) return;

        const currentPage = document.getElementById(currentPageId);
        const nextPage = document.getElementById(pageId);

        if (!nextPage) {
            console.error(`Página não encontrada: ${pageId}`);
            return;
        }

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

        // 2. Atualiza Tema da Status Bar (claro/escuro)
        const lightThemePages = ['page-homescreen', 'page-login', 'page-add-dependent', 'page-schedule', 'page-calendar-ana', 'page-calendar-joao', 'page-calendar-generic'];
        if (lightThemePages.includes(pageId)) {
            simBody.dataset.theme = 'light';
        } else {
            simBody.dataset.theme = 'dark';
        }

        // 3. Lógica do Botão Voltar (Correção de Fluxo)
        if (pageId === 'page-schedule' && originPageId) {
            scheduleBackButton.dataset.page = originPageId; // Configura o botão "voltar" dinamicamente
        }
        
        // 4. Atualiza a Tab Bar (Navegação Inferior)
        updateBottomNav(pageId);

        currentPageId = pageId; // Atualiza a página atual
    }

    /**
     * Atualiza o estado ativo da navegação inferior (Tab Bar)
     * @param {string} pageId - O ID da página ativa
     */
    function updateBottomNav(pageId) {
        const navButtons = document.querySelectorAll('.nav-item');
        const homeIcon = navButtons[0].querySelector('ion-icon');
        const starIcon = navButtons[1].querySelector('ion-icon');
        
        navButtons.forEach(button => button.classList.remove('active'));

        if (pageId === 'page-dashboard') {
            navButtons[0].classList.add('active');
            homeIcon.setAttribute('name', 'home'); // Ícone preenchido
            starIcon.setAttribute('name', 'star-outline');
        } else if (pageId === 'page-incentives') {
            navButtons[1].classList.add('active');
            homeIcon.setAttribute('name', 'home-outline');
            starIcon.setAttribute('name', 'star'); // Ícone preenchido
        } else {
            // Nenhuma aba ativa (ex: em sub-páginas)
            homeIcon.setAttribute('name', 'home-outline');
            starIcon.setAttribute('name', 'star-outline');
        }
    }


    // --- Lógica de Dependentes (localStorage) ---

    /**
     * Carrega os dependentes salvos no localStorage
     */
    function loadDependents() {
        const dependents = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        dependents.forEach(renderDependentCard);
    }

    /**
     * Salva um novo dependente no localStorage
     * @param {object} dependent - O objeto do dependente { id, name, dob }
     */
    function saveDependent(dependent) {
        const dependents = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        dependents.push(dependent);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dependents));
    }

    /**
     * Renderiza um card de dependente na tela da dashboard
     * @param {object} dependent - O objeto do dependente { id, name, dob }
     */
    function renderDependentCard(dependent) {
        // Calcula a idade (simples)
        const age = new Date().getFullYear() - new Date(dependent.dob).getFullYear();
        
        const cardHTML = `
            <div class="card" data-page="page-calendar-generic" data-name="${dependent.name}">
                <ion-icon name="person-circle-outline" class="card-icon"></ion-icon>
                <div class="card-info">
                    <strong>${dependent.name} (${age} anos)</strong>
                    <span>Calendário pendente</span>
                    <span class="status-pendente">Simulado</span>
                </div>
                <ion-icon name="chevron-forward-outline" class="card-arrow"></ion-icon>
            </div>
        `;
        dependentListContainer.innerHTML += cardHTML;
        
        // Re-vincula os eventos aos novos cards
        rebindNavTriggers();
    }
    
    /**
     * Re-adiciona os event listeners a todos os [data-page] (necessário após adicionar HTML dinâmico)
     */
    function rebindNavTriggers() {
        const allTriggers = document.querySelectorAll('[data-page]');
        allTriggers.forEach(trigger => {
            // Remove o listener antigo para evitar duplicatas (se houver)
            trigger.removeEventListener('click', handleNavClick);
            // Adiciona o novo listener
            trigger.addEventListener('click', handleNavClick);
        });
    }

    /**
     * Handler central para todos os cliques de navegação
     */
    function handleNavClick(e) {
        e.preventDefault();
        e.stopPropagation(); // Impede cliques múltiplos

        const target = e.currentTarget;
        const targetPage = target.dataset.page;
        const direction = target.dataset.direction || 'forward';
        const originPage = currentPageId; // De onde estamos vindo

        // Lógica especial para o calendário genérico
        if (targetPage === 'page-calendar-generic') {
            const dependentName = target.dataset.name || 'Dependente';
            document.getElementById('generic-calendar-title').innerText = `Calendário (${dependentName})`;
        }
        
        showPage(targetPage, direction, originPage);
    }


    // --- Event Listeners Iniciais ---

    // 1. Navegação (Links, botões e cards com 'data-page')
    rebindNavTriggers(); // Vincula todos os gatilhos iniciais
    
    // 2. Simulação de Confirmação de Vacina e Gamificação
    confirmVaccineButton.addEventListener('click', () => {
        alert("Agendamento Confirmado!\n\n(Simulação) Após a aplicação na UBS, o sistema confirmará a dose e desbloqueará o incentivo.");
        document.getElementById('incentive-locked').style.display = 'none';
        document.getElementById('incentive-unlocked').style.display = 'block';
        showPage('page-incentives', 'forward');
    });

    // 3. Formulário de Adicionar Dependente
    formAddDependent.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('input-name').value;
        const dob = document.getElementById('input-dob').value;
        
        const newDependent = {
            id: Date.now(),
            name: name,
            dob: dob
        };

        saveDependent(newDependent);
        renderDependentCard(newDependent);
        
        showPage('page-dashboard', 'back'); // Volta para a dashboard
        
        // Limpa o formulário
        formAddDependent.reset();
    });

    // --- Inicialização ---
    loadDependents(); // Carrega os dependentes salvos ao iniciar
    updateBottomNav(currentPageId); // Garante que a Tab Bar esteja no estado correto

});
