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
                <li><a class="dropdown-item" href="meuPerfil.html">Meu Perfil</a></li>
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
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    telefone: document.getElementById('telefone'),
    data_nascimento: document.getElementById('data_nascimento'),
    newsletterBtn: document.getElementById('newsletter-btn')
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


async function registerForNewsletter(userData) {
    try {
        const db = firebase.firestore();
        
        // Check if email already exists in leads collection
        const existingLead = await db.collection('leads')
            .where('email', '==', userData.email)
            .get();
        
        if (!existingLead.empty) {
            return { 
                success: false, 
                error: 'Este email já está cadastrado!' 
            };
        }
        
        // If email doesn't exist, create new lead
        await db.collection('leads').add({
            ...userData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        });
        
        return { success: true };
    } catch (error) {
        console.error('Lead registration error:', error);
        return { success: false, error: error.message };
    }
}


if (form.newsletterBtn) {
    form.newsletterBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        if (!validateNewsletterForm()) {
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
            alert('Cadastro realizado com sucesso! Você receberá nossas novidades.');
           
            form.name.value = '';
            form.email.value = '';
            form.telefone.value = '';
            form.data_nascimento.value = '';
        } else if (result.error === 'Este email já está cadastrado!') {
            // Show error on email field
            showError(form.email, result.error);
            alert(result.error);
        } else {
            alert('Erro ao realizar cadastro. Tente novamente.');
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
        elements.dados.classList.remove('d-none');
        elements.resultado.classList.add('d-none');
        elements.erro.classList.add('d-none');
        elements.pixCode.value = '';
        elements.qrCode.removeAttribute('src');
        elements.ticketUrl.href = '#';
        elements.ticketUrl.classList.add('d-none');
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
