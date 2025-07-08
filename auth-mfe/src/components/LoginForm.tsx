import React, { useState, useEffect } from 'react';
import { LoginCredentials } from '../types/auth';
import './LoginForm.css';

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  onClearError: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  isLoading,
  error,
  onClearError,
}) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        onClearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, onClearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (error) {
      onClearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (!credentials.username.trim() || !credentials.password.trim()) {
      return;
    }

    const success = await onLogin(credentials);
    if (!success) {
      setCredentials(prev => ({ ...prev, password: '' }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={credentials.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={isLoading || !credentials.username.trim() || !credentials.password.trim()}
          >
            {isLoading ? (
              <span className="loading-spinner">
                <span className="spinner"></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>        <div className="login-footer">
          <p className="demo-info">
            <strong>Demo Credentials:</strong><br/>
            Username: <code>emilys</code><br/>
            Password: <code>emilyspass</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
