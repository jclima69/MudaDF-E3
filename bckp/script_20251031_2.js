// =============================================
// SCRIPT CONSOLIDADO - MudaDF
// =============================================

// =============================================
// CLASSES AUXILIARES
// =============================================

class InputMask {
    static cpf(input) {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            
            e.target.value = value;
        });
    }

    static telefone(input) {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length <= 10) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
            } else {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }

    static cep(input) {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.slice(0, 8);
            
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            
            e.target.value = value;
        });
    }
}

class ErrorManager {
    static showFieldError(fieldName, message) {
        this.clearFieldError(fieldName);
        
        const input = document.querySelector(`[name="${fieldName}"]`);
        const checkboxes = document.querySelectorAll(`[name="${fieldName}"]`);
        
        let targetElement = input;
        
        if (checkboxes.length > 1) {
            targetElement = checkboxes[0].closest('.form-group');
        }
        
        if (targetElement) {
            const formGroup = targetElement.closest('.form-group');
            if (formGroup) {
                formGroup.classList.add('error');
                
                const errorElement = document.createElement('span');
                errorElement.className = 'error-message active';
                errorElement.id = `${fieldName}-error`;
                errorElement.setAttribute('role', 'alert');
                errorElement.setAttribute('aria-live', 'polite');
                errorElement.textContent = message;
                
                formGroup.appendChild(errorElement);
                
                if (input) {
                    input.setAttribute('aria-invalid', 'true');
                    input.setAttribute('aria-describedby', `${fieldName}-error`);
                }
                
                if (input && input.type !== 'hidden') {
                    input.focus();
                }
            }
        }
    }

    static clearFieldError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        const input = document.querySelector(`[name="${fieldName}"]`);
        const checkboxes = document.querySelectorAll(`[name="${fieldName}"]`);
        
        let targetElement = input;
        
        if (checkboxes.length > 1) {
            targetElement = checkboxes[0].closest('.form-group');
        }
        
        if (errorElement) {
            errorElement.remove();
        }
        
        if (targetElement) {
            const formGroup = targetElement.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('error');
                
                if (input) {
                    input.removeAttribute('aria-invalid');
                    input.removeAttribute('aria-describedby');
                }
            }
        }
    }

    static showGlobalError(message, form = null) {
        this.clearGlobalError(form);
        
        const targetForm = form || document;
        
        const errorElement = document.createElement('div');
        errorElement.className = 'global-error';
        errorElement.id = 'global-error';
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'assertive');
        errorElement.innerHTML = `
            <div class="error-icon">⚠️</div>
            <div class="error-content">
                <strong>Erro no Formulário</strong>
                <p>${message}</p>
            </div>
        `;
        
        if (targetForm.querySelector('form')) {
            targetForm.querySelector('form').insertBefore(errorElement, targetForm.querySelector('form').firstChild);
        } else {
            targetForm.insertBefore(errorElement, targetForm.firstChild);
        }
        
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        setTimeout(() => {
            this.clearGlobalError(form);
        }, 10000);
    }

    static clearGlobalError(form = null) {
        const targetForm = form || document;
        const existingError = targetForm.querySelector('#global-error');
        if (existingError) {
            existingError.remove();
        }
    }

    static showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✓' : '⚠️'}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
}

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;
        
        this.fields = {
            'nome-completo': this.validateNome,
            'email': this.validateEmail,
            'cpf': this.validateCPF,
            'telefone': this.validateTelefone,
            'data-nascimento': this.validateDataNascimento,
            'cep': this.validateCEP,
            'endereco': this.validateEndereco,
            'cidade': this.validateCidade,
            'estado': this.validateEstado,
            'interesse': this.validateInteresse,
            'termos': this.validateTermos
        };
        
        this.errorMessages = {
            'nome-completo': {
                'required': 'Nome completo é obrigatório',
                'invalid': 'Digite nome e sobrenome',
                'minlength': 'Nome deve ter pelo menos 3 caracteres'
            },
            'email': {
                'required': 'E-mail é obrigatório',
                'invalid': 'Digite um e-mail válido (exemplo@dominio.com)'
            },
            'cpf': {
                'required': 'CPF é obrigatório',
                'invalid': 'Digite um CPF válido (11 dígitos)',
                'format': 'Formato inválido (use: 000.000.000-00)'
            },
            'telefone': {
                'required': 'Telefone é obrigatório',
                'invalid': 'Digite um telefone válido (10 ou 11 dígitos)',
                'format': 'Formato inválido (use: (00) 00000-0000)'
            },
            'data-nascimento': {
                'required': 'Data de nascimento é obrigatória',
                'invalid': 'Data inválida',
                'age': 'Você deve ter entre 16 e 100 anos para se cadastrar'
            },
            'cep': {
                'required': 'CEP é obrigatório',
                'invalid': 'Digite um CEP válido (8 dígitos)',
                'format': 'Formato inválido (use: 00000-000)'
            },
            'endereco': {
                'required': 'Endereço é obrigatório',
                'invalid': 'Digite um endereço válido (mínimo 5 caracteres)'
            },
            'cidade': {
                'required': 'Cidade é obrigatória',
                'invalid': 'Digite uma cidade válida (mínimo 2 caracteres)'
            },
            'estado': {
                'required': 'Estado é obrigatório',
                'invalid': 'Selecione um estado'
            },
            'interesse': {
                'required': 'Selecione pelo menos uma forma de participação'
            },
            'termos': {
                'required': 'Você deve aceitar os termos e condições'
            }
        };
        
        this.init();
    }

    init() {
        this.applyMasks();
        this.addEventListeners();
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    applyMasks() {
        const cpfInput = this.form.querySelector('#cpf');
        const telefoneInput = this.form.querySelector('#telefone');
        const cepInput = this.form.querySelector('#cep');

        if (cpfInput) InputMask.cpf(cpfInput);
        if (telefoneInput) InputMask.telefone(telefoneInput);
        if (cepInput) InputMask.cep(cepInput);
    }

    addEventListeners() {
        Object.keys(this.fields).forEach(fieldName => {
            const input = this.form.querySelector(`[name="${fieldName}"]`);
            if (input) {
                input.addEventListener('blur', () => this.validateField(fieldName));
                input.addEventListener('input', () => {
                    ErrorManager.clearFieldError(fieldName);
                    if (['cpf', 'telefone', 'cep', 'email'].includes(fieldName)) {
                        clearTimeout(this[`${fieldName}Timeout`]);
                        this[`${fieldName}Timeout`] = setTimeout(() => {
                            this.validateField(fieldName);
                        }, 1000);
                    }
                });
            }
        });

        const interesseCheckboxes = this.form.querySelectorAll('input[name="interesse"]');
        interesseCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.validateField('interesse'));
        });

        const cepInput = this.form.querySelector('#cep');
        if (cepInput) {
            cepInput.addEventListener('blur', () => {
                if (this.validateCEP(cepInput.value)) {
                    this.buscarEndereco();
                }
            });
        }

        const disponibilidadeInput = this.form.querySelector('#disponibilidade');
        const disponibilidadeOutput = this.form.querySelector('#disponibilidade-output');
        if (disponibilidadeInput && disponibilidadeOutput) {
            disponibilidadeInput.addEventListener('input', (e) => {
                disponibilidadeOutput.textContent = `${e.target.value} horas`;
            });
        }
    }

    validateField(fieldName) {
        const input = this.form.querySelector(`[name="${fieldName}"]`);
        const checkboxes = this.form.querySelectorAll(`[name="${fieldName}"]`);
        
        let value, isValid, errorType;
        
        if (checkboxes.length > 1) {
            const checked = Array.from(checkboxes).some(cb => cb.checked);
            value = checked ? 'checked' : '';
            isValid = this.fields[fieldName](value);
            errorType = !checked ? 'required' : null;
        } else {
            value = input.value;
            isValid = this.fields[fieldName](value);
            errorType = this.getErrorType(fieldName, value, isValid);
        }
        
        if (!isValid) {
            const errorMessage = this.getErrorMessage(fieldName, errorType);
            ErrorManager.showFieldError(fieldName, errorMessage);
            return false;
        } else {
            ErrorManager.clearFieldError(fieldName);
            return true;
        }
    }

    getErrorType(fieldName, value, isValid) {
        if (!value.trim()) return 'required';
        
        switch(fieldName) {
            case 'nome-completo':
                return value.trim().length < 3 ? 'minlength' : 
                       value.trim().split(' ').length < 2 ? 'invalid' : null;
            
            case 'email':
                return 'invalid';
            
            case 'cpf':
            case 'telefone':
            case 'cep':
                const cleanValue = value.replace(/\D/g, '');
                if (fieldName === 'cpf' && cleanValue.length !== 11) return 'invalid';
                if (fieldName === 'telefone' && (cleanValue.length < 10 || cleanValue.length > 11)) return 'invalid';
                if (fieldName === 'cep' && cleanValue.length !== 8) return 'invalid';
                return 'format';
            
            case 'data-nascimento':
                if (!value) return 'required';
                const dataNascimento = new Date(value);
                const hoje = new Date();
                const idade = hoje.getFullYear() - dataNascimento.getFullYear();
                if (idade < 16 || idade > 100) return 'age';
                return 'invalid';
            
            default:
                return 'invalid';
        }
    }

    validateNome(value) {
        return value.trim().length >= 3 && value.trim().split(' ').length >= 2;
    }

    validateEmail(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    }

    validateCPF(value) {
        const cpf = value.replace(/\D/g, '');
        if (cpf.length !== 11) return false;
        if (/^(\d)\1+$/.test(cpf)) return false;
        
        let soma = 0;
        let resto;
        
        for (let i = 1; i <= 9; i++) {
            soma = soma + parseInt(cpf.substring(i-1, i)) * (11 - i);
        }
        
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;
        
        soma = 0;
        for (let i = 1; i <= 10; i++) {
            soma = soma + parseInt(cpf.substring(i-1, i)) * (12 - i);
        }
        
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;
        
        return true;
    }

    validateTelefone(value) {
        const telefone = value.replace(/\D/g, '');
        return telefone.length >= 10 && telefone.length <= 11;
    }

    validateDataNascimento(value) {
        if (!value) return false;
        
        const dataNascimento = new Date(value);
        const hoje = new Date();
        let idade = hoje.getFullYear() - dataNascimento.getFullYear();
        const mes = hoje.getMonth() - dataNascimento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimento.getDate())) {
            idade--;
        }
        
        return idade >= 16 && idade <= 100;
    }

    validateCEP(value) {
        const cep = value.replace(/\D/g, '');
        return cep.length === 8;
    }

    validateEndereco(value) {
        return value.trim().length >= 5;
    }

    validateCidade(value) {
        return value.trim().length >= 2;
    }

    validateEstado(value) {
        return value !== '';
    }

    validateInteresse(value) {
        const checkboxes = this.form.querySelectorAll('input[name="interesse"]');
        return Array.from(checkboxes).some(cb => cb.checked);
    }

    validateTermos(value) {
        const checkbox = this.form.querySelector('input[name="termos"]');
        return checkbox ? checkbox.checked : false;
    }

    getErrorMessage(fieldName, errorType) {
        return this.errorMessages[fieldName]?.[errorType] || 'Campo inválido';
    }

    async buscarEndereco() {
        const cepInput = this.form.querySelector('#cep');
        const cep = cepInput.value.replace(/\D/g, '');
        
        if (cep.length !== 8) return;
        
        try {
            cepInput.setAttribute('disabled', 'true');
            
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            
            cepInput.removeAttribute('disabled');
            
            if (!data.erro) {
                this.form.querySelector('#endereco').value = data.logradouro;
                this.form.querySelector('#cidade').value = data.localidade;
                this.form.querySelector('#estado').value = data.uf;
                
                ErrorManager.showToast('Endereço preenchido automaticamente!', 'success');
            } else {
                ErrorManager.showFieldError('cep', 'CEP não encontrado');
            }
        } catch (error) {
            cepInput.removeAttribute('disabled');
            ErrorManager.showFieldError('cep', 'Erro ao buscar CEP. Tente novamente.');
            console.error('Erro ao buscar CEP:', error);
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        let isValid = true;
        let firstErrorField = null;
        
        Object.keys(this.fields).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
                if (!firstErrorField) {
                    firstErrorField = fieldName;
                }
            }
        });
        
        if (isValid) {
            this.submitForm();
        } else {
            const errorMessage = 'Por favor, corrija os erros destacados em vermelho antes de enviar o formulário.';
            ErrorManager.showGlobalError(errorMessage, this.form);
            
            if (firstErrorField) {
                const firstErrorElement = document.querySelector(`[name="${firstErrorField}"]`);
                if (firstErrorElement) {
                    firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstErrorElement.focus();
                }
            }
        }
    }

    submitForm() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('Dados do formulário:', data);
        
        this.showSuccessMessage();
        
        this.form.reset();
        
        const disponibilidadeOutput = this.form.querySelector('#disponibilidade-output');
        if (disponibilidadeOutput) {
            disponibilidadeOutput.textContent = '0 horas';
        }
        
        Object.keys(this.fields).forEach(fieldName => {
            ErrorManager.clearFieldError(fieldName);
        });
    }

    showSuccessMessage() {
        ErrorManager.showToast('Cadastro realizado com sucesso! Em breve entraremos em contato.', 'success');
        
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message global';
        successMessage.innerHTML = `
            <div class="success-icon">✓</div>
            <div class="success-content">
                <h3>Cadastro Realizado com Sucesso!</h3>
                <p>Obrigado por se cadastrar. Em breve nossa equipe entrará em contato para dar continuidade ao processo.</p>
                <p><strong>Próximos passos:</strong></p>
                <ul>
                    <li>Análise do cadastro (24-48 horas)</li>
                    <li>Entrada em contato por e-mail/telefone</li>
                    <li>Orientações sobre próximos passos</li>
                </ul>
            </div>
        `;
        
        this.form.innerHTML = '';
        this.form.appendChild(successMessage);
    }
}

// =============================================
// INICIALIZAÇÃO PRINCIPAL
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // ====================================
    // ESTILOS DINÂMICOS
    // ====================================
    const dynamicStyles = `
        .form-group.error input,
        .form-group.error select,
        .form-group.error textarea {
            border-color: #dc3545 !important;
            background-color: #fff5f5;
            box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.1);
        }
        
        .form-group.error .checkbox-label {
            color: #dc3545;
        }
        
        .error-message {
            display: none;
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.5rem;
            padding: 0.5rem;
            background: #fff5f5;
            border: 1px solid #f8d7da;
            border-radius: 4px;
            animation: slideDown 0.3s ease-out;
        }
        
        .error-message.active {
            display: block;
        }
        
        .global-error {
            background: #fff5f5;
            color: #721c24;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            border: 1px solid #f8d7da;
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            animation: shake 0.5s ease-in-out;
        }
        
        .global-error .error-icon {
            font-size: 1.5rem;
            flex-shrink: 0;
        }
        
        .global-error .error-content strong {
            display: block;
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }
        
        .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        }
        
        .toast-error {
            background: #fff5f5;
            color: #721c24;
            border: 1px solid #f8d7da;
        }
        
        .toast-success {
            background: #f0fff4;
            color: #1e6b46;
            border: 1px solid #c6f6d5;
        }
        
        .toast-icon {
            font-size: 1.25rem;
            flex-shrink: 0;
        }
        
        .toast-close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            margin-left: auto;
            opacity: 0.7;
        }
        
        .toast-close:hover {
            opacity: 1;
        }
        
        .success-message.global {
            background: #f0fff4;
            color: #1e6b46;
            padding: 2rem;
            border-radius: 8px;
            border: 1px solid #c6f6d5;
            text-align: center;
            margin: 2rem 0;
        }
        
        .success-message.global .success-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .success-message.global h3 {
            color: #1e6b46;
            margin-bottom: 1rem;
        }
        
        .success-message.global ul {
            text-align: left;
            max-width: 300px;
            margin: 1rem auto;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
        
        .loading {
            position: relative;
            pointer-events: none;
            opacity: 0.7;
        }
        
        .loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .fade-in-visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        [aria-invalid="true"]:focus {
            outline: 2px solid #dc3545;
            outline-offset: 2px;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = dynamicStyles;
    document.head.appendChild(styleSheet);
    
    // ====================================
    // MENU MOBILE
    // ====================================
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.getElementById('main-menu');
    
    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            mainMenu.classList.toggle('active');
        });
    }

    // ====================================
    // FORMULÁRIO DE CADASTRO
    // ====================================
    if (document.getElementById('cadastro-form')) {
        new FormValidator('cadastro-form');
    }

    // ====================================
    // MODAL DE DOAÇÃO
    // ====================================
    const donationModal = document.getElementById('donation-modal');
    
    window.openDonationModal = function() {
        if (donationModal) {
            donationModal.style.display = 'flex';
            donationModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    };
    
    window.closeDonationModal = function() {
        if (donationModal) {
            donationModal.style.display = 'none';
            donationModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    };
    
    if (donationModal) {
        donationModal.addEventListener('click', function(e) {
            if (e.target === donationModal) {
                window.closeDonationModal();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && donationModal.style.display === 'flex') {
                window.closeDonationModal();
            }
        });
    }
    
    const donationForm = document.querySelector('.donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const amount = document.getElementById('donation-amount').value;
            const name = document.getElementById('donor-name').value;
            
            alert('🙏 Obrigado pela sua doação de R$ ' + amount + ', ' + name + '!\n\nVocê será redirecionado para a página de pagamento.');
            
            console.log('Doação:', {
                valor: amount,
                nome: name,
                email: document.getElementById('donor-email').value
            });
            
            window.closeDonationModal();
            donationForm.reset();
        });
    }

    // ====================================
    // COPIAR CHAVE PIX
    // ====================================
    window.copyPixKey = function() {
        const pixKey = 'contato@ongmudadf.org';
        
        const tempInput = document.createElement('input');
        tempInput.value = pixKey;
        document.body.appendChild(tempInput);
        tempInput.select();
        
        try {
            document.execCommand('copy');
            alert('✅ Chave PIX copiada!\n\n' + pixKey);
        } catch (err) {
            alert('❌ Erro ao copiar. Por favor, copie manualmente:\n\n' + pixKey);
        }
        
        document.body.removeChild(tempInput);
    };

    // ====================================
    // SMOOTH SCROLL
    // ====================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ====================================
    // ANIMAÇÃO DE ENTRADA (FADE IN)
    // ====================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.project-card, .team-member, .timeline-item').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // ====================================
    // EXPOR CLASSES GLOBALMENTE
    // ====================================
    window.ErrorManager = ErrorManager;
    window.InputMask = InputMask;
    window.FormValidator = FormValidator;

    // ====================================
    // CONSOLE LOG - INFORMAÇÃO DO PROJETO
    // ====================================
    console.log('%c🌱 MudaDF - Transformando Vidas desde 2010', 'font-size: 16px; color: #28a745; font-weight: bold;');
    console.log('%cSite desenvolvido com HTML5, CSS3 e JavaScript', 'font-size: 12px; color: #666;');
    console.log('%cInteressado em contribuir? Visite: cadastro.html', 'font-size: 12px; color: #007bff;');

});

// =============================================
// FUNÇÕES AUXILIARES GLOBAIS
// =============================================

// Validação adicional de CPF (disponível globalmente)
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}