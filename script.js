/**
 * ImuniVida MVP v2.4 - Showcase Final
 * Features: Schedule Flow, Interactive Map, Status Updates
 */

class App {
    constructor() {
        this.pages = document.querySelectorAll('.page');
        this.nav = document.getElementById('main-nav');
        this.toast = document.getElementById('toast-notification');
        
        // Estado Inicial
        this.state = {
            points: 350,
            dependents: [
                { 
                    id: 1, 
                    name: 'João Silva', 
                    dob: '2020-05-10', 
                    status: 'late',  // Inicialmente atrasado
                    avatar: 'assets/boyperfil.png' 
                },
                { 
                    id: 2, 
                    name: 'Ana Clara', 
                    dob: '2022-08-15', 
                    status: 'ok',
                    avatar: 'assets/girlperfil.png'
                }
            ],
            selectedDependentId: null // Para saber quem está sendo agendado
        };

        this.init();
    }

    init() {
        this.attachEvents();
        this.renderDependents();
        this.renderPoints();
        
        // Preencher data de hoje no input
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
            
            // --- LOGICA DE AGENDAMENTO ---
            // 1. Clicou em Agendar no Dashboard
            if(e.target.closest('.btn-schedule')) {
                e.stopPropagation();
                const btn = e.target.closest('.btn-schedule');
                const depId = btn.dataset.id;
                this.startScheduleFlow(depId);
            }

            // 2. Confirmou o Agendamento na tela nova
            if(e.target.id === 'btn-confirm-schedule') {
                this.confirmSchedule();
            }
        });
        
        // Formulário Cadastro
        const form = document.getElementById('form-dependent');
        if(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addDependent();
            });
        }
    }

    // --- SELEÇÃO DE UBS ---
    // (Função global para funcionar no onclick do HTML)
    selectUBS(element) {
        document.querySelectorAll('.ubs-item').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
    }

    startScheduleFlow(dependentId) {
        this.state.selectedDependentId = parseInt(dependentId);
        this.goTo('page-schedule');
    }

    confirmSchedule() {
        // Achar o dependente
        const depIndex = this.state.dependents.findIndex(d => d.id === this.state.selectedDependentId);
        
        if(depIndex > -1) {
            // Simula carregamento
            const btn = document.getElementById('btn-confirm-schedule');
            btn.innerHTML = 'Confirmando...';
            
            setTimeout(() => {
                // Atualiza estado
                this.state.dependents[depIndex].status = 'scheduled'; // Novo status temporário
                
                this.renderDependents();
                this.showToast('Agendamento Confirmado!', 'success');
                this.goTo('page-dashboard');
                
                btn.innerHTML = 'Confirmar Agendamento';
                
                // Simula atualização do card de alerta
                const alertCard = document.getElementById('alert-card');
                if(alertCard) {
                    alertCard.innerHTML = `
                        <div class="card-flex">
                            <span class="material-symbols-rounded" style="color:#34C759; font-size:32px;">check_circle</span>
                            <div>
                                <h3>Tudo certo!</h3>
                                <p>Vacina do João agendada.</p>
                            </div>
                        </div>
                    `;
                    alertCard.style.borderLeft = '5px solid #34C759';
                }

            }, 1000);
        }
    }

    handleLogin(btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<span class="material-symbols-rounded" style="animation: spin 1s linear infinite">sync</span> Acessando...`;
        btn.style.opacity = 0.8;
        setTimeout(() => {
            this.showToast('Autenticado Gov.br');
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
            this.showToast(`Cupom resgatado!`);
            btn.disabled = true;
            btn.textContent = 'Resgatado';
            btn.style.background = '#ccc';
        } else {
            this.showToast('Pontos insuficientes.', 'error');
        }
    }

    addDependent() {
        const nameInput = document.getElementById('dep-name');
        const dobInput = document.getElementById('dep-dob');
        const genderInput = document.getElementById('dep-gender');

        if(nameInput.value && dobInput.value) {
            const avatarUrl = genderInput.value === 'girl' ? 'assets/girlperfil.png' : 'assets/boyperfil.png';
            this.state.dependents.push({
                id: Date.now(),
                name: nameInput.value,
                dob: dobInput.value,
                status: 'ok',
                avatar: avatarUrl
            });
            this.renderDependents();
            this.state.points += 50;
            this.renderPoints();
            this.showToast('Dependente adicionado!');
            this.goTo('page-dashboard');
            nameInput.value = ''; dobInput.value = '';
        }
    }

    renderDependents() {
        const list = document.getElementById('dependents-list');
        list.innerHTML = '';

        this.state.dependents.forEach(dep => {
            let statusHtml = '';
            let actionBtn = '';

            if (dep.status === 'late') {
                statusHtml = '<span style="color:#FF3B30; font-weight:600;">• Pendente</span>';
                actionBtn = `<button class="btn-schedule" data-id="${dep.id}">Agendar</button>`;
            } else if (dep.status === 'scheduled') {
                statusHtml = '<span style="color:#FF9500; font-weight:600;">• Agendado</span>';
                actionBtn = `<button class="btn-details" style="color:#FF9500;">Ver Guia</button>`;
            } else {
                statusHtml = '<span style="color:#34C759; font-weight:600;">• Em dia</span>';
                actionBtn = `<button class="btn-details">Carteira</button>`;
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
                        <div class="list-actions">
                            ${actionBtn}
                        </div>
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
        icon.style.color = type === 'error' ? '#ff4d4d' : '#4cd964';
        this.toast.classList.add('show');
        setTimeout(() => { this.toast.classList.remove('show'); }, 3000);
    }
}

// Expose global function for HTML onClick
window.selectUBS = (el) => {
    document.querySelectorAll('.ubs-item').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
};

const style = document.createElement('style');
style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);

window.onload = () => new App();
