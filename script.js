/**
 * ImuniVida MVP v2.1 - Fixed Logic
 * Clean Architecture + Robust DOM Handling
 */

class App {
    constructor() {
        // Elementos Principais
        this.pages = document.querySelectorAll('.page');
        this.nav = document.getElementById('main-nav');
        this.toast = document.getElementById('toast-notification');
        
        // Estado Simulado (Mock Database)
        this.state = {
            points: 0,
            dependents: [
                { id: 1, name: 'João Silva', dob: '2020-05-10', status: 'late' },
                { id: 2, name: 'Ana Clara', dob: '2022-08-15', status: 'ok' }
            ]
        };

        this.init();
    }

    init() {
        this.attachEvents();
        this.renderDependents();
        this.renderPoints();
    }

    // --- NAVEGAÇÃO ---
    goTo(targetId) {
        // Esconde todas as páginas
        this.pages.forEach(p => p.classList.remove('active'));
        
        // Mostra a alvo
        const target = document.getElementById(targetId);
        if(target) {
            target.classList.add('active');
            
            // Ajusta tema da Status Bar
            const theme = target.dataset.theme;
            document.querySelector('.iphone-chassis').setAttribute('data-screen-theme', theme);
        }

        // Controla a barra de navegação (Bottom Nav)
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

    // --- EVENTOS ---
    attachEvents() {
        // Clique Global (Delegation)
        document.body.addEventListener('click', (e) => {
            // Navegação
            const navTarget = e.target.closest('[data-target]');
            if(navTarget) {
                this.goTo(navTarget.dataset.target);
            }

            // Voltar
            if(e.target.closest('.action-back')) {
                this.goTo('page-dashboard');
            }

            // Login
            if(e.target.closest('.action-login')) {
                this.handleLogin(e.target.closest('.action-login'));
            }

            // Resgatar Recompensa
            if(e.target.closest('.action-redeem')) {
                this.handleRedeem(e.target.closest('.action-redeem'));
            }
        });

        // Formulário
        const form = document.getElementById('form-dependent');
        if(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addDependent();
            });
        }
    }

    // --- AÇÕES ---
    handleLogin(btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = `<span class="material-symbols-rounded">sync</span> Entrando...`;
        btn.style.opacity = 0.7;

        setTimeout(() => {
            this.showToast('Login realizado!');
            this.goTo('page-dashboard');
            btn.innerHTML = originalText;
            btn.style.opacity = 1;
        }, 1500);
    }

    handleRedeem(btn) {
        const item = btn.closest('.reward-item');
        const cost = parseInt(item.dataset.cost);

        if(this.state.points >= cost) {
            this.state.points -= cost;
            this.renderPoints();
            this.showToast(`Resgate de ${cost} pts realizado!`);
            btn.disabled = true;
            btn.textContent = 'Resgatado';
        } else {
            this.showToast('Pontos insuficientes!', 'error');
        }
    }

    addDependent() {
        const nameInput = document.getElementById('dep-name');
        const dobInput = document.getElementById('dep-dob');

        if(nameInput.value && dobInput.value) {
            this.state.dependents.push({
                id: Date.now(),
                name: nameInput.value,
                dob: dobInput.value,
                status: 'ok' // Padrão
            });
            
            this.renderDependents();
            this.state.points += 50; // Gamification
            this.renderPoints();
            
            this.showToast('Dependente adicionado! (+50 pts)');
            this.goTo('page-dashboard');
            
            nameInput.value = '';
            dobInput.value = '';
        }
    }

    // --- RENDERIZAÇÃO ---
    renderDependents() {
        const list = document.getElementById('dependents-list');
        list.innerHTML = '';

        this.state.dependents.forEach(dep => {
            const isLate = dep.status === 'late';
            const html = `
                <div class="list-item">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:40px; height:40px; background:#eee; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; color:#666;">
                            ${dep.name.charAt(0)}
                        </div>
                        <div>
                            <strong>${dep.name}</strong>
                            <div style="font-size:12px; color:#999;">Vacinas: ${isLate ? 'Pendente' : 'Em dia'}</div>
                        </div>
                    </div>
                    <span class="badge ${isLate ? 'badge-late' : 'badge-ok'}">
                        ${isLate ? 'ATRASO' : 'OK'}
                    </span>
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
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// Inicia App
window.onload = () => new App();
