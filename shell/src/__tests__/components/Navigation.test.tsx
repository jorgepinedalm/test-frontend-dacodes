import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Navigation from '../../components/Navigation';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the AuthContext hook
const mockUser = {
  id: '1',
  username: 'testuser',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  image: 'https://example.com/avatar.jpg'
};

const createMockAuthContext = (
  isAuthenticated = true,
  user:any = mockUser,
  logout = jest.fn()
) => ({
  user,
  isAuthenticated,
  login: jest.fn(),
  logout,
  isLoading: false,
  error: null,
  clearError: jest.fn()
});

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

let mockAuthContext = createMockAuthContext();

const renderNavigation = (initialPath = '/dashboard') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navigation />
    </MemoryRouter>
  );
};

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthContext = createMockAuthContext();
  });

  describe('when user is not authenticated', () => {
    it('should not render navigation when user is not authenticated', () => {
      // Arrange
      mockAuthContext = createMockAuthContext(false, null);

      // Act
      const { container } = renderNavigation();

      // Assert
      expect(container.firstChild).toBeNull();
    });
  });

  describe('when user is authenticated', () => {
    it('should render navigation with all navigation links', () => {
      // Arrange & Act
      renderNavigation();

      // Assert
      expect(screen.getByText('🏢 Modular People Portal')).toBeInTheDocument();
      expect(screen.getByText('📊 Dashboard')).toBeInTheDocument();
      expect(screen.getByText('👥 Directory')).toBeInTheDocument();
      expect(screen.getByText('🎮 Memory Game')).toBeInTheDocument();
      expect(screen.getByText('👤 Profile')).toBeInTheDocument();
    });

    it('should display user information correctly', () => {
      // Arrange & Act
      renderNavigation();

      // Assert
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      const avatar = screen.getByAltText('John');
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveAttribute('src', mockUser.image);
    });

    it('should use placeholder image when user image is not available', () => {
      // Arrange
      mockAuthContext = createMockAuthContext(true, { ...mockUser, image: '' });

      // Act
      renderNavigation();

      // Assert
      const avatar = screen.getByAltText('John');
      expect(avatar).toHaveAttribute('src', '/api/placeholder/32/32');
    });

    it('should highlight active navigation link for dashboard', () => {
      // Arrange & Act
      renderNavigation('/dashboard');

      // Assert
      const dashboardLink = screen.getByText('📊 Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('active');
    });

    it('should highlight active navigation link for directory', () => {
      // Arrange & Act
      renderNavigation('/directory');

      // Assert
      const directoryLink = screen.getByText('👥 Directory').closest('a');
      expect(directoryLink).toHaveClass('active');
    });

    it('should highlight active navigation link for memory game', () => {
      // Arrange & Act
      renderNavigation('/memory-game');

      // Assert
      const memoryGameLink = screen.getByText('🎮 Memory Game').closest('a');
      expect(memoryGameLink).toHaveClass('active');
    });

    it('should highlight active navigation link for profile', () => {
      // Arrange & Act
      renderNavigation('/profile');

      // Assert
      const profileLink = screen.getByText('👤 Profile').closest('a');
      expect(profileLink).toHaveClass('active');
    });

    it('should not highlight any link when on unmatched route', () => {
      // Arrange & Act
      renderNavigation('/unknown');

      // Assert
      const links = screen.getAllByRole('link');
      const navLinks = links.filter(link => 
        link.textContent?.includes('Dashboard') ||
        link.textContent?.includes('Directory') ||
        link.textContent?.includes('Memory Game') ||
        link.textContent?.includes('Profile')
      );
      
      navLinks.forEach(link => {
        expect(link).not.toHaveClass('active');
      });
    });

    it('should render logout button', () => {
      // Arrange & Act
      renderNavigation();

      // Assert
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });
  });

  describe('logout functionality', () => {
    it('should call logout and navigate to root when logout button is clicked', async () => {
      // Arrange
      const mockLogout = jest.fn();
      mockAuthContext = createMockAuthContext(true, mockUser, mockLogout);
      renderNavigation();

      // Act
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      fireEvent.click(logoutButton);

      // Assert
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('should handle logout function being undefined', () => {
      // Arrange
      mockAuthContext = createMockAuthContext(true, mockUser, undefined);
      renderNavigation();

      // Act & Assert
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(() => fireEvent.click(logoutButton)).not.toThrow();
    });
  });

  describe('navigation structure', () => {
    it('should have correct link hrefs', () => {
      // Arrange & Act
      renderNavigation();

      // Assert
      expect(screen.getByText('🏢 Modular People Portal').closest('a'))
        .toHaveAttribute('href', '/dashboard');
      expect(screen.getByText('📊 Dashboard').closest('a'))
        .toHaveAttribute('href', '/dashboard');
      expect(screen.getByText('👥 Directory').closest('a'))
        .toHaveAttribute('href', '/directory');
      expect(screen.getByText('🎮 Memory Game').closest('a'))
        .toHaveAttribute('href', '/memory-game');
      expect(screen.getByText('👤 Profile').closest('a'))
        .toHaveAttribute('href', '/profile');
    });

    it('should have correct CSS classes applied', () => {
      // Arrange & Act
      renderNavigation();

      // Assert
      expect(screen.getByRole('navigation')).toHaveClass('navigation');
      expect(screen.getByText('🏢 Modular People Portal').closest('a'))
        .toHaveClass('brand-link');
      expect(screen.getByText('📊 Dashboard').closest('a'))
        .toHaveClass('nav-link');
    });
  });

  describe('user display edge cases', () => {
    it('should handle user with only first name', () => {
      // Arrange
      mockAuthContext = createMockAuthContext(true, {
        ...mockUser,
        lastName: ''
      });

      // Act
      renderNavigation();

      // Assert
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    it('should handle user with empty names', () => {
      // Arrange
      mockAuthContext = createMockAuthContext(true, {
        ...mockUser,
        firstName: '',
        lastName: ''
      });

      // Act
      renderNavigation();

      // Assert
      const userNameElement = screen.getByText('').closest('.user-name');
      expect(userNameElement).toBeInTheDocument();
    });
  });
});
