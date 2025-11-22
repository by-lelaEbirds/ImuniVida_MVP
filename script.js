/**
 * ImuniVida MVP v2.5 - Milano Edition
 * Features: Gamification Points, Italian Context, Enhanced UX
 */

class App {
    constructor() {
        this.pages = document.querySelectorAll('.page');
        this.nav = document.getElementById('main-nav');
        this.toast = document.getElementById('toast-notification');
        
        // DADOS ITALIANOS
        this.state = {
            points: 350,
            dependents: [
                { 
                    id: 1, 
                    name: 'Giovanni Rossi', 
                    dob: '2020-05-10', 
                    status: 'late', 
                    avatar: 'assets/boyperfil.png' 
                },
                { 
                    id: 2, 
                    name: 'Sofia Rossi', 
                    dob: '2022-08-15', 
                    status: 'ok',
                    avatar: 'assets/girlperfil.png'
                }
            ],
            selectedDependentId: null
        };

        this.init();
    }

    init() {
        this.attachEvents();
        this.renderDependents();
        this.renderPoints();
        const dateInput = document.getElementById('schedule-date');
        if(dateInput) dateInput.valueAsDate = new Date();
    }

    goTo(targetId) {
        this.pages.forEach(p => p.classList.remove('active'));
        const target = document.getElementById(targetId);
        if(target) {
            target.classList.add('active');
            const theme = target.dataset.theme;
            document.querySelector('.iphone-chassis').setAttribute('data-screen-theme', theme);
        }

        if(targetId === 'page-dashboard' || targetId === 'page-incentives') {
            this.nav.classList.remove('hidden');
            this.updateNavHighlight(targetId);
        } else {
            this.nav.classList.add('hidden');
        }
    }

    updateNavHighlight(pageId) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.target === pageId);
        });
    }

    attachEvents() {
        document.body.addEventListener('click', (e) => {
            const navTarget = e.target.closest('[data-target]');
            if(navTarget) this.goTo(navTarget.dataset.target);

            if(e.target.closest('.action-back')) this.goTo('page-dashboard');
            if(e.target.closest('.action-login')) this.handleLogin(e.target.closest('.action-login'));
            if(e.target.closest('.action-redeem')) this.handleRedeem(e.target.closest('.action-redeem'));
            
            // AGENDAR
            if(e.target.closest('.btn-schedule')) {
                e.stopPropagation();
                const btn = e.target.closest('.btn-schedule');
                this.startScheduleFlow(btn.dataset.id);
            }

            // CONFIRMAR AGENDAMENTO
            if(e.target.id === 'btn-confirm-schedule') {
                this.confirmSchedule();
            }
        });
    }

    selectUBS(element) {
        document.querySelectorAll('.ubs-item').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
    }

    startScheduleFlow(dependentId) {
        this.state.selectedDependentId = parseInt(dependentId);
        this.goTo('page-schedule');
    }

    confirmSchedule() {
        const depIndex = this.state.dependents.findIndex(d => d.id === this.state.selectedDependentId);
        if(depIndex > -1) {
            const btn = document.getElementById('btn-confirm-schedule');
            btn.innerHTML = 'Conferma...';
            
            setTimeout(() => {
                // 1. Atualiza Status
                this.state.dependents[depIndex].status = 'scheduled';
                
                // 2. GAMIFICAÇÃO (PONTOS)
                this.state.points += 200; 
                this.renderPoints();

                this.renderDependents();
                // 3. Toast com Pontos
                this.showToast('Prenotato! +200 Punti', 'success');
                this.goTo('page-dashboard');
                
                btn.innerHTML = 'Conferma Prenotazione';
                
                const alertCard = document.getElementById('alert-card');
                if(alertCard) {
                    alertCard.innerHTML = `
                        <div class="card-flex">
                            <span class="material-symbols-rounded" style="color:#34C759; font-size:32px;">check_circle</span>
                            <div><h3>Perfetto!</h3><p>Vaccino prenotato.</p></div>
                        </div>
                    `;
                    alertCard.style.borderLeft = '5px solid #34C759';
                }
            }, 1000);
        }
    }

    handleLogin(btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<span class="material-symbols-rounded" style="animation: spin 1s linear infinite">sync</span> Accesso...`;
        btn.style.opacity = 0.8;
        setTimeout(() => {
            this.showToast('Accesso Riuscito');
            this.goTo('page-dashboard');
            btn.innerHTML = originalHTML;
            btn.style.opacity = 1;
        }, 1500);
    }

    handleRedeem(btn) {
        const item = btn.closest('.reward-item');
        const cost = parseInt(item.dataset.cost);
        if(this.state.points >= cost) {
            this.state.points -= cost;
            this.renderPoints();
            this.showToast(`Codice generato!`);
            btn.disabled = true;
            btn.textContent = 'Riscatto';
            btn.style.background = '#ccc';
        } else {
            this.showToast('Punti insufficienti.', 'error');
        }
    }

    renderDependents() {
        const list = document.getElementById('dependents-list');
        list.innerHTML = '';

        this.state.dependents.forEach(dep => {
            let statusHtml = '';
            let actionBtn = '';

            if (dep.status === 'late') {
                statusHtml = '<span style="color:#FF3B30; font-weight:600;">• In Ritardo</span>';
                actionBtn = `<button class="btn-schedule" data-id="${dep.id}">Prenota</button>`;
            } else if (dep.status === 'scheduled') {
                statusHtml = '<span style="color:#FF9500; font-weight:600;">• Programmato</span>';
                // Melhoria UX: Ver Guia
                actionBtn = `<button class="btn-details" style="color:#FF9500;">Vedi Guida</button>`;
            } else {
                statusHtml = '<span style="color:#34C759; font-weight:600;">• Regolare</span>';
                // Melhoria UX: Certificado em vez de Carteira
                actionBtn = `<button class="btn-details">Certificato</button>`;
            }

            const html = `
                <div class="list-item">
                    <div class="list-item-row">
                        <div style="display:flex; align-items:center; gap:14px;">
                            <img src="${dep.avatar}" class="avatar-child" onerror="this.src='https://ui-avatars.com/api/?name=${dep.name}'">
                            <div>
                                <strong style="font-size:15px; display:block; color:#1C1C1E;">${dep.name}</strong>
                                <div style="font-size:13px; color:#8E8E93; display:flex; align-items:center; gap:4px;">
                                    ${statusHtml}
                                </div>
                            </div>
                        </div>
                        <div class="list-actions">${actionBtn}</div>
                    </div>
                </div>
            `;
            list.insertAdjacentHTML('beforeend', html);
        });
    }

    renderPoints() {
        const el = document.getElementById('user-points');
        if(el) el.textContent = this.state.points;
    }

    showToast(msg, type = 'success') {
        this.toast.querySelector('.text').textContent = msg;
        const icon = this.toast.querySelector('.icon');
        icon.textContent = type === 'error' ? 'error' : 'check_circle';
        icon.style.color = type === 'error' ? '#ff4d4d' : '#FFCC00'; // Dourado para pontos
        this.toast.classList.add('show');
        setTimeout(() => { this.toast.classList.remove('show'); }, 3000);
    }
}

window.selectUBS = (el) => {
    document.querySelectorAll('.ubs-item').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
};

const style = document.createElement('style');
style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);

window.onload = () => new App();
