# Profile MFE

Un microfrontend de React TypeScript para la gestión de perfiles de usuario utilizando Module Federation (Webpack 5). Este MFE proporciona capacidades completas de visualización y edición de perfiles dentro de la aplicación Modular People Portal.

## 🚀 Inicio Rápido

### Desarrollo
```bash
npm install
npm start
```

El Profile MFE estará disponible en: http://localhost:3004

### Integración
Este MFE es consumido por la aplicación Shell que se ejecuta en el puerto 3000. Cuando se integra, proporciona funcionalidad de gestión de perfiles accesible a través del menú de navegación.

## 📋 Características

### ✅ Funcionalidad Principal
- **Visualización de Perfil**: Mostrar información completa del perfil de usuario
- **Edición en Línea**: Alternar entre modos de visualización y edición para datos del perfil
- **Validación de Formularios**: Validación de entrada para email, teléfono y otros campos
- **Manejo de Objetos Anidados**: Soporte para estructuras de datos complejas (dirección, empresa)
- **Visualización de Avatar**: Generación dinámica de avatares usando RoboHash
- **Diseño Responsivo**: Diseño amigable para móviles con secciones basadas en grid
- **Estados de Carga**: Animaciones de carga suaves y manejo de errores

### 📊 Secciones del Perfil
- **Información Personal**: Nombre, email, teléfono, fecha de nacimiento, género
- **Información de Empresa**: Nombre de empresa y título del trabajo
- **Información de Dirección**: Dirección completa con calle, ciudad, estado, código postal, país
- **Gestión de Avatar**: Visualización de foto de perfil y generación de respaldo

## 🏗️ Arquitectura

### Configuración de Module Federation
```javascript
// webpack.config.js
new ModuleFederationPlugin({
  name: 'profile',
  filename: 'remoteEntry.js',
  exposes: {
    './ProfileApp': './src/components/ProfileApp'
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true }
  }
})
```

### Estructura de Componentes
```
src/
├── components/
│   ├── ProfileApp.tsx         # Componente principal del perfil
│   └── ProfileApp.css         # Estilos del perfil
├── bootstrap.tsx              # Bootstrap de Module Federation
└── index.tsx                  # Punto de entrada
```

## 🔧 Implementación Técnica

### Gestión de Datos
El Profile MFE maneja estructuras de datos de usuario complejas con objetos anidados:

```typescript
interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  image?: string;
  address?: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  company?: {
    name: string;
    title: string;
  };
  birthDate?: string;
  gender?: string;
}
```

### Gestión de Estado
- **Estado de Vista**: Alternar entre modos de solo lectura y edición
- **Estado del Formulario**: Estado separado de datos del formulario para operaciones de edición
- **Estado de Carga**: Manejar operaciones asíncronas con indicadores de carga
- **Manejo de Errores**: Estados de error elegantes para operaciones fallidas

### Manejo de Entrada
El componente presenta manejo sofisticado de entrada para objetos anidados:

```typescript
const handleInputChange = (field: string, value: string) => {
  if (field.includes('.')) {
    const [parent, child] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent as keyof User] as any),
        [child]: value
      }
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }
};
```

### Interfaz de Props
```typescript
interface ProfileAppProps {
  userId?: number;
  username?: string;
}
```

## 🎨 Características de UI/UX

### Sistema de Diseño
- **Esquema de Colores**: Encabezados con gradientes modernos y paleta de colores consistente
- **Tipografía**: Fuentes limpias y legibles con jerarquía apropiada
- **Espaciado**: Padding y márgenes consistentes en todo el diseño
- **Grid Responsivo**: Diseño adaptativo para diferentes tamaños de pantalla

### Elementos Interactivos
- **Alternancia de Edición**: Transición suave entre modos de vista y edición
- **Controles de Formulario**: Inputs, selects y botones estilizados
- **Visualización de Avatar**: Imágenes de perfil circulares con generación de respaldo
- **Animación de Carga**: Cargador giratorio con texto descriptivo

### Comportamiento Responsivo
- **Escritorio**: Diseño de dos columnas con tarjeta de perfil y detalles
- **Tablet/Móvil**: Diseño apilado con secciones de ancho completo
- **Sistema de Grid**: CSS Grid para diseño flexible y responsivo

## 🔄 Puntos de Integración

### Integración con la Aplicación Shell
El Profile MFE se integra con la aplicación Shell a través de:

1. **Module Federation**: Expuesto como componente `./ProfileApp`
2. **Paso de Props**: Recibe `userId` y `username` desde Shell
3. **Dependencias Compartidas**: React y React-DOM compartidos como singletons
4. **Enrutamiento**: Accesible a través del sistema de navegación de Shell

### Contexto de Autenticación
Aunque el Profile MFE no maneja directamente la autenticación, recibe contexto de usuario a través de props y puede ser mejorado para:
- Obtener datos de usuario desde endpoints de API autenticados
- Respetar permisos de usuario para capacidades de edición
- Manejar actualización de tokens para llamadas API

## 📡 Integración de API

### Implementación Actual
El MFE actualmente utiliza datos simulados para propósitos de demostración:

```typescript
const loadUserProfile = async () => {
  const mockUser: User = {
    id: userId || 1,
    username: username || 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    // ... datos simulados adicionales
  };
  
  setTimeout(() => {
    setUser(mockUser);
    setFormData(mockUser);
    setLoading(false);
  }, 1000);
};
```

### Integración de Producción
Para despliegue en producción, reemplazar datos simulados con llamadas API reales:

```typescript
// Ejemplo de integración API
const loadUserProfile = async () => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    const userData = await response.json();
    setUser(userData);
    setFormData(userData);
  } catch (error) {
    console.error('Failed to load user profile:', error);
  } finally {
    setLoading(false);
  }
};
```

## 🎯 Componentes Clave

### ProfileApp.tsx
**Características del Componente Principal:**
- Gestión de estado para datos de usuario, modo de edición y estados de carga
- Manejo de formularios con soporte para objetos anidados
- Renderizado condicional para modos de vista/edición
- Límites de error y estados de carga

**Métodos Clave:**
- `loadUserProfile()`: Simula llamada API para obtener datos de usuario
- `handleEdit()`: Alterna modo de edición
- `handleSave()`: Simula guardar cambios del perfil
- `handleCancel()`: Revierte cambios y sale del modo de edición
- `handleInputChange()`: Maneja actualizaciones de campos planos y anidados

### Arquitectura de Estilos
**Características de ProfileApp.css:**
- Diseño CSS Grid para diseño responsivo
- Diseño moderno basado en tarjetas con sombras y esquinas redondeadas
- Transiciones suaves y efectos hover
- Keyframes de animación de carga
- Breakpoints responsivos mobile-first

## 🔍 Mejoras Recientes

### Correcciones de Layout (Últimas)
- **Cálculo de Altura**: Corregida altura del layout para usar `min-height: calc(100vh - 70px)` para integración apropiada con navbar
- **Module Federation**: Actualizada configuración webpack para exponer componente directamente en lugar de archivo bootstrap
- **Estructura CSS**: Mejorado diseño responsivo con mejores layouts de grid

### Optimizaciones de Rendimiento
- **Renderizado Condicional**: Optimizados re-renders en modo de edición
- **Gestión de Estado**: Separado estado del formulario del estado de visualización
- **Estados de Carga**: Indicadores de carga apropiados para mejor UX

## 🚀 Desarrollo

### Desarrollo Local
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (Puerto 3004)
npm start

# Construir para producción
npm build

# Verificación de tipos
npm run type-check
```

### Pruebas Independientes
El MFE puede ser probado independientemente con props simuladas:

```typescript
// bootstrap.tsx
if (process.env.NODE_ENV === 'development') {
  const devRoot = document.getElementById('root');
  
  if (devRoot) {
    mount(devRoot, {
      userId: 1,
      username: 'johndoe'
    });
  }
}
```

## 🧪 Estrategia de Pruebas

### Áreas de Cobertura de Pruebas
- **Renderizado de Componentes**: Verificar visualización de datos del perfil
- **Alternancia de Modo de Edición**: Probar transiciones entre modos vista/edición
- **Validación de Formularios**: Validación de entrada y manejo de errores
- **Gestión de Estado**: Actualizaciones y persistencia de datos del perfil
- **Integración de Props**: Probar con varias combinaciones de props

### Pruebas Recomendadas
```typescript
// Ejemplo de estructura de pruebas
describe('ProfileApp', () => {
  test('renders profile information correctly');
  test('toggles edit mode when edit button clicked');
  test('saves changes when save button clicked');
  test('handles nested object updates correctly');
  test('displays loading state during operations');
  test('shows error state when profile fails to load');
});
```

## 🔧 Configuración

### Configuración de Webpack
- **Module Federation**: Expone componente ProfileApp
- **Soporte TypeScript**: ts-loader con modo transpileOnly
- **Procesamiento CSS**: style-loader y css-loader
- **Servidor de Desarrollo**: Puerto 3004 con headers CORS

### Configuración de TypeScript
- **Modo Estricto**: Habilitado para seguridad de tipos
- **Soporte JSX**: Transformación React JSX
- **Resolución de Módulos**: Resolución estilo Node
- **Target**: ES2020 para soporte de navegadores modernos

## 🚀 Mejoras Futuras

### Características Planificadas
- **Subida de Imagen**: Subida y gestión de avatares
- **Validación de Campos**: Validación de formulario mejorada con mensajes de error
- **Historial de Cambios**: Rastrear y mostrar historial de cambios del perfil
- **Configuraciones de Privacidad**: Controles de privacidad y visibilidad del usuario
- **Enlaces Sociales**: Integración con perfiles de redes sociales

### Mejoras Técnicas
- **Integración API Real**: Reemplazar datos simulados con llamadas backend reales
- **Estrategia de Caché**: Implementar caché de datos del perfil
- **Soporte Offline**: Visualización de perfil en modo offline
- **Accesibilidad**: Labels ARIA mejoradas y navegación por teclado
- **Rendimiento**: Optimizaciones de code splitting y lazy loading

## 📚 Dependencias

### Dependencias de Runtime
- **React 18.2.0**: Librería UI
- **React-DOM 18.2.0**: Renderizado DOM

### Dependencias de Desarrollo
- **TypeScript 5.1.6**: Verificación de tipos y compilación
- **Webpack 5.88.2**: Bundling de módulos y federación
- **ts-loader 9.4.4**: Compilación TypeScript
- **Procesamiento CSS**: style-loader, css-loader para estilos

## 🔗 Documentación Relacionada

- [Auth MFE README](../auth-mfe/README.md) - Autenticación y gestión de sesiones
- [Directory MFE README](../directory-mfe/README.md) - Directorio de usuarios y búsqueda
- [Memory Game MFE README](../memory-game-mfe/README.md) - Juego de memoria interactivo
- [Aplicación Shell](../shell/README.md) - Shell principal de aplicación y enrutamiento

---

**Profile MFE** - Parte de la arquitectura de la aplicación Modular People Portal.
