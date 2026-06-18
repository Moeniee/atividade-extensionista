firebase.auth().onAuthStateChanged(user => {
    const loginBtn = document.getElementById('login-btn');
    if (user) {
        loginBtn.style.display = 'none';
        // Add user menu
        const userMenu = document.createElement('div');
        userMenu.className = 'dropdown ms-2';
        userMenu.innerHTML = `
            <button class="btn btn-secondary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-person-circle"></i>
            </button>
            <ul class="dropdown-menu" aria-labelledby="userDropdown">
                <li><a class="dropdown-item" href="/meuPerfil.html">Meu Perfil</a></li>
                <li><a class="dropdown-item" href="#" onclick="logout()">Sair</a></li>
            </ul>
        `;
        loginBtn.parentNode.appendChild(userMenu);
    } else {
        loginBtn.style.display = 'inline-block';
        const userMenu = document.querySelector('.dropdown.ms-2');
        if (userMenu) userMenu.remove();
    }
});

function logout() {
    firebase.auth().signOut().then(() => {
        console.log('User logged out');
    }).catch(error => {
        console.log('Logout error', error);
    });
}

const form = {
    newsletterForm: document.getElementById('newsletter-form'),
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    telefone: document.getElementById('telefone'),
    data_nascimento: document.getElementById('data_nascimento'),
    newsletterBtn: document.getElementById('newsletter-btn'),
    errorMessage: document.getElementById('newsletter-error'),
    successMessage: document.getElementById('newsletter-success')
};

// Validation messages
const errorMessages = {
    name: 'Nome é obrigatório',
    email: 'Email é obrigatório',
    telefone: 'Telefone é obrigatório',
    data_nascimento: 'Data de aniversário é obrigatória'
};

// Show error message (only after user interacts)
function showError(input, message) {
    input.classList.add('is-invalid');
    const errorId = input.id + '-error';
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.classList.remove('d-none');
    }
}

// Clear error on input
function clearError(input) {
    input.classList.remove('is-invalid');
    const errorId = input.id + '-error';
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.classList.add('d-none');
    }
}
function showFormMessage(message, type = 'danger') {
    if (!form.errorMessage || !form.successMessage) return;

    form.errorMessage.classList.add('d-none');
    form.successMessage.classList.add('d-none');
    form.errorMessage.textContent = '';
    form.successMessage.textContent = '';

    const target = type === 'success' ? form.successMessage : form.errorMessage;
    target.textContent = message;
    target.classList.remove('d-none');
}

function clearFormMessages() {
    if (form.errorMessage) {
        form.errorMessage.classList.add('d-none');
        form.errorMessage.textContent = '';
    }
    if (form.successMessage) {
        form.successMessage.classList.add('d-none');
        form.successMessage.textContent = '';
    }
}
// Add input event listeners to show errors only after user types
function setupInputValidation() {
    const fields = ['name', 'email', 'telefone', 'data_nascimento'];
    
    fields.forEach(field => {
        if (form[field]) {
            form[field].addEventListener('input', function() {
                if (this.value.trim()) {
                    clearError(this);
                }
            });
        }
    });
}

// Validate form
function validateNewsletterForm() {
    let isValid = true;
    
    // Validate name
    if (!form.name.value.trim()) {
        showError(form.name, errorMessages.name);
        isValid = false;
    } else {
        clearError(form.name);
    }
    
    // Validate email
    if (!form.email.value.trim()) {
        showError(form.email, errorMessages.email);
        isValid = false;
    } else {
        clearError(form.email);
    }
    
    // Validate telefone
    if (!form.telefone.value.trim()) {
        showError(form.telefone, errorMessages.telefone);
        isValid = false;
    } else {
        clearError(form.telefone);
    }
    
    // Validate data_nascimento
    if (!form.data_nascimento.value) {
        showError(form.data_nascimento, errorMessages.data_nascimento);
        isValid = false;
    } else {
        clearError(form.data_nascimento);
    }
    
    return isValid;
}


function createLeadId(email) {
    const normalized = email.trim().toLowerCase();
    return btoa(normalized).replace(/\//g, '_').replace(/\+/g, '-').replace(/=+$/, '');
}

let currentDoacaoId = null;
let unsubscribeDoacaoStatus = null;

function mostrarConfirmacaoDoacao() {
    const dados = document.getElementById('dadosDoacaoPix');
    const resultado = document.getElementById('resultadoDoacaoPix');
    const erro = document.getElementById('erroDoacaoPix');
    const confirmacao = document.getElementById('confirmacaoDoacaoPix');

    if (dados) dados.classList.add('d-none');
    if (resultado) resultado.classList.add('d-none');
    if (erro) erro.classList.add('d-none');
    if (confirmacao) confirmacao.classList.remove('d-none');
}

function acompanharStatusDoacao(doacaoId) {
    if (!doacaoId) {
        return null;
    }

    let intervalId = null;
    let attempts = 0;
    let failures = 0;
    const maxAttempts = 40;
    const maxFailuresBeforeError = 5;
    const erroElemento = document.getElementById('erroDoacaoPix');
    const aguardando = document.getElementById('doacaoPixAguardando');

    if (aguardando) {
        aguardando.classList.remove('d-none');
    }

    async function checkStatus() {
        attempts += 1;

        try {
            const response = await fetch(`/api/doacoes/pix/status?doacaoId=${encodeURIComponent(doacaoId)}`);
            if (!response.ok) {
                failures += 1;
                if (response.status === 404) {
                    // O documento pode não estar pronto ainda, continue tentando.
                }
            } else {
                failures = 0;
                const data = await response.json();
                const status = String(data.status || '').toLowerCase();

                if (status === 'ok') {
                    if (aguardando) {
                        aguardando.classList.add('d-none');
                    }
                    mostrarConfirmacaoDoacao();
                    cleanupDoacaoListener();
                    return;
                }

                if (status === 'failed' || status === 'erro') {
                    if (aguardando) {
                        aguardando.classList.add('d-none');
                    }
                    if (erroElemento) {
                        erroElemento.textContent = 'Houve um problema com a doação. Verifique o pagamento ou tente novamente.';
                        erroElemento.classList.remove('d-none');
                    }
                    cleanupDoacaoListener();
                    return;
                }
            }

            if (attempts >= maxAttempts) {
                if (aguardando) {
                    aguardando.classList.add('d-none');
                }
                if (erroElemento) {
                    erroElemento.textContent = 'Não foi possível confirmar o pagamento do Pix. Tente novamente mais tarde.';
                    erroElemento.classList.remove('d-none');
                }
                cleanupDoacaoListener();
            }
        } catch (error) {
            console.error('Erro ao acompanhar status da doação:', error);
            failures += 1;
            if (failures >= maxFailuresBeforeError && attempts >= 6) {
                if (aguardando) {
                    aguardando.classList.add('d-none');
                }
                if (erroElemento) {
                    erroElemento.textContent = 'Não foi possível acompanhar o status da doação.';
                    erroElemento.classList.remove('d-none');
                }
                cleanupDoacaoListener();
            }
        }
    }

    intervalId = setInterval(checkStatus, 3000);
    checkStatus();

    return () => {
        clearInterval(intervalId);
    };
}

function cleanupDoacaoListener() {
    if (typeof unsubscribeDoacaoStatus === 'function') {
        unsubscribeDoacaoStatus();
        unsubscribeDoacaoStatus = null;
    }
    currentDoacaoId = null;
}

async function registerForNewsletter(userData) {
    try {
        const db = firebase.firestore();
        const leadId = createLeadId(userData.email);

        await db.collection('leads').doc(leadId).set({
            ...userData,
            email: userData.email.trim().toLowerCase(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        }, { merge: false });
        
        return { success: true };
    } catch (error) {
        console.error('Lead registration error:', error);
        if (error.code === 'permission-denied') {
            return { success: false, error: 'Este email já está cadastrado!' };
        }
        return { success: false, error: error.message };
    }
}


if (form.newsletterForm) {
    form.newsletterForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormMessages();

        if (!validateNewsletterForm()) {
            showFormMessage('Verifique os campos obrigatórios e tente novamente.');
            return;
        }

        const userData = {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            telefone: form.telefone.value.trim(),
            data_nascimento: form.data_nascimento.value
        };

        form.newsletterBtn.disabled = true;
        form.newsletterBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cadastrando...';

        const result = await registerForNewsletter(userData);

        if (result.success) {
            showFormMessage('Cadastro realizado com sucesso! Você receberá nossas novidades.', 'success');
            form.newsletterForm.reset();
        } else if (result.error === 'Este email já está cadastrado!') {
            showError(form.email, result.error);
            showFormMessage(result.error, 'danger');
        } else {
            console.error('Newsletter registration failed:', result.error);
            showFormMessage(`Erro ao realizar cadastro. Tente novamente. (${result.error})`, 'danger');
        }

        form.newsletterBtn.disabled = false;
        form.newsletterBtn.innerHTML = '<strong class="fs-5">Inscrever-se</strong>';
    });
}

setupInputValidation();

document.addEventListener('DOMContentLoaded', () => {
    const formDoacaoPix = document.getElementById('formDoacaoPix');

    if (!formDoacaoPix) {
        return;
    }

    const elements = {
        dados: document.getElementById('dadosDoacaoPix'),
        resultado: document.getElementById('resultadoDoacaoPix'),
        erro: document.getElementById('erroDoacaoPix'),
        nome: document.getElementById('doacaoNome'),
        email: document.getElementById('doacaoEmail'),
        valor: document.getElementById('doacaoValor'),
        mensagem: document.getElementById('doacaoMensagem'),
        gerarBtn: document.getElementById('gerarPixBtn'),
        qrCode: document.getElementById('doacaoPixQrCode'),
        pixCode: document.getElementById('doacaoPixCode'),
        ticketUrl: document.getElementById('doacaoPixTicketUrl')
    };

    formDoacaoPix.addEventListener('submit', async (event) => {
        event.preventDefault();
        elements.erro.classList.add('d-none');
        elements.erro.textContent = '';
        elements.gerarBtn.disabled = true;
        elements.gerarBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Gerando Pix...';

        try {
            const response = await fetch('/api/doacoes/pix', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: elements.nome.value.trim(),
                    email: elements.email.value.trim(),
                    valor: Number(elements.valor.value),
                    mensagem: elements.mensagem.value.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Nao foi possivel gerar o Pix.');
            }

            elements.pixCode.value = data.qrCode || '';
            elements.qrCode.src = `data:image/png;base64,${data.qrCodeBase64}`;

            if (data.ticketUrl) {
                elements.ticketUrl.href = data.ticketUrl;
                elements.ticketUrl.classList.remove('d-none');
            }

            elements.dados.classList.add('d-none');
            elements.resultado.classList.remove('d-none');

            cleanupDoacaoListener();
            currentDoacaoId = data.doacaoId || null;
            unsubscribeDoacaoStatus = data.doacaoId ? acompanharStatusDoacao(data.doacaoId) : null;

            if (String(data.status || '').toLowerCase() === 'ok') {
                mostrarConfirmacaoDoacao();
            }
        } catch (error) {
            elements.erro.textContent = error.message;
            elements.erro.classList.remove('d-none');
        } finally {
            elements.gerarBtn.disabled = false;
            elements.gerarBtn.textContent = 'Gerar Pix';
        }
    });

    const modal = document.getElementById('modalDoacaoPix');
    modal.addEventListener('hidden.bs.modal', () => {
        formDoacaoPix.reset();
        cleanupDoacaoListener();
        elements.dados.classList.remove('d-none');
        elements.resultado.classList.add('d-none');
        elements.erro.classList.add('d-none');
        elements.pixCode.value = '';
        elements.qrCode.removeAttribute('src');
        elements.ticketUrl.href = '#';
        elements.ticketUrl.classList.add('d-none');
        document.getElementById('confirmacaoDoacaoPix')?.classList.add('d-none');
    });
});

function topo(){
    window.scrollTo(
        {
        top: 0,
        left: 0,
        behavior: 'smooth'
        }
        );
}

function copiarPix() {
    const input = document.getElementById('doacaoPixCode') || document.getElementById('pixCode');
    navigator.clipboard.writeText(input.value).then(() => {
      const msg = document.getElementById('doacaoPixCopiado') || document.getElementById('copiado');
      msg.style.display = 'block';
      setTimeout(() => msg.style.display = 'none', 2500);
    });
  }
