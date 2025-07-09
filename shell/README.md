# Shell MFE - Micro Frontend Orchestrator

El **Shell MFE** es el micro frontend principal que actúa como orquestador y contenedor de toda la aplicación **Modular People Portal**. Este componente es responsable de la navegación, autenticación global, enrutamiento y carga dinámica de otros micro frontends.

## 🏗️ Arquitectura

### Responsabilidades Principales

1. **Orquestación de MFEs**: Gestiona la carga y renderizado de micro frontends remotos
2. **Autenticación Global**: Maneja el estado de autenticación compartido entre todos los MFEs
3. **Navegación Central**: Proporciona una navegación unificada y responsiva
4. **Enrutamiento**: Gestiona las rutas protegidas y públicas de la aplicación
5. **Layout Principal**: Define la estructura visual base de la aplicación

### Micro Frontends Integrados

- **Auth MFE** (`localhost:3001`): Sistema de autenticación y login
- **Directory MFE** (`localhost:3002`): Directorio de usuarios con búsqueda y paginación
- **Memory Game MFE** (`localhost:3003`): Juego de memoria con configuraciones persistentes
- **Profile MFE** (`localhost:3004`): Gestión de perfiles de usuario

## 🚀 Tecnologías Utilizadas

- **React 18.2**: Framework principal con hooks y context
- **React Router DOM 6.8**: Enrutamiento SPA con protección de rutas
- **Module Federation**: Carga dinámica de micro frontends
- **TypeScript**: Tipado estático para mayor robustez
- **CSS3**: Estilos responsivos con CSS Grid y Flexbox
- **Webpack 5**: Bundling y configuración de Module Federation

## 📁 Estructura del Proyecto

```
shell/
├── src/
│   ├── App.tsx                    # Componente principal con routing
│   ├── App.css                    # Estilos globales
│   ├── index.tsx                  # Entry point
│   ├── components/
│   │   ├── Navigation.tsx         # Navbar responsivo
│   │   ├── Navigation.css         # Estilos del navbar
│   │   ├── MicroFrontendLoader.tsx # Wrapper para MFEs
│   │   ├── MicrofrontendWrapper.tsx # HOC para manejo de errores
│   │   └── LoadingSpinner.css     # Spinner de carga
│   ├── contexts/
│   │   └── AuthContext.tsx        # Context global de autenticación
│   ├── pages/
│   │   ├── Dashboard.tsx          # Página principal dashboard
│   │   └── Dashboard.css          # Estilos del dashboard
│   └── types/
│       └── auth.ts                # Tipos TypeScript para auth
├── config/
│   └── mfe-config.js              # Configuración de MFEs por ambiente
├── webpack.config.js              # Configuración Webpack + Module Federation
├── package.json                   # Dependencias y scripts
└── tsconfig.json                  # Configuración TypeScript
```

## 🔧 Configuración y Setup

### Instalación

```bash
cd shell
npm install
```

### Variables de Ambiente

El shell soporta configuración por ambiente a través de variables:

```bash
# Development (por defecto)
REACT_APP_AUTH_MFE_URL=http://localhost:3001/remoteEntry.js
REACT_APP_DIRECTORY_MFE_URL=http://localhost:3002/remoteEntry.js
REACT_APP_MEMORY_GAME_MFE_URL=http://localhost:3003/remoteEntry.js
REACT_APP_PROFILE_MFE_URL=http://localhost:3004/remoteEntry.js
```

### Ejecución

```bash
# Desarrollo
npm start # Puerto 3000

# Build para producción
npm run build

# Testing
npm test
```

## 🏛️ Componentes Principales

### 1. App.tsx - Orquestador Principal

**Responsabilidades:**
- Configuración del Router principal
- Definición de rutas públicas y protegidas
- Integración del AuthProvider global
- Lazy loading de micro frontends

**Flujo de Routing:**
```typescript
/ (public) → AuthApp | Dashboard (if authenticated)
/dashboard (protected) → Dashboard
/directory (protected) → DirectoryApp
/memory-game (protected) → MemoryGameApp + user props
/profile/* (protected) → ProfileApp + user props
/* → Redirect to /
```

### 2. Navigation.tsx - Navegación Responsiva

**Características:**
- **Responsive Design**: Menú hamburguesa para pantallas < 992px
- **Estado Activo**: Highlighting de ruta actual
- **User Info**: Avatar y datos del usuario autenticado
- **Logout Functionality**: Cierre de sesión con limpieza de estado

**Comportamiento Responsivo:**
- **Desktop (≥992px)**: Navegación horizontal completa
- **Mobile (<992px)**: Menú colapsable con overlay

### 3. AuthContext.tsx - Estado Global de Autenticación

**Funcionalidades:**
- **Gestión de Usuario**: Estado del usuario autenticado
- **Persistencia**: LocalStorage para mantener sesión
- **Loading States**: Control de estados de carga
- **Logout Global**: Limpieza completa de estado y redirección

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}
```

### 4. MicroFrontendLoader.tsx - Cargador de MFEs

**Responsabilidades:**
- **Error Boundaries**: Manejo de errores en MFEs remotos
- **Loading States**: Spinner durante carga de MFEs
- **Fallback UI**: Interface de respaldo en caso de fallos
- **Suspense Integration**: Integración con React Suspense

### 5. Dashboard.tsx - Página Principal

**Características:**
- **Cards de Navegación**: Acceso rápido a cada MFE
- **Responsive Grid**: Layout adaptativo
- **Iconografía Consistente**: Icons temáticos para cada sección
- **CSS Modules**: Estilos extraídos y organizados

## 🔐 Sistema de Autenticación

### Flujo de Autenticación

1. **Usuario no autenticado** → Redirección a `/` (AuthApp)
2. **Login exitoso** → AuthApp llama `login(user)` del contexto
3. **Estado persistido** → LocalStorage + Context state
4. **Redirección automática** → `/dashboard`
5. **Rutas protegidas** → Acceso habilitado a todos los MFEs

### ProtectedRoute Component

```typescript
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};
```

## 🌐 Module Federation Setup

### Configuración Webpack

```javascript
new ModuleFederationPlugin({
  name: 'shell',
  remotes: getMFEConfig(), // URLs dinámicas por ambiente
  shared: {
    react: { singleton: true, eager: true },
    'react-dom': { singleton: true, eager: true },
    'react-router-dom': { singleton: true, eager: true }
  }
})
```

### Gestión de Ambientes

El archivo `mfe-config.js` maneja la configuración por ambiente:

- **Development**: URLs localhost con puertos fijos
- **Staging/Production**: URLs desde variables de ambiente
- **Fallback**: Configuración por defecto si fallan las URLs

## 📱 Diseño Responsivo

### Breakpoints

- **Desktop**: ≥ 992px - Navegación completa horizontal
- **Tablet**: 768px - 991px - Navegación adaptada
- **Mobile**: < 768px - Menú hamburguesa con overlay

### CSS Grid Layout

```css
.nav-content {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
}

@media (max-width: 991px) {
  .nav-content {
    position: fixed;
    top: 0;
    right: -100%;
    width: 300px;
    height: 100vh;
    background: var(--background);
    transition: right 0.3s ease;
  }
}
```

## 🎨 Sistema de Estilos

### Variables CSS Globales

```css
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --background: #f8f9fa;
  --text-color: #212529;
}
```

### Clases Utilitarias

- `.main-content`: Layout principal con padding dinámico
- `.with-navbar`: Clase condicional cuando hay navbar visible
- `.loading`: Estados de carga unificados
- `.btn-*`: Sistema de botones consistente

## 🚨 Manejo de Errores

### Error Boundaries para MFEs

```typescript
class MicrofrontendWrapper extends React.Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MFE Error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <FallbackUI />;
    }
    return this.props.children;
  }
}
```

### Estrategias de Fallback

1. **MFE no disponible**: UI de fallback con retry
2. **Error de red**: Mensaje informativo y reintento
3. **Error de JavaScript**: Boundary con logging
4. **Timeout**: Loading timeout con mensaje de error

## 📊 Performance

### Optimizaciones Implementadas

- **Lazy Loading**: Carga bajo demanda de MFEs
- **Code Splitting**: Separación automática por rutas
- **Shared Dependencies**: React/ReactDOM compartidos
- **CSS Optimization**: Extracción de estilos críticos
- **Image Optimization**: Lazy loading de imágenes en dashboard

### Métricas de Carga

- **Initial Load**: ~50KB (shell únicamente)
- **MFE Loading**: ~30KB promedio por MFE
- **Shared Libraries**: Cargadas una sola vez
- **Route Switching**: <100ms entre rutas

## 🧪 Testing

### Estrategia de Testing

```bash
# Unit tests
npm test

# Coverage report
npm run test:coverage

```

### Environment Variables por Ambiente

```bash
# Staging
REACT_APP_AUTH_MFE_URL=https://test-frontend-dacodes.onrender.com/remoteEntry.js

# Production  
REACT_APP_AUTH_MFE_URL=https://test-frontend-dacodes.onrender.com/remoteEntry.js
```

## 🔮 Próximas Mejoras

### Features Planeadas

- [ ] **Service Worker**: Caching de MFEs para mejor performance
- [ ] **Error Reporting**: Integración con Sentry/LogRocket
- [ ] **A/B Testing**: Framework para testing de features
- [ ] **Analytics**: Tracking de navegación entre MFEs
- [ ] **Theme System**: Themes dinámicos con CSS Variables
- [ ] **Internationalization**: i18n para múltiples idiomas

### Optimizaciones Técnicas

- [ ] **Webpack 5 Features**: Module Federation v2
- [ ] **React 18 Features**: Concurrent rendering
- [ ] **Bundle Optimization**: Tree shaking mejorado
- [ ] **Loading Strategies**: Preloading inteligente de MFEs

## 📚 Referencias y Documentación

- [Module Federation Documentation](https://webpack.js.org/concepts/module-federation/)
- [React Router v6 Guide](https://reactrouter.com/en/main)
- [CSS Grid Complete Guide](https://css-tricks.com/snippets/css/complete-guide-grid/)
