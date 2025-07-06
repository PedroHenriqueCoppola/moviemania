// Máscara para limitar input de duração
document.addEventListener('DOMContentLoaded', function() {
    const durationInput = document.getElementById('duration');

    durationInput.addEventListener('input', function(e) {
        // Remove tudo que não for digito
        let value = e.target.value.replace(/\D/g, '');

        // Limita a 6 dígitos
        if (value.length > 6) {
            value = value.substring(0, 6);
        }

        let formattedValue = '';
        if (value.length > 4) {
            // HH:MM:SS
            formattedValue = value.substring(0, 2) + ':' + value.substring(2, 4) + ':' + value.substring(4, 6);
        } else if (value.length > 2) {
            // HH:MM
            formattedValue = value.substring(0, 2) + ':' + value.substring(2, 4);
        } else {
            // HH
            formattedValue = value;
        }

        e.target.value = formattedValue;
    });

    durationInput.addEventListener('blur', function(e) {
        let value = e.target.value;
        const parts = value.split(':');
        let isValid = true;

        if (parts.length === 3) {
            const hh = parseInt(parts[0] || '0', 10);
            const mm = parseInt(parts[1] || '0', 10);
            const ss = parseInt(parts[2] || '0', 10);

            if (mm < 0 || mm > 59 || ss < 0 || ss > 59 || isNaN(hh) || isNaN(mm) || isNaN(ss)) {
                isValid = false;
            }
        } else {
            // Se estiver fora dos padrões de hora, vai reclamar
            isValid = false;
        }

        if (!isValid && value !== '') {
            e.target.style.borderColor = 'orange';
        } else {
            e.target.style.borderColor = '';
        }
    });
});

// Manter a borda vermelha quando tiver um valor selecionado
document.addEventListener('DOMContentLoaded', function() {
    const genderSelect = document.getElementById('gender');

    function updateSelectValidationStyle() {
        if (genderSelect.value !== "") {
            genderSelect.classList.add('selected-and-valid');
        } else {
            genderSelect.classList.remove('selected-and-valid');
        }
    }

    genderSelect.addEventListener('change', updateSelectValidationStyle);
    updateSelectValidationStyle();
});