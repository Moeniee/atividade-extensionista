let nameTouched = false;
let lastNameTouched = false;
let emailTouched = false;
let passwordTouched = false;
let confirmPasswordTouched = false;
let cpfTouched = false;
let cepTouched = false;
let telefoneTouched = false;
let numeroTouched = false;
let generoTouched = false;
let enderecoTouched = false;
let notificacaoTouched = false;
let dataNascTouched = false;

function onChangeNome() {
    nameTouched = true;
    const name = form.nome().value.trim();
    form.nameRequiredError().style.display = nameTouched && !name ? "block" : "none";
    toggleRegisterButtonDisabled();
}

function onChangeSobrenome() {
    lastNameTouched = true;
    const lastName = form.sobrenome().value.trim();
    form.lastNameRequiredError().style.display = lastNameTouched && !lastName ? "block" : "none";
    toggleRegisterButtonDisabled();
}

function onChangeEmail() {
    emailTouched = true;
    const email = form.email().value.trim();
    form.emailInvalidError().style.display = emailTouched && !validateEmail(email) ? "block" : "none";
    form.emailRequiredError().style.display = emailTouched && !email ? "block" : "none";
    toggleRegisterButtonDisabled();
}

function onChangePassword() {
    passwordTouched = true;
    const password = form.password().value.trim();
    form.passwordRequiredError().style.display = passwordTouched && !password ? "block" : "none";
    form.passwordLengthError().style.display = passwordTouched && password.length < 6 ? "block" : "none";
    toggleRegisterButtonDisabled();
}

function onChangeConfirmPassword() {
    confirmPasswordTouched = true;
    const password = form.password().value.trim();
    const confirmPassword = form.confirmPassword().value.trim();
    form.passwordDoesntMatchError().style.display = confirmPasswordTouched && password !== confirmPassword ? "block" : "none";
    toggleRegisterButtonDisabled();
}

function onChangeCPF() {
    cpfTouched = true;
    const cpf = form.cpf().value.trim();
    form.cpfInvalidError().style.display = cpfTouched && !validateCPF(cpf) ? "block" : "none";
    form.cpfRequiredError().style.display = cpfTouched && !cpf ? "block" : "none";
    toggleRegisterButtonDisabled();
}

function onChangeCEP() {
    cepTouched = true;
    const cep = form.cep().value.trim();
    form.cepInvalidError().style.display = cepTouched && !validateCEP(cep) ? "block" : "none";
    form.cepRequiredError().style.display = cepTouched && !cep ? "block" : "none";
    toggleRegisterButtonDisabled();
}

function onChangeDataNasc() {
    dataNascTouched = true;
    const dataNasc = form.dataNasc().value.trim();
    form.dataNascRequiredError().style.display = dataNascTouched && !dataNasc ? "block" : "none";
    toggleRegisterButtonDisabled();
}

function onChangeTelefone() {
    telefoneTouched = true;
    const telefone = form.telefone().value.trim();
    form.telefoneRequiredError().style.display = telefoneTouched && !telefone ? "block" : "none";
    form.telefoneInvalidError().style.display = telefoneTouched && !validateTelefone(telefone) ? "block" : "none";
    toggleRegisterButtonDisabled();
}

function onChangeEndereco() {
    enderecoTouched = true;
    const endereco = form.endereco().value.trim();
    form.enderecoRequiredError().style.display = enderecoTouched && !endereco ? "block" : "none";
    toggleRegisterButtonDisabled();
}

function onChangeNumero() {
    numeroTouched = true;
    const numero = form.numero().value.trim();
    form.numeroRequiredError().style.display = numeroTouched && !numero ? "block" : "none";
    form.numeroInvalidError().style.display = numeroTouched && !validateNumero(numero) ? "block" : "none";
    toggleRegisterButtonDisabled();
}

function onChangeGenero() {
    generoTouched = true;
    const genero = form.genero();
    form.generoRequiredError().style.display = generoTouched && !genero ? "block" : "none";
    toggleRegisterButtonDisabled();
}

function onChangeNotificacao() {
    notificacaoTouched = true;
    const notificacao = form.notificacao();
    form.notificacaoRequiredError().style.display = notificacaoTouched && !notificacao ? "block" : "none";
    toggleRegisterButtonDisabled();
}

function onSubmit(event) {
    const name = form.nome().value.trim();
    const lastName = form.sobrenome().value.trim();
    const email = form.email().value.trim();
    const password = form.password().value.trim();
    const confirmPassword = form.confirmPassword().value.trim();
    const cpf = form.cpf().value.trim();
    const cep = form.cep().value.trim();
    const telefone = form.telefone().value.trim();
    const numero = form.numero().value.trim();
    const genero = form.genero();
    const endereco = form.endereco().value.trim();
    const notificacao = form.notificacao();
    const dataNasc = form.dataNasc().value.trim();

    const nameValid = name;
    const lastNameValid = lastName;
    const emailValid = email && validateEmail(email);
    const passwordValid = password && password.length >= 6;
    const confirmValid = password === confirmPassword;
    const cpfValid = cpf && validateCPF(cpf);
    const cepValid = cep && validateCEP(cep);
    const telefoneValid = telefone && validateTelefone(telefone);
    const numeroValid = numero && validateNumero(numero);
    const generoValid = !!genero;
    const enderecoValid = endereco;
    const notificacaoValid = !!notificacao;
    const dataNascValid = dataNasc;

    // Show all errors on submit
    form.nameRequiredError().style.display = !name ? "block" : "none";
    form.lastNameRequiredError().style.display = !lastName ? "block" : "none";
    form.emailInvalidError().style.display = !validateEmail(email) ? "block" : "none";
    form.emailRequiredError().style.display = !email ? "block" : "none";
    form.passwordRequiredError().style.display = !password ? "block" : "none";
    form.passwordLengthError().style.display = password.length < 6 ? "block" : "none";
    form.passwordDoesntMatchError().style.display = password !== confirmPassword ? "block" : "none";
    form.cpfInvalidError().style.display = !validateCPF(cpf) ? "block" : "none";
    form.cpfRequiredError().style.display = !cpf ? "block" : "none";
    form.cepInvalidError().style.display = !validateCEP(cep) ? "block" : "none";
    form.cepRequiredError().style.display = !cep ? "block" : "none";
    form.telefoneRequiredError().style.display = !telefone ? "block" : "none";
    form.telefoneInvalidError().style.display = !validateTelefone(telefone) ? "block" : "none";
    form.numeroRequiredError().style.display = !numero ? "block" : "none";
    form.numeroInvalidError().style.display = !validateNumero(numero) ? "block" : "none";
    form.generoRequiredError().style.display = !genero ? "block" : "none";
    form.enderecoRequiredError().style.display = !endereco ? "block" : "none";
    form.notificacaoRequiredError().style.display = !notificacao ? "block" : "none";
    form.dataNascRequiredError().style.display = !dataNasc ? "block" : "none";

    if (!nameValid || !lastNameValid || !emailValid || !passwordValid || !confirmValid || !cpfValid || !cepValid || !telefoneValid || !numeroValid || !generoValid || !enderecoValid || !notificacaoValid || !dataNascValid) {
        event.preventDefault();
        alert("Por favor, corrija os erros no formulário antes de enviar.");
    }
}

function toggleRegisterButtonDisabled() {
    form.registerButton().disabled = !isformValid();
}

function isformValid() {
    const name = form.nome().value.trim();
    if (!name) {
        return false;
    }
    const lastName = form.sobrenome().value.trim();
    if (!lastName) {
        return false;
    }
    const email = form.email().value.trim();
    if (!email || !validateEmail(email)) {
        return false;
    }
    const password = form.password().value.trim();
    if (!password || password.length < 6) {
        return false;
    }
    const confirmPassword = form.confirmPassword().value.trim();
    if (password !== confirmPassword) {
        return false;
    }
    const cpf = form.cpf().value.trim();
    if (!cpf || !validateCPF(cpf)) {
        return false;
    }
    const cep = form.cep().value.trim();
    if (!cep || !validateCEP(cep)) {
        return false;
    }
    const telefone = form.telefone().value.trim();
    if (!telefone || !validateTelefone(telefone)) {
        return false;
    }
    const numero = form.numero().value.trim();
    if (!numero || !validateNumero(numero)) {
        return false;
    }
    const genero = form.genero();
    if (!genero) {
        return false;
    }
    const endereco = form.endereco().value.trim();
    if (!endereco) {
        return false;
    }
    const notificacao = form.notificacao();
    if (!notificacao) {
        return false;
    }
    const dataNasc = form.dataNasc().value.trim();
    if (!dataNasc) {
        return false;
    }
    return true;
}

const form = {
    nome: () => document.getElementById("nome"),
    nameRequiredError: () => document.getElementById("name-required-error"),
    sobrenome: () => document.getElementById("sobrenome"),
    lastNameRequiredError: () => document.getElementById("lastname-required-error"),
    email: () => document.getElementById("email"),
    emailInvalidError: () => document.getElementById("email-invalid-error"),
    emailRequiredError: () => document.getElementById("email-required-error"),
    password: () => document.getElementById("password"),
    confirmPassword: () => document.getElementById("confirmPassword"),
    passwordRequiredError: () => document.getElementById("password-required-error"),
    passwordLengthError: () => document.getElementById("password-length-error"),
    passwordDoesntMatchError: () => document.getElementById("password-doesnt-match-error"),
    cpf: () => document.getElementById("cpf"),
    cpfInvalidError: () => document.getElementById("cpf-invalid-error"),
    cpfRequiredError: () => document.getElementById("cpf-required-error"),
    cep: () => document.getElementById("cep"),
    cepInvalidError: () => document.getElementById("cep-invalid-error"),
    cepRequiredError: () => document.getElementById("cep-required-error"),
    telefone: () => document.querySelector('input[name="telefone"]'),
    telefoneRequiredError: () => document.getElementById("telefone-required-error"),
    telefoneInvalidError: () => document.getElementById("telefone-invalid-error"),
    numero: () => document.querySelector('input[name="numero"]'),
    numeroRequiredError: () => document.getElementById("numero-required-error"),
    numeroInvalidError: () => document.getElementById("numero-invalid-error"),
    genero: () => document.querySelector('input[name="gender"]:checked'),
    generoRequiredError: () => document.getElementById("genero-required-error"),
    endereco: () => document.querySelector('input[name="endereco"]'),
    enderecoRequiredError: () => document.getElementById("endereco-required-error"),
    notificacao: () => document.querySelector('input[name="notificacoes"]:checked'),
    notificacaoRequiredError: () => document.getElementById("notificacao-required-error"),
    dataNasc: () => document.querySelector('input[name="dataNasc"]'),
    dataNascRequiredError: () => document.getElementById("dataNasc-required-error"),
    registerButton: () => document.getElementById("register-buttom")
};

// Add event listener to form
document.querySelector('form').addEventListener('submit', onSubmit);
