let currentUser = null;
let originalProfileData = null;
let profileLoaded = false;

const db = firebase.firestore();

const profileFields = {
    nome: () => document.getElementById("nome"),
    sobrenome: () => document.getElementById("sobrenome"),
    email: () => document.getElementById("email"),
    cpf: () => document.getElementById("cpf"),
    cep: () => document.getElementById("cep"),
    telefone: () => document.getElementById("telefone"),
    numero: () => document.getElementById("numero"),
    endereco: () => document.getElementById("endereco"),
    dataNasc: () => document.getElementById("dataNasc"),
    genero: () => document.querySelector('input[name="gender"]:checked'),
    notificacao: () => document.querySelector('input[name="notificacoes"]:checked'),
    editButton: () => document.getElementById("edit-profile-button"),
    saveButton: () => document.getElementById("save-profile-button"),
    cancelButton: () => document.getElementById("cancel-edit-button"),
    deleteButton: () => document.getElementById("delete-profile-button"),
    status: () => document.getElementById("profile-status"),
    profileForm: () => document.getElementById("profile-form"),
    nameRequiredError: () => document.getElementById("name-required-error"),
    lastNameRequiredError: () => document.getElementById("lastname-required-error"),
    emailInvalidError: () => document.getElementById("email-invalid-error"),
    emailRequiredError: () => document.getElementById("email-required-error"),
    cpfInvalidError: () => document.getElementById("cpf-invalid-error"),
    cpfRequiredError: () => document.getElementById("cpf-required-error"),
    cepInvalidError: () => document.getElementById("cep-invalid-error"),
    cepRequiredError: () => document.getElementById("cep-required-error"),
    telefoneRequiredError: () => document.getElementById("telefone-required-error"),
    telefoneInvalidError: () => document.getElementById("telefone-invalid-error"),
    numeroRequiredError: () => document.getElementById("numero-required-error"),
    numeroInvalidError: () => document.getElementById("numero-invalid-error"),
    generoRequiredError: () => document.getElementById("genero-required-error"),
    enderecoRequiredError: () => document.getElementById("endereco-required-error"),
    notificacaoRequiredError: () => document.getElementById("notificacao-required-error"),
    dataNascRequiredError: () => document.getElementById("dataNasc-required-error")
};

document.addEventListener("DOMContentLoaded", () => {
    profileFields.profileForm().addEventListener("submit", saveProfile);
    profileFields.editButton().addEventListener("click", enableEditMode);
    profileFields.cancelButton().addEventListener("click", cancelEdit);
    profileFields.deleteButton().addEventListener("click", deleteProfile);
    setEditMode(false);
});

firebase.auth().onAuthStateChanged(async user => {
    if (!user) {
        window.location.href = "/login";
        return;
    }

    currentUser = user;
    setupNavbarForLoggedUser();
    await loadProfile(user);
});

function setupNavbarForLoggedUser() {
    const loginBtn = document.getElementById("login-btn");
    if (!loginBtn) {
        return;
    }

    loginBtn.style.display = "none";

    if (document.getElementById("profile-user-menu")) {
        return;
    }

    const userMenu = document.createElement("div");
    userMenu.className = "dropdown ms-2";
    userMenu.id = "profile-user-menu";
    userMenu.innerHTML = `
        <button class="btn btn-secondary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person-circle"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li><a class="dropdown-item" href="/meuPerfil">Meu Perfil</a></li>
            <li><a class="dropdown-item" href="#" onclick="logout(); return false;">Sair</a></li>
        </ul>
    `;
    loginBtn.parentNode.appendChild(userMenu);
}

async function loadProfile(user) {
    setStatus("Carregando seus dados...", "info");
    setFieldsDisabled(true);

    try {
        const profileDoc = await db.collection("membro").doc(user.uid).get();

        if (!profileDoc.exists) {
            originalProfileData = createEmptyProfile(user);
            fillProfileForm(originalProfileData);
            profileLoaded = true;
            setStatus("Perfil ainda nao encontrado. Clique em Editar informacoes para cadastrar seus dados pessoais.", "warning");
            setEditMode(false);
            return;
        }

        originalProfileData = {
            ...createEmptyProfile(user),
            ...profileDoc.data()
        };
        fillProfileForm(originalProfileData);
        profileLoaded = true;
        setStatus("Dados carregados. Clique em Editar informacoes para alterar.", "success");
        setEditMode(false);
    } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        originalProfileData = createEmptyProfile(user);
        fillProfileForm(originalProfileData);
        profileLoaded = false;
        setEditMode(false);

        if (error.code === "permission-denied") {
            setStatus("O Firestore bloqueou a leitura dos dados. Ajuste as regras da colecao membro para este usuario poder ver o proprio perfil.", "danger");
        } else {
            setStatus("Nao foi possivel carregar os dados salvos. Veja o console do navegador para detalhes.", "danger");
        }
    }
}

function createEmptyProfile(user) {
    return {
        uid: user.uid,
        nome: "",
        sobrenome: "",
        cpf: "",
        cep: "",
        telefone: "",
        numero: "",
        genero: "",
        endereco: "",
        email: user.email || "",
        dataNasc: "",
        notificacao: false
    };
}

function fillProfileForm(data) {
    profileFields.nome().value = data.nome || "";
    profileFields.sobrenome().value = data.sobrenome || "";
    profileFields.email().value = data.email || currentUser.email || "";
    profileFields.cpf().value = data.cpf || "";
    profileFields.cep().value = data.cep || "";
    profileFields.telefone().value = data.telefone || "";
    profileFields.numero().value = data.numero || "";
    profileFields.endereco().value = data.endereco || "";
    profileFields.dataNasc().value = data.dataNasc || "";

    document.querySelectorAll('input[name="gender"]').forEach(field => {
        field.checked = field.value === data.genero;
    });

    document.querySelectorAll('input[name="notificacoes"]').forEach(field => {
        field.checked = field.value === (data.notificacao ? "sim" : "nao");
    });
}

function getProfileData() {
    const notificacao = profileFields.notificacao();

    return {
        uid: currentUser.uid,
        nome: profileFields.nome().value.trim(),
        sobrenome: profileFields.sobrenome().value.trim(),
        cpf: profileFields.cpf().value.trim(),
        cep: profileFields.cep().value.trim(),
        telefone: profileFields.telefone().value.trim(),
        numero: profileFields.numero().value.trim(),
        genero: profileFields.genero() ? profileFields.genero().value : "",
        endereco: profileFields.endereco().value.trim(),
        email: profileFields.email().value.trim(),
        dataNasc: profileFields.dataNasc().value.trim(),
        notificacao: notificacao ? notificacao.value === "sim" : false,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
}

function enableEditMode() {
    if (!currentUser) {
        return;
    }

    setEditMode(true);
    setStatus("Edite os campos desejados e clique em Salvar alteracoes.", "info");
}

function cancelEdit() {
    fillProfileForm(originalProfileData || createEmptyProfile(currentUser));
    clearErrors();
    setEditMode(false);
    setStatus("Alteracoes canceladas.", "secondary");
}

async function saveProfile(event) {
    event.preventDefault();

    if (!currentUser || !validateProfileForm()) {
        setStatus("Corrija os campos destacados antes de salvar.", "warning");
        return;
    }

    setFieldsDisabled(true);
    showLoading();

    try {
        const profileData = getProfileData();

        if (profileData.email !== currentUser.email) {
            await currentUser.updateEmail(profileData.email);
        }

        await db.collection("membro").doc(currentUser.uid).set(profileData, { merge: true });

        originalProfileData = {
            ...profileData,
            updatedAt: null
        };
        profileLoaded = true;
        setEditMode(false);
        setStatus("Perfil atualizado com sucesso.", "success");
    } catch (error) {
        console.error("Erro ao salvar perfil:", error);
        setStatus(getProfileErrorMessage(error), "danger");
        setEditMode(true);
    } finally {
        hideLoading();
    }
}

async function deleteProfile() {
    const confirmed = confirm("Tem certeza que deseja excluir sua conta? Essa acao nao podera ser desfeita.");
    if (!confirmed) {
        return;
    }

    setFieldsDisabled(true);
    showLoading();

    try {
        await db.collection("membro").doc(currentUser.uid).delete();
        await currentUser.delete();
        alert("Conta excluida com sucesso.");
        window.location.href = "/index.html";
    } catch (error) {
        console.error("Erro ao excluir perfil:", error);
        setStatus(getProfileErrorMessage(error), "danger");
        setEditMode(false);
        hideLoading();
    }
}

function validateProfileForm() {
    const data = getProfileData();

    const validations = [
        [profileFields.nameRequiredError(), !!data.nome],
        [profileFields.lastNameRequiredError(), !!data.sobrenome],
        [profileFields.emailRequiredError(), !!data.email],
        [profileFields.emailInvalidError(), !data.email || validateEmail(data.email)],
        [profileFields.cpfRequiredError(), !!data.cpf],
        [profileFields.cpfInvalidError(), !data.cpf || validateCPF(data.cpf)],
        [profileFields.cepRequiredError(), !!data.cep],
        [profileFields.cepInvalidError(), !data.cep || validateCEP(data.cep)],
        [profileFields.telefoneRequiredError(), !!data.telefone],
        [profileFields.telefoneInvalidError(), !data.telefone || validateTelefone(data.telefone)],
        [profileFields.numeroRequiredError(), !!data.numero],
        [profileFields.numeroInvalidError(), !data.numero || validateNumero(data.numero)],
        [profileFields.generoRequiredError(), !!data.genero],
        [profileFields.enderecoRequiredError(), !!data.endereco],
        [profileFields.notificacaoRequiredError(), !!profileFields.notificacao()],
        [profileFields.dataNascRequiredError(), !!data.dataNasc]
    ];

    validations.forEach(([element, isValid]) => {
        if (element) {
            element.style.display = isValid ? "none" : "block";
        }
    });

    return validations.every(([, isValid]) => isValid);
}

function clearErrors() {
    document.querySelectorAll(".error").forEach(error => {
        error.style.display = "none";
    });
}

function setStatus(message, type) {
    const status = profileFields.status();
    if (!status) {
        return;
    }

    status.textContent = message;
    status.className = `alert alert-${type}`;
}

function setEditMode(isEditing) {
    setFieldsDisabled(!isEditing);
    profileFields.editButton().classList.toggle("d-none", isEditing);
    profileFields.saveButton().classList.toggle("d-none", !isEditing);
    profileFields.cancelButton().classList.toggle("d-none", !isEditing);
}

function setFieldsDisabled(disabled) {
    profileFields.profileForm().querySelectorAll("input").forEach(field => {
        field.disabled = disabled;
    });
}

function getProfileErrorMessage(error) {
    if (error.code === "auth/requires-recent-login") {
        return "Por seguranca, faca login novamente antes de alterar e-mail ou excluir a conta.";
    }

    if (error.code === "auth/email-already-in-use") {
        return "Este e-mail ja esta em uso por outra conta.";
    }

    if (error.code === "auth/invalid-email") {
        return "Informe um e-mail valido.";
    }

    if (error.code === "permission-denied") {
        return "O Firestore bloqueou essa acao. Ajuste as regras da colecao membro.";
    }

    return "Ocorreu um erro: " + error.message;
}

function onChangeNome() { validateProfileForm(); }
function onChangeSobrenome() { validateProfileForm(); }
function onChangeEmail() { validateProfileForm(); }
function onChangeCPF() { validateProfileForm(); }
function onChangeCEP() { validateProfileForm(); }
function onChangeTelefone() { validateProfileForm(); }
function onChangeNumero() { validateProfileForm(); }
function onChangeGenero() { validateProfileForm(); }
function onChangeEndereco() { validateProfileForm(); }
function onChangeDataNasc() { validateProfileForm(); }
function onChangeNotificacao() { validateProfileForm(); }

function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "/index.html";
    });
}
