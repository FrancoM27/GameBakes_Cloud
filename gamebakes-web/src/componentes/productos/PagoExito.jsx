import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAuthData } from '../autenticacion/authUtils';
import { useAxios } from '../autenticacion/useAxios.js';

export default function PagoExito() {
    const api = useAxios();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [estadoPago, setEstadoPago] = useState('validando');

    useEffect(() => {
        const statusMP = searchParams.get('collection_status');
        const idPago = searchParams.get('external_reference');

        if (statusMP === 'approved' && idPago) {
            confirmarPagoEnBackend(idPago);
        } else {
            setEstadoPago('error');
        }
    }, []);

    const confirmarPagoEnBackend = async (idPago) => {
        try {
            const token = sessionStorage.getItem('token');
            const auth = getAuthData();
            const usuarioId = auth ? auth.id : '';
            const nombreReal = auth && auth.nombre ? auth.nombre : 'Cliente';

            const configPago = {
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    'X-User-Id': String(usuarioId),
                    'X-User-Name': nombreReal
                }
            };

            await api.post(`/api/pagos/confirmar/${idPago}`, {}, configPago);
            setEstadoPago('aprobado');
        } catch (error) {
            console.error("Error confirmando en el backend:", error);
            setEstadoPago('error');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#111] text-white p-6">
            {estadoPago === 'validando' && (
                <div className="text-center animate-pulse">
                    <div className="w-16 h-16 border-4 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h2 className="text-3xl font-bold mb-2 text-[#00d4ff]">Validando tu transacción...</h2>
                    <p className="text-gray-400">Por favor no cierres esta ventana, estamos confirmando el stock.</p>
                </div>
            )}

            {estadoPago === 'aprobado' && (
                <div className="text-center">
                    <div className="w-24 h-24 bg-[#44ff44] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50">
                        <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 className="text-4xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#44ff44] to-[#00d4ff]">
                        ¡Pago Exitoso!
                    </h2>
                    <p className="text-xl text-gray-300 mb-8">El stock ha sido actualizado correctamente.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-transparent text-[#00d4ff] border border-[#00d4ff] font-bold rounded-xl hover:bg-[#00d4ff] hover:text-black transition-colors"
                    >
                        Volver a la tienda
                    </button>
                </div>
            )}

            {estadoPago === 'error' && (
                <div className="text-center">
                    <div className="w-24 h-24 bg-[#ff4444] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/50">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-[#ff4444]">Algo salió mal</h2>
                    <p className="text-gray-400 mb-6">No pudimos validar tu pago o fue rechazado.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-[#ff4444] text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            )}
        </div>
    );
}