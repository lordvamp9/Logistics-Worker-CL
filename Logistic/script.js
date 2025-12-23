class SecurityValidator {
    static checkRut(rut) {
        let value = rut.replace(/[^0-9kK]/g, '');

        if (value.length < 2) return false;

        let body = value.slice(0, -1);
        let dv = value.slice(-1).toUpperCase();

        if (!/^[0-9]+$/.test(body)) return false;

        let sum = 0;
        let multiplier = 2;

        for (let i = body.length - 1; i >= 0; i--) {
            sum += multiplier * parseInt(body.charAt(i));
            multiplier = multiplier < 7 ? multiplier + 1 : 2;
        }

        let calculated = 11 - (sum % 11);
        let expected = calculated === 11 ? '0' : calculated === 10 ? 'K' : calculated.toString();

        return expected === dv;
    }

    static checkPassword(password) {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        return {
            isValid: strength === 4 && password.length >= 8,
            strengthScore: strength
        };
    }

    static formatRut(rut) {
        let clean = rut.replace(/[^0-9kK]/g, '');

        if (clean.length <= 1) return clean;

        let body = clean.slice(0, -1);
        let dv = clean.slice(-1).toUpperCase();

        let formattedBody = body.split('').reverse().join('').match(/.{1,3}/g).join('.').split('').reverse().join('');

        return `${formattedBody}-${dv}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const map = L.map('map', { zoomControl: false }).setView([-33.4489, -70.6693], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const bases = [
        { name: 'LogiCore Santiago (Central)', lat: -33.4489, lng: -70.6693 },
        { name: 'LogiCore Norte (Antofagasta)', lat: -23.6509, lng: -70.3975 },
        { name: 'LogiCore Sur (Concepción)', lat: -36.8201, lng: -73.0444 },
        { name: 'LogiCore Puerto (Valparaíso)', lat: -33.0472, lng: -71.6127 },
        { name: 'LogiCore Curicó', lat: -34.9828, lng: -71.2394 }
    ];

    let currentSelection = null;

    bases.forEach(base => {
        const marker = L.marker([base.lat, base.lng], {
            icon: L.divIcon({
                className: 'custom-pin',
                html: '',
                iconSize: [24, 24]
            })
        }).addTo(map);

        marker.on('click', () => {
            document.getElementById('lat').value = base.lat;
            document.getElementById('lng').value = base.lng;
            document.getElementById('baseName').value = base.name;

            document.getElementById('mapFeedback').innerHTML = `✅ Base Seleccionada: <strong>${base.name}</strong>`;

            map.flyTo([base.lat, base.lng], 12);
        });
    });

    const rutInput = document.getElementById('rut');
    const rutError = document.getElementById('rutError');

    rutInput.addEventListener('input', (e) => {
        let val = e.target.value;

        if (e.inputType === 'deleteContentBackward') return;

        let clean = val.replace(/[^0-9kK]/g, '');
        if (clean.length > 1) {
            rutInput.value = SecurityValidator.formatRut(clean);
        }

        if (SecurityValidator.checkRut(rutInput.value)) {
            rutInput.classList.remove('input-error');
            rutInput.classList.add('input-success');
            rutError.classList.remove('visible');
        } else {
            rutInput.classList.remove('input-success');
            rutInput.classList.add('input-error');
            if (clean.length > 7) rutError.classList.add('visible');
        }
    });

    const passInput = document.getElementById('password');
    const passError = document.getElementById('passError');
    const strengthBar = document.getElementById('strengthBar');

    passInput.addEventListener('input', (e) => {
        const result = SecurityValidator.checkPassword(e.target.value);

        const percentage = (result.strengthScore / 4) * 100;
        strengthBar.style.width = `${percentage}%`;

        if (percentage <= 25) strengthBar.style.backgroundColor = 'var(--error)';
        else if (percentage <= 75) strengthBar.style.backgroundColor = '#f1c40f';
        else strengthBar.style.backgroundColor = 'var(--success)';

        if (result.isValid) {
            passInput.classList.remove('input-error');
            passInput.classList.add('input-success');
            passError.classList.remove('visible');
        } else {
            passInput.classList.remove('input-success');
        }
    });

    document.getElementById('onboardingForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('fullName').value;
        const rut = document.getElementById('rut').value;
        const role = document.getElementById('role').value;
        const password = document.getElementById('password').value;
        const lat = document.getElementById('lat').value;

        let valid = true;

        if (!SecurityValidator.checkRut(rut)) {
            valid = false;
            rutInput.classList.add('input-error');
            rutError.classList.add('visible');
            Swal.fire({
                icon: 'error',
                title: 'Acceso Denegado',
                text: 'RUT inválido. Por favor verifique.',
                confirmButtonColor: '#ff6b00'
            });
            return;
        }

        if (!lat) {
            valid = false;
            Swal.fire({
                icon: 'warning',
                title: 'Falta Ubicación',
                text: 'Debe seleccionar un Centro de Distribución en el mapa.',
                confirmButtonColor: '#ff6b00'
            });
            return;
        }

        const passResult = SecurityValidator.checkPassword(password);
        if (!passResult.isValid) {
            valid = false;
            passError.classList.add('visible');
            Swal.fire({
                icon: 'warning',
                title: 'Contraseña Insegura',
                text: 'No cumple con los requisitos de complejidad.',
                confirmButtonColor: '#ff6b00'
            });
            return;
        }

        if (valid) {
            const loader = document.getElementById('loader');
            loader.classList.remove('hidden');

            setTimeout(() => {
                loader.classList.add('hidden');

                const uuid = crypto.randomUUID();
                const baseName = document.getElementById('baseName').value;

                const userData = {
                    id: uuid,
                    name: name,
                    rut: rut,
                    role: role,
                    base: baseName,
                    location: {
                        lat: document.getElementById('lat').value,
                        lng: document.getElementById('lng').value
                    },
                    timestamp: new Date().toISOString()
                };

                let db = JSON.parse(localStorage.getItem('logistics_db') || '[]');
                db.push(userData);
                localStorage.setItem('logistics_db', JSON.stringify(db));

                Swal.fire({
                    title: '¡Registro Exitoso!',
                    html: `
                        <div style="text-align: left; font-size: 0.95em;">
                            <p><strong>Bienvenido:</strong> ${name}</p>
                            <p><strong>ID Empleado:</strong> ${uuid}</p>
                            <p><strong>Base Asignada:</strong> ${baseName}</p>
                            <p style="margin-top: 10px; color: var(--success);">✔ Conexión Segura Establecida</p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Ir al Portal',
                    confirmButtonColor: '#ff6b00'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = 'dashboard.html';
                    }
                });

            }, 2000);
        }
    });
});
