import { User, UsersResponse, UserFilters } from '../types/directory';

const API_BASE_URL = 'https://dummyjson.com';

class DirectoryService {
  private static instance: DirectoryService;
  private cache: Map<string, UsersResponse> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): DirectoryService {
    if (!DirectoryService.instance) {
      DirectoryService.instance = new DirectoryService();
    }
    return DirectoryService.instance;
  }

  /**
   * Fetch users with optional filtering and pagination
   */
  async getUsers(filters: Partial<UserFilters> = {}): Promise<UsersResponse> {
    const cacheKey = this.generateCacheKey(filters);
    
    // Check cache first
    const cachedResponse = this.getFromCache(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const url = this.buildUrl(filters);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UsersResponse = await response.json();
      
      // Cache the response
      this.setCache(cacheKey, data);
      
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  /**
   * Search users by query
   */
  async searchUsers(query: string, filters: Partial<UserFilters> = {}): Promise<UsersResponse> {
    const searchFilters = { ...filters, search: query };
    
    try {
      const url = `${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UsersResponse = await response.json();
      
      // Apply client-side filtering if needed
      if (filters.sortBy && filters.sortOrder) {
        data.users = this.sortUsers(data.users, filters.sortBy, filters.sortOrder);
      }

      return data;
    } catch (error) {
      console.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  /**
   * Get a specific user by ID
   */
  async getUserById(id: number): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }
  /**
   * Client-side sorting of users
   */
  sortUsers(users: User[], sortBy: keyof User | 'company.name' | 'address.city', sortOrder: 'asc' | 'desc'): User[] {
    return [...users].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Handle nested properties
      if (sortBy.includes('.')) {
        const keys = sortBy.split('.');
        aValue = keys.reduce((obj, key) => obj?.[key], a as any);
        bValue = keys.reduce((obj, key) => obj?.[key], b as any);
      } else {
        aValue = a[sortBy as keyof User];
        bValue = b[sortBy as keyof User];
      }

      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(filters: Partial<UserFilters>): string {
    const params = new URLSearchParams();
    
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.skip) params.append('skip', filters.skip.toString());
    
    return `${API_BASE_URL}/users?${params.toString()}`;
  }

  /**
   * Generate cache key for request
   */
  private generateCacheKey(filters: Partial<UserFilters>): string {
    return JSON.stringify(filters);
  }

  /**
   * Get data from cache if not expired
   */
  private getFromCache(key: string): UsersResponse | null {
    const cached = this.cache.get(key);
    const expiry = this.cacheExpiry.get(key);

    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }

    // Remove expired cache
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  /**
   * Set data in cache with expiry
   */
  private setCache(key: string, data: UsersResponse): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default DirectoryService;
