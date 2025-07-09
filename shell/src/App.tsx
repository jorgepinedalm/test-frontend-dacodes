import React, { lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import MicroFrontendLoader from './components/MicroFrontendLoader';
import Dashboard from './pages/Dashboard';
import './App.css';

// Lazy load microfrontends
const AuthApp = lazy(() => import('auth/AuthApp'));
const DirectoryApp = lazy(() => import('directory/DirectoryApp'));
const MemoryGameApp = lazy(() => import('memoryGame/MemoryGameApp'));
const ProfileApp = lazy(() => import('profile/ProfileApp'));

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// Main App Component
const AppContent: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Handler for viewing a specific user profile from directory
  const handleViewProfile = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="app">
      <Navigation />
      <main className={`main-content ${isAuthenticated ? 'with-navbar' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <MicroFrontendLoader>
                  <AuthApp />
                </MicroFrontendLoader>
              )
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/directory" 
            element={
              <ProtectedRoute>
                <MicroFrontendLoader>
                  <DirectoryApp {...({ onViewProfile: handleViewProfile } as any)} />
                </MicroFrontendLoader>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/memory-game" 
            element={
              <ProtectedRoute>
                <MicroFrontendLoader>
                  <MemoryGameApp 
                    userId={user?.id} 
                    username={user?.username} 
                  />
                </MicroFrontendLoader>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <MicroFrontendLoader>
                  <ProfileApp 
                    userId={user?.id} 
                    username={user?.username} 
                  />
                </MicroFrontendLoader>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile/:userId" 
            element={
              <ProtectedRoute>
                <MicroFrontendLoader>
                  <ProfileApp />
                </MicroFrontendLoader>
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
