import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from '../../components/LoginForm';
import { LoginCredentials } from '../../types/auth';

describe('LoginForm', () => {
  const mockOnLogin = jest.fn();
  const mockOnClearError = jest.fn();

  const defaultProps = {
    onLogin: mockOnLogin,
    isLoading: false,
    error: null,
    onClearError: mockOnClearError,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('component rendering', () => {    it('should render login form with all required elements', () => {
      // Arrange & Act
      render(<LoginForm {...defaultProps} />);

      // Assert
      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/show password/i)).toBeInTheDocument();
    });    it('should render with default empty credentials', () => {
      // Arrange & Act
      render(<LoginForm {...defaultProps} />);

      // Assert
      expect(screen.getByLabelText(/username/i)).toHaveValue('');
      expect(screen.getByLabelText(/^password$/i)).toHaveValue('');
    });    it('should show loading state when isLoading is true', () => {
      // Arrange & Act
      render(<LoginForm {...defaultProps} isLoading={true} />);

      // Assert
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });

    it('should display error message when error prop is provided', () => {
      // Arrange
      const errorMessage = 'Invalid credentials';

      // Act
      render(<LoginForm {...defaultProps} error={errorMessage} />);

      // Assert
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toHaveClass('error-message');
    });
  });

  describe('user interactions', () => {    it('should update username field when user types', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);
      const usernameInput = screen.getByLabelText(/username/i);

      // Act
      await act(async () => {
        await user.type(usernameInput, 'testuser');
      });

      // Assert
      expect(usernameInput).toHaveValue('testuser');
    });    it('should update password field when user types', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);
      const passwordInput = screen.getByLabelText(/^password$/i);

      // Act
      await act(async () => {
        await user.type(passwordInput, 'testpass');
      });

      // Assert
      expect(passwordInput).toHaveValue('testpass');
    });    it('should toggle password visibility when toggle button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const toggleButton = screen.getByLabelText(/show password/i);

      // Act
      expect(passwordInput).toHaveAttribute('type', 'password');
      await act(async () => {
        await user.click(toggleButton);
      });

      // Assert
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Act - click again
      await act(async () => {
        await user.click(toggleButton);
      });

      // Assert
      expect(passwordInput).toHaveAttribute('type', 'password');
    });    it('should clear error when user starts typing in username field', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} error="Some error" />);
      const usernameInput = screen.getByLabelText(/username/i);

      // Act
      await act(async () => {
        await user.type(usernameInput, 'a');
      });

      // Assert
      expect(mockOnClearError).toHaveBeenCalled();
    });    it('should clear error when user starts typing in password field', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} error="Some error" />);
      const passwordInput = screen.getByLabelText(/^password$/i);

      // Act
      await act(async () => {
        await user.type(passwordInput, 'a');
      });

      // Assert
      expect(mockOnClearError).toHaveBeenCalled();
    });
  });

  describe('form submission', () => {    it('should call onLogin with correct credentials when form is submitted', async () => {
      // Arrange
      const user = userEvent.setup();
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'testpass'
      };

      mockOnLogin.mockResolvedValue(true);      render(<LoginForm {...defaultProps} />);
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Act
      await act(async () => {
        await user.type(usernameInput, credentials.username);
        await user.type(passwordInput, credentials.password);
        await user.click(submitButton);
      });

      // Assert
      expect(mockOnLogin).toHaveBeenCalledWith(credentials);
    });    it('should not submit form when username is empty', async () => {
      // Arrange
      const user = userEvent.setup();      render(<LoginForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Act
      await act(async () => {
        await user.type(passwordInput, 'testpass');
        await user.click(submitButton);
      });

      // Assert
      expect(mockOnLogin).not.toHaveBeenCalled();
    });    it('should not submit form when password is empty', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      const usernameInput = screen.getByLabelText(/username/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Act
      await act(async () => {
        await user.type(usernameInput, 'testuser');
        await user.click(submitButton);
      });

      // Assert
      expect(mockOnLogin).not.toHaveBeenCalled();
    });    it('should not submit form when already loading', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /signing in/i });

      // Act
      await act(async () => {
        await user.click(submitButton);
      });

      // Assert
      expect(mockOnLogin).not.toHaveBeenCalled();
    });    it('should handle form submission via Enter key', async () => {
      // Arrange
      const user = userEvent.setup();
      const credentials: LoginCredentials = {
        username: 'testuser',
        password: 'testpass'
      };

      mockOnLogin.mockResolvedValue(true);      render(<LoginForm {...defaultProps} />);

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      // Act
      await act(async () => {
        await user.type(usernameInput, credentials.username);
        await user.type(passwordInput, credentials.password);
        await user.keyboard('{Enter}');
      });

      // Assert
      expect(mockOnLogin).toHaveBeenCalledWith(credentials);
    });
  });

  describe('error handling', () => {
    it('should auto-clear error after 5 seconds', async () => {
      // Arrange
      jest.useFakeTimers();
      render(<LoginForm {...defaultProps} error="Test error" />);

      // Act
      jest.advanceTimersByTime(5000);

      // Assert
      await waitFor(() => {
        expect(mockOnClearError).toHaveBeenCalled();
      });

      jest.useRealTimers();
    });

    it('should cleanup timer on unmount', () => {
      // Arrange
      jest.useFakeTimers();
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const { unmount } = render(<LoginForm {...defaultProps} error="Test error" />);

      // Act
      unmount();

      // Assert
      expect(clearTimeoutSpy).toHaveBeenCalled();

      jest.useRealTimers();
      clearTimeoutSpy.mockRestore();
    });
  });
});
