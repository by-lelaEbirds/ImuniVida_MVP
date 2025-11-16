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

    // --- Variáveis do Toast ---
    const toastElement = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    let toastTimeout; // Variável para controlar o timer do toast
    
    const rootPages = ['page-dashboard', 'page-incentives']; 
    // Atualizado: 'page-dashboard' e 'page-incentives' agora são claros
    const lightThemePages = ['page-login', 'page-dashboard', 'page-incentives', 'page-add-dependent', 'page-schedule', 'page-calendar-ana', 'page-calendar-joao', 'page-calendar-generic'];

    // --- Variáveis de Refinamento (Login Simulado) ---
    const btnLoginGov = document.getElementById('btn-login-gov');
    // ATUALIZADO: O botão de login agora não tem HTML interno, só texto
    const btnLoginGovOriginalText = btnLoginGov.innerText; 

    // --- Funções Principais ---

    /**
     * Função de Notificação "Toast"
     */
    function showToast(message) {
        if (!toastElement || !toastMessage) return;

        if (toastTimeout) {
            clearTimeout(toastTimeout);
        }
        
        // ATUALIZADO: Adiciona ícone ao toast
        if (message.includes("Medalha")) {
            toastMessage.innerHTML = `<span class="material-symbols-outlined">military_tech</span> ${message}`;
        } else if (message.includes("Confirmado")) {
            toastMessage.innerHTML = `<span class="material-symbols-outlined">check_circle</span> ${message}`;
        } else {
            toastMessage.innerText = message;
        }

        toastElement.classList.add('show');

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

        // 1. Limpa classes de animação
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
        if (navItems.home) navItems.home.classList.remove('active');
        if (navItems.incentives) navItems.incentives.classList.remove('active');

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
     * =================================================
     * ATUALIZADO: renderDependentCard
     * Agora cria o HTML no novo formato do Stitch
     * =================================================
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
            let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
            months -= birthDate.getMonth();
            months += today.getMonth();
            if (today.getDate() < birthDate.getDate()) {
                months--;
            }
            ageText = (months > 0) ? `${months} me${months > 1 ? 'ses' : 's'}` : 'Recém-nascido';
        }
        
        // Novo HTML do card, baseado em code3.html
        const cardHTML = `
            <div class="card-list-item" data-page="page-calendar-generic" data-name="${dependent.name}" data-direction="forward">
                <img class="card-list-avatar" src="https://picsum.photos/seed/${dependent.id}/80/80" alt="${dependent.name}">
                <div class="card-list-info">
                    <strong>${dependent.name} (${ageText})</strong>
                    <span>Calendário pendente</span>
                </div>
                <div class="card-list-status">
                    <span class="status-badge status-alert">Pendente</span>
                </div>
                <span class="material-symbols-outlined card-list-arrow">chevron_right</span>
            </div>
        `;
        if (dependentListContainer) {
            dependentListContainer.insertAdjacentHTML('beforeend', cardHTML);
        }
    }
    
    /*
    =================================================
    BLOCO: EFEITO 3D MOUSE-MOVE (Corrigido)
    =================================================
    */
    
    const baseRotateX = 3;
    const baseRotateY = -4;
    const originalTransform = `rotateX(${baseRotateX}deg) rotateY(${baseRotateY}deg)`;
    
    document.body.addEventListener('mousemove', (e) => {
        if (!simulator) return;

        const { clientX, clientY } = e;
        const { offsetWidth, offsetHeight } = document.body;
        const x = (clientX / offsetWidth) - 0.5;
        const y = (clientY / offsetHeight) - 0.5;
        
        const maxRotate = 8; 
        const mouseRotateX = -1 * y * maxRotate;
        const mouseRotateY = x * maxRotate;
        
        const finalRotateX = baseRotateX + mouseRotateX;
        const finalRotateY = baseRotateY + mouseRotateY;
        
        simulator.style.transition = 'none';
        simulator.style.transform = `rotateX(${finalRotateX}deg) rotateY(${finalRotateY}deg)`;
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
                
                // ATUALIZADO: Spinner do botão
                loginTrigger.classList.add('is-loading'); 
                loginTrigger.innerHTML = `<span class="material-symbols-outlined">sync</span> Autenticando...`;

                setTimeout(() => {
                    showPage('page-dashboard', 'forward');
                    loginTrigger.disabled = false;
                    loginTrigger.classList.remove('is-loading');
                    // Restaura o HTML original (com o SVG)
                    loginTrigger.innerHTML = `<svg fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M12.193 13.729L15.343 15.49L12.193 17.25V13.729Z" fill="white"></path><path d="M11.808 10.21V13.73L8.658 15.49L11.808 10.21Z" fill="white"></path><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM15.99 15.99L12.23 18.17C12.08 18.25 11.92 18.25 11.77 18.17L8.01 15.99C7.86 15.9 7.75 15.76 7.75 15.6V12.4L11.77 10.22C11.91 10.14 12.08 10.14 12.22 10.22L16.25 12.4V15.6C16.25 15.76 16.14 15.9 15.99 15.99Z" fill="white"></path></svg> <span>${btnLoginGovOriginalText}</span>`;
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
                
                showToast("Agendamento Confirmado!");

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
                const rewardCard = redeemTrigger.closest('.card-list-item'); // Atualizado
                const cost = rewardCard.id === 'reward-farmacia' ? 1000 : 5000;
                let gameData = getGameData();

                if (gameData.points >= cost) {
                    gameData.points -= cost;
                    saveGameData(gameData);
                    updateIncentivesPage();
                    showToast(`Recompensa resgatada!`);
                } else {
                    showToast('Pontos insuficientes.');
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
    
    // Inicia na tela de homescreen
    updateBottomNav('page-homescreen');
    if(simulator) {
        simulator.classList.remove('nav-is-visible');
        simulator.dataset.theme = 'dark'; // Tema da homescreen
    }
});
