import React, { useState } from 'react';
import { useAxios } from './useAxios.js';

export default function Login({ onLoginSuccess, alCambiarARegistro, alOlvidarPassword }) {
    const api = useAxios();
    const [datos, setDatos] = useState({ identifier: '', password: '' });
    const [mostrarPassword, setMostrarPassword] = useState(false);
    const [error, setError] = useState('');
    const colorCian = '#00d4ff';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!datos.identifier || !datos.password) {
            setError('⚠️ Escribe tu usuario y contraseña, Guerrero.');
            return;
        }

        try {
            const response = await api.post('/api/usuarios/login', datos);
            sessionStorage.setItem('token', response.data);
            onLoginSuccess();
        } catch (err) {
            console.error("Error detallado: ", err);
            setError(`❌ ${err.response?.data?.message || "Usuario o contraseña incorrectos"}`);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                    <span style={{ fontSize: '3rem' }}>⚡</span>
                    <h2 style={{...titleStyle, color: colorCian}}>ACCESO GAMER</h2>
                </div>

                {error && <p style={errorStyle}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={inputGroup}>
                        <input type="text" placeholder="Escribe tu usuario o email..." style={inputStyle} value={datos.identifier} onChange={(e) => setDatos({...datos, identifier: e.target.value})} autoComplete="off" required />
                    </div>

                    <div style={{...inputGroup, position: 'relative'}}>
                        <input type={mostrarPassword ? 'text' : 'password'} placeholder="Tu contraseña secreta..." style={inputStyle} value={datos.password} onChange={(e) => setDatos({...datos, password: e.target.value})} autoComplete="new-password" required />
                        <button type="button" onClick={() => setMostrarPassword(!mostrarPassword)} style={eyeButtonStyle}>
                            {mostrarPassword ? '👁️‍🗨️' : '👁️'}
                        </button>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                        <span onClick={alOlvidarPassword} style={{...linkStyle, fontSize: '0.85rem', color: '#888'}}>¿Olvidaste tu contraseña?</span>
                    </div>

                    <button type="submit" style={{...btnStyle, boxShadow: `0 5px 15px ${colorCian}4d`}}>ENTRAR AL SISTEMA</button>
                </form>

                <p style={footerTextStyle}>
                    ¿Eres nuevo aquí? <span onClick={alCambiarARegistro} style={{...linkStyle, color: colorCian}}>Crea tu avatar</span>
                </p>
            </div>
        </div>
    );
}

const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'transparent' };
const cardStyle = { background: 'rgba(20, 10, 35, 0.95)', padding: '50px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(15px)', width: '420px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', transition: 'all 0.3s ease' };
const titleStyle = { letterSpacing: '3px', fontSize: '1.8rem', margin: '10px 0 0 0', fontWeight: '900', textTransform: 'uppercase' };
const inputGroup = { marginBottom: '20px' };
const inputStyle = { width: '100%', padding: '16px', paddingRight: '50px', fontSize: '1.1rem', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', transition: 'all 0.3s ease', boxSizing: 'border-box' };
const eyeButtonStyle = { position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#00d4ff', cursor: 'pointer', fontSize: '1.2rem', padding: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const btnStyle = { width: '100%', padding: '18px', backgroundColor: '#00d4ff', color: 'black', border: 'none', borderRadius: '12px', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', textTransform: 'uppercase', marginTop: '10px', transition: 'all 0.2s ease' };
const footerTextStyle = { marginTop: '30px', fontSize: '1rem', textAlign: 'center', color: '#aaa' };
const linkStyle = { cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px', textDecoration: 'none' };
const errorStyle = { color: '#ff4d4d', backgroundColor: 'rgba(255, 77, 77, 0.1)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', textAlign: 'center', marginBottom: '20px', border: '1px solid rgba(255, 77, 77, 0.3)' };