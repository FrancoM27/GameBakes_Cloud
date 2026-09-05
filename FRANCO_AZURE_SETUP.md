# Guía de Configuración de Azure AD para Franco - GameBakes

## Configuración de Microsoft Entra ID para GameBakes

Esta guía detalla los pasos que Franco debe seguir en Azure Portal para completar la configuración de identidad requerida por la rúbrica de la Evaluación Parcial 1.

## Requisitos Previos

- Acceso a Azure Portal con permisos de administrador
- Tenant ID: `e41697ee-1b10-4b64-95da-b32ec0fdb9a7`
- Backend ya configurado con las propiedades de OAuth2 Resource Server

## Paso 1: Registrar Aplicación Backend (Resource Server)

### 1.1 Acceder a Azure Portal
1. Ir a [https://portal.azure.com](https://portal.azure.com)
2. Iniciar sesión con las credenciales de administrador
3. Navegar a **Microsoft Entra ID** (antes Azure Active Directory)

### 1.2 Registrar Nueva Aplicación
1. En el menú lateral, seleccionar **App registrations**
2. Hacer clic en **New registration**
3. Completar el formulario:
   - **Name:** `GameBakes Backend API`
   - **Supported account types:** `Accounts in this organizational directory only`
   - **Redirect URI:** Dejar en blanco por ahora
4. Hacer clic en **Register**

### 1.3 Configurar la Aplicación Backend
1. Copiar el **Application (client) ID** - este es el Client ID del backend
2. Copiar el **Directory (tenant) ID** - debe coincidir con `e41697ee-1b10-4b64-95da-b32ec0fdb9a7`
3. Ir a **Certificates & secrets**
4. Crear un nuevo **Client secret**:
   - Hacer clic en **New client secret**
   - Descripción: `GameBakes Backend Secret`
   - Expiry: Seleccionar una fecha apropiada (recomendado: 180 días)
   - Hacer clic en **Add**
   - **IMPORTANTE:** Copiar el valor del secret inmediatamente (no se podrá ver después)

### 1.4 Exponer API y Crear Scopes
1. Ir a **Expose an API**
2. Verificar que el **Application ID URI** esté configurado como: `api://7f32a189-8be6-4f14-92ab-9d8e80fac2bc`
3. Hacer clic en **Add a scope**
4. Configurar el scope:
   - **Scope name:** `admin.access`
   - **Who can consent:** `Admins and users`
   - **Admin consent display name:** `Admin Access to GameBakes API`
   - **Admin consent description:** `Permite acceso administrativo a la API de GameBakes`
   - **User consent display name:** `Admin Access`
   - **User consent description:** `Acceso administrativo a GameBakes`
5. Hacer clic en **Add scope**
6. **Resultado final:** El scope completo será `api://7f32a189-8be6-4f14-92ab-9d8e80fac2bc/admin.access`

## Paso 2: Registrar Aplicación Frontend (Client Application)

### 2.1 Registrar Nueva Aplicación Frontend
1. En **App registrations**, hacer clic en **New registration**
2. Completar el formulario:
   - **Name:** `GameBakes Frontend React`
   - **Supported account types:** `Accounts in this organizational directory only`
   - **Redirect URI:** 
     - Tipo: `Single-page application (SPA)`
     - URL: `http://localhost:5173` (para desarrollo local)
     - URL: `http://18.211.231.0:5173` (para producción)
3. Hacer clic en **Register**

### 2.2 Configurar la Aplicación Frontend
1. Copiar el **Application (client) ID** - este es el Client ID que Franco debe dar a Luis
2. Ir a **Authentication**
3. Verificar que el tipo de aplicación esté configurado como **Single-page application (SPA)**
4. Agregar los URIs de redirección si no se agregaron en el registro

### 2.3 Configurar Permisos de API
1. Ir a **API permissions**
2. Hacer clic en **Add a permission**
3. Seleccionar **My APIs**
4. Elegir `GameBakes Backend API`
5. Seleccionar el scope `admin.access` que creamos en el Paso 1.4
6. Hacer clic en **Add permissions**
7. **IMPORTANTE:** Hacer clic en **Grant admin consent for [your organization]** para conceder el consentimiento

## Paso 3: Verificar Configuración

### 3.1 Verificar Propiedades del Backend
- ✅ Application ID URI: `api://7f32a189-8be6-4f14-92ab-9d8e80fac2bc`
- ✅ Scope creado: `api://7f32a189-8be6-4f14-92ab-9d8e80fac2bc/admin.access`
- ✅ Client ID del backend coincide con configuración en application.properties

### 3.2 Verificar Propiedades del Frontend
- ✅ Client ID del frontend (nuevo valor para Luis)
- ✅ Redirect URIs configurados correctamente
- ✅ Permisos de API concedidos con admin consent

## Paso 4: Documentación para Coordinación con Luis

### Datos que Franco debe proporcionar a Luis:

```
Client ID Frontend: [COPIAR EL CLIENT ID DE LA APLICACIÓN FRONTEND]
Tenant ID: e41697ee-1b10-4b64-95da-b32ec0fdb9a7
Authority: https://login.microsoftonline.com/e41697ee-1b10-4b64-95da-b32ec0fdb9a7
Scopes: ["api://7f32a189-8be6-4f14-92ab-9d8e80fac2bc/admin.access"]
Redirect URI: http://localhost:5173 (desarrollo) / http://18.211.231.0:5173 (producción)
```

### Configuración para el package.json de Luis:

Luis debe agregar estas dependencias:
```json
"@azure/msal-browser": "^3.0.0",
"@azure/msal-react": "^2.0.0"
```

### Configuración para el .env de Luis:

```env
VITE_AZURE_CLIENT_ID=[CLIENT_ID_FRONTEND]
VITE_AZURE_TENANT_ID=e41697ee-1b10-4b64-95da-b32ec0fdb9a7
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/e41697ee-1b10-4b64-95da-b32ec0fdb9a7
VITE_AZURE_SCOPE=api://7f32a189-8be6-4f14-92ab-9d8e80fac2bc/admin.access
```

## Paso 5: Verificación de Integración

### 5.1 Probar Configuración Local
1. Asegurarse que el servicio-usuarios esté configurado con las nuevas propiedades
2. Iniciar el servicio: `./mvnw spring-boot:run`
3. Verificar en los logs que el JWT decoder se conecte al JWKS endpoint:
   ```
   Connected to JWKS endpoint: https://login.microsoftonline.com/e41697ee-1b10-4b64-95da-b32ec0fdb9a7/discovery/v2.0/keys
   ```

### 5.2 Coordinación con Esther
Franco debe proporcionar a Esther:
- Issuer URI: `https://login.microsoftonline.com/e41697ee-1b10-4b64-95da-b32ec0fdb9a7/v2.0`
- JWKS URI: `https://login.microsoftonline.com/e41697ee-1b10-4b64-95da-b32ec0fdb9a7/discovery/v2.0/keys`
- Audience: `api://7f32a189-8be6-4f14-92ab-9d8e80fac2bc`

Esther usará estos datos para configurar el JWT Authorizer en AWS API Gateway.

## Resumen de Cambios Realizados en el Código

### application.properties (servicio-usuarios)
Se agregaron las siguientes líneas de configuración:

```properties
# Configuración OAuth2 Resource Server para Microsoft Entra ID
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://login.microsoftonline.com/e41697ee-1b10-4b64-95da-b32ec0fdb9a7/v2.0
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://login.microsoftonline.com/e41697ee-1b10-4b64-95da-b32ec0fdb9a7/discovery/v2.0/keys
spring.security.oauth2.resourceserver.jwt.audience=api://7f32a189-8be6-4f14-92ab-9d8e80fac2bc
```

### SecurityConfig
No se requirieron cambios. La configuración existente:
```java
.oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
```
es correcta y funcionará automáticamente con las propiedades configuradas.

## Checklist de Verificación

- [ ] Aplicación Backend registrada en Azure Portal
- [ ] Aplicación Frontend registrada en Azure Portal  
- [ ] Scope `admin.access` creado en la aplicación Backend
- [ ] Permisos de API configurados en la aplicación Frontend
- [ ] Admin consent concedido para los permisos
- [ ] Client ID Frontend proporcionado a Luis
- [ ] Issuer URI y JWKS URI proporcionados a Esther
- [ ] Servicio-usuarios inicia sin errores con nueva configuración
- [ ] Logs confirman conexión al JWKS endpoint de Microsoft Entra ID

## Troubleshooting

### Error: "Invalid issuer"
- Verificar que el Tenant ID en issuer-uri coincida exactamente con el Tenant ID en Azure Portal
- Asegurarse de que se esté usando el endpoint v2.0

### Error: "Unable to validate JWT"
- Verificar que el JWKS endpoint sea accesible desde el servidor
- Confirmar que el audience configurado coincida con el Application ID URI

### Error: "Scope not found"
- Verificar que el scope esté correctamente expuesto en la aplicación Backend
- Confirmar que el admin consent haya sido concedido

## Referencias

- [Microsoft Entra ID Documentation](https://docs.microsoft.com/en-us/azure/active-directory/)
- [Spring Boot OAuth2 Resource Server](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)
- [MSAL.js Documentation](https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-js-overview)