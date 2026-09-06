import React, { useState, useEffect } from 'react';
import { getAuthData } from '../autenticacion/authUtils';
import { useAxios } from '../autenticacion/useAxios.js';

export default function ResenasProducto({ rol, usuarioId, productoId, productoNombre, vendedorId, haComprado }) {
    const api = useAxios();
    const [resenas, setResenas] = useState([]);
    const [comentario, setComentario] = useState("");
    const [estrellas, setEstrellas] = useState(5);
    const [respuestaVendedor, setRespuestaVendedor] = useState({});
    const [cargando, setCargando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState("");

    const colorCian = '#00d4ff';
    const colorMorado = '#9b59b6';
    const colorTema = rol === 'vendedor' ? colorMorado : colorCian;

    const cargarResenas = async () => {
        setCargando(true);
        try {
            const token = sessionStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            let url;

            if (rol === 'cliente' && !productoId) {
                url = `/api/resenas/cliente`;
            } else if (rol === 'vendedor' && !productoId) {
                url = `/api/resenas/vendedor/${usuarioId}`;
            } else {
                url = `/api/resenas/producto/${productoId}`;
            }

            const response = await api.get(url, config);
            setResenas(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Error en cargarResenas:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (usuarioId && (rol === 'vendedor' || productoId || (rol === 'cliente' && !productoId))) {
            cargarResenas();
        }
    }, [rol, usuarioId, productoId]);

    const enviarResena = async () => {
        if (!comentario.trim()) {
            setMensaje("Por favor escribe un comentario");
            return;
        }

        setEnviando(true);
        setMensaje("");

        const auth = getAuthData();
        const nombreReal = auth && auth.nombre ? auth.nombre : 'Cliente';

        const nueva = {
            productoId: productoId,
            productoNombre: productoNombre || "Producto",
            clienteId: usuarioId,
            clienteNombre: nombreReal,
            comentario: comentario,
            estrellas: estrellas,
            vendedorId: vendedorId
        };

        try {
            const token = sessionStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            await api.post(`/api/resenas`, nueva, config);

            setComentario("");
            setEstrellas(5);
            setMensaje("¡Reseña enviada exitosamente!");
            cargarResenas();
            setTimeout(() => setMensaje(""), 3000);
        } catch (error) {
            console.error(error);
            setMensaje(`Error: ${error.response?.data?.message || "Error de conexión. Inténtalo nuevamente."}`);
        } finally {
            setEnviando(false);
        }
    };

    const enviarRespuesta = async (resenaId) => {
        const textoRespuesta = respuestaVendedor[resenaId];
        if (!textoRespuesta) return;

        try {
            const token = sessionStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            // Axios con PUT requiere enviar un cuerpo válido, lo enviamos como string.
            await api.put(`/api/resenas/${resenaId}/responder`, textoRespuesta, {
                ...config,
                headers: { ...config.headers, 'Content-Type': 'application/json' }
            });

            setRespuestaVendedor({ ...respuestaVendedor, [resenaId]: "" });
            cargarResenas();
        } catch (error) {
            console.error(error);
        }
    };

    if (cargando) return <div style={{ color: colorTema, padding: '20px' }}>Cargando información...</div>;

    if (rol === 'cliente' && !productoId) {
        return (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '25px', borderRadius: '15px', border: `1px solid ${colorTema}`, color: 'white', marginTop: '30px' }}>
                <h3 style={{ color: colorTema, textTransform: 'uppercase' }}>⭐ MIS RESEÑAS</h3>
                {resenas.length > 0 ? (
                    resenas.map(r => (
                        <div key={r.id} style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', marginBottom: '15px', borderLeft: `4px solid ${colorTema}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <strong>{r.productoNombre || r.productoId}</strong>
                                <span style={{ color: '#ffcc00' }}>{'★'.repeat(r.estrellas)}</span>
                            </div>
                            <p style={{ fontStyle: 'italic' }}>"{r.comentario}"</p>
                            {r.respuestaVendedor && (
                                <div style={{ marginLeft: '20px', borderTop: '1px solid #444', paddingTop: '10px', marginTop: '10px', color: colorMorado }}>
                                    <strong>Respuesta oficial:</strong> {r.respuestaVendedor}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <p>Aún no has dejado ninguna reseña.</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Dirígete al <strong>Catálogo</strong> para reseñar los productos que has comprado.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '25px', borderRadius: '15px', border: `1px solid ${colorTema}`, color: 'white', marginTop: '30px' }}>
            <h3 style={{ color: colorTema, textTransform: 'uppercase' }}>
                ⭐ {rol === 'vendedor' && !productoId ? 'Gestión de Reseñas' : 'Opiniones del Producto'}
            </h3>

            {rol === 'cliente' && haComprado && (
                <div style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
                    <p>Califica tu experiencia:</p>
                    <div style={{ marginBottom: '10px' }}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <span key={n} onClick={() => setEstrellas(n)} style={{ cursor: 'pointer', color: n <= estrellas ? '#ffcc00' : '#444', fontSize: '25px' }}>★</span>
                        ))}
                    </div>
                    <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Escribe tu reseña aquí..." style={{ width: '100%', backgroundColor: '#111', color: 'white', border: `1px solid ${colorCian}`, borderRadius: '8px', padding: '10px', boxSizing: 'border-box' }} />
                    {mensaje && (
                        <div style={{ marginTop: '10px', padding: '10px', borderRadius: '5px', backgroundColor: mensaje.includes('Error') ? '#ff4444' : '#44ff44', color: 'white' }}>
                            {mensaje}
                        </div>
                    )}
                    <button onClick={enviarResena} disabled={enviando} style={{ width: '100%', marginTop: '10px', backgroundColor: enviando ? '#666' : colorCian, border: 'none', padding: '12px', fontWeight: 'bold', cursor: enviando ? 'not-allowed' : 'pointer', borderRadius: '8px', color: 'black' }}>
                        {enviando ? 'ENVIANDO...' : 'ENVIAR COMENTARIO'}
                    </button>
                </div>
            )}

            {rol === 'cliente' && !haComprado && productoId && (
                <div style={{ padding: '15px', backgroundColor: '#1a1a1a', borderRadius: '8px', marginBottom: '20px', border: '1px dashed #444', textAlign: 'center' }}>
                    <p style={{ color: '#888', margin: 0 }}>Solo los guerreros que han adquirido este producto pueden dejar su testimonio.</p>
                </div>
            )}

            <div style={{ marginTop: '20px' }}>
                {resenas.length > 0 ? (
                    resenas.map(r => (
                        <div key={r.id} style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '10px', marginBottom: '15px', borderLeft: `4px solid ${colorTema}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <strong>{r.clienteNombre}</strong>
                                <span style={{ color: '#ffcc00' }}>{'★'.repeat(r.estrellas)}</span>
                            </div>
                            {r.productoNombre && (
                                <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '5px' }}>
                                    Producto: <span style={{ color: colorTema }}>{r.productoNombre}</span>
                                </div>
                            )}
                            <p style={{ fontStyle: 'italic' }}>"{r.comentario}"</p>

                            {r.respuestaVendedor && (
                                <div style={{ marginLeft: '20px', borderTop: '1px solid #444', paddingTop: '10px', marginTop: '10px', color: colorMorado }}>
                                    <strong>Respuesta oficial:</strong> {r.respuestaVendedor}
                                </div>
                            )}

                            {rol === 'vendedor' && !r.respuestaVendedor && (
                                <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                    <input type="text" value={respuestaVendedor[r.id] || ""} placeholder="Escribe una respuesta..." onChange={(e) => setRespuestaVendedor({ ...respuestaVendedor, [r.id]: e.target.value })} style={{ flexGrow: 1, padding: '8px', borderRadius: '5px', border: `1px solid ${colorMorado}`, backgroundColor: '#000', color: 'white' }} />
                                    <button onClick={() => enviarRespuesta(r.id)} style={{ padding: '8px 15px', backgroundColor: colorMorado, border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        PUBLICAR
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        <p>No se han encontrado reseñas.</p>
                    </div>
                )}
            </div>
        </div>
    );
}