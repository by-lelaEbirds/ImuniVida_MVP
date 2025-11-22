class App {
    constructor() {
        this.pages = document.querySelectorAll('.page');
        this.nav = document.getElementById('main-nav');
        this.toast = document.getElementById('toast-notification');
        
        // DATA: Agora usando ASSETS LOCAIS como solicitado
        this.state = {
            points: 0,
            dependents: [
                { 
                    id: 1, 
                    name: 'João Silva', 
                    dob: '2020-05-10', 
                    status: 'late', 
                    // Caminho relativo para funcionar no repo
                    avatar: 'assets/boyperfil.png' 
                },
                { 
                    id: 2, 
                    name: 'Ana Clara', 
                    dob: '2022-08-15', 
                    status: 'ok',
                    // Caminho relativo
                    avatar: 'assets/girlperfil.png'
                }
            ]
        };

        this.init();
    }

    init() {
        this.attachEvents();
        this.renderDependents();
        this.renderPoints();
    }

    // ... (MANTENHA OS MÉTODOS goTo E updateNavHighlight IGUAIS) ...
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
            
            // NOVO: Clique no botão Agendar
            if(e.target.closest('.btn-schedule')) {
                e.stopPropagation(); // Não abrir detalhes
                this.handleSchedule(e.target.closest('.btn-schedule'));
            }
        });

        const form = document.getElementById('form-dependent');
        if(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addDependent();
            });
        }
    }

    // ... (MANTENHA OS MÉTODOS handleLogin E handleRedeem) ...
    handleLogin(btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `<span class="material-symbols-rounded" style="animation: spin 1s linear infinite">sync</span> Acessando...`;
        btn.style.opacity = 0.8;
        setTimeout(() => {
            this.showToast('Acesso Gov.br validado.');
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
            this.showToast(`Cupom gerado com sucesso!`);
            btn.disabled = true;
            btn.textContent = 'Resgatado';
            btn.style.background = '#ccc';
            btn.style.color = '#666';
        } else {
            this.showToast('Pontos insuficientes.', 'error');
        }
    }

    // NOVO: Ação de Agendar
    handleSchedule(btn) {
        // Simula o agendamento
        btn.innerHTML = '<span class="material-symbols-rounded" style="font-size:14px;">event_available</span> Agendado';
        btn.style.background = '#34C759'; // Verde
        this.showToast('Agendamento confirmado na UBS!');
    }

    addDependent() {
        const nameInput = document.getElementById('dep-name');
        const dobInput = document.getElementById('dep-dob');
        const genderInput = document.getElementById('dep-gender');

        if(nameInput.value && dobInput.value) {
            // Usa assets locais
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
            
            nameInput.value = '';
            dobInput.value = '';
        }
    }

    renderDependents() {
        const list = document.getElementById('dependents-list');
        list.innerHTML = '';

        this.state.dependents.forEach(dep => {
            const isLate = dep.status === 'late';
            
            // Lógica do Botão: Se atrasado = Agendar, Se ok = Detalhes
            const actionBtn = isLate 
                ? `<button class="btn-schedule">Agendar</button>` 
                : `<button class="btn-details">Carteira</button>`;

            const html = `
                <div class="list-item">
                    <div class="list-item-row">
                        <div style="display:flex; align-items:center; gap:14px;">
                            <img src="${dep.avatar}" class="avatar-child" onerror="this.src='https://ui-avatars.com/api/?name=${dep.name}'">
                            <div>
                                <strong style="font-size:15px; display:block; color:#1C1C1E;">${dep.name}</strong>
                                <div style="font-size:13px; color:#8E8E93; display:flex; align-items:center; gap:4px;">
                                    ${isLate ? '<span style="color:#FF3B30">• Pendente</span>' : '<span style="color:#34C759">• Em dia</span>'}
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

const style = document.createElement('style');
style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);

window.onload = () => new App();
