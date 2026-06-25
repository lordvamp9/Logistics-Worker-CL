import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'leaflet/dist/leaflet.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const homeIcon = L.divIcon({
    className: 'custom-pin',
    html: '',
    iconSize: [20, 20]
});

const defaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const manifestData = [
    { id: 'PKG-9921', dest: 'Av. Providencia 123', status: 'En Ruta', eta: '14:30', w: '2.5kg' },
    { id: 'PKG-8832', dest: 'Calle Estado 45', status: 'Pendiente', eta: '15:15', w: '1.2kg' },
    { id: 'PKG-7741', dest: 'Alameda 550', status: 'Entregado', eta: '11:00', w: '5.0kg' },
    { id: 'PKG-6650', dest: 'Huérfanos 801', status: 'En Ruta', eta: '16:00', w: '0.8kg' }
];

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const db = JSON.parse(localStorage.getItem('logistics_db') || '[]');
        if (db.length === 0) {
            navigate('/');
        } else {
            setUser(db[db.length - 1]);
        }
    }, [navigate]);

    const handleLogout = () => {
        if (window.confirm('¿Cerrar sesión y finalizar turno?')) {
            navigate('/');
        }
    };

    if (!user) return null;

    const lat = parseFloat(user.location?.lat) || -33.4489;
    const lng = parseFloat(user.location?.lng) || -70.6693;

    const randomOffsets = [
        [0.01, 0.01], [-0.01, -0.01], [0.005, -0.015], [-0.005, 0.015]
    ];

    const chartData = {
        labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
        datasets: [{
            label: 'Paquetes Movidos',
            data: [45, 59, 80, 81, 56, 40],
            backgroundColor: '#ff6b00',
            borderRadius: 4
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: { beginAtZero: true, grid: { display: false } },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="dashboard-wrapper">
            <nav className="minimal-nav">
                <div className="logo-area" style={{ fontSize: '1.5rem', marginBottom: 0 }}>
                    <img src="/logo.png" alt="LogiCore" style={{ height: '40px', marginRight: '10px' }} /> 
                    LogiCore 
                    <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 400, marginLeft: '10px' }}>
                        | PORTAL CONFIDENCIAL
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div id="userNameDisplay" style={{ fontWeight: 700, color: 'var(--secondary)' }}>{user.name}</div>
                        <div id="roleDisplay" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.role}</div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        style={{ padding: '0.5rem 1rem', border: '1px solid var(--error)', background: 'transparent', color: 'var(--error)', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Salir
                    </button>
                </div>
            </nav>

            <main className="container">
                <div className="dashboard-grid">
                    <div className="card" style={{ borderLeft: '5px solid var(--primary)' }}>
                        <span className="stat-label">Entregas Pendientes</span>
                        <div className="stat-value">12</div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Actualizado hace 5 min</span>
                    </div>
                    <div className="card" style={{ borderLeft: '5px solid var(--success)' }}>
                        <span className="stat-label">Eficiencia Operativa</span>
                        <div className="stat-value" style={{ color: 'var(--success)' }}>98.5%</div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Top 5% de la flota</span>
                    </div>
                    <div className="card" style={{ borderLeft: '5px solid #3498db' }}>
                        <span className="stat-label">Distancia Hoy</span>
                        <div className="stat-value" style={{ color: '#3498db' }}>45.2 km</div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Ruta Optimizada Activa</span>
                    </div>
                </div>

                <div className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1rem', borderBottom: '1px solid #eee', background: '#fff' }}>
                            <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary)' }}>Ruta y Logística en Vivo</h3>
                        </div>
                        <div style={{ flex: 1, height: '400px', position: 'relative' }}>
                            <MapContainer center={[lat, lng]} zoom={13} className="map-container">
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[lat, lng]} icon={homeIcon}>
                                    <Popup>Base Asignada</Popup>
                                </Marker>
                                {randomOffsets.map((off, idx) => (
                                    <Marker key={idx} position={[lat + off[0], lng + off[1]]} icon={defaultIcon}>
                                        <Popup>Parada #{idx + 1}</Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary)', marginBottom: '1rem' }}>Movimientos Semanales</h3>
                        <div style={{ height: '300px', position: 'relative' }}>
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '1.1rem', color: 'var(--secondary)', marginBottom: '1rem' }}>Manifiesto Activo</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID Paquete</th>
                                    <th>Destino Final</th>
                                    <th>Estado</th>
                                    <th>ETA (Estimado)</th>
                                    <th>Peso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {manifestData.map((row, idx) => {
                                    let badgeClass = 'badge-pending';
                                    if (row.status === 'En Ruta') badgeClass = 'badge-active';
                                    if (row.status === 'Entregado') badgeClass = 'badge-delivered';
                                    
                                    return (
                                        <tr key={idx}>
                                            <td><strong>{row.id}</strong></td>
                                            <td>{row.dest}</td>
                                            <td><span className={`badge ${badgeClass}`}>{row.status}</span></td>
                                            <td>{row.eta}</td>
                                            <td>{row.w}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
