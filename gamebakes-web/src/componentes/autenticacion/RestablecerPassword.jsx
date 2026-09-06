import React, { useState } from 'react';
import { useAxios } from './useAxios.js';

export default function RestablecerPassword({ token, alFinalizar }) {
    const api = useAxios();
    const [password, setPassword] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [error, setError] = useState('');
    const colorCian = '#00d4ff';

    const handleConfirmar = async (e) => {
        e.preventDefault();

        if (password.length < 8 || !/[A-Z]/.test(password)) {
            setError('⚠️ La clave requiere al menos 8 caracteres y una mayúscula.');
            return;
        }
        if (password !== confirmar) {
            setError('⚠️ Las contraseñas no coinciden.');
            return;
        }

        try {
            await api.post('/api/usuarios/recuperacion/confirmar', { token, password });
            alert("✅ ¡Password actualizada con éxito! Ahora puedes iniciar sesión.");
            alFinalizar();
        } catch (err) {
            setError(`❌ ${err.response?.data?.message || "Error de conexión con el servidor."}`);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{...titleStyle, color: colorCian}}>NUEVA CONTRASEÑA</h2>
                <p style={{color: '#aaa', fontSize: '0.9rem', marginBottom: '20px'}}>Ingresa tu nueva clave de acceso para volver al juego.</p>
                {error && <p style={errorStyle}>{error}</p>}

                <form onSubmit={handleConfirmar}>
                    <div style={{...inputGroup, position: 'relative'}}>
                        <input type={mostrarPassword ? 'text' : 'password'} placeholder="Nueva Password" style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} required />
                        <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} style={eyeButtonStyle}>{mostrarPassword ? '👁️‍🗨️' : '👁️'}</button>
                    </div>

                    <div style={{...inputGroup, position: 'relative'}}>
                        <input type={mostrarConfirmar ? 'text' : 'password'} placeholder="Confirmar Password" style={inputStyle} value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required />
                        <button type="button" onClick={() => setMostrarConfirmar(!mostrarConfirmar)} style={eyeButtonStyle}>{mostrarConfirmar ? '👁️‍🗨️' : '👁️'}</button>
                    </div>

                    <button type="submit" style={btnStyle}>ACTUALIZAR Y ENTRAR</button>
                </form>
            </div>
        </div>
    );
}

const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' };
const cardStyle = { background: 'rgba(20, 10, 35, 0.95)', padding: '40px', borderRadius: '24px', width: '400px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' };
const titleStyle = { letterSpacing: '2px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '10px' };
const inputGroup = { marginBottom: '20px' };
const inputStyle = { width: '100%', padding: '14px', paddingRight: '45px', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: 'white', outline: 'none', boxSizing: 'border-box' };
const eyeButtonStyle = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '1.1rem' };
const btnStyle = { width: '100%', padding: '16px', backgroundColor: '#00d4ff', color: 'black', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', marginTop: '10px' };
const errorStyle = { color: '#ff4d4d', backgroundColor: 'rgba(255, 77, 77, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(255, 77, 77, 0.3)' };