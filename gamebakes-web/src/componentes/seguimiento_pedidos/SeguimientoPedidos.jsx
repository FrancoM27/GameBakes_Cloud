import React, { useState, useEffect } from 'react';
import { useAxios } from '../autenticacion/useAxios.js';

export default function SeguimientoPedidos({ rol, usuarioId }) {
    const api = useAxios();
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);

    const colorCian = '#00d4ff';
    const colorMorado = '#9b59b6';
    const colorTema = rol === 'vendedor' ? colorMorado : colorCian;

    const cargarPedidos = async () => {
        try {
            setCargando(true);
            const token = sessionStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const url = rol === 'vendedor'
                ? `/api/pedidos/vendedor/${usuarioId}`
                : `/api/pedidos/mis-pedidos`;

            const res = await api.get(url, config);
            setPedidos(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        if (usuarioId) cargarPedidos();
    }, [rol, usuarioId]);

    const getEstadoStyle = (estado) => {
        switch(estado) {
            case 'ENTREGADO': return { color: '#44ff44', bg: 'rgba(68, 255, 68, 0.1)', icon: '✅' };
            case 'EN_CAMINO': return { color: '#00d4ff', bg: 'rgba(0, 212, 255, 0.1)', icon: '🚚' };
            case 'PREPARACION': return { color: '#f39c12', bg: 'rgba(243, 156, 18, 0.1)', icon: '👨‍🍳' };
            default: return { color: '#ff4444', bg: 'rgba(255, 68, 68, 0.1)', icon: '⏳' };
        }
    };

    const cambiarEstado = async (id, nuevoEstado) => {
        try {
            const token = sessionStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            // Enviamos un cuerpo vacío {} ya que es un PUT con Query Parameter
            await api.put(`/api/pedidos/${id}/estado?nuevoEstado=${nuevoEstado}`, {}, config);
            cargarPedidos();
        } catch (err) {
            console.error(err);
        }
    };

    if (cargando) return <p style={{ textAlign: 'center', color: colorTema }}>Sincronizando...</p>;

    return (
        <div style={{ padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ color: colorTema, margin: 0, letterSpacing: '2px' }}>📡 PANEL DE OPERACIONES</h2>
                <button onClick={cargarPedidos} style={{ background: 'none', border: `1px solid ${colorTema}`, color: colorTema, padding: '5px 15px', borderRadius: '20px', cursor: 'pointer' }}>
                    🔄 Actualizar
                </button>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
                {pedidos.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#111', borderRadius: '15px', border: '1px dashed #333' }}>
                        <p style={{ color: '#666' }}>No hay registros de pedidos en este sector.</p>
                    </div>
                ) : (
                    pedidos.map(p => {
                        const style = getEstadoStyle(p.estado);
                        return (
                            <div key={p.id} style={{
                                backgroundColor: '#111',
                                borderLeft: `5px solid ${style.color}`,
                                borderRadius: '10px',
                                padding: '20px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                            }}>
                                <div>
                                    <span style={{ color: '#555', fontSize: '0.8rem', fontWeight: 'bold' }}>ORDEN #{p.id}</span>
                                    <h3 style={{ margin: '5px 0', color: 'white' }}>{p.productoNombre}</h3>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        backgroundColor: style.bg,
                                        color: style.color,
                                        marginTop: '10px'
                                    }}>
                                        {style.icon} {p.estado}
                                    </div>
                                </div>

                                {rol === 'vendedor' ? (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => cambiarEstado(p.id, 'PREPARACION')} style={{...btnBase, borderColor: '#f39c12', color: '#f39c12'}}>Preparar</button>
                                        <button onClick={() => cambiarEstado(p.id, 'EN_CAMINO')} style={{...btnBase, borderColor: '#00d4ff', color: '#00d4ff'}}>Enviar</button>
                                        <button onClick={() => cambiarEstado(p.id, 'ENTREGADO')} style={{...btnBase, borderColor: '#44ff44', color: '#44ff44'}}>Finalizar</button>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>Vendedor ID</p>
                                        <p style={{ margin: 0, fontWeight: 'bold', color: colorTema }}>#{p.vendedorId}</p>
                                        <p style={{ margin: 0, fontWeight: 'bold', color: 'white' }}>Cant: {p.cantidad || 1}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

const btnBase = { padding: '8px 15px', backgroundColor: 'transparent', border: '1px solid', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold', transition: '0.3s' };