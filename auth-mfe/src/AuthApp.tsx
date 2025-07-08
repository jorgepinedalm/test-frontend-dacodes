import React from 'react';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/LoginForm';

const AuthApp: React.FC = () => {
  const { authState, login, clearError } = useAuth();
  // If user is authenticated, don't show anything (let shell handle navigation)
  if (authState.isAuthenticated) {
    return null;
  }

  // Show login form if not authenticated
  return (
    <div style={{ 
      padding: '20px', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <LoginForm
        onLogin={login}
        isLoading={authState.isLoading}
        error={authState.error}
        onClearError={clearError}
      />
    </div>
  );
};

export default AuthApp;
