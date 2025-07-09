import AuthService from '../../services/authService';
import { LoginCredentials, LoginResponse } from '../../types/auth';

// Mock fetch globally
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    // Arrange - Reset singleton and mocks
    (AuthService as any).instance = undefined;
    authService = AuthService.getInstance();
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('getInstance', () => {
    it('should return the same instance (singleton pattern)', () => {
      // Arrange
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();

      // Act & Assert
      expect(instance1).toBe(instance2);
    });
  });

  describe('login', () => {
    it('should successfully authenticate user with valid credentials', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        username: 'emilys',
        password: 'emilyspass'
      };

      const mockResponse: LoginResponse = {
        id: 1,
        username: 'emilys',
        email: 'emily.johnson@x.dummyjson.com',
        firstName: 'Emily',
        lastName: 'Johnson',
        gender: 'female',
        image: 'https://dummyjson.com/icon/emilys/128',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        }
      );
      expect(result).toEqual(mockResponse);
      expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', 'mock-access-token');
      expect(localStorage.setItem).toHaveBeenCalledWith('refresh_token', 'mock-refresh-token');
    });

    it('should throw error when authentication fails', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        username: 'invalid',
        password: 'invalid'
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      } as Response);

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow('Invalid username or password');
    });

    it('should throw error when network request fails', async () => {
      // Arrange
      const credentials: LoginCredentials = {
        username: 'emilys',
        password: 'emilyspass'
      };

      mockFetch.mockRejectedValue(new Error('Network error'));

      // Act & Assert
      await expect(authService.login(credentials)).rejects.toThrow('Invalid username or password');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user when valid token exists', async () => {
      // Arrange
      const mockToken = 'valid-token';
      const mockUser = {
        id: 1,
        username: 'emilys',
        email: 'emily.johnson@x.dummyjson.com',
        firstName: 'Emily',
        lastName: 'Johnson'
      };

      (localStorage.getItem as jest.Mock).mockReturnValue(mockToken);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      } as Response);

      // Act
      const result = await authService.getCurrentUser();      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/auth/me',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${mockToken}`,
          },
        }
      );
      expect(result).toEqual(mockUser);
    });

    it('should return null when no token exists', async () => {
      // Arrange
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return null when token is invalid', async () => {
      // Arrange
      const mockToken = 'invalid-token';
      (localStorage.getItem as jest.Mock).mockReturnValue(mockToken);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
      } as Response);

      // Act
      const result = await authService.getCurrentUser();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear all stored authentication data', () => {
      // Arrange
      (localStorage.getItem as jest.Mock).mockReturnValue('some-token');

      // Act
      authService.logout();      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      // Arrange
      const mockToken = 'stored-token';
      (localStorage.getItem as jest.Mock).mockReturnValue(mockToken);

      // Act
      const result = authService.getToken();

      // Assert
      expect(localStorage.getItem).toHaveBeenCalledWith('auth_token');
      expect(result).toBe(mockToken);
    });

    it('should return null when no token is stored', () => {
      // Arrange
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      // Act
      const result = authService.getToken();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      // Arrange
      (localStorage.getItem as jest.Mock).mockReturnValue('some-token');

      // Act
      const result = authService.isAuthenticated();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no token exists', () => {
      // Arrange
      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      // Act
      const result = authService.isAuthenticated();

      // Assert
      expect(result).toBe(false);
    });
  });
});
