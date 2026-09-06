import React, { useState } from 'react';
import { useAxios } from './useAxios.js';

export default function Registro({ alVolverAlLogin }) {
    const api = useAxios();
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmarPassword: '', nombreCompleto: '', rol: 'cliente' });
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [error, setError] = useState('');
    const colorCian = '#00d4ff';

    const handleRegistro = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password.length < 8 || !/[A-Z]/.test(form.password)) {
            setError('⚠️ La contraseña debe tener al menos 8 caracteres y una mayúscula.');
            return;
        }
        if (form.password !== form.confirmarPassword) {
            setError('⚠️ ¡Error! Las contraseñas no coinciden.');
            return;
        }

        const datosParaEnviar = {
            username: form.username,
            email: form.email,
            password: form.password,
            nombreCompleto: form.nombreCompleto,
            rol: form.rol.toUpperCase()
        };

        try {
            const response = await api.post('/api/usuarios/registrar', datosParaEnviar);
            const data = response.data;

            try {
                const token = data.token || null;
                const usuarioId = data.id || data.usuarioId || null;

                if (usuarioId) {
                    const perfilData = {
                        usuarioId: usuarioId, username: form.username, email: form.email, rol: form.rol.toUpperCase(), nombreCompleto: form.nombreCompleto, telefono: '', direccion: ''
                    };

                    // Si hay token, se inyectará manualmente solo para esta petición inicial
                    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                    await api.post('/api/perfil', perfilData, config);
                }
            } catch (perfilError) {
                console.warn('Error al crear perfil automáticamente:', perfilError);
            }

            alert(`🚀 ¡Cuenta creada! Ya puedes iniciar sesión.`);
            alVolverAlLogin();
        } catch (err) {
            setError(`❌ ${err.response?.data?.message || "Error crítico: No se pudo contactar al servidor."}`);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <span style={{ fontSize: '2.5rem' }}>📝</span>
                    <h2 style={{ ...titleStyle, color: colorCian }}>NUEVA CUENTA</h2>
                </div>

                {error && <p style={errorStyle}>{error}</p>}

                <form onSubmit={handleRegistro}>
                    <div style={inputGroup}><input type="text" placeholder="Nombre Real" style={inputStyle} value={form.nombreCompleto} required onChange={(e) => setForm({...form, nombreCompleto: e.target.value})} /></div>
                    <div style={inputGroup}><input type="text" placeholder="Username" style={inputStyle} value={form.username} required onChange={(e) => setForm({...form, username: e.target.value})} /></div>
                    <div style={inputGroup}><input type="email" placeholder="Email" style={inputStyle} value={form.email} required onChange={(e) => setForm({...form, email: e.target.value})} /></div>

                    <div style={{...inputGroup, position: 'relative'}}>
                        <input type={mostrarPassword ? 'text' : 'password'} placeholder="Contraseña (8+ carac, 1 Mayús)" style={inputStyle} value={form.password} required onChange={(e) => setForm({...form, password: e.target.value})} />
                        <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} style={eyeButtonStyle}>{mostrarPassword ? '👁️‍🗨️' : '👁️'}</button>
                    </div>

                    <div style={{...inputGroup, position: 'relative'}}>
                        <input type={mostrarConfirmar ? 'text' : 'password'} placeholder="Repetir Contraseña" style={inputStyle} value={form.confirmarPassword} required onChange={(e) => setForm({...form, confirmarPassword: e.target.value})} />
                        <button type="button" onClick={() => setMostrarConfirmar(!mostrarConfirmar)} style={eyeButtonStyle}>{mostrarConfirmar ? '👁️‍🗨️' : '👁️'}</button>
                    </div>

                    <div style={inputGroup}>
                        <label style={{ color: colorCian, display: 'block', marginBottom: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>TIPO DE PERFIL:</label>
                        <select style={{...inputStyle, appearance: 'none', cursor: 'pointer'}} value={form.rol} onChange={(e) => setForm({...form, rol: e.target.value})}>
                            <option value="cliente" style={{backgroundColor: '#1a0b2e'}}>🎮 GAMER</option>
                            <option value="vendedor" style={{backgroundColor: '#1a0b2e'}}>🧁 MASTER BAKER</option>
                        </select>
                    </div>
                    <button type="submit" style={{...btnStyle, boxShadow: `0 5px 15px ${colorCian}4d`}}>CREAR CUENTA</button>
                </form>
                <button onClick={alVolverAlLogin} style={backButtonStyle}>VOLVER AL LOGIN</button>
            </div>
        </div>
    );
}

const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' };
const cardStyle = { background: 'rgba(20, 10, 35, 0.95)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(15px)', width: '420px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', boxSizing: 'border-box' };
const titleStyle = { letterSpacing: '3px', fontSize: '1.6rem', fontWeight: '900', textTransform: 'uppercase' };
const inputGroup = { marginBottom: '15px' };
const inputStyle = { width: '100%', padding: '14px', paddingRight: '45px', fontSize: '0.95rem', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', boxSizing: 'border-box' };
const eyeButtonStyle = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '1.1rem' };
const btnStyle = { width: '100%', padding: '16px', backgroundColor: '#00d4ff', color: 'black', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1rem', cursor: 'pointer', textTransform: 'uppercase', marginTop: '10px' };
const backButtonStyle = { background: 'none', border: 'none', color: '#888', width: '100%', marginTop: '15px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold', textDecoration: 'underline' };
const errorStyle = { color: '#ff4d4d', backgroundColor: 'rgba(255, 77, 77, 0.1)', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center', marginBottom: '15px', border: '1px solid rgba(255, 77, 77, 0.3)' };