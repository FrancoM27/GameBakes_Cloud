import React, { useState } from 'react'
import { useMsal } from "@azure/msal-react"
import { loginRequest } from './componentes/autenticacion/authConfig'

import SeguimientoPedidos from './componentes/seguimiento_pedidos/SeguimientoPedidos'
import ResenasProducto from './componentes/resenas/ResenasProducto'
import logo from './assets/logo_gamebakes.png'
import Login from './componentes/autenticacion/Login'
import Registro from './componentes/autenticacion/Registro'
import SolicitarRecuperacion from './componentes/autenticacion/SolicitarRecuperacion'
import RestablecerPassword from './componentes/autenticacion/RestablecerPassword'
import GestionProductos from './componentes/productos/GestionProductos'
import CatalogoProductos from './componentes/productos/CatalogoProductos'
import DetalleCatalogo from './componentes/productos/DetalleCatalogo'
import Carrito from './componentes/productos/Carrito'
import PerfilUsuario from './componentes/perfil/PerfilUsuario'

import { getAuthData } from './componentes/autenticacion/authUtils'

function App() {
    // --- 1. INTEGRACIÓN MSAL (AZURE AD - VENDEDORES/ADMINS) ---
    const { instance, accounts } = useMsal();
    const isMsalAuthenticated = accounts.length > 0;
    const msalAccount = accounts[0];

    const handleLoginMSAL = () => {
        instance.loginPopup(loginRequest).catch(e => console.error("Error en login MSAL:", e));
    };

    const handleLogoutMSAL = () => {
        instance.logoutPopup().catch(e => console.error("Error en logout MSAL:", e));
        sessionStorage.clear();
        setSeccionActiva('inicio');
    };

    // --- 2. LÓGICA MANUAL ORIGINAL (CLIENTES) ---
    const [usuario, setUsuario] = useState(() => {
        const auth = getAuthData();
        if (auth) {
            return { loggedIn: true, rol: auth.rol || 'cliente', id: auth.id || null, nombre: auth.nombre || '' };
        }
        return { loggedIn: false, rol: 'cliente', id: null, nombre: '' };
    });

    const [vistaRecuperacion, setVistaRecuperacion] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);

    const [tokenRecuperacion, setTokenRecuperacion] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return params.get('token');
    });

    const [mostrarRegistro, setMostrarRegistro] = useState(() => {
        return sessionStorage.getItem('view') === 'registro';
    });

    const [seccionActiva, setSeccionActiva] = useState(() => {
        return sessionStorage.getItem('seccion') || 'inicio';
    });

    const manejarCambioSeccion = (id) => {
        setSeccionActiva(id || 'inicio');
        sessionStorage.setItem('seccion', id || 'inicio');
        setProductoSeleccionado(null);
    };

    const manejarCambioVista = (esRegistro) => {
        setMostrarRegistro(esRegistro);
        sessionStorage.setItem('view', esRegistro ? 'registro' : 'login');
        setVistaRecuperacion(false);
    };

    const cerrarSesionManual = () => {
        sessionStorage.clear();
        setUsuario({ loggedIn: false, rol: 'cliente', id: null, nombre: '' });
        setSeccionActiva('inicio');
        setMostrarRegistro(false);
        setVistaRecuperacion(false);
    };

    // --- 3. RENDERIZADO NO AUTENTICADO ---
    if (!isMsalAuthenticated && !usuario.loggedIn) {
        if (tokenRecuperacion) {
            return (
                <RestablecerPassword
                    token={tokenRecuperacion}
                    alFinalizar={() => {
                        setTokenRecuperacion(null);
                        window.history.replaceState({}, document.title, "/");
                        setVistaRecuperacion(false);
                    }}
                />
            );
        }

        if (vistaRecuperacion) {
            return <SolicitarRecuperacion alVolverAlLogin={() => setVistaRecuperacion(false)} />;
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#0a0a0a', minHeight: '100vh', paddingTop: '40px' }}>
                <img src={logo} alt="GameBakes" style={{ width: '250px', marginBottom: '30px' }} />

                {/* SECCIÓN AZURE AD PARA VENDEDORES */}
                <div style={{ background: '#111', padding: '25px', borderRadius: '15px', border: '1px solid #9b59b6', marginBottom: '30px', textAlign: 'center', width: '350px', boxShadow: '0 4px 15px rgba(155, 89, 182, 0.2)' }}>
                    <h3 style={{ color: '#9b59b6', margin: '0 0 15px 0', textTransform: 'uppercase' }}>Acceso Corporativo</h3>
                    <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '15px' }}>Exclusivo para Vendedores y Administradores</p>
                    <button onClick={handleLoginMSAL} style={{ background: '#0078D4', color: 'white', padding: '12px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                        🔑 Iniciar Sesión con Microsoft
                    </button>
                </div>

                <div style={{ width: '350px', borderBottom: '1px solid #333', marginBottom: '30px' }}></div>

                {/* SECCIÓN MANUAL PARA CLIENTES */}
                <h3 style={{ color: '#00d4ff', marginBottom: '10px', textTransform: 'uppercase' }}>Acceso Clientes</h3>
                { mostrarRegistro
                    ? <Registro alVolverAlLogin={() => manejarCambioVista(false)} />
                    : <Login
                        onLoginSuccess={() => {
                            const auth = getAuthData();
                            setUsuario({ loggedIn: true, rol: auth?.rol || 'cliente', id: auth?.id || null, nombre: auth?.nombre || '' });
                            sessionStorage.removeItem('view');
                        }}
                        alCambiarARegistro={() => manejarCambioVista(true)}
                        alOlvidarPassword={() => setVistaRecuperacion(true)}
                    />
                }
            </div>
        );
    }

    // --- 4. RENDERIZADO AUTENTICADO ---
    // Determinamos unificadamente quién está operando la app
    const rolActual = isMsalAuthenticated ? 'vendedor' : usuario.rol;
    const nombreActual = isMsalAuthenticated ? msalAccount.name : usuario.nombre;
    const idActual = isMsalAuthenticated ? msalAccount.localAccountId : usuario.id;

    const colorCian = '#00d4ff';
    const colorMorado = '#9b59b6';
    const colorTema = rolActual === 'vendedor' ? colorMorado : colorCian;

    const menuCliente = [
        { id: 'inicio', nombre: '🎮 Inicio' },
        { id: 'catalogo', nombre: '🍰 Catálogo' },
        { id: 'carrito', nombre: '🛒 Mi Carrito' },
        { id: 'pedidos', nombre: '📦 Mis Pedidos' },
        { id: 'resenas', nombre: '⭐ Mis Reseñas' },
        { id: 'perfil', nombre: '👤 Mi Perfil' }
    ];

    const menuVendedor = [
        { id: 'inicio', nombre: '🏠 Dashboard' },
        { id: 'productos', nombre: '🧁 Mis Productos' },
        { id: 'pedidos_gestion', nombre: '📋 Gestionar Ventas' },
        { id: 'resenas_gestion', nombre: '💬 Feedback Clientes' },
        { id: 'perfil', nombre: '👤 Mi Perfil' }
    ];

    const menuActual = rolActual === 'vendedor' ? menuVendedor : menuCliente;

    const estiloTarjeta = { backgroundColor: '#111', border: `1px solid #333`, borderBottom: `4px solid ${colorTema}`, borderRadius: '15px', padding: '30px', textAlign: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0a0a0a', color: 'white' }}>
            <nav style={{ width: '250px', backgroundColor: 'rgba(0,0,0,0.9)', borderRight: `2px solid ${colorTema}`, padding: '20px', display: 'flex', flexDirection: 'column', backdropFilter: 'blur(10px)', position: 'fixed', height: '100vh', boxSizing: 'border-box', zIndex: 1000 }}>
                <img src={logo} alt="Logo" style={{ width: '100%', marginBottom: '30px' }} />

                <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '20px' }}>
                    <p style={{ color: colorTema, fontSize: '0.8rem', marginBottom: '20px', textAlign: 'center', letterSpacing: '1px' }}>
                        MODO: {rolActual.toUpperCase()}
                    </p>
                    {menuActual.map(item => (
                        <button
                            key={item.id}
                            onClick={() => manejarCambioSeccion(item.id)}
                            style={{ width: '100%', textAlign: 'left', padding: '12px', marginBottom: '10px', backgroundColor: seccionActiva === item.id ? colorTema : 'transparent', color: seccionActiva === item.id ? 'black' : 'white', border: `1px solid ${seccionActiva === item.id ? colorTema : 'rgba(255,255,255,0.1)'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' }}
                        >
                            {item.nombre}
                        </button>
                    ))}
                </div>

                <div style={{ paddingBottom: '10px' }}>
                    <button
                        onClick={isMsalAuthenticated ? handleLogoutMSAL : cerrarSesionManual}
                        style={{ width: '100%', backgroundColor: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}
                    >
                        ❌ Cerrar Gestión
                    </button>
                </div>
            </nav>

            <main style={{ flexGrow: 1, padding: '40px', marginLeft: '250px' }}>
                <header style={{ marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                    <h1 style={{ color: colorTema, margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
                        {(seccionActiva || 'inicio').replace('_', ' ')}
                    </h1>
                </header>

                {seccionActiva === 'pedidos' && <SeguimientoPedidos rol={rolActual} usuarioId={idActual} />}
                {seccionActiva === 'pedidos_gestion' && <SeguimientoPedidos rol={rolActual} usuarioId={idActual} />}
                {seccionActiva === 'resenas' && <ResenasProducto rol={rolActual} usuarioId={idActual} />}
                {seccionActiva === 'resenas_gestion' && <ResenasProducto rol={rolActual} usuarioId={idActual} />}
                {seccionActiva === 'productos' && <GestionProductos vendedorId={idActual}/>}
                {seccionActiva === 'perfil' && <PerfilUsuario usuarioId={idActual} rol={rolActual} />}

                {seccionActiva === 'catalogo' && !productoSeleccionado && (
                    <CatalogoProductos onVerDetalle={(id) => setProductoSeleccionado(id)} />
                )}

                {seccionActiva === 'catalogo' && productoSeleccionado && (
                    <DetalleCatalogo productoId={productoSeleccionado} rol={rolActual} usuarioId={idActual} alVolver={() => setProductoSeleccionado(null)} />
                )}

                {seccionActiva === 'carrito' && (
                    <Carrito usuarioId={idActual} onCambiarSeccion={manejarCambioSeccion} />
                )}

                {seccionActiva === 'inicio' && (
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <div style={{ background: `linear-gradient(135deg, rgba(0,0,0,0.8), ${colorTema}33)`, padding: '60px 40px', borderRadius: '20px', border: `1px solid ${colorTema}`, textAlign: 'center', marginBottom: '40px', boxShadow: `0 10px 30px ${colorTema}22` }}>
                            <h1 style={{ fontSize: '3.5rem', margin: '0 0 15px 0', textTransform: 'uppercase', textShadow: `0 0 15px ${colorTema}` }}>
                                ¡SALUDOS, {nombreActual || 'GUERRERO'}!
                            </h1>
                            <p style={{ fontSize: '1.2rem', color: '#ccc', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
                                {rolActual === 'vendedor'
                                    ? 'Este es tu panel de control central. Revisa tus pedidos pendientes, gestiona tu armería de productos y domina el mercado.'
                                    : 'Prepárate para subir de nivel con los mejores pasteles y dulces temáticos. ¿Qué aventura gastronómica elegiremos hoy?'}
                            </p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px' }}>
                            {rolActual === 'cliente' ? (
                                <>
                                    <div onClick={() => manejarCambioSeccion('catalogo')} style={estiloTarjeta}>
                                        <h2 style={{ fontSize: '3rem', margin: '0 0 15px 0' }}>🍰</h2>
                                        <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Explorar Catálogo</h3>
                                        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Descubre nuevas pociones y pasteles.</p>
                                    </div>
                                    <div onClick={() => manejarCambioSeccion('pedidos')} style={estiloTarjeta}>
                                        <h2 style={{ fontSize: '3rem', margin: '0 0 15px 0' }}>📦</h2>
                                        <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Mis Misiones</h3>
                                        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Rastrea tus pedidos activos y entregados.</p>
                                    </div>
                                    <div onClick={() => manejarCambioSeccion('carrito')} style={estiloTarjeta}>
                                        <h2 style={{ fontSize: '3rem', margin: '0 0 15px 0' }}>🛒</h2>
                                        <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Inventario</h3>
                                        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Revisa y paga los items de tu carrito.</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div onClick={() => manejarCambioSeccion('pedidos_gestion')} style={estiloTarjeta}>
                                        <h2 style={{ fontSize: '3rem', margin: '0 0 15px 0' }}>📋</h2>
                                        <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Órdenes Activas</h3>
                                        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Gestiona y actualiza los pedidos.</p>
                                    </div>
                                    <div onClick={() => manejarCambioSeccion('productos')} style={estiloTarjeta}>
                                        <h2 style={{ fontSize: '3rem', margin: '0 0 15px 0' }}>🧁</h2>
                                        <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Mi Armería</h3>
                                        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Añade o edita tu stock de productos.</p>
                                    </div>
                                    <div onClick={() => manejarCambioSeccion('resenas_gestion')} style={estiloTarjeta}>
                                        <h2 style={{ fontSize: '3rem', margin: '0 0 15px 0' }}>💬</h2>
                                        <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Feedback</h3>
                                        <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>Responde las reseñas de los guerreros.</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

export default App