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

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd modular-people-portal
\`\`\`

2. Install dependencies for all applications:
\`\`\`bash
# Install shell dependencies
cd shell && npm install

# Install auth MFE dependencies  
cd ../auth-mfe && npm install

# Install directory MFE dependencies
cd ../directory-mfe && npm install

# Install memory game MFE dependencies
cd ../memory-game-mfe && npm install

# Install profile MFE dependencies
cd ../profile-mfe && npm install
\`\`\`

### Development

To run all applications in development mode:

1. Start each microfrontend in separate terminals:

\`\`\`bash
# Terminal 1 - Auth MFE
cd auth-mfe && npm start

# Terminal 2 - Directory MFE  
cd directory-mfe && npm start

# Terminal 3 - Memory Game MFE
cd memory-game-mfe && npm start

# Terminal 4 - Profile MFE
cd profile-mfe && npm start

# Terminal 5 - Shell (Main App)
cd shell && npm start
\`\`\`

2. Open http://localhost:3000 to view the application

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
