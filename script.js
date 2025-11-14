document.addEventListener('DOMContentLoaded', () => {

    const navButtons = document.querySelectorAll('.nav-item');
    const allNavTriggers = document.querySelectorAll('[data-page]');
    const confirmVaccineButton = document.getElementById('btn-confirm-vaccine');
    const simBody = document.querySelector('.iphone-simulator');

    let currentPageId = 'page-login'; // Rastreia a página atual

    // Função principal para trocar de página com animação
    function showPage(pageId, direction = 'forward') {
        if (!pageId || pageId === currentPageId) {
            return; // Não faz nada se a página for nula ou já for a ativa
        }

        const currentPage = document.getElementById(currentPageId);
        const nextPage = document.getElementById(pageId);

        if (!nextPage) {
            console.error(`Página não encontrada: ${pageId}`);
            return;
        }
        
        // Lógica de Animação
        if (direction === 'forward') {
            // Avançando (Push): A página atual sai para a esquerda, a nova entra da direita
            currentPage.classList.remove('active');
            currentPage.classList.add('inactive-left');
            
            nextPage.classList.remove('inactive-right'); // Remove o estado padrão
            nextPage.classList.add('active');

            // Atualiza tema da status-bar
            if (pageId === 'page-login') {
                simBody.dataset.theme = 'dark'; // Fundo branco, texto escuro
            } else {
                 simBody.dataset.theme = 'light'; // Fundo colorido, texto claro
            }

        } else if (direction === 'back') {
            // Voltando (Pop): A página atual sai para a direita, a nova entra da esquerda
            currentPage.classList.remove('active');
            currentPage.classList.add('inactive-right');

            nextPage.classList.remove('inactive-left'); // Remove o estado anterior
            nextPage.classList.add('active');

             // Atualiza tema da status-bar
            if (pageId === 'page-login') {
                 simBody.dataset.theme = 'dark';
            } else {
                 simBody.dataset.theme = 'light';
            }
        }
        
        currentPageId = pageId; // Atualiza a página atual

        // Atualiza o estado ativo da navegação inferior
        navButtons.forEach(button => {
            if (button.dataset.page === pageId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Simula notificação ao entrar no calendário de João
        if (pageId === 'page-calendar-joao') {
            setTimeout(() => {
                alert("🔔 Lembrete ImuniVida (Notificação Proativa)\n\nA dose de Tríplice Viral do João está atrasada!");
            }, 600); // Aumenta o delay para esperar a animação
        }
    }

    // --- Event Listeners ---

    // 1. Navegação (Links, botões e cards com 'data-page')
    allNavTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = trigger.dataset.page;
            const direction = trigger.dataset.direction || 'forward'; // Pega a direção (padrão 'forward')
            
            showPage(targetPage, direction);
        });
    });
    
    // 2. Simulação de Confirmação de Vacina e Gamificação
    if (confirmVaccineButton) {
        confirmVaccineButton.addEventListener('click', () => {
            alert("Agendamento Confirmado!\n\n(Simulação) Após a aplicação na UBS, o sistema confirmará a dose e desbloqueará o incentivo.");
            
            // Simula o desbloqueio
            document.getElementById('incentive-locked').style.display = 'none';
            document.getElementById('incentive-unlocked').style.display = 'block';

            // Atualiza a barra de progresso
            const progressBar = document.querySelector('#page-incentives .progress');
            if(progressBar) {
                progressBar.style.width = '100%';
            }

            // Leva para a página de incentivos
            showPage('page-incentives', 'forward');
        });
    }

    // Inicia o app na tela de login
    simBody.dataset.theme = 'dark'; // Tema inicial para tela de login

});
