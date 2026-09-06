export const msalConfig = {
    auth: {
        clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
        authority: import.meta.env.VITE_AZURE_AUTHORITY,
        redirectUri: "http://localhost:5173",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    }
};

export const loginRequest = {
    scopes: [import.meta.env.VITE_AZURE_SCOPE]
};