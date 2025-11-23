/**
 * ImuniVida MVP v3.0 - Hacker Edition
 * Features: Survey Modal, Hacker Terminal, Global Context
 */

const translations = {
    it: {
        pitch_desc: "Soluzione digitale per i Governi che aumenta le vaccinazioni e riduce i costi ospedalieri.<br><br>Semplice per il cittadino, potente per la sanità pubblica.",
        tech_title: "Punti di Forza Tecnici",
        tech_1: "Sistema Flessibile",
        tech_2: "Basso Costo",
        tech_3: "Sicurezza Totale",
        tech_4: "Connessione Ufficiale",
        status_title: "Stato del Progetto",
        metric_1: "Esperienza Visiva (UI)",
        metric_2: "Funzionalità Mappe",
        widget_now: "ADESSO",
        widget_title: "Campagna Antinfluenzale",
        widget_desc: "Richiamo disponibile per Giovanni.",
        app_calendar: "Calendario",
        app_settings: "Impostazioni",
        app_maps: "Mappe",
        login_subtitle: "Passaporto sanitario digitale.",
        login_btn: "Accedi con <strong>SPID / CIE</strong>",
        login_secure: "Protezione Dati (GDPR)",
        dash_welcome: "Benvenuto,",
        alert_title: "Attenzione",
        alert_desc: "Giovanni ha 1 vaccino in ritardo.",
        dash_dependents: "I Miei Familiari",
        btn_add: "Aggiungi",
        btn_back: "Indietro",
        sched_title: "Prenotazione",
        map_tag: "Sei qui (Milano Centro)",
        sched_date: "Scegli la Data",
        sched_place: "Ospedale / ASL Vicina",
        ubs_1_name: "Ospedale Niguarda",
        ubs_2_name: "Centro Vaccinale Duomo",
        ubs_open: "Aperto ora",
        btn_confirm: "Conferma Prenotazione",
        rewards_title: "Incentivi",
        points_label: "Punti Imuni",
        rewards_sub: "Riscatta Premi",
        reward_pharma_name: "Farmacia Comunale",
        reward_pharma_desc: "15% di Sconto",
        reward_tax_name: "Detrazione Fiscale",
        reward_tax_desc: "Modello 730/2025",
        nav_home: "Home",
        nav_rewards: "Premi",
        reg_title: "Registrazione",
        reg_name: "Nome",
        reg_gender: "Genere",
        gender_m: "Maschio",
        gender_f: "Femmina",
        reg_dob: "Data di Nascita",
        btn_save: "Salva"
    },
    pt: {
        pitch_desc: "Solução digital para Governos que aumenta a vacinação e reduz custos hospitalares.<br><br>Simples para o cidadão, poderoso para a gestão pública.",
        tech_title: "Diferenciais Técnicos",
        tech_1: "Sistema Flexível",
        tech_2: "Baixo Custo",
        tech_3: "Segurança Total",
        tech_4: "Conexão Oficial",
        status_title: "Status do Projeto",
        metric_1: "Experiência Visual (UI)",
        metric_2: "Funcionalidade de Mapas",
        widget_now: "AGORA",
        widget_title: "Campanha de Gripe",
        widget_desc: "Reforço disponível para João.",
        app_calendar: "Agenda",
        app_settings: "Ajustes",
        app_maps: "Mapas",
        login_subtitle: "Passaporte digital de vacinação.",
        login_btn: "Entrar com <strong>Gov.br</strong>",
        login_secure: "Dados Protegidos (LGPD)",
        dash_welcome: "Bem-vindo,",
        alert_title: "Atenção",
        alert_desc: "João tem 1 vacina atrasada.",
        dash_dependents: "Meus Dependentes",
        btn_add: "Adicionar",
        btn_back: "Voltar",
        sched_title: "Agendamento",
        map_tag: "Você está aqui (Av. Paulista)",
        sched_date: "Escolha a Data",
        sched_place: "Unidade de Saúde Próxima",
        ubs_1_name: "Hospital das Clínicas",
        ubs_2_name: "UBS Paulista",
        ubs_open: "Aberto agora",
        btn_confirm: "Confirmar Agendamento",
        rewards_title: "Incentivos",
        points_label: "Pontos Imuni",
        rewards_sub: "Resgatar Prêmios",
        reward_pharma_name: "Farmácia Popular",
        reward_pharma_desc: "15% de Desconto",
        reward_tax_name: "Imposto de Renda",
        reward_tax_desc: "Abatimento 2025",
        nav_home: "Início",
        nav_rewards: "Prêmios",
        reg_title: "Cadastro",
        reg_name: "Nome",
        reg_gender: "Gênero",
        gender_m: "Menino",
        gender_f: "Menina",
        reg_dob: "Data de Nascimento",
        btn_save: "Salvar"
    }
};

class App {
    constructor() {
        this.currentLang = 'it';
        this.pages = document.querySelectorAll('.page');
        this.nav = document.getElementById('main-nav');
        this.toast = document.getElementById('toast-notification');
        
        this.state = {
            points: 350,
            dependents: [
                { id: 1, name: 'Giovanni Grandizoli', dob: '2020-05-10', status: 'late', avatar: 'assets/boyperfil.png' },
                { id: 2, name: 'Sofia Grandizoli', dob: '2022-08-15', status: 'ok', avatar: 'assets/girlperfil.png' }
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
        this.applyLanguage(this.currentLang);
        this.initHackerTerminal();
    }

    applyLanguage(lang) {
        this.currentLang = lang;
        const texts = translations[lang];
        document.getElementById('btn-it').classList.toggle('active', lang === 'it');
        document.getElementById('btn-pt').classList.toggle('active', lang === 'pt');
        document.querySelectorAll('[data-key]').forEach(el => {
            const key = el.getAttribute('data-key');
            if(texts[key]) el.innerHTML = texts[key];
        });
        const mapContainer = document.getElementById('dynamic-map');
        if(mapContainer) {
            mapContainer.style.backgroundImage = lang === 'it' ? "url('milano.png')" : "url('saopaolo.png')";
        }
        if (lang === 'pt') {
            this.state.dependents[0].name = "João Grandizoli";
            this.state.dependents[1].name = "Ana Clara Grandizoli";
        } else {
            this.state.dependents[0].name = "Giovanni Grandizoli";
            this.state.dependents[1].name = "Sofia Grandizoli";
        }
        this.renderDependents();
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
            if(e.target.closest('.btn-schedule')) {
                e.stopPropagation();
                const btn = e.target.closest('.btn-schedule');
                this.startScheduleFlow(btn.dataset.id);
            }
            if(e.target.id === 'btn-confirm-schedule') this.confirmSchedule();
        });
        const form = document.getElementById('form-dependent');
        if(form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addDependent();
            });
        }
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
            btn.innerHTML = '...';
            setTimeout(() => {
                this.state.dependents[depIndex].status = 'scheduled';
                this.state.points += 200; 
                this.renderPoints();
                this.renderDependents();
                const msg = this.currentLang === 'it' ? 'Prenotato! +200 Punti' : 'Agendado! +200 Pontos';
                this.showToast(msg, 'success');
                this.goTo('page-dashboard');
                this.applyLanguage(this.currentLang);
            }, 1000);
        }
    }

    handleLogin(btn) {
        const originalHTML = btn.innerHTML;
        btn.style.opacity = 0.8;
        setTimeout(() => {
            const msg = this.currentLang === 'it' ? 'Accesso Riuscito' : 'Login com Sucesso';
            this.showToast(msg);
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
            const msg = this.currentLang === 'it' ? 'Codice generato!' : 'Código gerado!';
            this.showToast(msg);
            btn.disabled = true;
        } else {
            const msg = this.currentLang === 'it' ? 'Punti insufficienti.' : 'Pontos insuficientes.';
            this.showToast(msg, 'error');
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
            const msg = this.currentLang === 'it' ? 'Salvato!' : 'Salvo!';
            this.showToast(msg);
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
                const statusText = this.currentLang === 'it' ? '• In Ritardo' : '• Pendente';
                const btnText = this.currentLang === 'it' ? 'Prenota' : 'Agendar';
                statusHtml = `<span style="color:#FF3B30; font-weight:600;">${statusText}</span>`;
                actionBtn = `<button class="btn-schedule" data-id="${dep.id}">${btnText}</button>`;
            } else if (dep.status === 'scheduled') {
                const statusText = this.currentLang === 'it' ? '• Programmato' : '• Agendado';
                const btnText = this.currentLang === 'it' ? 'Vedi Guida' : 'Ver Guia';
                statusHtml = `<span style="color:#FF9500; font-weight:600;">${statusText}</span>`;
                actionBtn = `<button class="btn-details" style="color:#FF9500;">${btnText}</button>`;
            } else {
                const statusText = this.currentLang === 'it' ? '• Regolare' : '• Em dia';
                const btnText = this.currentLang === 'it' ? 'Certificato' : 'Carteira';
                statusHtml = `<span style="color:#34C759; font-weight:600;">${statusText}</span>`;
                actionBtn = `<button class="btn-details">${btnText}</button>`;
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
        icon.style.color = type === 'error' ? '#ff4d4d' : '#FFCC00';
        this.toast.classList.add('show');
        setTimeout(() => { this.toast.classList.remove('show'); }, 3000);
    }

    // --- HACKER MODE ---
    initHackerTerminal() {
        const input = document.getElementById('hacker-input');
        const output = document.getElementById('hacker-output');
        
        if(input) {
            input.addEventListener('keypress', (e) => {
                if(e.key === 'Enter') {
                    const cmd = input.value.trim();
                    input.value = '';
                    
                    // Print command
                    output.innerHTML += `<div>root@imuni:~# ${cmd}</div>`;
                    
                    // Parse Command
                    if(cmd.includes('imuni.add_points') || cmd.includes('user.add_points')) {
                        const match = cmd.match(/\d+/);
                        if(match) {
                            const pointsToAdd = parseInt(match[0]);
                            
                            // Simulate Hacking
                            output.innerHTML += `<div style="color:yellow">Injecting points package...</div>`;
                            output.innerHTML += `<div style="color:yellow">Bypassing backend validation...</div>`;
                            
                            setTimeout(() => {
                                this.state.points += pointsToAdd;
                                this.renderPoints();
                                // Force update of buttons
                                const rewardBtns = document.querySelectorAll('.action-redeem');
                                rewardBtns.forEach(b => b.disabled = false);
                                
                                output.innerHTML += `<div style="color:#00FF00">SUCCESS: Added ${pointsToAdd} points.</div>`;
                                this.showToast('HACKED: Pontos Adicionados!', 'success');
                                // Scroll to bottom
                                output.scrollTop = output.scrollHeight;
                            }, 800);
                        }
                    } else {
                        output.innerHTML += `<div style="color:red">Error: Command not found.</div>`;
                    }
                    output.scrollTop = output.scrollHeight;
                }
            });
        }
    }
}

// FUNÇÕES GLOBAIS
window.setLanguage = (lang) => { if(window.appInstance) window.appInstance.applyLanguage(lang); };
window.selectUBS = (el) => { document.querySelectorAll('.ubs-item').forEach(e => e.classList.remove('selected')); el.classList.add('selected'); };
window.toggleSurvey = () => {
    const modal = document.getElementById('survey-modal');
    modal.classList.toggle('hidden');
};

const style = document.createElement('style');
style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);

window.onload = () => { window.appInstance = new App(); };
