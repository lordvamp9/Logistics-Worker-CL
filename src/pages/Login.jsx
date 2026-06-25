import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { SecurityValidator } from '../utils/validators';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const customPin = L.divIcon({
    className: 'custom-pin',
    html: '',
    iconSize: [24, 24]
});

const bases = [
    { name: 'LogiCore Santiago (Central)', lat: -33.4489, lng: -70.6693 },
    { name: 'LogiCore Norte (Antofagasta)', lat: -23.6509, lng: -70.3975 },
    { name: 'LogiCore Sur (Concepción)', lat: -36.8201, lng: -73.0444 },
    { name: 'LogiCore Puerto (Valparaíso)', lat: -33.0472, lng: -71.6127 },
    { name: 'LogiCore Curicó', lat: -34.9828, lng: -71.2394 }
];

function LocationMarker({ onSelectBase }) {
    return (
        <>
            {bases.map((base, idx) => (
                <Marker
                    key={idx}
                    position={[base.lat, base.lng]}
                    icon={customPin}
                    eventHandlers={{
                        click: () => onSelectBase(base),
                    }}
                >
                    <Popup>{base.name}</Popup>
                </Marker>
            ))}
        </>
    );
}

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        rut: '',
        role: '',
        password: ''
    });
    const [selectedBase, setSelectedBase] = useState(null);
    const [rutValid, setRutValid] = useState(null);
    const [passScore, setPassScore] = useState(0);
    const [passValid, setPassValid] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleRutChange = (e) => {
        let val = e.target.value;
        let clean = val.replace(/[^0-9kK]/g, '');
        let formatted = clean.length > 1 ? SecurityValidator.formatRut(clean) : clean;
        setFormData({ ...formData, rut: formatted });

        if (clean.length >= 8) {
            setRutValid(SecurityValidator.checkRut(formatted));
        } else {
            setRutValid(null);
        }
    };

    const handlePassChange = (e) => {
        const val = e.target.value;
        setFormData({ ...formData, password: val });
        const result = SecurityValidator.checkPassword(val);
        setPassScore(result.strengthScore);
        if (val.length > 0) {
            setPassValid(result.isValid);
        } else {
            setPassValid(null);
        }
    };

    const handleSelectBase = (base) => {
        setSelectedBase(base);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!SecurityValidator.checkRut(formData.rut)) {
            setRutValid(false);
            Swal.fire({
                icon: 'error',
                title: 'Acceso Denegado',
                text: 'RUT inválido. Por favor verifique.',
                confirmButtonColor: '#ff6b00'
            });
            return;
        }

        if (!selectedBase) {
            Swal.fire({
                icon: 'warning',
                title: 'Falta Ubicación',
                text: 'Debe seleccionar un Centro de Distribución en el mapa.',
                confirmButtonColor: '#ff6b00'
            });
            return;
        }

        if (!passValid) {
            Swal.fire({
                icon: 'warning',
                title: 'Contraseña Insegura',
                text: 'No cumple con los requisitos de complejidad.',
                confirmButtonColor: '#ff6b00'
            });
            return;
        }

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            const uuid = crypto.randomUUID();

            const userData = {
                id: uuid,
                name: formData.fullName,
                rut: formData.rut,
                role: formData.role,
                base: selectedBase.name,
                location: {
                    lat: selectedBase.lat,
                    lng: selectedBase.lng
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
                        <p><strong>Bienvenido:</strong> ${formData.fullName}</p>
                        <p><strong>ID Empleado:</strong> ${uuid}</p>
                        <p><strong>Base Asignada:</strong> ${selectedBase.name}</p>
                        <p style="margin-top: 10px; color: var(--success);">✔ Conexión Segura Establecida</p>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Ir al Portal',
                confirmButtonColor: '#ff6b00'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/dashboard');
                }
            });
        }, 2000);
    };

    const getStrengthColor = () => {
        const percentage = (passScore / 4) * 100;
        if (percentage <= 25) return 'var(--error)';
        if (percentage <= 75) return '#f1c40f';
        return 'var(--success)';
    };

    return (
        <>
            <div className="auth-wrapper">
                <div className="auth-form-side">
                    <div className="logo-area">
                        <img src="/logo.png" alt="LogiCore Logo" className="logo-img" />
                        LogiCore
                    </div>

                    <h2>Registro de Personal</h2>
                    <p className="subtitle">Complete su perfil para acceder al portal de flota.</p>

                    <form id="onboardingForm" onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="fullName">Nombre</label>
                            <input 
                                type="text" 
                                id="fullName" 
                                placeholder="Ej. Juan Pérez" 
                                autoComplete="off" 
                                required
                                value={formData.fullName}
                                onChange={e => setFormData({...formData, fullName: e.target.value})}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="rut">RUT (Con guión)</label>
                            <input 
                                type="text" 
                                id="rut" 
                                placeholder="Ej. 12.345.678-9" 
                                autoComplete="off" 
                                maxLength="12"
                                required
                                value={formData.rut}
                                onChange={handleRutChange}
                                className={rutValid === false ? 'input-error' : rutValid === true ? 'input-success' : ''}
                            />
                            <div className={`validation-message ${rutValid === false ? 'visible' : ''}`} id="rutError">
                                Formato inválido. Dígito verificador no coincide.
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">Cargo / Puesto</label>
                            <select 
                                id="role" 
                                required
                                value={formData.role}
                                onChange={e => setFormData({...formData, role: e.target.value})}
                            >
                                <option value="" disabled>Seleccione Cargo</option>
                                <option value="Conductor de Flota">Conductor de Flota</option>
                                <option value="Operario de Bodega">Operario de Bodega</option>
                                <option value="Coordinador Logístico">Coordinador Logístico</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Contraseña de Acceso</label>
                            <input 
                                type="password" 
                                id="password" 
                                placeholder="Mín 8 caracteres, 1 Símbolo, 1 Mayúscula"
                                autoComplete="new-password" 
                                required
                                value={formData.password}
                                onChange={handlePassChange}
                                className={passValid === false ? 'input-error' : passValid === true ? 'input-success' : ''}
                            />
                            <div className="strength-meter">
                                <div 
                                    className="strength-bar" 
                                    style={{ 
                                        width: `${(passScore / 4) * 100}%`,
                                        backgroundColor: getStrengthColor()
                                    }}
                                ></div>
                            </div>
                            <div className={`validation-message ${passValid === false ? 'visible' : ''}`} id="passError">
                                Contraseña débil. Req: 8+ cars, Mayús, Núm, Símbolo.
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Registrar y Acceder
                        </button>
                    </form>
                </div>

                <div className="auth-map-side">
                    <MapContainer 
                        center={[-33.4489, -70.6693]} 
                        zoom={5} 
                        className="map-container"
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker onSelectBase={handleSelectBase} />
                    </MapContainer>
                    <div className="map-overlay-text" id="mapFeedback">
                        {selectedBase ? (
                            <>✅ Base Seleccionada: <strong>{selectedBase.name}</strong></>
                        ) : (
                            <>📍 Seleccione su <strong>Centro Base</strong> haciendo clic en el mapa.</>
                        )}
                    </div>
                </div>
            </div>

            {loading && (
                <div id="loader">
                    <div className="spinner"></div>
                    <p className="loader-text">Validando Credenciales...</p>
                </div>
            )}
        </>
    );
}
