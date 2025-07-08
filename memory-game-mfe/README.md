# Memory Game Microfrontend (MFE)

## Descripción General

El Memory Game MFE es un microfrontend que implementa un juego de memoria completamente funcional y configurable. Los usuarios pueden seleccionar diferentes tamaños de grilla, habilitar temporizadores, y competir en un sistema de puntuación y tabla de líderes. Está diseñado como parte de la aplicación "Modular People Portal" y se integra perfectamente con el sistema de autenticación.

## Arquitectura y Estructura

```
memory-game-mfe/
├── src/
│   ├── bootstrap.tsx            # Configuración para desarrollo standalone
│   ├── index.tsx                # Punto de entrada del MFE
│   ├── components/
│   │   ├── MemoryGameApp.tsx    # Componente principal del juego
│   │   ├── MemoryGameApp.css    # Estilos principales del juego
│   │   ├── GameCard.tsx         # Componente individual de carta
│   │   ├── GameCard.css         # Estilos de las cartas
│   │   ├── GameGrid.tsx         # Grilla del juego
│   │   ├── GameGrid.css         # Estilos de la grilla
│   │   ├── GameControls.tsx     # Controles y estadísticas del juego
│   │   ├── GameControls.css     # Estilos de los controles
│   │   ├── Leaderboard.tsx      # Tabla de líderes
│   │   └── Leaderboard.css      # Estilos de la tabla de líderes
│   ├── hooks/
│   │   └── useMemoryGame.ts     # Hook principal con lógica del juego
│   ├── services/
│   │   └── gameService.ts       # Servicio para persistencia de datos
│   ├── types/
│   │   └── game.ts              # Definiciones de tipos TypeScript
│   ├── utils/
│   │   └── gameUtils.ts         # Utilidades y algoritmos del juego
│   └── webpack.config.js        # Configuración Module Federation
```

## Funcionalidades Principales

### 1. Juego de Memoria Configurable
- **Tamaños de grilla**: 3x3 (Fácil), 4x4 (Medio), 5x5 (Difícil), 6x6 (Experto)
- **Símbolos**: Emojis diversos para hacer el juego visualmente atractivo
- **Algoritmo de coincidencias**: Lógica robusta para detectar pares
- **Manejo de grillas impares**: Soporte para grillas con número impar de casillas

### 2. Sistema de Temporización
- **Timer opcional**: Configurable por nivel de dificultad
- **Límites de tiempo**: Personalizables para cada configuración
- **Tiempo restante**: Visualización en tiempo real
- **Estados de juego**: Tracking de tiempo transcurrido

### 3. Sistema de Puntuación
- **Cálculo dinámico**: Basado en tiempo, número de movimientos y dificultad
- **Bonificaciones**: Puntos extra por completar niveles difíciles
- **Persistencia**: Almacenamiento de puntuaciones para usuarios autenticados

### 4. Tabla de Líderes
- **Ranking global**: Mejores puntuaciones de todos los usuarios
- **Filtros por dificultad**: Clasificación por tamaño de grilla
- **Estadísticas personales**: Historial individual del usuario
- **Ordenamiento**: Por puntuación, tiempo, y movimientos

## Componentes Principales

### MemoryGameApp.tsx
```typescript
// Componente principal que orquesta todo el juego
```

**Lógica aplicada**:
- Gestiona el estado global del juego
- Controla la visibilidad entre juego y tabla de líderes
- Maneja la sincronización con el sistema de puntuación
- Implementa el patrón de key única para forzar re-renders
- Gestiona props del usuario (userId, username) del shell

### GameCard.tsx
```typescript
// Componente individual de carta con animaciones de volteo
```

**Características**:
- **Estados visuales**: Normal, volteada, coincidida, deshabilitada
- **Animaciones CSS**: Efecto 3D de volteo con transforms
- **Optimización**: Uso de React.memo y useCallback para performance
- **Manejo de cartas vacías**: Soporte para grillas impares con cartas invisibles
- **Accesibilidad**: Estados hover y focus apropiados

### GameGrid.tsx
```typescript
// Grilla responsiva que contiene todas las cartas
```

**Funcionalidades**:
- **Layout CSS Grid**: Adaptable a diferentes tamaños de grilla
- **Responsivo**: Ajuste automático en dispositivos móviles
- **Espaciado dinámico**: Gap ajustable según el tamaño de grilla
- **Renderizado optimizado**: Solo re-renderiza cartas que cambian

### GameControls.tsx
```typescript
// Panel de control con configuración y estadísticas
```

**Elementos**:
- **Configuración de juego**: Tamaño de grilla, timer, límite de tiempo
- **Estadísticas en tiempo real**: Movimientos, tiempo, puntuación
- **Presets rápidos**: Configuraciones predefinidas (Fácil, Medio, Difícil, Experto)
- **Controles de partida**: Iniciar, pausar, reanudar, reiniciar

### Leaderboard.tsx
```typescript
// Tabla de líderes con filtros y estadísticas
```

**Características**:
- **Visualización de rankings**: Top puntuaciones por dificultad
- **Filtros dinámicos**: Por tamaño de grilla y usuario
- **Estadísticas agregadas**: Promedios, mejores tiempos, total de juegos
- **Actualización automática**: Se refresca cuando se completa un juego

## Hook Principal: useMemoryGame

### Estados Gestionados
```typescript
interface GameState {
  cards: Card[];
  flippedCards: Card[];
  matchedPairs: number;
  totalPairs: number;
  turns: number;
  isGameActive: boolean;
  isGameComplete: boolean;
  elapsedTime: number;
  config: GameConfig;
  score: number;
}
```

### Funciones Principales
- **`startNewGame(config)`**: Inicializa nueva partida con configuración específica
- **`flipCard(cardId)`**: Maneja la lógica de voltear cartas y detectar coincidencias
- **`resetGame()`**: Reinicia el estado del juego
- **`pauseGame()` / `resumeGame()`**: Control de pausado del juego
- **`saveGameSession()`**: Persiste resultados para usuarios autenticados

### Lógica de Coincidencias
```typescript
// Algoritmo optimizado para detectar pares
1. Usuario hace clic en carta → Se voltea
2. Si es la segunda carta volteada → Se verifica coincidencia
3. Si coinciden → Se marcan como matched (solo las 2 cartas específicas)
4. Si no coinciden → Se voltean de vuelta después de 1 segundo
5. Se incrementa contador de movimientos
6. Se verifica si el juego está completo
```

## Utilidades del Juego (gameUtils.ts)

### Generación de Cartas
```typescript
// Algoritmo para crear cartas con manejo de grillas impares
export const generateCards = (config: GameConfig): Card[] => {
  const totalCards = config.gridSize * config.gridSize;
  const pairCount = Math.floor(totalCards / 2);
  
  // Para grillas impares, se agrega una carta vacía invisible
  // Esto permite tamaños como 3x3 (9 cartas = 4 pares + 1 vacía)
}
```

### Algoritmo de Barajado
```typescript
// Fisher-Yates shuffle para distribución aleatoria
export const shuffleArray = <T>(array: T[]): T[] => {
  // Implementación optimizada que garantiza distribución uniforme
}
```

### Sistema de Puntuación
```typescript
export const calculateScore = (timeElapsed, turns, gridSize): number => {
  // Fórmula: Puntuación de tiempo (0-50) + Puntuación de movimientos (0-50) + Bonus de dificultad
  const timeScore = Math.max(0, 50 - (timeElapsed / maxTime) * 50);
  const turnScore = Math.max(0, 50 - (turns / maxTurns) * 50);
  const gridBonus = gridSize >= 5 ? 20 : gridSize >= 4 ? 10 : 0;
  
  return Math.round(timeScore + turnScore + gridBonus);
}
```

## Configuraciones Predefinidas

```typescript
export const DEFAULT_CONFIGS = {
  easy: { gridSize: 3, hasTimer: false },
  medium: { gridSize: 4, hasTimer: true, timeLimit: 120 },
  hard: { gridSize: 5, hasTimer: true, timeLimit: 180 },
  expert: { gridSize: 6, hasTimer: true, timeLimit: 240 }
};
```

## Persistencia de Datos

### GameService
```typescript
// Servicio singleton para gestionar datos del juego
class GameService {
  // Almacenamiento en localStorage para persistencia
  saveGameSession(userId, username, gridSize, turns, timeElapsed): Promise<GameSession>
  getLeaderboard(gridSize?): GameSession[]
  getUserStats(userId): UserStats
}
```

### Estructura de Sesión
```typescript
interface GameSession {
  id: string;
  userId: number;
  username: string;
  gridSize: number;
  turns: number;
  timeElapsed: number;
  score: number;
  completedAt: Date;
  difficulty: string;
}
```

## Integración con Module Federation

### Configuración Webpack
```javascript
exposes: {
  './MemoryGameApp': './src/components/MemoryGameApp'
}
```

**Problema Resuelto**: La configuración anterior exponía el archivo `bootstrap` en lugar del componente React, causando:
- Corrupción del DOM en el shell
- Desaparición de la navbar al navegar entre MFEs
- Errores de createRoot() de ReactDOM

### Props del Shell
```typescript
interface MemoryGameAppProps {
  userId?: number;    // ID del usuario autenticado
  username?: string;  // Nombre de usuario para leaderboard
}
```

### Comunicación Inter-MFE
- **Eventos de juego completado**: Notificación al shell para actualizar estadísticas
- **State persistente**: Leaderboard compartido entre usuarios
- **Navegación fluida**: Sin pérdida de estado al cambiar entre MFEs

## Responsive Design

### Breakpoints Principales
- **Desktop (>1024px)**: Layout completo con sidebar
- **Tablet (768px-1024px)**: Layout de columna única
- **Mobile (<768px)**: Controles simplificados, grilla optimizada

### Adaptaciones Móviles
- **Tamaños de carta**: Ajuste automático con clamp() CSS
- **Espaciado**: Grid gap reducido en pantallas pequeñas
- **Controles**: Botones más grandes para touch
- **Sidebar**: Se mueve arriba del juego en móviles

### Layout Fixes para Module Federation
```css
.memory-game-app {
  min-height: calc(100vh - 70px); /* Account for navbar */
  padding-top: 0; /* No extra padding needed */
}
```

**Problema Resuelto**: El CSS original no consideraba la navbar del shell, causando:
- Overlap de contenido con la navegación
- Scroll innecesario en dispositivos móviles
- Layout inconsistente entre MFEs

## Estados del Juego

### GameStatus
```typescript
type GameStatus = 'idle' | 'playing' | 'paused' | 'completed' | 'failed';
```

### Transiciones de Estado
1. **`idle`** → **`playing`**: Al hacer clic en "Start Game"
2. **`playing`** → **`paused`**: Al hacer clic en "Pause"
3. **`paused`** → **`playing`**: Al hacer clic en "Resume"
4. **`playing`** → **`completed`**: Al completar todos los pares
5. **`playing`** → **`failed`**: Al agotar el tiempo límite
6. **Cualquier estado** → **`idle`**: Al hacer clic en "Reset"

## Optimizaciones de Performance

### React Optimizations
- **React.memo**: En GameCard para evitar re-renders innecesarios
- **useCallback**: En handlers de eventos para estabilidad de referencias
- **Key props**: Únicas para forzar re-mount cuando es necesario
- **Lazy loading**: De componentes pesados como Leaderboard

### CSS Optimizations
- **Transform y opacity**: Para animaciones que no causan reflow
- **will-change**: En elementos que van a ser animados
- **CSS Grid**: Para layouts eficientes sin JavaScript
- **Clamp()**: Para sizing responsivo sin media queries

## Accesibilidad

### Características Implementadas
- **Keyboard navigation**: Tab order lógico
- **Focus visible**: Estados de focus claros
- **High contrast**: Soporte para modo de alto contraste
- **Reduced motion**: Respeta preferencias de movimiento reducido
- **Screen readers**: Aria labels apropiados

## Testing

### Casos de Prueba Principales
1. **Generación de cartas**: Verificar pares correctos en todas las configuraciones
2. **Lógica de coincidencias**: Asegurar que solo se marcan las cartas correctas
3. **Timer**: Verificar conteo preciso y límites de tiempo
4. **Puntuación**: Validar cálculos en diferentes escenarios
5. **Persistencia**: Confirmar guardado y carga de datos

## Desarrollo Standalone

```bash
npm start
```

**Características standalone**:
- **Mock user**: Usuario de prueba predefinido
- **Funcionalidad completa**: Todas las características disponibles
- **Hot reload**: Desarrollo rápido con recarga automática

## Integración con Shell

### Comunicación
- **Props**: userId y username del sistema de autenticación
- **Eventos**: Notificaciones de juegos completados
- **Contexto**: Acceso al estado de autenticación global

### Sincronización
- **Leaderboard**: Se actualiza con datos de otros usuarios
- **Perfil**: Estadísticas personales sincronizadas
- **Sesión**: Manejo de logout durante el juego

## Scripts Disponibles

- `npm start`: Desarrollo en modo standalone
- `npm run build`: Construcción para producción
- `npm test`: Ejecución de tests
- `npm run dev`: Desarrollo con hot reload

## Dependencias Principales

- **React 18.2.0**: Framework base
- **TypeScript**: Tipado estático
- **Webpack 5**: Module Federation
- **CSS Grid & Flexbox**: Layout responsivo

---

## Notas de Implementación

### Algoritmos Clave
- **Fisher-Yates Shuffle**: Para distribución aleatoria de cartas
- **Flood Fill Adaptation**: Para detección de coincidencias
- **Dynamic Programming**: Para cálculo optimizado de puntuaciones

### Correcciones y Mejoras Recientes

#### 🔧 Correcciones de Lógica de Juego
- **Grid Size Validation Fix**: Eliminación del error que impedía grillas impares (3x3, 5x5)
- **Odd Grid Support**: Implementación de cartas vacías invisibles para grillas con número impar de casillas
- **Card Matching Logic**: Corrección para marcar solo las 2 cartas específicas que coinciden, no todas las cartas con el mismo valor
- **totalPairs Calculation**: Arreglo del cálculo para contar solo cartas no vacías dividido por 2

#### 🎯 Mejoras de Performance y UX
- **React.memo en GameCard**: Optimización para evitar re-renders innecesarios
- **useCallback en handlers**: Estabilidad de referencias para mejor performance
- **Key props únicas**: Forzado de re-mount cuando es necesario
- **Timer cleanup**: Optimización de limpieza de intervalos

#### 🎮 Algoritmos Mejorados
```typescript
// ANTES: Error en grillas impares
if (totalCards % 2 !== 0) {
  throw new Error('Grid size must result in an even number of cards');
}

// DESPUÉS: Soporte para grillas impares con cartas vacías
while (cards.length < totalCards) {
  cards.push({
    id: `empty-${cards.length}`,
    value: '',
    isMatched: true, // Siempre "coincidida" (deshabilitada)
  });
}
```

#### 🎨 Mejoras Visuales
- **Empty Cards CSS**: Cartas vacías completamente invisibles (opacity: 0)
- **Animation Performance**: Uso de transform y opacity para animaciones fluidas
- **Responsive Grid**: Ajustes automáticos para diferentes tamaños de pantalla

### Próximas Mejoras
- Modo multijugador en tiempo real
- Nuevos tipos de símbolos y temas
- Sistema de logros y badges
- Análisis de patrones de juego
- Soporte para PWA y juego offline
