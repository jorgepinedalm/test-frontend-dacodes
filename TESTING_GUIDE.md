# Modular People Portal - Testing Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- All dependencies installed (run `npm run install:all` if needed)

### Starting All Applications
```powershell
npm run start:dev
```

This will start all microfrontends simultaneously:
- Shell App: http://localhost:3000
- Auth MFE: http://localhost:3001  
- Directory MFE: http://localhost:3002
- Memory Game MFE: http://localhost:3003
- Profile MFE: http://localhost:3004

## 🧪 Testing Scenarios

### 1. Authentication Flow
1. Navigate to http://localhost:3000
2. You should be redirected to the authentication page
3. Try logging in with DummyJSON credentials:
   - Username: `emilys`
   - Password: `emilyspass`
4. Upon successful login, you should be redirected to the dashboard
5. Check that the navigation shows the authenticated user

### 2. Directory MFE Testing
1. Navigate to http://localhost:3000/directory
2. Test search functionality:
   - Search for users by name, email, or company
   - Verify search history is maintained
3. Test sorting:
   - Click column headers to sort
   - Verify ascending/descending order
4. Test pagination:
   - Change page size (10, 20, 50, 100)
   - Navigate between pages
   - Verify total items count

### 3. Memory Game MFE Testing
1. Navigate to http://localhost:3000/memory-game
2. Test game configuration:
   - Change grid size (3x3, 4x4, 5x5, 6x6)
   - Start a new game
3. Test gameplay:
   - Click cards to flip them
   - Match pairs
   - Verify turn counter increments
   - Verify timer is running
4. Test game completion:
   - Complete a game
   - Verify score calculation
   - Check leaderboard updates
5. Test leaderboard:
   - Sort by different criteria (score, time, turns)
   - Filter by grid size
   - Verify persistence across sessions

### 4. Profile MFE Testing
1. Navigate to http://localhost:3000/profile
2. Verify user profile displays authenticated user data
3. Test edit mode:
   - Click "Edit Profile" button
   - Modify user information
   - Save changes
   - Verify changes persist

### 5. Navigation Testing
1. Test navigation between all routes
2. Verify protected routes redirect to auth when not logged in
3. Test logout functionality
4. Verify responsive design on different screen sizes

## 🔍 Common Issues & Solutions

### Module Federation Loading Errors
If you see "Failed to load micro-frontend application":
1. Ensure all MFEs are running on their designated ports
2. Check browser console for CORS errors
3. Verify remoteEntry.js files are accessible:
   - http://localhost:3001/remoteEntry.js
   - http://localhost:3002/remoteEntry.js  
   - http://localhost:3003/remoteEntry.js
   - http://localhost:3004/remoteEntry.js

### React Version Conflicts
If you see React version warnings:
1. All MFEs should use React 18.2.0
2. Shell app should use React 18.2.0 (not 19.x)
3. Check shared module configurations in webpack.config.js

### TypeScript Compilation Errors
1. Ensure `"noEmit": false` in all tsconfig.json files
2. Check for missing export statements in index.tsx files
3. Verify type definitions are consistent across MFEs

## 📊 Performance Testing

### Bundle Size Analysis
```powershell
# In each MFE directory
npm run build
```

### Load Testing
1. Open browser dev tools
2. Monitor network tab while navigating
3. Check for:
   - Initial bundle sizes
   - Lazy loading of MFEs
   - Shared dependency deduplication

## 🔧 Development Commands

```powershell
# Start all applications
npm run start:dev

# Start individual applications
npm run start:shell
npm run start:auth
npm run start:directory
npm run start:game

# Build all applications
npm run build:all

# Run tests (when implemented)
npm run test:all

# Clean all node_modules and dist folders
npm run clean
```

## ✅ Success Criteria

### Functional Requirements
- [x] JWT Authentication with token refresh
- [x] User directory with search, sort, pagination
- [x] Memory game with configurable grid sizes
- [x] Game scoring and leaderboard
- [x] Profile management
- [x] Responsive design
- [x] Module Federation architecture

### Technical Requirements
- [x] TypeScript implementation
- [x] React 18.2.0 consistency
- [x] Webpack 5 Module Federation
- [x] CORS handling
- [x] Error boundaries
- [x] Loading states
- [x] State persistence

### User Experience
- [x] Smooth navigation between MFEs
- [x] Consistent UI/UX across applications
- [x] Proper loading indicators
- [x] Error handling and recovery
- [x] Responsive design
- [x] Accessibility features

## 🐛 Known Issues

1. **First Load Performance**: Initial MFE loading might be slow due to module resolution
2. **Browser Cache**: Hard refresh (Ctrl+F5) may be needed after configuration changes
3. **Development Hot Reload**: Changes in shared dependencies may require full restart

## 📝 Next Steps

1. Implement unit tests with Jest
2. Add E2E tests with Cypress
3. Add performance monitoring
4. Implement proper error logging
5. Add CI/CD pipeline
6. Optimize bundle splitting
7. Add Progressive Web App features
