// Máscara para limitar input de telefone
document.addEventListener('DOMContentLoaded', function () {
    const phoneInput = document.getElementById('phone');

    phoneInput.addEventListener('input', function (e) {
        // Remove tudo que não for dígito
        let value = e.target.value.replace(/\D/g, '');

        // Limita a 11 dígitos (formato: (99) 99999-9999)
        if (value.length > 11) {
            value = value.substring(0, 11);
        }

        // Aplica a máscara
        let formattedValue = '';
        if (value.length > 6) {
            formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
        } else if (value.length > 2) {
            formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 7)}`;
        } else if (value.length > 0) {
            formattedValue = `(${value}`;
        }

        e.target.value = formattedValue;
    });

    phoneInput.addEventListener('blur', function (e) {
        const value = e.target.value;

        // Validação do formato (99) 99999-9999 usando regex
        const phoneRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;

        if (!phoneRegex.test(value) && value !== '') {
            e.target.style.borderColor = 'orange';
            console.warn('Formato de telefone inválido. Use (99) 99999-9999.');
        } else {
            e.target.style.borderColor = '';
        }
    });
});