// Script principal do site MudaDF
// Arquivo: js/script.js

document.addEventListener('DOMContentLoaded', function() {
    
    // ====================================
    // MENU MOBILE - HAMBURGER
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
    // MÁSCARAS DE INPUT - FORMULÁRIO DE CADASTRO
    // ====================================
    
    // Máscara para CPF (000.000.000-00)
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            
            e.target.value = value;
        });
    }

    // Máscara para Telefone ((00) 00000-0000 ou (00) 0000-0000)
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.slice(0, 11);
            
            if (value.length <= 10) {
                // Formato: (00) 0000-0000
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
            } else {
                // Formato: (00) 00000-0000
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
            
            e.target.value = value;
        });
    }

    // Máscara para CEP (00000-000)
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.slice(0, 8);
            
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            
            e.target.value = value;
        });
    }

    // ====================================
    // ATUALIZAÇÃO DO OUTPUT DO RANGE (DISPONIBILIDADE)
    // ====================================
    const disponibilidadeRange = document.getElementById('disponibilidade');
    const disponibilidadeOutput = document.getElementById('disponibilidade-output');
    
    if (disponibilidadeRange && disponibilidadeOutput) {
        disponibilidadeRange.addEventListener('input', function() {
            disponibilidadeOutput.textContent = this.value + ' horas';
        });
    }

    // ====================================
    // VALIDAÇÃO E SUBMISSÃO DO FORMULÁRIO DE CADASTRO
    // ====================================
    const cadastroForm = document.getElementById('cadastro-form');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (cadastroForm.checkValidity()) {
                // Coleta os dados do formulário
                const formData = new FormData(cadastroForm);
                const dados = {};
                
                formData.forEach((value, key) => {
                    if (dados[key]) {
                        // Se a chave já existe, transforma em array
                        if (!Array.isArray(dados[key])) {
                            dados[key] = [dados[key]];
                        }
                        dados[key].push(value);
                    } else {
                        dados[key] = value;
                    }
                });
                
                // Exibe mensagem de sucesso
                alert('✅ Cadastro realizado com sucesso!\n\nObrigado por se juntar à MudaDF, ' + dados['nome-completo'] + '!\n\nEm breve entraremos em contato.');
                
                // Aqui você pode adicionar código para enviar os dados para um servidor
                console.log('Dados do cadastro:', dados);
                
                // Limpa o formulário
                cadastroForm.reset();
                
                // Reseta o output do range
                if (disponibilidadeOutput) {
                    disponibilidadeOutput.textContent = '0 horas';
                }
            } else {
                // Força a exibição das mensagens de validação nativas
                cadastroForm.reportValidity();
            }
        });
    }

    // ====================================
    // MODAL DE DOAÇÃO (PÁGINA PROJETOS)
    // ====================================
    const donationModal = document.getElementById('donation-modal');
    
    // Função para abrir o modal
    window.openDonationModal = function() {
        if (donationModal) {
            donationModal.style.display = 'flex';
            donationModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Previne scroll da página
        }
    };
    
    // Função para fechar o modal
    window.closeDonationModal = function() {
        if (donationModal) {
            donationModal.style.display = 'none';
            donationModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = ''; // Restaura scroll da página
        }
    };
    
    // Fechar modal ao clicar fora do conteúdo
    if (donationModal) {
        donationModal.addEventListener('click', function(e) {
            if (e.target === donationModal) {
                window.closeDonationModal();
            }
        });
        
        // Fechar modal com tecla ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && donationModal.style.display === 'flex') {
                window.closeDonationModal();
            }
        });
    }
    
    // Submissão do formulário de doação
    const donationForm = document.querySelector('.donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const amount = document.getElementById('donation-amount').value;
            const name = document.getElementById('donor-name').value;
            
            alert('🙏 Obrigado pela sua doação de R$ ' + amount + ', ' + name + '!\n\nVocê será redirecionado para a página de pagamento.');
            
            // Aqui você redirecionaria para a página de pagamento
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
    // COPIAR CHAVE PIX (PÁGINA PROJETOS)
    // ====================================
    window.copyPixKey = function() {
        const pixKey = 'contato@ongmudadf.org';
        
        // Cria um elemento temporário para copiar o texto
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
    // SMOOTH SCROLL PARA LINKS INTERNOS
    // ====================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Ignora links que são apenas "#"
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
    
    // Adiciona animação a elementos específicos
    document.querySelectorAll('.project-card, .team-member, .timeline-item').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // ====================================
    // CONSOLE LOG - INFORMAÇÃO DO PROJETO
    // ====================================
    console.log('%c🌱 MudaDF - Transformando Vidas desde 2010', 'font-size: 16px; color: #28a745; font-weight: bold;');
    console.log('%cSite desenvolvido com HTML5, CSS3 e JavaScript', 'font-size: 12px; color: #666;');
    console.log('%cInteressado em contribuir? Visite: cadastro.html', 'font-size: 12px; color: #007bff;');

});

// ====================================
// VALIDAÇÃO ADICIONAL DE CPF (OPCIONAL)
// ====================================
function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false; // Verifica se todos os dígitos são iguais
    
    // Validação dos dígitos verificadores
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