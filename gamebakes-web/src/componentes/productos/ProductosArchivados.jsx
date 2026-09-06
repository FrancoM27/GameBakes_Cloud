import React, { useState, useEffect } from 'react';
import { useAxios } from '../autenticacion/useAxios.js';

export default function ProductosArchivados({ vendedorId, alRestaurarExitoso }) {
    const api = useAxios();
    const [productosAnulados, setProductosAnulados] = useState([]);
    const [cargando, setCargando] = useState(true);

    const colorCian = '#00d4ff';

    useEffect(() => {
        if (vendedorId) {
            obtenerArchivados();
        }
    }, [vendedorId]);

    const obtenerArchivados = async () => {
        setCargando(true);
        try {
            const response = await api.get(`/api/productos/vendedor/${vendedorId}`);

            if (Array.isArray(response.data)) {
                const ocultos = response.data.filter(p => !p.activo);
                setProductosAnulados(ocultos);
            }
        } catch (err) {
            console.error("Error cargando archivados:", err);
        } finally {
            setCargando(false);
        }
    };

    const handleRestaurar = async (productoId) => {
        try {
            await api.patch(`/api/productos/${productoId}/estado?activo=true`);

            alert("✅ ¡Producto restaurado con éxito! Volverá a aparecer en el catálogo público.");
            obtenerArchivados();
            if (alRestaurarExitoso) alRestaurarExitoso();
        } catch (err) {
            alert(`❌ Error al intentar restaurar: ${err.response?.data || "Conexión rechazada"}`);
        }
    };

    if (cargando) return <p style={{ textAlign: 'center', color: colorCian }}>Buscando en el baúl de archivados...</p>;

    return (
        <div style={gridStyle}>
            {productosAnulados.length === 0 ? (
                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#666', padding: '40px' }}>
                    No tienes productos archivados en este momento.
                </p>
            ) : (
                productosAnulados.map(p => (
                    <div key={p.id} style={cardStyle}>
                        <div style={{ ...imgContainer, backgroundImage: `url(${p.imagenUrl || 'https://via.placeholder.com/300x200'})` }}>
                            <span style={tagStyleArchivado}>ARCHIVADO</span>
                        </div>
                        <div style={contentStyle}>
                            <h3 style={{ color: '#aaa', margin: '0 0 10px 0' }}>{p.nombre}</h3>
                            <p style={{ color: '#555', fontSize: '0.8rem', margin: '0 0 15px 0' }}>{p.categoria}</p>
                            <div style={btnGroupGrid}>
                                <button onClick={() => handleRestaurar(p.id)} style={btnRestaurar}>
                                    🔄 REHABILITAR PRODUCTO
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' };
const cardStyle = { backgroundColor: '#111', borderRadius: '15px', overflow: 'hidden', border: '1px solid #222', opacity: 0.8 };
const imgContainer = { height: '160px', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', filter: 'grayscale(100%)' };
const tagStyleArchivado = { position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ff4444', color: 'white', padding: '4px 10px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold' };
const contentStyle = { padding: '20px' };
const btnGroupGrid = { display: 'flex', gap: '8px' };
const btnRestaurar = { flex: 1, padding: '10px', backgroundColor: 'transparent', border: '1px solid #44ff44', color: '#44ff44', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' };