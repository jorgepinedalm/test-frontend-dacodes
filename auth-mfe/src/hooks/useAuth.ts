import { useState, useEffect, useCallback } from 'react';
import { AuthState, LoginCredentials, User } from '../types/auth';
import AuthService from '../services/authService';

const authService = AuthService.getInstance();

const initialAuthState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const token = authService.getToken();
      if (token && authService.isValidToken(token)) {
        const user = await authService.getCurrentUser();
        if (user) {
          setAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return;
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    }

    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {      const loginResponse = await authService.login(credentials);
      
      setAuthState({
        user: loginResponse,
        token: loginResponse.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const newToken = await authService.refreshToken();
      if (newToken) {
        setAuthState(prev => ({
          ...prev,
          token: newToken,
        }));
        return true;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }

    // If refresh fails, logout user
    logout();
    return false;
  }, [logout]);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    authState,
    login,
    logout,
    refreshToken,
    clearError,
  };
};
