// Tests for DirectoryService
import DirectoryService from '../../services/directoryService';
import { UserFilters } from '../../types/directory';

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('DirectoryService', () => {
  let directoryService: DirectoryService;

  beforeEach(() => {
    directoryService = DirectoryService.getInstance();
    directoryService.clearCache();
    jest.clearAllMocks();
  });

  describe('singleton pattern', () => {
    it('should return the same instance', () => {
      // Act
      const instance1 = DirectoryService.getInstance();
      const instance2 = DirectoryService.getInstance();

      // Assert
      expect(instance1).toBe(instance2);
      expect(instance1).toBe(directoryService);
    });
  });

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      // Arrange
      const mockResponse = {
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
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const filters: Partial<UserFilters> = { limit: 20, skip: 0 };

      // Act
      const result = await directoryService.getUsers(filters);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/users?limit=20&skip=0'
      );
    });

    it('should handle fetch errors', async () => {
      // Arrange
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Act & Assert
      await expect(directoryService.getUsers()).rejects.toThrow('Network error');
    });

    it('should handle non-ok responses', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as Response);

      // Act & Assert
      await expect(directoryService.getUsers()).rejects.toThrow(
        'Failed to fetch users: 500 Internal Server Error'
      );
    });

    it('should use cache for identical requests', async () => {
      // Arrange
      const mockResponse = {
        users: [{ id: 1, firstName: 'John' }],
        total: 1,
        skip: 0,
        limit: 20
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const filters: Partial<UserFilters> = { limit: 20, skip: 0 };

      // Act
      const result1 = await directoryService.getUsers(filters);
      const result2 = await directoryService.getUsers(filters);

      // Assert
      expect(result1).toEqual(mockResponse);
      expect(result2).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      // Arrange
      const mockResponse = {
        users: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '123-456-7890'
          }
        ],
        total: 1,
        skip: 0,
        limit: 20
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      // Act
      const result = await directoryService.searchUsers('John');

      // Assert
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/users/search?q=John'
      );
    });

    it('should include filters in search', async () => {
      // Arrange
      const mockResponse = { users: [], total: 0, skip: 0, limit: 10 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      const filters: Partial<UserFilters> = { limit: 10, skip: 20 };

      // Act
      await directoryService.searchUsers('test', filters);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/users/search?q=test&limit=10&skip=20'
      );
    });

    it('should handle empty search query', async () => {
      // Act & Assert
      await expect(directoryService.searchUsers('')).rejects.toThrow(
        'Search query cannot be empty'
      );
    });
  });

  describe('getUserById', () => {
    it('should fetch user by ID successfully', async () => {
      // Arrange
      const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123-456-7890'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser
      } as Response);

      // Act
      const result = await directoryService.getUserById(1);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockFetch).toHaveBeenCalledWith('https://dummyjson.com/users/1');
    });

    it('should handle user not found', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response);

      // Act & Assert
      await expect(directoryService.getUserById(999)).rejects.toThrow(
        'Failed to fetch user: 404 Not Found'
      );
    });
  });

  describe('sortUsers', () => {
    const users = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '123-456-7890',
        company: { name: 'ABC Corp', department: 'Engineering' },
        address: { city: 'New York' }
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '098-765-4321',
        company: { name: 'XYZ Inc', department: 'Marketing' },
        address: { city: 'Los Angeles' }
      }
    ] as any[];

    it('should sort users by firstName ascending', () => {
      // Act
      const sorted = directoryService.sortUsers(users, 'firstName', 'asc');

      // Assert
      expect(sorted[0].firstName).toBe('Jane');
      expect(sorted[1].firstName).toBe('John');
    });

    it('should sort users by firstName descending', () => {
      // Act
      const sorted = directoryService.sortUsers(users, 'firstName', 'desc');

      // Assert
      expect(sorted[0].firstName).toBe('John');
      expect(sorted[1].firstName).toBe('Jane');
    });

    it('should sort users by email', () => {
      // Act
      const sorted = directoryService.sortUsers(users, 'email', 'asc');

      // Assert
      expect(sorted[0].email).toBe('jane@example.com');
      expect(sorted[1].email).toBe('john@example.com');
    });

    it('should sort users by company name', () => {
      // Act
      const sorted = directoryService.sortUsers(users, 'company.name', 'asc');

      // Assert
      expect(sorted[0].company.name).toBe('ABC Corp');
      expect(sorted[1].company.name).toBe('XYZ Inc');
    });

    it('should sort users by city', () => {
      // Act
      const sorted = directoryService.sortUsers(users, 'address.city', 'asc');

      // Assert
      expect(sorted[0].address.city).toBe('Los Angeles');
      expect(sorted[1].address.city).toBe('New York');
    });

    it('should handle undefined/null values in sorting', () => {
      // Arrange
      const usersWithNulls = [
        { ...users[0], firstName: null },
        { ...users[1] }
      ] as any[];

      // Act
      const sorted = directoryService.sortUsers(usersWithNulls, 'firstName', 'asc');

      // Assert
      expect(sorted).toHaveLength(2);
      // Null values should be sorted to the end
      expect(sorted[0].firstName).toBe('Jane');
    });
  });

  describe('cache management', () => {
    it('should clear cache successfully', () => {
      // Arrange
      // First, populate cache
      const mockResponse = { users: [], total: 0, skip: 0, limit: 20 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response);

      // Act
      directoryService.clearCache();
      const stats = directoryService.getCacheStats();

      // Assert
      expect(stats.size).toBe(0);
      expect(stats.keys).toEqual([]);
    });

    it('should provide cache statistics', () => {
      // Act
      const stats = directoryService.getCacheStats();

      // Assert
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('keys');
      expect(Array.isArray(stats.keys)).toBe(true);
      expect(typeof stats.size).toBe('number');
    });

    it('should expire cached data after timeout', async () => {
      // Arrange
      const mockResponse = { users: [], total: 0, skip: 0, limit: 20 };
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response);

      // Mock Date.now to simulate time passing
      const originalDateNow = Date.now;
      let currentTime = 1000000;
      Date.now = jest.fn(() => currentTime);

      // Act - First call
      await directoryService.getUsers({ limit: 20 });
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Simulate time passing beyond cache expiry (5 minutes)
      currentTime += 6 * 60 * 1000;

      // Second call should fetch again
      await directoryService.getUsers({ limit: 20 });

      // Assert
      expect(mockFetch).toHaveBeenCalledTimes(2);

      // Restore Date.now
      Date.now = originalDateNow;
    });
  });

  describe('URL building', () => {
    it('should build URL with no filters', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [], total: 0 })
      } as Response);

      // Act
      await directoryService.getUsers();

      // Assert
      expect(mockFetch).toHaveBeenCalledWith('https://dummyjson.com/users?');
    });

    it('should build URL with multiple filters', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [], total: 0 })
      } as Response);

      const filters: Partial<UserFilters> = {
        limit: 10,
        skip: 20
      };

      // Act
      await directoryService.getUsers(filters);

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        'https://dummyjson.com/users?limit=10&skip=20'
      );
    });
  });

  describe('error handling', () => {
    it('should handle JSON parsing errors', async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      } as Response);

      // Act & Assert
      await expect(directoryService.getUsers()).rejects.toThrow('Invalid JSON');
    });

    it('should handle network timeouts', async () => {
      // Arrange
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      // Act & Assert
      await expect(directoryService.getUsers()).rejects.toThrow('Timeout');
    });
  });
});
