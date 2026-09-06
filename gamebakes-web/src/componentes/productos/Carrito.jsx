import React, { useState, useEffect } from 'react';
import { getAuthData } from '../autenticacion/authUtils';
import { useAxios } from '../autenticacion/useAxios.js';

const Carrito = ({ usuarioId, onCambiarSeccion }) => {
    const api = useAxios();
    const [items, setItems] = useState([]);
    const [detallesProductos, setDetallesProductos] = useState({});
    const [cargando, setCargando] = useState(true);
    const [esperandoPago, setEsperandoPago] = useState(false);
    const [idPagoGenerado, setIdPagoGenerado] = useState(null);
    const [mostrarExito, setMostrarExito] = useState(false);
    const [procesando, setProcesando] = useState(false);

    const token = sessionStorage.getItem('token');
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    useEffect(() => {
        obtenerCarrito();
    }, []);

    const obtenerCarrito = async () => {
        try {
            const response = await api.get(`/bff/carrito/completo/${usuarioId}`, config);
            setItems(response.data.items);
        } catch (err) {
            console.error("Error al obtener carrito:", err);
        } finally {
            setCargando(false);
        }
    };

    const handleProcederAlPago = async () => {
        try {
            const response = await api.post(`/api/pagos/iniciar-desde-carrito/${usuarioId}`, {}, config);
            if (response.data.transaccionId) {
                setIdPagoGenerado(response.data.idPago);
                setEsperandoPago(true);
                window.open(response.data.transaccionId, '_blank');
            }
        } catch (err) {
            alert("Error al iniciar el pago.");
        }
    };

    const confirmarPagoManual = async () => {
        if (procesando) return;
        setProcesando(true);
        try {
            const auth = getAuthData();
            const nombreReal = auth && auth.nombre ? auth.nombre : 'Cliente';

            const headersPago = {
                ...config.headers,
                'X-User-Id': String(usuarioId),
                'X-User-Name': nombreReal
            };

            await api.post(`/api/pagos/confirmar/${idPagoGenerado}`, {}, { headers: headersPago });
            setMostrarExito(true);
            setItems([]);
            setEsperandoPago(false);
        } catch (err) {
            alert("Error al confirmar o el servidor rechazó el pago.");
        } finally {
            setProcesando(false);
        }
    };

    const total = items.reduce((acc, item) => acc + (item.precioUnitario * item.cantidad), 0);

    if (cargando) return <p style={{ textAlign: 'center', color: '#00d4ff' }}>Cargando carrito...</p>;

    if (mostrarExito) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px', color: 'white' }}>
                <h1 style={{ fontSize: '5rem', marginBottom: '20px' }}>🎂</h1>
                <h2 style={{ color: '#00d4ff', fontSize: '2.5rem', textTransform: 'uppercase' }}>¡Pedido en Horno!</h2>
                <p style={{ fontSize: '1.2rem', color: '#888', marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
                    Tu pago fue procesado con éxito. Ya puedes ver el estado de tu torta en la sección de seguimiento.
                </p>
                <button
                    onClick={() => onCambiarSeccion('pedidos')}
                    style={{ padding: '18px 50px', backgroundColor: '#00d4ff', color: 'black', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 0 20px rgba(0,212,255,0.4)' }}
                >
                    IR A MIS PEDIDOS
                </button>
            </div>
        );
    }

    if (esperandoPago) {
        return (
            <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#050505', borderRadius: '15px', border: '1px solid #44ff44', maxWidth: '600px', margin: '50px auto' }}>
                <h2 style={{ color: '#44ff44' }}>🚀 ¡Casi listo!</h2>
                <p>Se abrió Mercado Pago en una pestaña nueva.</p>
                <p style={{ color: '#888' }}>Cuando termines de pagar, vuelve aquí y presiona el botón para vaciar tu carrito.</p>
                <button
                    onClick={confirmarPagoManual}
                    disabled={procesando}
                    style={{ marginTop: '30px', padding: '15px 40px', backgroundColor: procesando ? '#228822' : '#44ff44', color: 'black', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: procesando ? 'not-allowed' : 'pointer', fontSize: '1.2rem', opacity: procesando ? 0.7 : 1 }}
                >
                    {procesando ? '⏳ PROCESANDO PEDIDO...' : '✅ YA PAGUÉ, LIMPIAR MI CARRITO'}
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', color: 'white' }}>
            {items.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <h2 style={{ color: '#666' }}>Tu carrito está vacío 🛒</h2>
                </div>
            ) : (
                <>
                    <div style={{ backgroundColor: '#111', borderRadius: '15px', overflow: 'hidden', border: '1px solid #333' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr style={{ backgroundColor: '#050505', borderBottom: '1px solid #333', textAlign: 'left' }}>
                                <th style={{ padding: '20px' }}>Producto</th>
                                <th style={{ padding: '20px' }}>Cantidad</th>
                                <th style={{ padding: '20px' }}>Precio</th>
                                <th style={{ padding: '20px' }}>Subtotal</th>
                            </tr>
                            </thead>
                            <tbody>
                            {items.map(item => {
                                const p = item.productoDetalle || {};
                                return (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #222' }}>
                                        <td style={{ padding: '15px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <img src={p.imagenUrl || 'https://via.placeholder.com/50'} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }} alt="thumb" />
                                            <span>{p.nombre || `Producto #${item.productoId}`}</span>
                                        </td>
                                        <td style={{ padding: '15px' }}>{item.cantidad}</td>
                                        <td style={{ padding: '15px' }}>${item.precioUnitario.toLocaleString()}</td>
                                        <td style={{ padding: '15px', color: '#00d4ff', fontWeight: 'bold' }}>
                                            ${(item.precioUnitario * item.cantidad).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ marginTop: '30px', textAlign: 'right', padding: '30px', backgroundColor: '#050505', borderRadius: '15px', border: '1px solid #333' }}>
                        <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#00d4ff' }}>${total.toLocaleString()}</h2>
                        <button onClick={handleProcederAlPago} style={{ padding: '15px 50px', backgroundColor: '#44ff44', color: 'black', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem' }}>
                            💸 Proceder al Pago
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Carrito;