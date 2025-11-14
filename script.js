// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {

    const pages = document.querySelectorAll('.page');
    const navButtons = document.querySelectorAll('.nav-item');
    const allNavTriggers = document.querySelectorAll('[data-page]');
    const loginButton = document.getElementById('btn-login-gov');
    const confirmVaccineButton = document.getElementById('btn-confirm-vaccine');

    // Função principal para trocar de página
    function showPage(pageId) {
        // Esconde todas as páginas
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Mostra a página desejada
        const activePage = document.getElementById(pageId);
        if (activePage) {
            activePage.classList.add('active');
        }

        // Atualiza o estado ativo da navegação inferior
        navButtons.forEach(button => {
            if (button.dataset.page === pageId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Simula notificação ao entrar no calendário [cite: 14, 48]
        if (pageId === 'page-calendar-joao') {
            setTimeout(() => {
                alert("🔔 Lembrete ImuniVida (Notificação Proativa)\n\nA dose de Tríplice Viral do João está atrasada! [cite: 14]");
            }, 500); // Pequeno delay para simular
        }
    }

    // --- Event Listeners ---

    // 1. Simulação de Login 
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            showPage('page-dashboard');
        });
    }

    // 2. Navegação (Links, botões e cards com 'data-page')
    allNavTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = trigger.dataset.page;
            if (targetPage) {
                showPage(targetPage);
            }
        });
    });
    
    // 3. Simulação de Confirmação de Vacina e Gamificação 
    if (confirmVaccineButton) {
        confirmVaccineButton.addEventListener('click', () => {
            alert("Agendamento Confirmado!\n\n(Simulação) Após a aplicação na UBS, o sistema confirmará a dose e desbloqueará o incentivo.");
            
            // Simula o desbloqueio
            const lockedIncentive = document.getElementById('incentive-locked');
            const unlockedIncentive = document.getElementById('incentive-unlocked');
            
            if (lockedIncentive && unlockedIncentive) {
                lockedIncentive.style.display = 'none';
                unlockedIncentive.style.display = 'block';
            }

            // Atualiza a barra de progresso (exemplo)
            const progressBar = document.querySelector('.progress');
            if(progressBar) {
                progressBar.style.width = '100%';
                progressBar.textContent = '100%';
            }

            // Leva para a página de incentivos
            showPage('page-incentives');
        });
    }

    // Inicia o app na tela de login
    showPage('page-login');

});
