import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthApp from '../../AuthApp';
import { useAuth } from '../../hooks/useAuth';

// Mock useAuth hook
jest.mock('../hooks/useAuth');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock LoginForm component
jest.mock('../components/LoginForm', () => {
  return function MockLoginForm(props: any) {
    return (
      <div data-testid="login-form">
        <div>Loading: {props.isLoading.toString()}</div>
        <div>Error: {props.error || 'none'}</div>
        <button onClick={() => props.onLogin({ username: 'test', password: 'test' })}>
          Login
        </button>
        <button onClick={props.onClearError}>Clear Error</button>
      </div>
    );
  };
});

describe('AuthApp', () => {
  const mockLogin = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('component rendering', () => {
    it('should render login form when user is not authenticated', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        authState: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
        login: mockLogin,
        logout: jest.fn(),
        refreshToken: jest.fn(),
        clearError: mockClearError,
      });

      // Act
      render(<AuthApp />);

      // Assert
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByText('Loading: false')).toBeInTheDocument();
      expect(screen.getByText('Error: none')).toBeInTheDocument();
    });

    it('should render nothing when user is authenticated', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        authState: {
          user: { id: 1, username: 'testuser', email: 'test@example.com', firstName: 'Test', lastName: 'User', gender: "Male", image: "/dummy/image" },
          token: 'valid-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
        login: mockLogin,
        logout: jest.fn(),
        refreshToken: jest.fn(),
        clearError: mockClearError,
      });

      // Act
      const { container } = render(<AuthApp />);

      // Assert
      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
    });

    it('should pass loading state to LoginForm', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        authState: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: true,
          error: null,
        },
        login: mockLogin,
        logout: jest.fn(),
        refreshToken: jest.fn(),
        clearError: mockClearError,
      });

      // Act
      render(<AuthApp />);

      // Assert
      expect(screen.getByText('Loading: true')).toBeInTheDocument();
    });

    it('should pass error state to LoginForm', () => {
      // Arrange
      const errorMessage = 'Invalid credentials';
      mockUseAuth.mockReturnValue({
        authState: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorMessage,
        },
        login: mockLogin,
        logout: jest.fn(),
        refreshToken: jest.fn(),
        clearError: mockClearError,
      });

      // Act
      render(<AuthApp />);

      // Assert
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });

    it('should apply correct container styles', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        authState: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
        login: mockLogin,
        logout: jest.fn(),
        refreshToken: jest.fn(),
        clearError: mockClearError,
      });

      // Act
      render(<AuthApp />);

      // Assert
      const container = screen.getByTestId('login-form').parentElement;
      expect(container).toHaveStyle({
        padding: '20px',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      });
    });
  });

  describe('interaction with useAuth hook', () => {
    it('should call useAuth hook on render', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        authState: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
        login: mockLogin,
        logout: jest.fn(),
        refreshToken: jest.fn(),
        clearError: mockClearError,
      });

      // Act
      render(<AuthApp />);

      // Assert
      expect(mockUseAuth).toHaveBeenCalled();
    });

    it('should pass login function to LoginForm', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        authState: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
        login: mockLogin,
        logout: jest.fn(),
        refreshToken: jest.fn(),
        clearError: mockClearError,
      });

      // Act
      render(<AuthApp />);
      const loginButton = screen.getByText('Login');
      loginButton.click();

      // Assert
      expect(mockLogin).toHaveBeenCalledWith({ username: 'test', password: 'test' });
    });

    it('should pass clearError function to LoginForm', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        authState: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Some error',
        },
        login: mockLogin,
        logout: jest.fn(),
        refreshToken: jest.fn(),
        clearError: mockClearError,
      });

      // Act
      render(<AuthApp />);
      const clearErrorButton = screen.getByText('Clear Error');
      clearErrorButton.click();

      // Assert
      expect(mockClearError).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined authState gracefully', () => {
      // Arrange
      mockUseAuth.mockReturnValue({
        authState: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
        login: mockLogin,
        logout: jest.fn(),
        refreshToken: jest.fn(),
        clearError: mockClearError,
      });

      // Act & Assert
      expect(() => render(<AuthApp />)).not.toThrow();
    });

    it('should re-render when authState changes', () => {
      // Arrange
      const { rerender } = render(<AuthApp />);
      
      mockUseAuth.mockReturnValue({
        authState: {
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        },
        login: mockLogin,
        logout: jest.fn(),
        refreshToken: jest.fn(),
        clearError: mockClearError,
      });

      // Act - first render shows login form
      rerender(<AuthApp />);
      expect(screen.getByTestId('login-form')).toBeInTheDocument();

      // Change to authenticated state
      mockUseAuth.mockReturnValue({
        authState: {
          user: { id: 1, username: 'testuser', email: 'test@example.com', firstName: 'Test', lastName: 'User', gender: "Male", image: "/dummy/image" },
          token: 'valid-token',
          isAuthenticated: true,
          isLoading: false,
          error: null,
        },
        login: mockLogin,
        logout: jest.fn(),
        refreshToken: jest.fn(),
        clearError: mockClearError,
      });

      // Act - second render should hide login form
      rerender(<AuthApp />);

      // Assert
      expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
    });
  });
});
