function onChangeEmail() {
    toggleEmailErrors();
    toggleButtonsDisable();
}

function onChangePassword() {
    togglePasswordErrors();
    toggleButtonsDisable();
} 

function login(event) {
    if (event) {
        event.preventDefault();
    }

    toggleEmailErrors();
    togglePasswordErrors();

    if (!isEmailValid() || !isPasswordValid()) {
        return false;
    }
    window.location.href = "index.html";
    return false;
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
    const recover = form.recoverPasswordButton();
    if (recover) {
        recover.style.pointerEvents = emailValid ? "auto" : "none";
        recover.style.opacity = emailValid ? "1" : "0.5";
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