document.getElementById('comment').addEventListener('input', function () {
    const valor = this.value;
    const regex = /^[\p{L}\p{N} ]{0,150}$/u;

    if (!regex.test(valor)) {
        this.style.borderColor = 'red';
        this.setCustomValidity('Use apenas letras e números (sem acentos ou símbolos), no máximo 150 caracteres.');
    } else {
        this.style.borderColor = '';
        this.setCustomValidity('');
    }
});