firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log('User is already logged in', user);
        window.location.href = "index.html";
    }
});

function onChangeEmail() {
    toggleEmailErrors();
    toggleButtonsDisable();
}

function onChangePassword() {
    togglePasswordErrors();
    toggleButtonsDisable();
} 

function login(event) {
    showLoading();
  event.preventDefault();
  firebase.auth().signInWithEmailAndPassword(form.email().value, form.password().value).then(response => {
    hideLoading();
    console.log('Login successful', response);
    window.location.href = "index.html";
  }).catch(error => {
    hideLoading();
    console.log('Login error', error);
    alert(getErrorMessage(error));
  });
  return false;
}

function getErrorMessage(error) {
    if(error.code === "auth/user-not-found") {
        return "Usuário não encontrado.";
    }
    if(error.code === "auth/wrong-password") {
        return "Senha incorreta.";
    }
    if(error.code === "auth/invalid-email") {
        return "E-mail inválido.";
    }
    if(error.code === "auth/user-disabled") {
        return "Conta desabilitada.";
    }
    if(error.code === "auth/too-many-requests") {
        return "Muitas tentativas. Tente novamente mais tarde.";
    }
    return error.message;
}


function recoverPassword() {
    const email = form.email().value.trim();
    
    if (!email) {
        alert("Por favor, insira seu e-mail para recuperar a senha.");
        return;
    }
    
    if (!validateEmail(email)) {
        alert("Por favor, insira um e-mail válido.");
        return;
    }
    
    showLoading();
    firebase.auth().sendPasswordResetEmail(email).then(() => {
        hideLoading();
        alert("E-mail de recuperação enviado! Verifique sua caixa de entrada (e também a pasta de spam).");
    }).catch(error => {
        hideLoading();
        console.log('Recover password error', error);
        if (error.code === "auth/user-not-found") {
            alert("E-mail não encontrado em nosso sistema.");
        } else {
            alert("Erro ao enviar e-mail de recuperação: " + error.message);
        }
    });
}

function toggleEmailErrors() {
    const email = form.email().value.trim();
    const hasEmail = email.length > 0;

    form.emailRequiredError().style.display = hasEmail ? "none" : "block";
    form.emailInvalidError().style.display = hasEmail && !validateEmail(email) ? "block" : "none";
}

function togglePasswordErrors() {
    const password = form.password().value.trim();
    form.passwordRequiredError().style.display = password ? "none" : "block";
}

function toggleButtonsDisable() {
    const emailValid = isEmailValid();
    const passwordValid = isPasswordValid();
    const recover = form.recoverPasswordButton();
    if (recover) {
        recover.style.pointerEvents = emailValid ? "auto" : "none";
        recover.style.opacity = emailValid ? "1" : "0.5";
    }
    const loginBtn = form.loginButton();
    if (loginBtn) {
        loginBtn.disabled = !(emailValid && passwordValid);
    }
}

function isEmailValid() {
    const email = form.email().value;
    if (!email) {
        return false;
    }
    return validateEmail(email);
}

function isPasswordValid() {
    return form.password().value ? true : false;
}

const form = {
    email: () => document.getElementById("email"),
    emailInvalidError: () => document.getElementById("email-invalid-error"),
    emailRequiredError: () => document.getElementById("email-required-error"),
    loginButton: () => document.getElementById("login-button"),
    password: () => document.getElementById("password"),
    passwordRequiredError: () => document.getElementById("password-required-error"),
    recoverPasswordButton: () => document.getElementById("recover-password-button"),
} 