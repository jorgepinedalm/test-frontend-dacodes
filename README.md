# Modular People Portal

A React TypeScript microfrontend application implementing a modular people portal with authentication, user directory, memory game, and profile management.

## Architecture

This project uses **Module Federation** (Webpack 5) to implement a microfrontend architecture with the following applications:

- **Shell (Port 3000)**: Main container application that orchestrates all microfrontends
- **Auth MFE (Port 3001)**: Authentication microfrontend with JWT token management
- **Directory MFE (Port 3002)**: User directory with pagination, search, and filtering
- **Memory Game MFE (Port 3003)**: Configurable NxN memory matching game
- **Profile MFE (Port 3004)**: User profile management (bonus feature)

## Tech Stack

- **Frontend**: React 18, TypeScript
- **Microfrontend**: Module Federation (Webpack 5)
- **State Management**: React Context + useReducer
- **Routing**: React Router v6
- **Authentication**: JWT tokens
- **API**: DummyJSON API (https://dummyjson.com)
- **Testing**: Jest (Unit), Cypress (E2E)
- **Styling**: CSS3 with CSS Grid and Flexbox

## Features

### Authentication
- JWT-based authentication using DummyJSON API
- Token refresh handling
- Protected routes
- Session management

### User Directory
- Paginated user list with infinite scrolling
- Client-side sorting by multiple columns
- Server-side search functionality
- Local storage caching for performance
- Responsive design

### Memory Game
- Configurable grid sizes (3x3, 4x4, 5x5, etc.)
- Turn counter and timer
- Game state persistence
- Leaderboard integration
- Responsive card layout

### Profile Management
- User profile viewing
- Detailed user information display

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
