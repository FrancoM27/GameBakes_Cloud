import React, { useState, useEffect } from 'react';
import { getAuthData } from '../autenticacion/authUtils';
import { useAxios } from '../autenticacion/useAxios.js';

const CatalogoProductos = ({onVerDetalle}) => {
    const api = useAxios();
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [filtroCategoria, setFiltroCategoria] = useState('Todos');
    const [categorias, setCategorias] = useState([]);

    const auth = getAuthData();
    const colorCian = '#00d4ff';

    useEffect(() => {
        traerProductosActivos();
    }, []);

    const traerProductosActivos = async () => {
        try {
            setCargando(true);
            const response = await api.get(`/api/productos`);
            const data = response.data;

            setProductos(data);
            const cats = ['Todos', ...new Set(data.map(p => p.categoria).filter(c => c))];
            setCategorias(cats);
        } catch (err) {
            console.error('Error:', err);
            setError('No se pudieron cargar los productos');
        } finally {
            setCargando(false);
        }
    };

    const productosFiltrados = filtroCategoria === 'Todos'
        ? productos
        : productos.filter(p => p.categoria === filtroCategoria);

    if (cargando) return <p style={{ color: colorCian, textAlign: 'center', marginTop: '20px' }}>Cargando catálogo gamer...</p>;
    if (error) return <p style={{ color: '#ff4444', textAlign: 'center', marginTop: '20px' }}>{error}</p>;

    return (
        <div>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ color: colorCian, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' }}>🍰 Catálogo de Productos</h2>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    {categorias.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFiltroCategoria(cat)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: filtroCategoria === cat ? colorCian : 'rgba(0,212,255,0.1)',
                                color: filtroCategoria === cat ? 'black' : colorCian,
                                border: `1px solid ${colorCian}`,
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: '0.3s'
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                {productosFiltrados.map(producto => (
                    <div
                        key={producto.id}
                        style={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '15px', overflow: 'hidden', transition: '0.3s', cursor: 'pointer', position: 'relative' }}
                        onClick={() => onVerDetalle(producto.id)}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = colorCian; e.currentTarget.style.boxShadow = '0 0 15px rgba(0,212,255,0.3)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        {producto.imagenUrl && (
                            <img src={producto.imagenUrl} alt={producto.nombre} style={{ width: '100%', height: '220px', objectFit: 'cover' }} />
                        )}
                        <div style={{ padding: '20px' }}>
                            <span style={{ color: '#888', fontSize: '0.7rem', textTransform: 'uppercase' }}>{producto.categoria}</span>
                            <h3 style={{ margin: '5px 0 15px 0', color: 'white', fontSize: '1.2rem' }}>{producto.nombre}</h3>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: colorCian, fontSize: '1.4rem', fontWeight: 'bold' }}>
                                    ${producto.precio?.toLocaleString()}
                                </span>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, color: '#666', fontSize: '0.7rem' }}>STOCK DISPONIBLE</p>
                                    <span style={{ color: producto.stock > 0 ? '#44ff44' : '#ff4444', fontWeight: 'bold' }}>
                                        {producto.stock} uds.
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={(e) => { e.stopPropagation(); onVerDetalle(producto.id); }}
                                style={{ width: '100%', marginTop: '20px', padding: '12px', backgroundColor: colorCian, color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase' }}
                            >
                                Ver Producto
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {productosFiltrados.length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px', color: '#444' }}>
                    <p>No hay productos en esta categoría, jefe.</p>
                </div>
            )}
        </div>
    );
};

export default CatalogoProductos;