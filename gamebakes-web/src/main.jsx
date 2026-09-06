import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./componentes/autenticacion/authConfig.js";
import { MsalProvider } from "@azure/msal-react";

const msalInstance = new PublicClientApplication(msalConfig);

msalInstance.initialize().then(() => {
    createRoot(document.getElementById('root')).render(
        <StrictMode>
            <MsalProvider instance={msalInstance}>
                <App />
            </MsalProvider>
        </StrictMode>,
    )
}).catch(e => {
    console.error("Error al inicializar MSAL:", e);
});