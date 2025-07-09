import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock all the lazy-loaded components
jest.mock('auth/AuthApp', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="auth-app">Auth App</div>
  };
});

jest.mock('directory/DirectoryApp', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="directory-app">Directory App</div>
  };
});

jest.mock('memoryGame/MemoryGameApp', () => {
  return {
    __esModule: true,
    default: ({ userId, username }: { userId?: string; username?: string }) => (
      <div data-testid="memory-game-app">
        Memory Game App - User: {userId}, Username: {username}
      </div>
    )
  };
});

jest.mock('profile/ProfileApp', () => {
  return {
    __esModule: true,
    default: ({ userId, username }: { userId?: string; username?: string }) => (
      <div data-testid="profile-app">
        Profile App - User: {userId}, Username: {username}
      </div>
    )
  };
});

// Mock the components
jest.mock('../../components/Navigation', () => {
  return function MockNavigation() {
    return <nav data-testid="navigation">Navigation</nav>;
  };
});

jest.mock('../../components/MicroFrontendLoader', () => {
  return function MockMicroFrontendLoader({ children }: { children: React.ReactNode }) {
    return <div data-testid="mfe-loader">{children}</div>;
  };
});

jest.mock('../../pages/Dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard</div>;
  };
});

// Mock AuthContext
const mockUser = {
  id: '1',
  username: 'testuser',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  image: 'https://example.com/avatar.jpg'
};

const createMockAuthContext = (
  isAuthenticated = false,
  loading = false,
  user:any = null
) => ({
  user,
  isAuthenticated,
  loading,
  login: jest.fn(),
  logout: jest.fn(),
  error: null,
  clearError: jest.fn()
});

let mockAuthContext = createMockAuthContext();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Helper function to render App with specific route
const renderAppAtRoute = (initialPath: string) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>
  );
};

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext = createMockAuthContext();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockAuthContext = createMockAuthContext(false, false, null);
    });

    it('should render auth app on root route', async () => {
      // Arrange & Act
      renderAppAtRoute('/');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('auth-app')).toBeInTheDocument();
      });
    });

    it('should redirect to root when accessing protected routes while not authenticated', async () => {
      // Arrange & Act
      renderAppAtRoute('/dashboard');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('auth-app')).toBeInTheDocument();
      });
    });

    it('should redirect to root when accessing directory route', async () => {
      // Arrange & Act
      renderAppAtRoute('/directory');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('auth-app')).toBeInTheDocument();
      });
    });

    it('should redirect to root when accessing memory game route', async () => {
      // Arrange & Act
      renderAppAtRoute('/memory-game');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('auth-app')).toBeInTheDocument();
      });
    });

    it('should redirect to root when accessing profile route', async () => {
      // Arrange & Act
      renderAppAtRoute('/profile');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('auth-app')).toBeInTheDocument();
      });
    });

    it('should redirect unknown routes to root', async () => {
      // Arrange & Act
      renderAppAtRoute('/unknown');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('auth-app')).toBeInTheDocument();
      });
    });

    it('should not render navigation when not authenticated', () => {
      // Arrange & Act
      renderAppAtRoute('/');

      // Assert
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });

    it('should apply correct CSS classes when not authenticated', () => {
      // Arrange & Act
      const { container } = renderAppAtRoute('/');

      // Assert
      const mainContent = container.querySelector('.main-content');
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).not.toHaveClass('with-navbar');
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockAuthContext = createMockAuthContext(true, false, mockUser);
    });

    it('should redirect from root to dashboard when authenticated', async () => {
      // Arrange & Act
      renderAppAtRoute('/');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    it('should render dashboard on dashboard route', async () => {
      // Arrange & Act
      renderAppAtRoute('/dashboard');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    it('should render directory app on directory route', async () => {
      // Arrange & Act
      renderAppAtRoute('/directory');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('directory-app')).toBeInTheDocument();
        expect(screen.getByTestId('mfe-loader')).toBeInTheDocument();
      });
    });

    it('should render memory game app on memory game route', async () => {
      // Arrange & Act
      renderAppAtRoute('/memory-game');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('memory-game-app')).toBeInTheDocument();
        expect(screen.getByText(/Memory Game App - User: 1, Username: testuser/)).toBeInTheDocument();
      });
    });

    it('should render profile app on profile route', async () => {
      // Arrange & Act
      renderAppAtRoute('/profile');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('profile-app')).toBeInTheDocument();
        expect(screen.getByText(/Profile App - User: 1, Username: testuser/)).toBeInTheDocument();
      });
    });

    it('should render profile app on nested profile routes', async () => {
      // Arrange & Act
      renderAppAtRoute('/profile/edit');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('profile-app')).toBeInTheDocument();
      });
    });

    it('should redirect unknown routes to dashboard when authenticated', async () => {
      // Arrange & Act
      renderAppAtRoute('/unknown');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    it('should render navigation when authenticated', () => {
      // Arrange & Act
      renderAppAtRoute('/dashboard');

      // Assert
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });

    it('should apply correct CSS classes when authenticated', () => {
      // Arrange & Act
      const { container } = renderAppAtRoute('/dashboard');

      // Assert
      const mainContent = container.querySelector('.main-content');
      expect(mainContent).toBeInTheDocument();
      expect(mainContent).toHaveClass('with-navbar');
    });

    it('should pass user props to memory game app', async () => {
      // Arrange & Act
      renderAppAtRoute('/memory-game');

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/User: 1, Username: testuser/)).toBeInTheDocument();
      });
    });

    it('should pass user props to profile app', async () => {
      // Arrange & Act
      renderAppAtRoute('/profile');

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/User: 1, Username: testuser/)).toBeInTheDocument();
      });
    });
  });

  describe('when authentication is loading', () => {
    beforeEach(() => {
      mockAuthContext = createMockAuthContext(false, true, null);
    });

    it('should show loading state when authentication is loading', () => {
      // Arrange & Act
      renderAppAtRoute('/dashboard');

      // Assert
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByText('Loading...')).toHaveClass('loading');
    });

    it('should show loading for any protected route', () => {
      // Arrange & Act
      renderAppAtRoute('/directory');

      // Assert
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show loading for memory game route', () => {
      // Arrange & Act
      renderAppAtRoute('/memory-game');

      // Assert
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should show loading for profile route', () => {
      // Arrange & Act
      renderAppAtRoute('/profile');

      // Assert
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('app structure and layout', () => {
    it('should have correct app structure', () => {
      // Arrange & Act
      const { container } = renderAppAtRoute('/');

      // Assert
      expect(container.querySelector('.app')).toBeInTheDocument();
      expect(container.querySelector('.main-content')).toBeInTheDocument();
    });

    it('should render navigation component', () => {
      // Arrange & Act
      renderAppAtRoute('/dashboard');

      // Assert
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });

    it('should wrap microfrontends with MicroFrontendLoader', async () => {
      // Arrange
      mockAuthContext = createMockAuthContext(true, false, mockUser);

      // Act
      renderAppAtRoute('/directory');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('mfe-loader')).toBeInTheDocument();
        expect(screen.getByTestId('directory-app')).toBeInTheDocument();
      });
    });

    it('should not wrap dashboard with MicroFrontendLoader', async () => {
      // Arrange
      mockAuthContext = createMockAuthContext(true, false, mockUser);

      // Act
      renderAppAtRoute('/dashboard');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.queryByTestId('mfe-loader')).not.toBeInTheDocument();
      });
    });

    it('should wrap auth app with MicroFrontendLoader', async () => {
      // Arrange
      mockAuthContext = createMockAuthContext(false, false, null);

      // Act
      renderAppAtRoute('/');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('mfe-loader')).toBeInTheDocument();
        expect(screen.getByTestId('auth-app')).toBeInTheDocument();
      });
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle user without id or username for memory game', async () => {
      // Arrange
      mockAuthContext = createMockAuthContext(true, false, { 
        ...mockUser, 
        id: undefined, 
        username: undefined 
      });

      // Act
      renderAppAtRoute('/memory-game');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('memory-game-app')).toBeInTheDocument();
        expect(screen.getByText(/User: undefined, Username: undefined/)).toBeInTheDocument();
      });
    });

    it('should handle user without id or username for profile', async () => {
      // Arrange
      mockAuthContext = createMockAuthContext(true, false, { 
        ...mockUser, 
        id: undefined, 
        username: undefined 
      });

      // Act
      renderAppAtRoute('/profile');

      // Assert
      await waitFor(() => {
        expect(screen.getByTestId('profile-app')).toBeInTheDocument();
        expect(screen.getByText(/User: undefined, Username: undefined/)).toBeInTheDocument();
      });
    });

    it('should handle authentication state changes', async () => {
      // Arrange
      mockAuthContext = createMockAuthContext(false, false, null);
      const { rerender } = renderAppAtRoute('/dashboard');

      // Assert - Should show auth initially
      await waitFor(() => {
        expect(screen.getByTestId('auth-app')).toBeInTheDocument();
      });

      // Act - Change to authenticated
      mockAuthContext = createMockAuthContext(true, false, mockUser);
      rerender(
        <MemoryRouter initialEntries={['/dashboard']}>
          <App />
        </MemoryRouter>
      );

      // Assert - Should show dashboard now
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    it('should handle rapid route changes', async () => {
      // Arrange
      mockAuthContext = createMockAuthContext(true, false, mockUser);

      // Act - Render at different routes rapidly
      const { rerender } = renderAppAtRoute('/dashboard');
      
      rerender(
        <MemoryRouter initialEntries={['/directory']}>
          <App />
        </MemoryRouter>
      );
      
      rerender(
        <MemoryRouter initialEntries={['/memory-game']}>
          <App />
        </MemoryRouter>
      );

      // Assert - Should render final route
      await waitFor(() => {
        expect(screen.getByTestId('memory-game-app')).toBeInTheDocument();
      });
    });
  });
});
