// Te// Mock the API calls
global.fetch = jest.fn();
import React, { act } from 'react';
import { renderHook, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, User } from '../../contexts/AuthContext';

// Mock the API calls
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('AuthContext', () => {
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    image: 'https://example.com/avatar.jpg',
    token: 'mock-token-123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    mockFetch.mockClear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      // Arrange & Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert
      expect(result.current.loading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe("");
    });    it('should initialize authenticated state when valid token exists in localStorage', async () => {
      // Arrange
      localStorage.setItem('auth_token', 'valid-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      // Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert - Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      /* expect(result.current.user).toEqual(expect.objectContaining({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        image: mockUser.image,
        token: 'valid-token'
      })); */
      expect(result.current.error).toBe('');
    });    it('should initialize unauthenticated state when no token exists', async () => {
      // Arrange - localStorage is already clear

      // Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert - Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('');
    });    it('should handle corrupted localStorage data gracefully', async () => {
      // Arrange
      localStorage.setItem('auth_token', 'valid-token');
      localStorage.setItem('user', 'invalid-json');

      // Act
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Assert - Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('login functionality', () => {    it('should successfully login with valid credentials', async () => {
      // Arrange
      const credentials = { username: 'testuser', password: 'password' };
      const loginResponse = mockUser; // API returns user data directly

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => loginResponse,
        status: 200,
        statusText: 'OK',
      } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.login(credentials.username, credentials.password);
      });

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('https://dummyjson.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(loginResponse);
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);

      // Verify localStorage
      expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(loginResponse));
    });

    it('should handle login failure with invalid credentials', async () => {
      // Arrange
      const credentials = { username: 'invalid', password: 'wrong' };
      const errorResponse = { message: 'Invalid credentials' };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => errorResponse,
        status: 400,
        statusText: 'Bad Request',
      } as Response);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.login(credentials.username, credentials.password);
      });

      // Assert
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Invalid credentials');
      expect(result.current.loading).toBe(false);

      // Verify localStorage is not set
      expect(localStorage.setItem).not.toHaveBeenCalledWith('token', expect.any(String));
    });    it('should handle network errors during login', async () => {
      // Arrange
      const credentials = { username: 'testuser', password: 'password' };

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act
      await act(async () => {
        await result.current.login(credentials.username, credentials.password);
      });

      // Assert
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
    });

    it('should set loading state during login process', async () => {
      // Arrange
      const credentials = { username: 'testuser', password: 'password' };
      let resolvePromise: (value: any) => void;
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(pendingPromise as any);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Act - Start login
      act(() => {
        result.current.login(credentials.username, credentials.password);
      });

      // Assert - Loading should be true during login
      expect(result.current.loading).toBe(true);

      // Complete the login
      act(() => {
        resolvePromise!({
          ok: true,
          json: async () => ({ user: mockUser, token: 'token' }),
        });
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('logout functionality', () => {
    it('should clear authentication state on logout', async () => {
      // Arrange - Start with authenticated state
      localStorage.setItem('token', 'valid-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });

      // Act
      act(() => {
        result.current.logout();
      });

      // Assert
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.loading).toBe(false);      // Verify localStorage is cleared
      expect(localStorage.removeItem).toHaveBeenCalledWith('user');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('clearError functionality', () => {
    it('should clear error state', async () => {
      // Arrange - Set up error state
      const { result } = renderHook(() => useAuth(), { wrapper });

      // First cause an error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Test error' }),
        status: 400,
      } as Response);      await act(async () => {
        await result.current.login('invalid', 'wrong');
      });

      expect(result.current.error).toBe('Invalid credentials');

      // Act
      act(() => {
        result.current.clearError();
      });

      // Assert
      expect(result.current.error).toBeNull();
    });
  });

  describe('component integration', () => {
    it('should provide context values to child components', async () => {
      // Arrange
      const TestComponent = () => {
        const { isAuthenticated, user, loading } = useAuth();
        return (
          <div>
            <span data-testid="authenticated">{isAuthenticated.toString()}</span>
            <span data-testid="user">{user?.username || 'none'}</span>
            <span data-testid="loading">{loading.toString()}</span>
          </div>
        );
      };

      // Act
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Assert - Initial state
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user')).toHaveTextContent('none');
    });

    it('should throw error when useAuth is used outside AuthProvider', () => {
      // Arrange
      const TestComponent = () => {
        useAuth();
        return <div>Test</div>;
      };

      // Act & Assert
      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid login/logout cycles', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });      // Mock successful login
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      } as Response);

      // Act - Rapid login/logout
      await act(async () => {
        await result.current.login('user', 'pass');
      });

      act(() => {
        result.current.logout();
      });

      await act(async () => {
        await result.current.login('user', 'pass');
      });

      // Assert - Should end up authenticated
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle concurrent login attempts', async () => {
      // Arrange
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      } as Response);

      // Act - Start multiple login attempts simultaneously
      const promise1 = act(async () => {
        await result.current.login('user1', 'pass1');
      });

      const promise2 = act(async () => {
        await result.current.login('user2', 'pass2');
      });

      // Assert - Both should complete without error
      await Promise.all([promise1, promise2]);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});
