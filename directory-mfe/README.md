# Directory Microfrontend (MFE)

## Descripción General

El Directory MFE es el microfrontend responsable de la gestión y visualización del directorio de usuarios en la aplicación "Modular People Portal". Proporciona funcionalidades completas de búsqueda, filtrado, paginación y visualización de perfiles de usuario utilizando la API de DummyJSON.

## Arquitectura y Estructura

```
directory-mfe/
├── src/
│   ├── DirectoryApp.tsx         # Componente principal del MFE
│   ├── DirectoryApp.css         # Estilos principales
│   ├── bootstrap.tsx            # Configuración para desarrollo standalone
│   ├── index.tsx                # Punto de entrada del módulo
│   ├── components/
│   │   ├── SearchBar.tsx        # Barra de búsqueda con filtros
│   │   ├── SearchBar.css        # Estilos de la barra de búsqueda
│   │   ├── UserTable.tsx        # Tabla de usuarios con ordenamiento
│   │   ├── UserTable.css        # Estilos de la tabla
│   │   ├── Pagination.tsx       # Componente de paginación
│   │   └── Pagination.css       # Estilos de paginación
│   ├── hooks/
│   │   └── useDirectory.ts      # Hook personalizado para lógica del directorio
│   ├── services/
│   │   └── directoryService.ts  # Servicio de comunicación con API
│   ├── types/
│   │   └── directory.ts         # Definiciones de tipos TypeScript
│   ├── utils/
│   │   └── formatting.ts        # Utilidades de formateo
│   └── webpack.config.js        # Configuración Module Federation
```

## Funcionalidades Principales

### 1. Gestión de Usuarios
- **Listado completo**: Visualización de todos los usuarios registrados
- **Datos mostrados**: Nombre, email, teléfono, company, department, etc.
- **Imágenes de perfil**: Avatar de cada usuario con fallback

### 2. Sistema de Búsqueda
- **Búsqueda en tiempo real**: Filtrado dinámico mientras se escribe
- **Múltiples campos**: Búsqueda por nombre, email, company, department
- **Historial de búsquedas**: Almacenamiento de búsquedas recientes
- **Búsqueda del lado del servidor**: Integración con API de DummyJSON

### 3. Filtrado y Ordenamiento
- **Ordenamiento por columnas**: Ascendente y descendente
- **Filtros aplicables**: Por género, rango de edad, company
- **Estado persistente**: Mantiene filtros durante la navegación

### 4. Paginación
- **Paginación del servidor**: Carga eficiente de grandes conjuntos de datos
- **Tamaños configurables**: 10, 25, 50, 100 usuarios por página
- **Navegación completa**: Primera, anterior, siguiente, última página

## Componentes Principales

### DirectoryApp.tsx
```typescript
// Componente principal que orquesta toda la funcionalidad del directorio
```

**Lógica aplicada**:
- Integra todos los subcomponentes (SearchBar, UserTable, Pagination)
- Maneja el estado global del directorio a través del hook useDirectory
- Gestiona estados de carga, error y datos vacíos
- Proporciona funciones de refrescar y limpiar búsquedas

### SearchBar.tsx
```typescript
// Barra de búsqueda con capacidades avanzadas de filtrado
```

**Características**:
- Input de búsqueda con debounce para optimizar llamadas a API
- Filtros por género (All, Male, Female)
- Historial de búsquedas recientes con localStorage
- Botones de acción para limpiar y refrescar
- Estados visuales para búsqueda activa

### UserTable.tsx
```typescript
// Tabla responsiva para mostrar datos de usuarios
```

**Funcionalidades**:
- Columnas ordenables: firstName, lastName, email, phone, company
- Indicadores visuales de ordenamiento activo
- Avatares de usuario con imagen de fallback
- Información de company y department
- Estados de carga y error integrados
- Responsive design para dispositivos móviles

### Pagination.tsx
```typescript
// Componente de paginación con navegación completa
```

**Características**:
- Navegación por páginas individuales
- Botones de primera/última página
- Selector de tamaño de página
- Información de registros totales
- Cálculo automático de páginas disponibles

## Hooks Personalizados

### useDirectory.ts
```typescript
// Hook que encapsula toda la lógica de gestión del directorio
```

**Estado manejado**:
- `users`: Array de usuarios actual
- `loading`: Estado de carga
- `error`: Manejo de errores
- `filters`: Filtros aplicados actualmente
- `pagination`: Estado de paginación
- `searchHistory`: Historial de búsquedas

**Funciones expuestas**:
- `search(query, gender)`: Ejecuta búsqueda con filtros
- `sort(field, direction)`: Ordena por campo específico
- `changePage(page)`: Navega a página específica
- `changePageSize(size)`: Cambia tamaño de página
- `clearSearch()`: Limpia búsqueda y filtros
- `refresh()`: Recarga datos actuales

## Servicios

### directoryService.ts
```typescript
// Servicio para comunicación con DummyJSON API
```

**Métodos principales**:
- `searchUsers(query, filters, pagination)`: Búsqueda con parámetros
- `getAllUsers(pagination, sort)`: Obtiene lista paginada
- `getUserById(id)`: Obtiene usuario específico
- `getSearchSuggestions(query)`: Sugerencias de búsqueda

**Integración con API**:
- **Endpoint base**: `https://dummyjson.com/users`
- **Búsqueda**: `/search?q={query}`
- **Paginación**: `?limit={limit}&skip={skip}`
- **Ordenamiento**: `?sortBy={field}&order={direction}`

## Tipos de Datos

### User
```typescript
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
  gender: 'male' | 'female';
  age: number;
  company: {
    name: string;
    department: string;
    title: string;
  };
  address: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
}
```

### DirectoryState
```typescript
interface DirectoryState {
  users: User[];
  loading: boolean;
  error: string | null;
  filters: {
    query: string;
    gender: 'all' | 'male' | 'female';
  };
  pagination: {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  };
  searchHistory: string[];
}
```

### SearchFilters
```typescript
interface SearchFilters {
  query?: string;
  gender?: 'all' | 'male' | 'female';
  minAge?: number;
  maxAge?: number;
  company?: string;
}
```

## Integración con Module Federation

### Configuración Webpack
```javascript
// Expone componentes para consumo del shell
exposes: {
  './DirectoryApp': './src/DirectoryApp',
  './UserTable': './src/components/UserTable'
}
```

### Dependencias Compartidas
- **React**: Singleton para consistencia
- **React-DOM**: Compartido entre MFEs
- **React-Router-DOM**: Para navegación (aunque no se usa internamente)

## Flujo de Datos

### 1. Carga Inicial
```
DirectoryApp.mount()
  ↓
useDirectory.initialize()
  ↓
directoryService.getAllUsers()
  ↓
Update state with users
  ↓
Render UserTable + Pagination
```

### 2. Búsqueda de Usuarios
```
User types in SearchBar
  ↓
Debounced search function
  ↓
useDirectory.search(query, filters)
  ↓
directoryService.searchUsers()
  ↓
Update users and pagination
  ↓
Save to search history
```

### 3. Ordenamiento
```
User clicks column header
  ↓
UserTable.onSort()
  ↓
useDirectory.sort(field, direction)
  ↓
directoryService.getAllUsers(with sort)
  ↓
Update users with new order
```

### 4. Paginación
```
User clicks page number
  ↓
Pagination.onPageChange()
  ↓
useDirectory.changePage()
  ↓
directoryService with new skip/limit
  ↓
Update current page data
```

## Optimizaciones de Rendimiento

### 1. Debouncing
- Búsquedas con delay de 300ms para evitar llamadas excesivas
- Cancelación de requests pendientes al cambiar query

### 2. Memoización
- Uso de `useMemo` para cálculos de paginación
- `useCallback` para funciones de evento

### 3. Lazy Loading
- Carga de datos solo cuando es necesario
- Paginación del servidor para grandes datasets

### 4. Cache Local
- Almacenamiento de resultados de búsqueda recientes
- Historial de búsquedas en localStorage

## Manejo de Estados

### Estados de Carga
- **Loading inicial**: Durante primera carga de datos
- **Loading búsqueda**: Durante búsquedas activas
- **Loading paginación**: Durante cambios de página

### Estados de Error
- **Error de red**: Fallos de conexión con API
- **Error de datos**: Respuestas inválidas del servidor
- **Sin resultados**: Búsquedas sin coincidencias

### Estados Vacíos
- **Sin usuarios**: Cuando no hay datos disponibles
- **Búsqueda vacía**: Cuando búsqueda no retorna resultados
- **Filtros sin resultados**: Filtros muy restrictivos

## Responsive Design

### Breakpoints
- **Desktop**: > 1024px - Tabla completa con todas las columnas
- **Tablet**: 768px - 1024px - Tabla condensada
- **Mobile**: < 768px - Cards en lugar de tabla

### Adaptaciones Móviles
- Cards individuales para cada usuario
- Navegación touch-friendly
- Búsqueda expandible
- Paginación simplificada

## Desarrollo Standalone

El MFE puede ejecutarse independientemente:

```bash
npm start
```

**Características standalone**:
- Bootstrap automático en modo desarrollo
- Funcionalidad completa sin shell
- Datos de prueba incluidos
- Hot reload habilitado

## Testing

### Estrategias de Testing
- **Unit tests**: Componentes individuales
- **Integration tests**: Flujos completos de búsqueda
- **E2E tests**: Interacciones de usuario

### Casos de Prueba Principales
- Búsqueda con diferentes queries
- Ordenamiento por múltiples campos
- Navegación de paginación
- Filtrado por género
- Responsive behavior

## Accesibilidad (a11y)

### Características Implementadas
- **Navegación por teclado**: Tab order lógico
- **Screen readers**: Aria labels apropiados
- **Alto contraste**: Colores accesibles
- **Focus management**: Indicadores visuales claros

### Estándares Cumplidos
- WCAG 2.1 AA compliance
- Semantic HTML
- Proper heading hierarchy
- Alt text para imágenes

## Scripts Disponibles

- `npm start`: Desarrollo standalone
- `npm run build`: Build para producción
- `npm test`: Ejecutar tests
- `npm run lint`: Linting de código
- `npm run dev`: Desarrollo con hot reload

## Dependencias Principales

- **React 18.2.0**: Framework base
- **TypeScript**: Tipado estático
- **Webpack 5**: Module Federation
- **CSS3**: Estilos modernos sin frameworks

---

## Notas de Implementación

### Cambios Recientes
- Optimización de búsquedas con debouncing
- Mejora en manejo de estados de error
- Implementación de historial de búsquedas
- Corrección de tipos TypeScript para sorting

### Próximas Mejoras
- Implementación de filtros avanzados
- Export de datos a CSV/Excel
- Modo oscuro (dark mode)
- Búsqueda por múltiples criterios simultáneos
- Cache más inteligente con invalidación
- Virtualization para grandes datasets
