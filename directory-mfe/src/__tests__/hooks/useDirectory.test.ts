// Tests for useDirectory hook
import { renderHook, act } from '@testing-library/react';
import { useDirectory } from '../../hooks/useDirectory';
import DirectoryService from '../../services/directoryService';

// Mock DirectoryService
jest.mock('../../services/directoryService', () => {
  const mockDirectoryService = {
    getInstance: jest.fn(),
    getUsers: jest.fn(),
    searchUsers: jest.fn(),
    getUserById: jest.fn(),
    sortUsers: jest.fn(),
    clearCache: jest.fn(),
    getCacheStats: jest.fn()
  };
  return {
    __esModule: true,
    default: {
      getInstance: () => mockDirectoryService,
    }
  };
});

const mockDirectoryService = DirectoryService.getInstance() as jest.Mocked<any>;

describe('useDirectory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    mockDirectoryService.getUsers.mockResolvedValue({
      users: [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          image: 'https://example.com/avatar.jpg',
          company: { name: 'Test Corp', department: 'Engineering' },
          address: { city: 'New York' }
        }
      ],
      total: 1,
      skip: 0,
      limit: 20
    });

    mockDirectoryService.searchUsers.mockResolvedValue({
      users: [],
      total: 0,
      skip: 0,
      limit: 20
    });

    mockDirectoryService.sortUsers.mockImplementation((users, sortBy, sortOrder) => [...users]);
    mockDirectoryService.getCacheStats.mockReturnValue({ size: 0, keys: [] });
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      // Act
      const { result } = renderHook(() => useDirectory());

      // Assert
      expect(result.current.users).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.filters.search).toBe('');
      expect(result.current.filters.sortBy).toBe('firstName');
      expect(result.current.filters.sortOrder).toBe('asc');
      expect(result.current.filters.limit).toBe(20);
      expect(result.current.filters.skip).toBe(0);
      expect(result.current.pagination.currentPage).toBe(1);
      expect(result.current.pagination.totalPages).toBe(0);
      expect(result.current.pagination.totalItems).toBe(0);
      expect(result.current.searchHistory).toEqual([]);
    });

    it('should load users on initialization', async () => {
      // Act
      const { result } = renderHook(() => useDirectory());

      // Wait for the effect to run
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Assert
      expect(mockDirectoryService.getUsers).toHaveBeenCalledWith({
        search: '',
        sortBy: 'firstName',
        sortOrder: 'asc',
        limit: 20,
        skip: 0
      });
    });
  });

  describe('search functionality', () => {
    it('should search users successfully', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());
      
      mockDirectoryService.searchUsers.mockResolvedValueOnce({
        users: [
          {
            id: 1,
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            phone: '123-456-7890'
          }
        ],
        total: 1,
        skip: 0,
        limit: 20
      });

      // Act
      await act(async () => {
        await result.current.search('Jane');
      });

      // Assert
      expect(mockDirectoryService.searchUsers).toHaveBeenCalledWith('Jane', expect.objectContaining({
        search: 'Jane',
        skip: 0
      }));
      expect(result.current.filters.search).toBe('Jane');
    });

    it('should add search query to history', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      // Act
      await act(async () => {
        await result.current.search('John');
      });

      await act(async () => {
        await result.current.search('Jane');
      });

      // Assert
      expect(result.current.searchHistory).toContain('John');
      expect(result.current.searchHistory).toContain('Jane');
    });

    it('should not add duplicate search terms to history', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      // Act
      await act(async () => {
        await result.current.search('John');
      });

      await act(async () => {
        await result.current.search('John');
      });

      // Assert
      expect(result.current.searchHistory.filter(term => term === 'John')).toHaveLength(1);
    });

    it('should limit search history to 10 items', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      // Act
      for (let i = 0; i < 15; i++) {
        await act(async () => {
          await result.current.search(`search${i}`);
        });
      }

      // Assert
      expect(result.current.searchHistory).toHaveLength(10);
    });

    it('should handle search errors', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());
      
      mockDirectoryService.searchUsers.mockRejectedValueOnce(new Error('Search failed'));

      // Act
      await act(async () => {
        await result.current.search('error');
      });

      // Assert
      expect(result.current.error).toBe('Search failed');
      expect(result.current.loading).toBe(false);
    });

    it('should trim search query', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      // Act
      await act(async () => {
        await result.current.search('  John  ');
      });

      // Assert
      expect(result.current.filters.search).toBe('John');
    });

    it('should not add empty search to history', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      // Act
      await act(async () => {
        await result.current.search('   ');
      });

      // Assert
      expect(result.current.searchHistory).toEqual([]);
    });
  });

  describe('sorting functionality', () => {
    it('should sort users by field', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Act
      act(() => {
        result.current.sort('lastName', 'desc');
      });

      // Assert
      expect(result.current.filters.sortBy).toBe('lastName');
      expect(result.current.filters.sortOrder).toBe('desc');
      expect(mockDirectoryService.sortUsers).toHaveBeenCalledWith(
        expect.any(Array),
        'lastName',
        'desc'
      );
    });

    it('should sort by nested fields', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      // Wait for initial load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Act
      act(() => {
        result.current.sort('company.name', 'asc');
      });

      // Assert
      expect(result.current.filters.sortBy).toBe('company.name');
      expect(result.current.filters.sortOrder).toBe('asc');
    });
  });

  describe('pagination functionality', () => {
    it('should change page', () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      // Act
      act(() => {
        result.current.changePage(3);
      });

      // Assert
      expect(result.current.filters.skip).toBe(40); // (3-1) * 20
    });

    it('should change page size', () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      // Act
      act(() => {
        result.current.changePageSize(50);
      });

      // Assert
      expect(result.current.filters.limit).toBe(50);
      expect(result.current.filters.skip).toBe(0); // Reset to first page
    });

    it('should calculate pagination correctly', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      mockDirectoryService.getUsers.mockResolvedValueOnce({
        users: new Array(20).fill(null).map((_, i) => ({ id: i + 1, firstName: `User${i + 1}` })),
        total: 100,
        skip: 0,
        limit: 20
      });

      // Act
      await act(async () => {
        await result.current.loadUsers();
      });

      // Assert
      expect(result.current.pagination.totalItems).toBe(100);
      expect(result.current.pagination.totalPages).toBe(5);
      expect(result.current.pagination.currentPage).toBe(1);
      expect(result.current.pagination.hasNext).toBe(true);
      expect(result.current.pagination.hasPrevious).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should handle loading errors', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());
      
      mockDirectoryService.getUsers.mockRejectedValueOnce(new Error('Network error'));

      // Act
      await act(async () => {
        await result.current.loadUsers();
      });

      // Assert
      expect(result.current.error).toBe('Network error');
      expect(result.current.loading).toBe(false);
    });

    it('should clear error state', () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      // Set an error manually
      act(() => {
        result.current.clearError();
      });

      // Act
      act(() => {
        result.current.clearError();
      });

      // Assert
      expect(result.current.error).toBeNull();
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      // Act
      act(() => {
        result.current.clearCache();
      });

      // Assert
      expect(mockDirectoryService.clearCache).toHaveBeenCalled();
    });

    it('should refresh data by clearing cache and reloading', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      // Act
      await act(async () => {
        await result.current.refresh();
      });

      // Assert
      expect(mockDirectoryService.clearCache).toHaveBeenCalled();
      expect(mockDirectoryService.getUsers).toHaveBeenCalled();
    });

    it('should provide cache stats', () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      mockDirectoryService.getCacheStats.mockReturnValue({
        size: 5,
        keys: ['key1', 'key2', 'key3', 'key4', 'key5']
      });

      // Act
      const stats = result.current.cacheStats;

      // Assert
      expect(stats.size).toBe(5);
      expect(stats.keys).toHaveLength(5);
    });
  });

  describe('utility functions', () => {
    it('should clear search filters', () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      // Set a search term first
      act(() => {
        result.current.search('John');
      });

      // Act
      act(() => {
        result.current.clearSearch();
      });

      // Assert
      expect(result.current.filters.search).toBe('');
      expect(result.current.filters.skip).toBe(0);
    });

    it('should handle loading states correctly', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      // Mock a slow response
      let resolvePromise: (value: any) => void;
      const promise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockDirectoryService.getUsers.mockReturnValueOnce(promise);

      // Act
      const loadPromise = act(async () => {
        await result.current.loadUsers();
      });

      // Check loading state
      expect(result.current.loading).toBe(true);

      // Resolve the promise
      resolvePromise!({
        users: [],
        total: 0,
        skip: 0,
        limit: 20
      });

      await loadPromise;

      // Assert
      expect(result.current.loading).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty user array', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      mockDirectoryService.getUsers.mockResolvedValueOnce({
        users: [],
        total: 0,
        skip: 0,
        limit: 20
      });

      // Act
      await act(async () => {
        await result.current.loadUsers();
      });

      // Assert
      expect(result.current.users).toEqual([]);
      expect(result.current.pagination.totalItems).toBe(0);
      expect(result.current.pagination.totalPages).toBe(0);
    });

    it('should handle malformed API response', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      mockDirectoryService.getUsers.mockRejectedValueOnce(new Error('Invalid response format'));

      // Act
      await act(async () => {
        await result.current.loadUsers();
      });

      // Assert
      expect(result.current.error).toBe('Invalid response format');
      expect(result.current.users).toEqual([]);
    });

    it('should handle search with empty results', async () => {
      // Arrange
      const { result } = renderHook(() => useDirectory());

      mockDirectoryService.searchUsers.mockResolvedValueOnce({
        users: [],
        total: 0,
        skip: 0,
        limit: 20
      });

      // Act
      await act(async () => {
        await result.current.search('nonexistent');
      });

      // Assert
      expect(result.current.users).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.searchHistory).toContain('nonexistent');
    });
  });
});
