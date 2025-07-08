# Auth Microfrontend (MFE)

## Descripción General

El Auth MFE es el microfrontend responsable de la autenticación de usuarios en la aplicación "Modular People Portal". Implementa un sistema de autenticación JWT utilizando la API de DummyJSON para validar credenciales y gestionar sesiones de usuario.

## Arquitectura y Estructura

```
auth-mfe/
├── src/
│   ├── AuthApp.tsx              # Componente principal del MFE
│   ├── index.tsx                # Punto de entrada con detección standalone
│   ├── components/
│   │   ├── LoginForm.tsx        # Formulario de inicio de sesión
│   │   └── LoginForm.css        # Estilos del formulario
│   ├── hooks/
│   │   └── useAuth.ts           # Hook personalizado para lógica de auth
│   ├── services/
│   │   └── authService.ts       # Servicio de comunicación con API
│   ├── types/
│   │   ├── auth.ts              # Definiciones de tipos TypeScript
│   │   └── global.d.ts          # Declaraciones globales
│   └── webpack.config.js        # Configuración Module Federation
```

## Funcionalidades Principales

### 1. Autenticación con DummyJSON
- **API Endpoint**: `https://dummyjson.com/auth/login`
- **Método**: POST con credenciales de usuario
- **Respuesta**: Token JWT y datos del usuario

### 2. Gestión de Sesión
- **Almacenamiento**: localStorage para persistencia
- **Datos guardados**: 
  - `authToken`: Token JWT para autenticación
  - `userData`: Información completa del usuario
- **Sincronización**: Con el AuthContext del shell

### 3. Validación de Formularios
- Validación en tiempo real de campos
- Manejo de errores de autenticación
- Estados de carga durante el proceso

## Componentes Principales

### AuthApp.tsx
```typescript
// Componente principal que maneja el estado de autenticación
// y renderiza el formulario de login cuando no está autenticado
```

**Lógica aplicada**:
- Verifica si el usuario ya está autenticado al montar
- Si está autenticado, no muestra la UI (el shell maneja la navegación)
- Si no está autenticado, muestra el formulario de login
- Gestiona estados de carga y error

### LoginForm.tsx
```typescript
// Formulario de inicio de sesión con validación y manejo de estado
```

**Características**:
- Campos: username y password
- Validación en tiempo real
- Estados visuales para loading/error
- Credenciales de demostración predefinidas

### useAuth.ts
```typescript
// Hook personalizado que encapsula toda la lógica de autenticación
```

**Funcionalidades**:
- `login()`: Procesa credenciales y autentica usuario
- `logout()`: Limpia sesión y redirige
- `checkAuthStatus()`: Verifica estado de autenticación actual
- Estados: `isAuthenticated`, `loading`, `error`, `user`

### authService.ts
```typescript
// Servicio que maneja las comunicaciones con la API externa
```

**Métodos**:
- `login(username, password)`: Llamada a DummyJSON API
- `validateToken()`: Verifica validez del token almacenado
- Manejo de errores HTTP y transformación de respuestas

## Integración con Module Federation

### Configuración Webpack
```javascript
// Expone el componente AuthApp para consumo del shell
exposes: {
  './AuthApp': './src/AuthApp'
}
```

### Dependencias Compartidas
- **React**: Singleton para evitar conflictos de versión
- **React-DOM**: Compartido entre todos los MFEs
- **React-Router-DOM**: Para navegación consistente

## Tipos de Datos

### User
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  token: string;
}
```

### AuthState
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
```

### LoginResponse
```typescript
interface LoginResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
  accessToken: string; 
}
```

## Flujo de Autenticación

1. **Carga inicial**: 
   - Verifica localStorage por token existente
   - Si existe, valida y restaura sesión
   - Si no existe o es inválido, muestra formulario

2. **Proceso de login**:
   - Usuario ingresa credenciales
   - Validación local de campos
   - Envío a DummyJSON API
   - Procesamiento de respuesta
   - Almacenamiento de datos en localStorage
   - Notificación al shell vía AuthContext

3. **Mantener sesión**:
   - Token persiste en localStorage
   - Sincronización automática con shell
   - Verificación de validez en cada carga

4. **Logout**:
   - Limpieza de localStorage
   - Reset de estado de autenticación
   - Redirección a página de login

## Credenciales de Demostración

Para pruebas, usar estas credenciales válidas de DummyJSON:

```
Username: emilys
Password: emilyspass
```

**Otro usuario disponible**:
- `oliviaw` / `oliviawpass`

## Manejo de Errores

### Tipos de Error
1. **Credenciales inválidas**: Mensaje específico para usuario/contraseña incorrectos
2. **Error de red**: Manejo de fallos de conexión
3. **Error del servidor**: Respuestas 500+ del servidor
4. **Token expirado**: Detección y limpieza automática

### Estrategias de Recuperación
- Reintentos automáticos para errores de red
- Mensajes informativos para el usuario
- Limpieza automática de tokens inválidos
- Fallback a estado no autenticado

## Desarrollo Standalone

El MFE puede ejecutarse independientemente para desarrollo:

```bash
npm start
```

**Características standalone**:
- Detección automática de modo desarrollo
- Creación de root React solo si es necesario
- Funcionalidad completa sin dependencia del shell

## Integración con Shell

### Comunicación
- **AuthContext**: Contexto compartido para estado global
- **LocalStorage**: Persistencia entre sesiones
- **Eventos**: Notificaciones de cambios de estado

### Sincronización
- El shell escucha cambios en localStorage
- Actualización automática del estado global
- Navegación reactiva basada en autenticación

## Consideraciones de Seguridad

1. **Token Storage**: localStorage para persistencia (considerar httpOnly cookies en producción)
2. **HTTPS**: Obligatorio para transmisión segura de credenciales
3. **Token Validation**: Verificación de validez en cada sesión
4. **Auto-logout**: Limpieza automática de sesiones inválidas

## Scripts Disponibles

- `npm start`: Desarrollo en modo standalone
- `npm run build`: Construcción para producción
- `npm test`: Ejecución de tests
- `npm run dev`: Desarrollo con hot reload

## Dependencias Principales

- **React 18.2.0**: Framework base
- **TypeScript**: Tipado estático
- **Webpack 5**: Module Federation
- **CSS Modules**: Estilos encapsulados

---

## Notas de Implementación

### Cambios Recientes
- Corrección de tipo `accessToken` vs `token` en DummyJSON response
- Implementación de persistencia en localStorage
- Mejora en detección de modo standalone
- Optimización de re-renders con useCallback

### Próximas Mejoras
- Implementación de refresh tokens
- Mejora en manejo de errores
- Tests unitarios comprehensivos
- Internacionalización de mensajes
