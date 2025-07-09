// Tests for DirectoryApp component
import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DirectoryApp from '../../DirectoryApp';
import { useDirectory } from '../../hooks/useDirectory';

// Mock the useDirectory hook
jest.mock('../../hooks/useDirectory');
const mockUseDirectory = useDirectory as jest.MockedFunction<typeof useDirectory>;

// Mock child components
jest.mock('../../components/SearchBar', () => {
  return function MockedSearchBar({ value, onSearch, onClear, disabled }: any) {
    return (
      <div data-testid="search-bar">
        <input
          data-testid="search-input"
          value={value}
          onChange={(e) => onSearch(e.target.value)}
          disabled={disabled}
        />
        <button data-testid="clear-button" onClick={onClear}>
          Clear
        </button>
      </div>
    );
  };
});

jest.mock('../../components/UserTable', () => {
  return function MockedUserTable({ users, loading, onSort, sortBy, sortOrder }: any) {
    return (
      <div data-testid="user-table">
        {loading && <div data-testid="table-loading">Loading...</div>}
        {users.map((user: any) => (
          <div key={user.id} data-testid="user-row">
            {user.firstName} {user.lastName}
          </div>
        ))}
        <button data-testid="sort-button" onClick={() => onSort('firstName', 'asc')}>
          Sort
        </button>
      </div>
    );
  };
});

jest.mock('../../components/Pagination', () => {
  return function MockedPagination({ currentPage, totalPages, onPageChange, loading }: any) {
    return (
      <div data-testid="pagination">
        <span data-testid="page-info">{currentPage} / {totalPages}</span>
        <button 
          data-testid="next-page" 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={loading}
        >
          Next
        </button>
      </div>
    );
  };
});

describe('DirectoryApp', () => {
  const mockDirectoryReturn = {
    users: [],
    loading: false,
    error: null,
    filters: {
      search: '',
      sortBy: 'firstName' as const,
      sortOrder: 'asc' as const,
      limit: 20,
      skip: 0
    },
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 20,
      hasNext: false,
      hasPrevious: false
    },
    searchHistory: [],
    search: jest.fn(),
    sort: jest.fn(),
    changePage: jest.fn(),
    changePageSize: jest.fn(),
    clearSearch: jest.fn(),
    clearError: jest.fn(),
    refresh: jest.fn(),
    loadUsers: jest.fn(),
    clearCache: jest.fn(),
    cacheStats: { size: 0, keys: [] }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDirectory.mockReturnValue(mockDirectoryReturn);
  });

  describe('rendering', () => {
    it('should render directory header', () => {
      // Act
      render(<DirectoryApp />);

      // Assert
      expect(screen.getByText('User Directory')).toBeInTheDocument();
      expect(screen.getByText('Browse and search through user profiles')).toBeInTheDocument();
    });

    it('should render all main components', () => {
      // Act
      render(<DirectoryApp />);

      // Assert
      expect(screen.getByTestId('search-bar')).toBeInTheDocument();
      expect(screen.getByTestId('user-table')).toBeInTheDocument();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });    it('should render refresh button', () => {
      // Act
      render(<DirectoryApp />);

      // Assert
      const refreshButton = screen.getByText('🔄 Refresh');
      expect(refreshButton).toBeInTheDocument();
      expect(refreshButton).toHaveClass('refresh-button');
    });    it('should render page size selector', () => {
      // Act
      render(<DirectoryApp />);

      // Assert
      const pageSize = screen.getByRole('combobox');
      expect(pageSize).toBeInTheDocument();
      expect(pageSize).toHaveClass('page-size-select');
    });
  });

  describe('user interactions', () => {
    it('should call search when search input changes', () => {
      // Arrange
      render(<DirectoryApp />);
      const searchInput = screen.getByTestId('search-input');

      // Act
      fireEvent.change(searchInput, { target: { value: 'John' } });

      // Assert
      expect(mockDirectoryReturn.search).toHaveBeenCalledWith('John');
    });

    it('should call clearSearch when clear button is clicked', () => {
      // Arrange
      render(<DirectoryApp />);
      const clearButton = screen.getByTestId('clear-button');

      // Act
      fireEvent.click(clearButton);

      // Assert
      expect(mockDirectoryReturn.clearSearch).toHaveBeenCalled();
    });

    it('should call refresh when refresh button is clicked', () => {
      // Arrange
      render(<DirectoryApp />);
      const refreshButton = screen.getByText('Refresh');

      // Act
      fireEvent.click(refreshButton);

      // Assert
      expect(mockDirectoryReturn.refresh).toHaveBeenCalled();
    });    it('should call changePageSize when page size changes', () => {
      // Arrange
      render(<DirectoryApp />);
      const pageSizeSelect = screen.getByRole('combobox');

      // Act
      fireEvent.change(pageSizeSelect, { target: { value: '50' } });

      // Assert
      expect(mockDirectoryReturn.changePageSize).toHaveBeenCalledWith(50);
    });

    it('should call sort when sort button is clicked', () => {
      // Arrange
      render(<DirectoryApp />);
      const sortButton = screen.getByTestId('sort-button');

      // Act
      fireEvent.click(sortButton);

      // Assert
      expect(mockDirectoryReturn.sort).toHaveBeenCalledWith('firstName', 'asc');
    });

    it('should call changePage when pagination is used', () => {
      // Arrange
      render(<DirectoryApp />);
      const nextButton = screen.getByTestId('next-page');

      // Act
      fireEvent.click(nextButton);

      // Assert
      expect(mockDirectoryReturn.changePage).toHaveBeenCalledWith(2);
    });
  });

  describe('loading states', () => {
    it('should disable controls when loading', () => {
      // Arrange
      mockUseDirectory.mockReturnValue({
        ...mockDirectoryReturn,
        loading: true
      });

      // Act
      render(<DirectoryApp />);

      // Assert
      const searchInput = screen.getByTestId('search-input');
      const refreshButton = screen.getByText('Refresh');
      const nextButton = screen.getByTestId('next-page');

      expect(searchInput).toBeDisabled();
      expect(refreshButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('should show loading state in table', () => {
      // Arrange
      mockUseDirectory.mockReturnValue({
        ...mockDirectoryReturn,
        loading: true
      });

      // Act
      render(<DirectoryApp />);

      // Assert
      expect(screen.getByTestId('table-loading')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should display error banner when error exists', () => {
      // Arrange
      mockUseDirectory.mockReturnValue({
        ...mockDirectoryReturn,
        error: 'Failed to load users'
      });

      // Act
      render(<DirectoryApp />);

      // Assert
      const errorBanner = screen.getByText('Failed to load users');
      expect(errorBanner).toBeInTheDocument();
      expect(errorBanner.closest('.error-banner')).toBeInTheDocument();
    });

    it('should show dismiss button in error banner', () => {
      // Arrange
      mockUseDirectory.mockReturnValue({
        ...mockDirectoryReturn,
        error: 'Failed to load users'
      });

      // Act
      render(<DirectoryApp />);

      // Assert
      const dismissButton = screen.getByText('×');
      expect(dismissButton).toBeInTheDocument();
    });

    it('should call clearError when dismiss button is clicked', () => {
      // Arrange
      mockUseDirectory.mockReturnValue({
        ...mockDirectoryReturn,
        error: 'Failed to load users'
      });

      render(<DirectoryApp />);
      const dismissButton = screen.getByText('×');

      // Act
      fireEvent.click(dismissButton);

      // Assert
      expect(mockDirectoryReturn.clearError).toHaveBeenCalled();
    });

    it('should not show error banner when no error', () => {
      // Arrange
      mockUseDirectory.mockReturnValue({
        ...mockDirectoryReturn,
        error: null
      });

      // Act
      render(<DirectoryApp />);

      // Assert
      expect(screen.queryByText('×')).not.toBeInTheDocument();
    });
  });

  describe('data display', () => {
    it('should display users when available', () => {
      // Arrange
      const users = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          username: 'johndoe',
          website: 'https://johndoe.com',
          image: 'https://example.com/johndoe.jpg',
          age: 30,
          gender: 'male',
          address: {
            address: '123 Main St',
            city: 'Anytown',
            postalCode: '12345',
            state: 'CA',
            country: 'USA'
          },
          company: {
            name: 'Example Inc.',
            title: 'Engineer',
            department: 'Engineering'
          },
          birthDate: '1993-01-01',
          bank: { cardNumber: '1234-5678-9012-3456', cardType: 'Visa', currency: 'USD', iban: 'US12345678901234567890', cardExpire: '12/25' }
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '098-765-4321',
          username: 'janesmith',
          website: 'https://janesmith.com',
          image: 'https://example.com/janesmith.jpg',
          age: 28,
          gender: 'female',
          address: {
            address: '456 Elm St',
            city: 'Othertown',
            postalCode: '67890',
            state: 'NY',
            country: 'USA'
          },
          company: {
            name: 'Example LLC',
            title: 'Marketing Specialist',
            department: 'Marketing'
          },
          birthDate: '1995-05-15',
          bank: { cardNumber: '9876-5432-1098-7654', cardType: 'MasterCard', currency: 'USD', iban: 'US09876543210987654321', cardExpire: '11/26' }
        }
      ];

      mockUseDirectory.mockReturnValue({
        ...mockDirectoryReturn,
        users
      });

      // Act
      render(<DirectoryApp />);

      // Assert
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should show correct pagination info', () => {
      // Arrange
      mockUseDirectory.mockReturnValue({
        ...mockDirectoryReturn,
        pagination: {
          currentPage: 2,
          totalPages: 5,
          totalItems: 100,
          itemsPerPage: 20,
          hasNext: true,
          hasPrevious: true
        }
      });

      // Act
      render(<DirectoryApp />);

      // Assert
      expect(screen.getByTestId('page-info')).toHaveTextContent('2 / 5');
    });

    it('should reflect current search term', () => {
      // Arrange
      mockUseDirectory.mockReturnValue({
        ...mockDirectoryReturn,
        filters: {
          ...mockDirectoryReturn.filters,
          search: 'John'
        }
      });

      // Act
      render(<DirectoryApp />);

      // Assert
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveValue('John');
    });
  });

  describe('component integration', () => {
    it('should pass correct props to SearchBar', () => {
      // Arrange
      const searchHistory = ['John', 'Jane'];
      mockUseDirectory.mockReturnValue({
        ...mockDirectoryReturn,
        filters: { ...mockDirectoryReturn.filters, search: 'test' },
        searchHistory,
        loading: true
      });

      // Act
      render(<DirectoryApp />);

      // Assert
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveValue('test');
      expect(searchInput).toBeDisabled();
    });

    it('should pass correct props to UserTable', () => {
      // Arrange
      const users = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          username: 'johndoe',
          website: 'https://johndoe.com',
          image: 'https://example.com/johndoe.jpg',
          age: 30,
          gender: 'male',
          address: {
            address: '123 Main St',
            city: 'Anytown',
            postalCode: '12345',
            state: 'CA',
            country: 'USA'
          },
          company: {
            name: 'Example Inc.',
            title: 'Engineer',
            department: 'Engineering'
          },
          birthDate: '1993-01-01',
          bank: { cardNumber: '1234-5678-9012-3456', cardType: 'Visa', currency: 'USD', iban: 'US12345678901234567890', cardExpire: '12/25' }
        },
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '098-765-4321',
          username: 'janesmith',
          website: 'https://janesmith.com',
          image: 'https://example.com/janesmith.jpg',
          age: 28,
          gender: 'female',
          address: {
            address: '456 Elm St',
            city: 'Othertown',
            postalCode: '67890',
            state: 'NY',
            country: 'USA'
          },
          company: {
            name: 'Example LLC',
            title: 'Marketing Specialist',
            department: 'Marketing'
          },
          birthDate: '1995-05-15',
          bank: { cardNumber: '9876-5432-1098-7654', cardType: 'MasterCard', currency: 'USD', iban: 'US09876543210987654321', cardExpire: '11/26' }
        }
      ];
      mockUseDirectory.mockReturnValue({
        ...mockDirectoryReturn,
        users,
        loading: true,
        filters: {
          ...mockDirectoryReturn.filters,
          sortBy: 'lastName',
          sortOrder: 'desc'
        }
      });

      // Act
      render(<DirectoryApp />);

      // Assert
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByTestId('table-loading')).toBeInTheDocument();
    });

    it('should pass correct props to Pagination', () => {
      // Arrange
      mockUseDirectory.mockReturnValue({
        ...mockDirectoryReturn,
        pagination: {
          currentPage: 3,
          totalPages: 10,
          totalItems: 200,
          itemsPerPage: 20,
          hasNext: true,
          hasPrevious: true
        },
        loading: true
      });

      // Act
      render(<DirectoryApp />);

      // Assert
      expect(screen.getByTestId('page-info')).toHaveTextContent('3 / 10');
      expect(screen.getByTestId('next-page')).toBeDisabled();
    });
  });

  describe('responsive behavior', () => {
    it('should have responsive CSS classes', () => {
      // Act
      render(<DirectoryApp />);

      // Assert
      const app = screen.getByText('User Directory').closest('.directory-app');
      expect(app).toBeInTheDocument();
      expect(app).toHaveClass('directory-app');
    });

    it('should have proper structure for responsive design', () => {
      // Act
      render(<DirectoryApp />);

      // Assert
      expect(screen.getByText('User Directory').closest('.directory-header')).toBeInTheDocument();
      expect(screen.getByTestId('search-bar').closest('.directory-controls')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      // Act
      render(<DirectoryApp />);

      // Assert
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('User Directory');
    });    it('should have accessible form controls', () => {
      // Act
      render(<DirectoryApp />);

      // Assert
      const pageSizeSelect = screen.getByRole('combobox');
      expect(pageSizeSelect).toBeInTheDocument();
      expect(pageSizeSelect).toHaveClass('page-size-select');
    });it('should have proper button roles', () => {
      // Act
      render(<DirectoryApp />);

      // Assert
      const refreshButton = screen.getByRole('button', { name: '🔄 Refresh' });
      expect(refreshButton).toBeInTheDocument();
    });
  });
});
