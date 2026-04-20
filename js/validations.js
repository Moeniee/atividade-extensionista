function validateEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf[9])) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(cpf[10])) return false;
    return true;
}

function validateCEP(cep) {
    return /^\d{8}$/.test(cep.replace(/[^\d]/g, ''));
}

function validateTelefone(telefone) {
    const cleaned = telefone.replace(/[^\d]/g, '');
    return cleaned.length >= 10 && cleaned.length <= 11;
}

function validateNumero(numero) {
    return !isNaN(numero) && numero.trim() !== '';
}