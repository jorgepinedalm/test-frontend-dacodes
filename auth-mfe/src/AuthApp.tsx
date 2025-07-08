import React from 'react';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/LoginForm';

const AuthApp: React.FC = () => {
  const { authState, login, logout, clearError } = useAuth();

  // If user is authenticated, show logout option
  if (authState.isAuthenticated && authState.user) {
    return (
      <div style={{ 
        padding: '20px', 
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>
            Welcome, {authState.user.firstName} {authState.user.lastName}!
          </h2>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            You are successfully authenticated.
          </p>
          <button
            onClick={logout}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  return (
    <LoginForm
      onLogin={login}
      isLoading={authState.isLoading}
      error={authState.error}
      onClearError={clearError}
    />
  );
};

export default AuthApp;
