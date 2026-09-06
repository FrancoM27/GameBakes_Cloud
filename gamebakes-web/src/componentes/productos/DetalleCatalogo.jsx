import React, { useState, useEffect } from 'react';
import ResenasProducto from '../resenas/ResenasProducto';
import { getAuthData } from '../autenticacion/authUtils';
import { useAxios } from '../autenticacion/useAxios.js';

const DetalleCatalogo = ({ productoId, alVolver, rol, usuarioId }) => {
    const api = useAxios();
    const [producto, setProducto] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [esperandoPago, setEsperandoPago] = useState(false);
    const [idPagoGenerado, setIdPagoGenerado] = useState(null);
    const [haComprado, setHaComprado] = useState(false);

    const token = sessionStorage.getItem('token');
    const configBase = token ? { headers: { Authorization: `Bearer ${token}` } } : { headers: {} };

    useEffect(() => {
        obtenerDetalle();
    }, [productoId]);

    const obtenerDetalle = async () => {
        try {
            setCargando(true);
            const config = {
                ...configBase,
                headers: {
                    ...configBase.headers,
                    ...(usuarioId ? { 'X-User-Id': String(usuarioId) } : {})
                }
            };

            const response = await api.get(`/bff/productos/${productoId}/detalle-completo`, config);
            setProducto(response.data.producto);
            if (response.data.haComprado !== undefined) {
                setHaComprado(response.data.haComprado);
            }
        } catch (err) {
            setError('Error al cargar el producto.');
        } finally {
            setCargando(false);
        }
    };

    const handleAgregarCarrito = async () => {
        if (!token && !usuarioId) return alert("Por favor, inicia sesión para agregar productos al carrito.");

        const item = {
            clienteId: usuarioId,
            productoId: producto.id,
            cantidad: cantidad,
            precioUnitario: producto.precio
        };

        try {
            await api.post(`/api/pagos/carrito/agregar`, item, configBase);
            alert("🛒 ¡Producto agregado al carrito con éxito!");
        } catch (err) {
            alert(`⚠️ Atención: ${err.response?.data || "Ocurrió un error de conexión con el servidor."}`);
        }
    };

    const handleComprarAhora = async () => {
        if (!token && !usuarioId) return alert("Por favor, inicia sesión para comprar.");

        const solicitud = {
            productoId: producto.id,
            cantidad: cantidad,
            monto: producto.precio * cantidad,
            descripcion: `Compra ${producto.nombre}`,
            clienteId: usuarioId
        };

        try {
            const response = await api.post(`/api/pagos/iniciar`, solicitud, configBase);
            if (response.data.transaccionId) {
                setIdPagoGenerado(response.data.idPago);
                setEsperandoPago(true);
                window.open(response.data.transaccionId, '_blank');
            }
        } catch (err) {
            alert(`❌ Error al intentar procesar el pago: ${err.response?.data || "Conexión rechazada"}`);
        }
    };

    const confirmarPagoManual = async () => {
        try {
            const auth = getAuthData();
            const nombreReal = auth && auth.nombre ? auth.nombre : 'Cliente';

            const configPago = {
                ...configBase,
                headers: {
                    ...configBase.headers,
                    'X-User-Id': String(usuarioId),
                    'X-User-Name': nombreReal
                }
            };

            await api.post(`/api/pagos/confirmar/${idPagoGenerado}`, {}, configPago);
            alert("✅ Pago confirmado. El stock ha sido descontado correctamente.");
            window.location.reload();
        } catch (err) {
            alert("❌ Error al confirmar el pago.");
        }
    };

    if (cargando) return <p style={{ color: '#00d4ff', textAlign: 'center' }}>Cargando...</p>;
    if (error) return <p style={{ color: '#ff4444', textAlign: 'center' }}>{error}</p>;
    if (!producto) return null;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ backgroundColor: '#111', padding: '30px', borderRadius: '15px', border: '1px solid #333' }}>
                <button onClick={alVolver} style={{ padding: '8px 15px', backgroundColor: 'transparent', color: '#00d4ff', border: '1px solid #00d4ff', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}>
                    ⬅️ VOLVER
                </button>

                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <img src={producto.imagenUrl || 'https://via.placeholder.com/400x400'} alt={producto.nombre} style={{ width: '100%', borderRadius: '10px', border: '1px solid #222' }} />
                    </div>

                    <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.8rem' }}>{producto.categoria}</span>
                        <h2 style={{ color: '#00d4ff', margin: '10px 0', fontSize: '2rem' }}>{producto.nombre}</h2>
                        <p style={{ color: '#ccc', marginBottom: '20px' }}>{producto.descripcion}</p>
                        <h3 style={{ color: 'white', fontSize: '1.8rem', margin: '0 0 20px 0' }}>${producto.precio?.toLocaleString()}</h3>

                        {!esperandoPago ? (
                            <>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                                    <label style={{ color: '#888' }}>Cantidad:</label>
                                    <input type="number" min="1" max={producto.stock} value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} style={{ padding: '10px', width: '70px', backgroundColor: '#050505', color: 'white', border: '1px solid #333', borderRadius: '8px' }} />
                                    <span style={{ color: producto.stock < 5 ? '#ff4444' : '#44ff44', fontSize: '0.8rem' }}>Stock: {producto.stock}</span>
                                </div>

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button onClick={handleAgregarCarrito} style={{ flex: 1, padding: '15px', backgroundColor: 'transparent', color: '#00d4ff', border: '1px solid #00d4ff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        🛒 AL CARRITO
                                    </button>
                                    <button onClick={handleComprarAhora} style={{ flex: 1, padding: '15px', backgroundColor: '#44ff44', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        💸 COMPRAR AHORA
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ padding: '20px', border: '1px dashed #00d4ff', borderRadius: '10px', textAlign: 'center', backgroundColor: 'rgba(0, 212, 255, 0.05)' }}>
                                <p style={{ color: '#00d4ff', fontWeight: 'bold', marginBottom: '10px' }}>
                                    🔒 Tu pago seguro se abrió en otra pestaña
                                </p>
                                <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '15px' }}>
                                    Completa la transacción en Mercado Pago y luego haz clic aquí para confirmar.
                                </p>
                                <button onClick={confirmarPagoManual} style={{ width: '100%', padding: '12px', backgroundColor: '#00d4ff', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    ✅ YA PAGUÉ, DESCONTAR STOCK
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ResenasProducto
                rol={rol}
                usuarioId={usuarioId}
                productoId={producto.id}
                productoNombre={producto.nombre}
                vendedorId={producto.vendedorId}
                haComprado={haComprado}
            />
        </div>
    );
};

export default DetalleCatalogo;