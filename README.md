# Modular People Portal

A React TypeScript microfrontend application implementing a modular people portal with authentication, user directory, memory game, and profile management using **Module Federation**.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Running
```bash
# Install all dependencies
npm run install:all

# Start all microfrontends
npm run start:dev
```

**Application URLs:**
- **Main App**: http://localhost:3000
- **Auth MFE**: http://localhost:3001  
- **Directory MFE**: http://localhost:3002
- **Memory Game MFE**: http://localhost:3003
- **Profile MFE**: http://localhost:3004

### Test Credentials
- **Username**: `emilys`
- **Password**: `emilyspass`

## 🏗️ Architecture

This project uses **Module Federation** (Webpack 5) to implement a microfrontend architecture:

| Application | Port | Description |
|-------------|------|-------------|
| **Shell** | 3000 | Main container orchestrating all MFEs |
| **Auth MFE** | 3001 | JWT authentication with DummyJSON API |
| **Directory MFE** | 3002 | User directory with search, sort, pagination |
| **Memory Game MFE** | 3003 | Configurable NxN memory matching game |
| **Profile MFE** | 3004 | User profile management |

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0, TypeScript 4.9.5+
- **Microfrontend**: Module Federation (Webpack 5)
- **State Management**: React Context + Custom Hooks
- **Routing**: React Router v6.8.0
- **Authentication**: JWT tokens with refresh
- **API**: DummyJSON API (https://dummyjson.com)
- **Styling**: CSS3 with CSS Grid, Flexbox, and Animations
- **Build**: Webpack 5 with ts-loader

## ✨ Features

### 🔐 Authentication (Auth MFE)
- JWT-based authentication using DummyJSON API
- Automatic token refresh handling
- Protected routes with redirect
- Persistent session management
- Responsive login form with validation

### 📁 User Directory (Directory MFE)
- Paginated user list from DummyJSON API
- **Search**: Real-time search with history
- **Sorting**: Multi-column sorting (name, email, company, city)
- **Pagination**: Configurable page sizes (10, 20, 50, 100)
- Client-side caching for performance
- Fully responsive table design

### 🎮 Memory Game (Memory Game MFE)
- **Configurable Grids**: 3x3, 4x4, 5x5, 6x6 options
- **Game Mechanics**: Card flipping, matching, completion detection
- **Scoring System**: Turn-based scoring with time tracking
- **Leaderboard**: Persistent leaderboard with sorting/filtering
- **State Persistence**: Game state saved across sessions
- CSS animations for card interactions

### 👤 Profile Management (Profile MFE)
- Display authenticated user information
- Edit mode with form validation
- Profile data persistence
- Responsive profile layout

### Leaderboard
- Top 10 players ranking
- Performance metrics tracking
- Real-time updates (bonus)

## Current Status

✅ **Completed Components:**
- Shell application with Module Federation setup
- Auth MFE with JWT authentication and DummyJSON integration
- Directory MFE core structure with search and API services
- Project structure and build configuration
- Installation and development scripts

🚧 **In Progress:**
- Directory MFE user table and pagination components
- Memory Game MFE implementation
- Profile MFE (bonus feature)

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation and Setup

**Option 1: Automated Setup (Recommended)**
```bash
# Windows (PowerShell)
npm run setup

# Linux/Mac
npm run setup:unix
```

**Option 2: Manual Setup**
```bash
# Install dependencies for all microfrontends
npm run install:all
```

### Development

**Start all applications for development:**
```bash
# This will start all MFEs concurrently on different ports
npm run start:dev
```

**Or start individually:**
```bash
# Terminal 1 - Auth MFE (Port 3001)
npm run start:auth

# Terminal 2 - Directory MFE (Port 3002)  
npm run start:directory

# Terminal 3 - Memory Game MFE (Port 3003)
npm run start:game

# Terminal 4 - Shell (Port 3000) - Start this last
npm run start:shell
```

### Access the Application

1. Open http://localhost:3000 in your browser
2. Use demo credentials:
   - **Username:** `kminchelle`
   - **Password:** `0lelplR`

## Architecture Overview

### Testing

Run unit tests:
\`\`\`bash
npm run test:all
\`\`\`

Run E2E tests:
\`\`\`bash
npm run cypress:open
\`\`\`

### Build for Production

\`\`\`bash
npm run build:all
\`\`\`

## API Integration

This application integrates with the DummyJSON API:

- **Authentication**: POST /auth/login
- **Users**: GET /users (with search and pagination)
- **User Details**: GET /users/{id}

## Development Notes

- Each microfrontend is independently deployable
- Shared dependencies are configured in Module Federation
- State is managed through React Context and shared across MFEs
- Authentication state is persisted and shared across all applications

## Deployment

The application can be deployed to any static hosting service. Each microfrontend should be deployed independently:

- Shell: Main domain (e.g., https://app.example.com)
- Auth MFE: Subdomain or path (e.g., https://auth.example.com)
- Directory MFE: Subdomain or path (e.g., https://directory.example.com)
- Memory Game MFE: Subdomain or path (e.g., https://game.example.com)
- Profile MFE: Subdomain or path (e.g., https://profile.example.com)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.
