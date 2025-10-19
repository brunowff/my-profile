/**
 * PORTFÓLIO PESSOAL - BRUNO WALLACE
 * Sistema JavaScript Modular e Organizado
 * 
 * Funcionalidades:
 * • Alternância de temas (escuro/claro)
 * • Navegação suave e menu responsivo
 * • Validação de formulário
 * • Integração entre componentes
 */

// =============================================================================
// CONFIGURAÇÕES GLOBAIS
// =============================================================================

const CONFIG = {
  THEME: {
    DEFAULT: 'dark',
    STORAGE_KEY: 'portfolio-theme',
    ICONS: { light: '🌙', dark: '☀️' },
    LABELS: { light: 'Modo Escuro', dark: 'Modo Claro' }
  },
  ANIMATION: {
    THEME_TRANSITION_DURATION: 300,
    SCROLL_OFFSET: 80
  },
  SELECTORS: {
    THEME_TOGGLE: '.theme-toggle',
    THEME_ICON: '.theme-icon',
    NAV_TOGGLE: '.nav-toggle',
    NAV_MENU: '.nav-menu',
    NAV_LINKS: '.nav-link, .footer-link',
    CONTACT_FORM: '#contactForm',
    SUCCESS_MODAL: '#successModal'
  }
};

// =============================================================================
// GERENCIADOR DE TEMAS
// =============================================================================

class ThemeManager {
  constructor() {
    this.currentTheme = CONFIG.THEME.DEFAULT;
    this.button = null;
    this.init();
  }

  init() {
    this.button = document.querySelector(CONFIG.SELECTORS.THEME_TOGGLE);
    if (!this.button) return;

    this.loadSavedTheme();
    this.button.addEventListener('click', () => this.toggle());
    this.apply(this.currentTheme);
  }

  toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.set(newTheme);
  }

  set(theme) {
    if (!CONFIG.THEME.ICONS[theme]) return;
    
    this.currentTheme = theme;
    this.apply(theme);
    this.save();
    this.updateButton();
  }

  apply(theme) {
    const body = document.body;
    body.removeAttribute('data-theme');
    if (theme === 'dark') body.setAttribute('data-theme', 'dark');
    
    body.classList.add('theme-transition');
    setTimeout(() => body.classList.remove('theme-transition'), CONFIG.ANIMATION.THEME_TRANSITION_DURATION);
  }

  updateButton() {
    if (!this.button) return;
    
    const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    const icon = this.button.querySelector(CONFIG.SELECTORS.THEME_ICON);
    
    if (icon) icon.textContent = CONFIG.THEME.ICONS[nextTheme];
    
    this.button.setAttribute('aria-label', CONFIG.THEME.LABELS[nextTheme]);
    this.button.setAttribute('aria-pressed', this.currentTheme === 'dark');
  }

  save() {
    try {
      sessionStorage.setItem(CONFIG.THEME.STORAGE_KEY, this.currentTheme);
    } catch (e) {
      console.warn('Não foi possível salvar tema:', e);
    }
  }

  loadSavedTheme() {
    try {
      const saved = sessionStorage.getItem(CONFIG.THEME.STORAGE_KEY);
      this.currentTheme = (saved && CONFIG.THEME.ICONS[saved]) ? saved : CONFIG.THEME.DEFAULT;
    } catch (e) {
      this.currentTheme = CONFIG.THEME.DEFAULT;
    }
  }
}

/**
 * Classe NavigationManager
 * 
 * Gerencia toda a navegação do portfólio:
 * - Smooth scroll para seções via âncoras
 * - Menu hamburger responsivo para mobile
 * - Indicação visual da seção ativa
 * - Fechamento automático do menu mobile
 * - Observação de seções para atualizar navegação ativa
 */
class NavigationManager {
    constructor() {
        // Referências aos elementos do DOM
        this.navToggle = null;      // Botão hamburger
        this.navMenu = null;        // Menu de navegação
        this.navLinks = [];         // Links de navegação
        this.sections = [];         // Seções da página
        
        // Estado do menu mobile
        this.isMenuOpen = false;
        
        // Seção atualmente ativa
        this.currentSection = 'sobre';
        
        // Inicializa o sistema de navegação
        this.init();
    }

    /**
     * Inicializa o sistema de navegação
     */
    init() {
        // Busca elementos do DOM
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link, .footer-link');
        this.sections = document.querySelectorAll('section[id]');

        if (!this.navToggle || !this.navMenu) {
            console.warn('Elementos de navegação não encontrados');
            return;
        }

        // Configura event listeners
        this.setupEventListeners();
        
        // Configura observador de seções para indicação ativa
        this.setupSectionObserver();
        
        console.log('NavigationManager inicializado');
    }

    /**
     * Configura todos os event listeners da navegação
     */
    setupEventListeners() {
        // Event listener para o botão do menu mobile
        this.navToggle.addEventListener('click', () => this.toggleMobileMenu());

        // Event listeners para links de navegação
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
            link.addEventListener('keydown', (e) => this.handleNavKeydown(e));
        });

        // Event listener para navegação por teclado no botão hamburger
        this.navToggle.addEventListener('keydown', (e) => this.handleToggleKeydown(e));

        // Fecha menu mobile ao clicar fora
        document.addEventListener('click', (e) => this.handleOutsideClick(e));

        // Fecha menu mobile ao pressionar Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Fecha menu mobile ao redimensionar para desktop
        window.addEventListener('resize', () => this.handleResize());
    }

    /**
     * Configura o observador de seções para indicar a seção ativa
     * Usa Intersection Observer API para detectar qual seção está visível
     */
    setupSectionObserver() {
        // Configurações do observador
        const options = {
            root: null,                        // Usa a viewport como root
            rootMargin: '-20% 0px -70% 0px',  // Margem para ativar quando seção está no centro
            threshold: 0                       // Ativa assim que qualquer parte da seção é visível
        };

        // Cria o observador que monitora quando seções entram/saem da viewport
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // Se a seção está visível (intersecting), marca como ativa
                if (entry.isIntersecting) {
                    this.setActiveSection(entry.target.id);
                }
            });
        }, options);

        // Observa todas as seções da página
        this.sections.forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Alterna o estado do menu mobile
     */
    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Abre o menu mobile
     */
    openMobileMenu() {
        this.isMenuOpen = true;
        this.navMenu.classList.add('active');
        this.navToggle.classList.add('active');
        this.navToggle.setAttribute('aria-expanded', 'true');
        this.navMenu.setAttribute('aria-hidden', 'false');
        
        // Previne scroll do body quando menu está aberto
        document.body.style.overflow = 'hidden';
        
        // Foca no primeiro link do menu para navegação por teclado
        const firstLink = this.navMenu.querySelector('.nav-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
    }

    /**
     * Fecha o menu mobile
     */
    closeMobileMenu() {
        this.isMenuOpen = false;
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
        this.navToggle.setAttribute('aria-expanded', 'false');
        this.navMenu.setAttribute('aria-hidden', 'true');
        
        // Restaura scroll do body
        document.body.style.overflow = '';
        
        // Retorna foco para o botão hamburger
        this.navToggle.focus();
    }

    /**
     * Manipula cliques nos links de navegação
     * @param {Event} e - Evento de clique
     */
    handleNavClick(e) {
        e.preventDefault();
        
        const targetId = e.target.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            // Fecha menu mobile se estiver aberto
            if (this.isMenuOpen) {
                this.closeMobileMenu();
            }
            
            // Faz scroll suave para a seção
            this.scrollToSection(targetSection);
        }
    }

    /**
     * Faz scroll suave para uma seção específica
     * @param {Element} section - Elemento da seção de destino
     */
    scrollToSection(section) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = section.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Define a seção ativa no menu de navegação
     * @param {string} sectionId - ID da seção ativa
     */
    setActiveSection(sectionId) {
        if (this.currentSection === sectionId) return;
        
        this.currentSection = sectionId;
        
        // Remove classe ativa de todos os links
        this.navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Adiciona classe ativa ao link correspondente
        const activeLink = document.querySelector(`a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Manipula cliques fora do menu para fechá-lo
     * @param {Event} e - Evento de clique
     */
    handleOutsideClick(e) {
        if (!this.isMenuOpen) return;
        
        const isClickInsideNav = this.navMenu.contains(e.target) || 
                                this.navToggle.contains(e.target);
        
        if (!isClickInsideNav) {
            this.closeMobileMenu();
        }
    }

    /**
     * Manipula navegação por teclado nos links
     */
    handleNavKeydown(e) {
        // Enter ou Space ativam o link
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.target.click();
        }
        
        // Navegação por setas no menu mobile
        if (this.isMenuOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            this.navigateMenuWithArrows(e.target, e.key === 'ArrowDown');
        }
    }

    /**
     * Manipula navegação por teclado no botão hamburger
     */
    handleToggleKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.toggleMobileMenu();
        }
    }

    /**
     * Navega pelo menu usando setas do teclado
     */
    navigateMenuWithArrows(currentLink, isDown) {
        const menuLinks = Array.from(this.navMenu.querySelectorAll('.nav-link'));
        const currentIndex = menuLinks.indexOf(currentLink);
        
        let nextIndex;
        if (isDown) {
            nextIndex = currentIndex + 1 >= menuLinks.length ? 0 : currentIndex + 1;
        } else {
            nextIndex = currentIndex - 1 < 0 ? menuLinks.length - 1 : currentIndex - 1;
        }
        
        menuLinks[nextIndex].focus();
    }

    /**
     * Manipula redimensionamento da janela
     */
    handleResize() {
        // Fecha menu mobile se a tela for redimensionada para desktop
        if (window.innerWidth >= 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
    }
}

/**
 * Classe FormValidator
 * 
 * Gerencia a validação completa do formulário de contato:
 * - Validação em tempo real dos campos
 * - Validação de formato de email
 * - Exibição de mensagens de erro específicas
 * - Simulação de envio com feedback visual
 * - Estados de loading e sucesso
 * - Limpeza automática após envio bem-sucedido
 */
class FormValidator {
    constructor(formId) {
        // Referência ao formulário
        this.form = document.getElementById(formId);
        
        // Configuração dos campos com seus estados
        this.fields = {
            name: {
                element: null,        // Input do nome
                errorElement: null,   // Elemento para mostrar erro
                isValid: false,       // Estado de validação
                value: ''            // Valor atual
            },
            email: {
                element: null,
                errorElement: null,
                isValid: false,
                value: ''
            },
            message: {
                element: null,
                errorElement: null,
                isValid: false,
                value: ''
            }
        };
        
        // Referência ao botão de envio
        this.submitButton = null;
        
        // Estado de envio (previne múltiplos envios)
        this.isSubmitting = false;
        
        // Inicializa o validador
        this.init();
    }

    /**
     * Inicializa o validador de formulário
     */
    init() {
        if (!this.form) {
            console.warn('Formulário não encontrado:', this.formId);
            return;
        }

        // Busca elementos do formulário
        this.setupFormElements();
        
        // Configura event listeners
        this.setupEventListeners();
        
        console.log('FormValidator inicializado');
    }

    /**
     * Configura referências aos elementos do formulário
     */
    setupFormElements() {
        // Campos de input
        this.fields.name.element = this.form.querySelector('#name');
        this.fields.email.element = this.form.querySelector('#email');
        this.fields.message.element = this.form.querySelector('#message');
        
        // Elementos de erro
        this.fields.name.errorElement = this.form.querySelector('#nameError');
        this.fields.email.errorElement = this.form.querySelector('#emailError');
        this.fields.message.errorElement = this.form.querySelector('#messageError');
        
        // Botão de submit
        this.submitButton = this.form.querySelector('button[type="submit"]');
    }

    /**
     * Configura event listeners do formulário
     */
    setupEventListeners() {
        // Event listener para submit do formulário
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Event listeners para validação em tempo real
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            if (field.element) {
                // Validação ao sair do campo (blur)
                field.element.addEventListener('blur', () => this.validateField(fieldName));
                
                // Limpa erros ao digitar (input)
                field.element.addEventListener('input', () => this.clearFieldError(fieldName));
            }
        });
    }

    /**
     * Manipula o envio do formulário
     * @param {Event} e - Evento de submit
     */
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Valida todos os campos
        const isFormValid = this.validateAllFields();
        
        if (!isFormValid) {
            this.focusFirstError();
            return;
        }
        
        // Simula envio do formulário
        await this.simulateFormSubmission();
    }

    /**
     * Valida todos os campos do formulário
     * @returns {boolean} - True se todos os campos são válidos
     */
    validateAllFields() {
        let isValid = true;
        
        Object.keys(this.fields).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    /**
     * Valida um campo específico
     * Aplica regras de validação baseadas no tipo de campo
     * @param {string} fieldName - Nome do campo a ser validado ('name', 'email', 'message')
     * @returns {boolean} - True se o campo é válido
     */
    validateField(fieldName) {
        const field = this.fields[fieldName];
        if (!field.element) return false;
        
        // Obtém o valor do campo removendo espaços extras
        const value = field.element.value.trim();
        field.value = value;
        
        // Limpa qualquer erro anterior antes de validar
        this.clearFieldError(fieldName);
        
        // Validação básica: campo obrigatório
        if (!value) {
            this.showFieldError(fieldName, 'Este campo é obrigatório');
            field.isValid = false;
            return false;
        }
        
        // Validações específicas baseadas no tipo de campo
        switch (fieldName) {
            case 'email':
                // Valida formato de email usando regex
                if (!this.isValidEmail(value)) {
                    this.showFieldError(fieldName, 'Por favor, insira um email válido');
                    field.isValid = false;
                    return false;
                }
                break;
                
            case 'message':
                // Valida tamanho mínimo da mensagem
                if (value.length < 10) {
                    this.showFieldError(fieldName, 'A mensagem deve ter pelo menos 10 caracteres');
                    field.isValid = false;
                    return false;
                }
                break;
                
            case 'name':
                // Valida tamanho mínimo do nome
                if (value.length < 2) {
                    this.showFieldError(fieldName, 'O nome deve ter pelo menos 2 caracteres');
                    field.isValid = false;
                    return false;
                }
                break;
        }
        
        // Se chegou até aqui, o campo é válido
        field.isValid = true;
        return true;
    }

    /**
     * Valida formato de email usando expressão regular
     * Verifica se o email tem formato básico: usuario@dominio.extensao
     * @param {string} email - Email a ser validado
     * @returns {boolean} - True se o email tem formato válido
     */
    isValidEmail(email) {
        // Regex simples para validação de email
        // Verifica: caracteres + @ + caracteres + . + caracteres
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Exibe erro para um campo específico
     * @param {string} fieldName - Nome do campo
     * @param {string} message - Mensagem de erro
     */
    showFieldError(fieldName, message) {
        const field = this.fields[fieldName];
        if (!field.errorElement) return;
        
        field.errorElement.textContent = message;
        field.errorElement.style.display = 'block';
        field.element.classList.add('form-input--error');
        field.element.setAttribute('aria-invalid', 'true');
    }

    /**
     * Limpa erro de um campo específico
     * @param {string} fieldName - Nome do campo
     */
    clearFieldError(fieldName) {
        const field = this.fields[fieldName];
        if (!field.errorElement) return;
        
        field.errorElement.textContent = '';
        field.errorElement.style.display = 'none';
        field.element.classList.remove('form-input--error');
        field.element.setAttribute('aria-invalid', 'false');
    }

    /**
     * Limpa todos os erros do formulário
     */
    clearAllErrors() {
        Object.keys(this.fields).forEach(fieldName => {
            this.clearFieldError(fieldName);
        });
    }

    /**
     * Foca no primeiro campo com erro
     */
    focusFirstError() {
        const firstErrorField = Object.keys(this.fields).find(fieldName => 
            !this.fields[fieldName].isValid
        );
        
        if (firstErrorField && this.fields[firstErrorField].element) {
            this.fields[firstErrorField].element.focus();
        }
    }

    /**
     * Simula o envio do formulário
     * Como este é um portfólio estático, simula o processo de envio
     * com delay realista e feedback visual para o usuário
     */
    async simulateFormSubmission() {
        // Marca como enviando para prevenir múltiplos envios
        this.isSubmitting = true;
        
        // Ativa estado de loading no botão
        this.setSubmitButtonState(true);
        
        try {
            // Simula delay de envio realista (1.5 segundos)
            // Em uma aplicação real, aqui seria feita a requisição HTTP
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simula sucesso no envio
            this.showSuccessMessage();
            
            // Limpa o formulário após envio bem-sucedido
            this.clearForm();
            
        } catch (error) {
            // Em caso de erro (não deve acontecer na simulação)
            console.error('Erro na simulação de envio:', error);
            this.showErrorMessage('Erro ao enviar mensagem. Tente novamente.');
        } finally {
            // Sempre restaura o estado normal do botão
            this.isSubmitting = false;
            this.setSubmitButtonState(false);
        }
    }

    /**
     * Define o estado do botão de submit
     * @param {boolean} isLoading - Se está carregando
     */
    setSubmitButtonState(isLoading) {
        if (!this.submitButton) return;
        
        const submitText = this.submitButton.querySelector('.submit-text');
        const submitLoading = this.submitButton.querySelector('.submit-loading');
        
        if (isLoading) {
            this.submitButton.disabled = true;
            this.submitButton.classList.add('form-submit--loading');
            if (submitText) submitText.style.display = 'none';
            if (submitLoading) submitLoading.style.display = 'inline';
        } else {
            this.submitButton.disabled = false;
            this.submitButton.classList.remove('form-submit--loading');
            if (submitText) submitText.style.display = 'inline';
            if (submitLoading) submitLoading.style.display = 'none';
        }
    }

    /**
     * Exibe mensagem de sucesso
     */
    showSuccessMessage() {
        // Busca modal de sucesso existente
        const modal = document.getElementById('successModal');
        const modalClose = document.getElementById('modalClose');
        
        if (modal) {
            // Exibe o modal
            modal.style.display = 'flex';
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            
            // Foca no botão de fechar para acessibilidade
            if (modalClose) {
                modalClose.focus();
                
                // Event listener para fechar modal
                const closeModal = () => {
                    modal.style.display = 'none';
                    modal.classList.remove('show');
                    modal.setAttribute('aria-hidden', 'true');
                    
                    // Retorna foco para o botão de submit
                    if (this.submitButton) {
                        this.submitButton.focus();
                    }
                };
                
                // Fecha com clique no botão
                modalClose.addEventListener('click', closeModal, { once: true });
                
                // Fecha com Escape
                const handleEscape = (e) => {
                    if (e.key === 'Escape') {
                        closeModal();
                        document.removeEventListener('keydown', handleEscape);
                    }
                };
                document.addEventListener('keydown', handleEscape);
                
                // Fecha clicando fora do modal
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        closeModal();
                    }
                }, { once: true });
            }
        } else {
            // Fallback para mensagem inline se modal não existir
            let successElement = this.form.querySelector('.success-message');
            if (!successElement) {
                successElement = document.createElement('div');
                successElement.className = 'success-message';
                successElement.setAttribute('role', 'alert');
                successElement.setAttribute('aria-live', 'polite');
                this.form.appendChild(successElement);
            }
            
            successElement.textContent = 'Mensagem enviada com sucesso! Entrarei em contato em breve.';
            successElement.style.display = 'block';
            
            // Remove mensagem após 5 segundos
            setTimeout(() => {
                successElement.style.display = 'none';
            }, 5000);
        }
    }

    /**
     * Exibe mensagem de erro
     * @param {string} message - Mensagem de erro
     */
    showErrorMessage(message) {
        // Cria elemento de erro se não existir
        let errorElement = this.form.querySelector('.form-error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'form-error-message';
            errorElement.setAttribute('role', 'alert');
            errorElement.setAttribute('aria-live', 'polite');
            this.form.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Remove mensagem após 5 segundos
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }

    /**
     * Limpa todos os campos do formulário
     */
    clearForm() {
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            if (field.element) {
                field.element.value = '';
                field.value = '';
                field.isValid = false;
            }
        });
        
        this.clearAllErrors();
    }
}

/**
 * Classe PortfolioApp
 * 
 * Classe principal que orquestra toda a aplicação do portfólio.
 * Responsabilidades:
 * - Inicializar todos os componentes na ordem correta
 * - Gerenciar event listeners globais
 * - Coordenar integração entre componentes
 * - Tratar erros de inicialização
 * - Fornecer atalhos de teclado
 * - Gerenciar estados da aplicação (scroll, visibilidade, etc.)
 */
class PortfolioApp {
    constructor() {
        // Armazena instâncias de todos os componentes
        this.components = {
            themeManager: null,       // Gerenciador de temas
            navigationManager: null,  // Gerenciador de navegação
            formValidator: null       // Validador de formulário
        };
        
        // Flag para indicar se a aplicação foi inicializada com sucesso
        this.isInitialized = false;
        
        // Inicia a inicialização da aplicação
        this.init();
    }

    /**
     * Inicializa a aplicação e todos os componentes
     * Processo assíncrono que garante ordem correta de inicialização
     */
    async init() {
        try {
            console.log('Inicializando Portfolio App...');
            
            // Passo 1: Inicializa todos os componentes na ordem correta
            await this.initializeComponents();
            
            // Passo 2: Configura event listeners globais da aplicação
            this.setupGlobalEventListeners();
            
            // Passo 3: Configura integração e comunicação entre componentes
            this.setupComponentIntegration();
            
            // Marca a aplicação como totalmente inicializada
            this.isInitialized = true;
            
            console.log('Portfolio App inicializado com sucesso');
            console.log('Componentes ativos:', Object.keys(this.components));
            
        } catch (error) {
            // Em caso de erro, tenta recuperação ou inicialização parcial
            console.error('Erro ao inicializar Portfolio App:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Inicializa todos os componentes principais
     */
    async initializeComponents() {
        // Inicializa gerenciador de temas
        this.components.themeManager = new ThemeManager();
        
        // Aguarda um frame para garantir que o tema seja aplicado
        await this.waitForNextFrame();
        
        // Inicializa gerenciador de navegação
        this.components.navigationManager = new NavigationManager();
        
        // Inicializa validador de formulário
        this.components.formValidator = new FormValidator('contactForm');
        
        console.log('Todos os componentes inicializados');
    }

    /**
     * Configura event listeners globais da aplicação
     */
    setupGlobalEventListeners() {
        // Event listener para mudanças de visibilidade da página
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Event listener para redimensionamento da janela
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleWindowResize();
            }, 150);
        });

        // Event listener para scroll da página
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 10);
        });

        // Event listener para teclas de atalho
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        console.log('Event listeners globais configurados');
    }

    /**
     * Configura integração entre componentes
     */
    setupComponentIntegration() {
        // Integração entre tema e navegação
        if (this.components.themeManager && this.components.navigationManager) {
            // Quando o tema muda, atualiza indicadores visuais da navegação
            const originalToggleTheme = this.components.themeManager.toggleTheme.bind(this.components.themeManager);
            this.components.themeManager.toggleTheme = () => {
                originalToggleTheme();
                this.onThemeChange();
            };
        }

        // Integração entre navegação e formulário
        if (this.components.navigationManager && this.components.formValidator) {
            // Quando navega para seção de contato, foca no primeiro campo se houver erro
            const originalScrollToSection = this.components.navigationManager.scrollToSection.bind(this.components.navigationManager);
            this.components.navigationManager.scrollToSection = (section) => {
                originalScrollToSection(section);
                if (section.id === 'contato') {
                    this.onNavigateToContact();
                }
            };
        }

        console.log('Integração entre componentes configurada');
    }

    /**
     * Manipula mudanças de tema
     */
    onThemeChange() {
        // Atualiza elementos que podem precisar de ajustes específicos
        this.updateThemeSpecificElements();
        
        // Dispara evento customizado para outros scripts
        document.dispatchEvent(new CustomEvent('portfolioThemeChange', {
            detail: { 
                theme: this.components.themeManager?.currentTheme 
            }
        }));
    }

    /**
     * Manipula navegação para seção de contato
     */
    onNavigateToContact() {
        // Pequeno delay para aguardar o scroll completar
        setTimeout(() => {
            // Se há erros no formulário, foca no primeiro campo com erro
            if (this.components.formValidator) {
                const firstErrorField = document.querySelector('.form-input--error, .form-textarea--error');
                if (firstErrorField) {
                    firstErrorField.focus();
                }
            }
        }, 600);
    }

    /**
     * Atualiza elementos específicos do tema
     */
    updateThemeSpecificElements() {
        // Atualiza meta theme-color para mobile browsers
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            themeColorMeta.setAttribute('content', isDark ? '#1a1a1a' : '#ffffff');
        }
    }

    /**
     * Manipula mudanças de visibilidade da página
     */
    handleVisibilityChange() {
        if (document.hidden) {
            // Página ficou oculta - pausa animações desnecessárias
            document.body.classList.add('page-hidden');
        } else {
            // Página ficou visível - retoma animações
            document.body.classList.remove('page-hidden');
        }
    }

    /**
     * Manipula redimensionamento da janela
     */
    handleWindowResize() {
        // Notifica componentes sobre mudança de tamanho
        if (this.components.navigationManager) {
            // O NavigationManager já tem seu próprio handler, mas podemos adicionar lógica extra aqui
            this.updateLayoutForScreenSize();
        }
    }

    /**
     * Atualiza layout baseado no tamanho da tela
     */
    updateLayoutForScreenSize() {
        const isMobile = window.innerWidth < 768;
        document.body.classList.toggle('is-mobile', isMobile);
        document.body.classList.toggle('is-desktop', !isMobile);
    }

    /**
     * Manipula scroll da página
     */
    handleScroll() {
        // Adiciona classe quando há scroll
        const hasScrolled = window.scrollY > 50;
        document.body.classList.toggle('has-scrolled', hasScrolled);
        
        // Atualiza navegação se necessário
        const nav = document.querySelector('.main-nav');
        if (nav) {
            nav.classList.toggle('scrolled', hasScrolled);
        }
    }

    /**
     * Manipula atalhos de teclado
     */
    handleKeyboardShortcuts(e) {
        // Atalho para alternar tema (Ctrl/Cmd + Shift + T)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
            e.preventDefault();
            if (this.components.themeManager) {
                this.components.themeManager.toggleTheme();
            }
        }

        // Atalho para ir ao topo (Home)
        if (e.key === 'Home' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Atalho para ir ao final (End)
        if (e.key === 'End' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    }

    /**
     * Manipula erros de inicialização
     */
    handleInitializationError(error) {
        // Tenta inicialização básica mesmo com erro
        console.warn('Tentando inicialização de fallback...');
        
        try {
            // Inicializa apenas componentes que funcionam
            if (!this.components.themeManager) {
                this.components.themeManager = new ThemeManager();
            }
        } catch (fallbackError) {
            console.error('Falha na inicialização de fallback:', fallbackError);
        }
    }

    /**
     * Utilitário para aguardar próximo frame
     */
    waitForNextFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }

    /**
     * Obtém informações sobre o estado da aplicação
     */
    getAppState() {
        return {
            isInitialized: this.isInitialized,
            components: Object.keys(this.components).reduce((acc, key) => {
                acc[key] = !!this.components[key];
                return acc;
            }, {}),
            theme: this.components.themeManager?.currentTheme || 'unknown',
            currentSection: this.components.navigationManager?.currentSection || 'unknown'
        };
    }

    /**
     * Método público para reinicializar componentes se necessário
     */
    reinitialize() {
        console.log('Reinicializando Portfolio App...');
        this.isInitialized = false;
        this.init();
    }
}

// =============================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// =============================================================================

// Variável global para acesso à instância principal da aplicação
let portfolioApp = null;

/**
 * Inicialização quando o DOM estiver carregado
 * Garante que todos os elementos HTML estejam disponíveis antes de iniciar
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - Iniciando Portfolio App');
    
    // Cria a instância principal da aplicação
    portfolioApp = new PortfolioApp();
    
    // Expõe a aplicação no window apenas em ambiente de desenvolvimento
    // Útil para debug e testes no console do navegador
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.portfolioApp = portfolioApp;
        console.log('Portfolio App disponível em window.portfolioApp para debug');
    }
});

/**
 * Event listener para quando a página estiver completamente carregada
 * Inclui todos os recursos (imagens, CSS, etc.)
 */
window.addEventListener('load', function() {
    console.log('Página completamente carregada');
    
    // Adiciona classe CSS indicando que o carregamento foi concluído
    // Pode ser usada para animações de entrada ou outros efeitos
    document.body.classList.add('page-loaded');
    
    // Verifica se a aplicação foi inicializada corretamente
    if (portfolioApp && portfolioApp.isInitialized) {
        console.log('Estado da aplicação:', portfolioApp.getAppState());
    }
});

/**
 * Event listener para capturar erros JavaScript não tratados
 * Implementa sistema de recuperação automática em caso de falhas
 */
window.addEventListener('error', function(e) {
    console.error('Erro não capturado:', e.error);
    
    // Tenta recuperação automática se a aplicação não foi inicializada
    if (!portfolioApp || !portfolioApp.isInitialized) {
        console.log('Tentando recuperação da aplicação...');
        
        // Aguarda 1 segundo antes de tentar recuperação
        setTimeout(() => {
            if (!portfolioApp) {
                // Cria nova instância se não existe
                portfolioApp = new PortfolioApp();
            } else {
                // Reinicializa a instância existente
                portfolioApp.reinitialize();
            }
        }, 1000);
    }
});