import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../../hooks/useAuth';
import AuthService from '../../services/authService';
import { LoginCredentials, LoginResponse, User } from '../../types/auth';
import { act } from 'react';

// Required fix for useAuth.test.ts
jest.mock('../../services/authService', () => {
  return {
    __esModule: true,
    default: {
      getInstance: jest.fn()
    }
  };
});

// Mock AuthService
const MockedAuthService = AuthService as jest.MockedClass<typeof AuthService>;

describe('useAuth', () => {
  let mockAuthService: jest.Mocked<AuthService>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock instance
    mockAuthService = {
      getToken: jest.fn(),
      isValidToken: jest.fn(),
      getCurrentUser: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      refreshToken: jest.fn(),
      isAuthenticated: jest.fn(),
      setToken: jest.fn(),
      setRefreshToken: jest.fn(),
      setUser: jest.fn(),
    } as any;

    // Mock the getInstance method to return our mock
    MockedAuthService.getInstance = jest.fn(() => mockAuthService);

    // Set default mock behaviors for initialization
    mockAuthService.getToken.mockReturnValue(null);
    mockAuthService.isValidToken.mockReturnValue(false);
    mockAuthService.getCurrentUser.mockResolvedValue(null);

    // Mock the getInstance method to return our mock
    (AuthService.getInstance as jest.Mock).mockReturnValue(mockAuthService);
  });
  describe('initialization', () => {
    it('should initialize with loading state', async () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth());

      // Assert - initially loading
      expect(result.current.authState.isLoading).toBe(true);
      
      // Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false);
      });

      expect(result.current.authState.isAuthenticated).toBe(false);
      expect(result.current.authState.user).toBeNull();
      expect(result.current.authState.token).toBeNull();
      expect(result.current.authState.error).toBeNull();
    });

    it('should initialize authenticated state when valid token exists', async () => {
      // Arrange
      const mockToken = 'valid-token';
      const mockUser: User = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        gender: "Male",
        image: "/dummy/image.jpg"
      };

      mockAuthService.getToken.mockReturnValue(mockToken);
      mockAuthService.isValidToken.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      // Act
      const { result } = renderHook(() => useAuth());

      // Assert
      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false);
      });

      expect(result.current.authState.isAuthenticated).toBe(true);
      expect(result.current.authState.user).toEqual(mockUser);
      expect(result.current.authState.token).toBe(mockToken);
      expect(result.current.authState.error).toBeNull();
    });

    it('should initialize unauthenticated state when no token exists', async () => {
      // Arrange
      mockAuthService.getToken.mockReturnValue(null);

      // Act
      const { result } = renderHook(() => useAuth());

      // Assert
      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false);
      });

      expect(result.current.authState.isAuthenticated).toBe(false);
      expect(result.current.authState.user).toBeNull();
      expect(result.current.authState.token).toBeNull();
      expect(result.current.authState.error).toBeNull();
    });

    it('should handle initialization error gracefully', async () => {
      // Arrange
      mockAuthService.getToken.mockReturnValue('invalid-token');
      mockAuthService.isValidToken.mockReturnValue(true);
      mockAuthService.getCurrentUser.mockRejectedValue(new Error('Network error'));

      // Act
      const { result } = renderHook(() => useAuth());

      // Assert
      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false);
      });

      expect(result.current.authState.isAuthenticated).toBe(false);
      expect(result.current.authState.user).toBeNull();
      expect(result.current.authState.token).toBeNull();
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'testpass'
      };

      const mockLoginResponse = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        accessToken: 'new-token',
        refreshToken: 'new-refresh-token',
        gender: "Male",
        image: "/dummy/image.jpg"
      };

      mockAuthService.getToken.mockReturnValue(null);
      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false);
      });

      let loginResult: boolean = false;
      await act(async () => {
        loginResult = await result.current.login(credentials);
      });

      // Assert
      expect(loginResult).toBe(true);
      expect(mockAuthService.login).toHaveBeenCalledWith(credentials);
      expect(result.current.authState.isAuthenticated).toBe(true);
      expect(result.current.authState.user).toEqual(mockLoginResponse);
      expect(result.current.authState.token).toBe(mockLoginResponse.accessToken);
      expect(result.current.authState.error).toBeNull();
      expect(result.current.authState.isLoading).toBe(false);
    });

    it('should handle login failure', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        username: 'invalid',
        password: 'invalid'
      };

      mockAuthService.getToken.mockReturnValue(null);
      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false);
      });

      let loginResult: boolean = false;
      await act(async () => {
        loginResult = await result.current.login(credentials);
      });

      // Assert
      expect(loginResult).toBe(false);
      expect(result.current.authState.isAuthenticated).toBe(false);
      expect(result.current.authState.user).toBeNull();
      expect(result.current.authState.token).toBeNull();
      expect(result.current.authState.error).toBe('Invalid credentials');
      expect(result.current.authState.isLoading).toBe(false);
    });

    it('should set loading state during login process', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'testpass'
      };

      mockAuthService.getToken.mockReturnValue(null);
      let resolveLogin: (value: any) => void;
      const loginPromise = new Promise(resolve => {
        resolveLogin = resolve;
      }) as Promise<LoginResponse>;
      mockAuthService.login.mockReturnValue(loginPromise);

      // Act
      const { result } = renderHook(() => useAuth());
      
      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false);
      });

      act(() => {
        result.current.login(credentials);
      });

      // Assert - loading should be true during login
      expect(result.current.authState.isLoading).toBe(true);

      // Complete the login
      act(() => {
        resolveLogin({
          id: 1,
          username: 'testuser',
          accessToken: 'token'
        });
      });
    });
  });

  describe('logout', () => {
    it('should clear authentication state on logout', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth());
      
      // Set initial authenticated state
      await waitFor(() => {
        expect(result.current.authState.isLoading).toBe(false);
      });

      // Act
      act(() => {
        result.current.logout();
      });

      // Assert
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(result.current.authState.isAuthenticated).toBe(false);
      expect(result.current.authState.user).toBeNull();
      expect(result.current.authState.token).toBeNull();
      expect(result.current.authState.error).toBeNull();
      expect(result.current.authState.isLoading).toBe(false);
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      // Arrange
      const newToken = 'new-access-token';
      mockAuthService.refreshToken.mockResolvedValue(newToken);

      const { result } = renderHook(() => useAuth());

      // Act
      let refreshResult: boolean = false;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      // Assert
      expect(refreshResult).toBe(true);
      expect(mockAuthService.refreshToken).toHaveBeenCalled();
      expect(result.current.authState.token).toBe(newToken);
    });

    it('should logout user when refresh fails', async () => {
      // Arrange
      mockAuthService.refreshToken.mockResolvedValue(null);

      const { result } = renderHook(() => useAuth());

      // Act
      let refreshResult: boolean = false;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      // Assert
      expect(refreshResult).toBe(false);
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(result.current.authState.isAuthenticated).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error from state', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth());
      
      // Set error state
      await act(async () => {
        await result.current.login({ username: 'invalid', password: 'invalid' });
      });
      
      expect(result.current.authState.error).toBeTruthy();

      // Act
      act(() => {
        result.current.clearError();
      });

      // Assert
      expect(result.current.authState.error).toBeNull();
    });
  });
});
