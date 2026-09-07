import React, { useState } from 'react';
import { useAxios } from './useAxios.js';

export default function SolicitarRecuperacion({ alVolverAlLogin }) {
    const api = useAxios();
    const [email, setEmail] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const colorCian = '#00d4ff';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMensaje('');

        try {
            const response = await api.post('/api/usuarios/recuperacion/solicitar', { email });
            setMensaje(`📧 ${response.data.message}`);
        } catch (err) {
            setError(`❌ ${err.response?.data?.message || "Error de conexión con el servidor."}`);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={{...titleStyle, color: colorCian}}>RECUPERAR ACCESO</h2>
                <p style={{color: '#aaa', fontSize: '0.9rem', marginBottom: '20px'}}>Escribe tu email y te enviaremos un link mágico para volver al juego.</p>

                {error && <p style={errorStyle}>{error}</p>}
                {mensaje && <p style={successStyle}>{mensaje}</p>}

                {!mensaje && (
                    <form onSubmit={handleSubmit}>
                        <input type="email" placeholder="Tu correo electrónico..." style={inputStyle} value={email} required onChange={(e) => setEmail(e.target.value)} />
                        <button type="submit" style={btnStyle}>ENVIAR ENLACE</button>
                    </form>
                )}
                <button onClick={alVolverAlLogin} style={backButtonStyle}>VOLVER AL LOGIN</button>
            </div>
        </div>
    );
}

const containerStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' };
const cardStyle = { background: 'rgba(20, 10, 35, 0.95)', padding: '40px', borderRadius: '24px', width: '400px', textAlign: 'center', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' };
const titleStyle = { letterSpacing: '2px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '10px' };
const inputStyle = { width: '100%', padding: '14px', marginBottom: '20px', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', outline: 'none', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '16px', backgroundColor: '#00d4ff', color: 'black', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' };
const backButtonStyle = { background: 'none', border: 'none', color: '#888', marginTop: '20px', cursor: 'pointer', textDecoration: 'underline', fontWeight: 'bold' };
const errorStyle = { color: '#ff4d4d', backgroundColor: 'rgba(255, 77, 77, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(255, 77, 77, 0.3)' };
const successStyle = { color: '#00ff88', backgroundColor: 'rgba(0,255,136,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px', border: '1px solid rgba(0,255,136,0.3)' };