import { useState, useEffect, useCallback, useMemo } from 'react';
import { DirectoryState, UserFilters, User, PaginationInfo } from '../types/directory';
import DirectoryService from '../services/directoryService';

const directoryService = DirectoryService.getInstance();

const initialFilters: UserFilters = {
  search: '',
  sortBy: 'firstName',
  sortOrder: 'asc',
  limit: 20,
  skip: 0,
};

const initialPagination: PaginationInfo = {
  currentPage: 1,
  totalPages: 0,
  totalItems: 0,
  itemsPerPage: 20,
  hasNext: false,
  hasPrevious: false,
};

const initialState: DirectoryState = {
  users: [],
  loading: false,
  error: null,
  filters: initialFilters,
  pagination: initialPagination,
  searchHistory: [],
  cache: new Map(),
};

export const useDirectory = () => {
  const [state, setState] = useState<DirectoryState>(initialState);

  // Load users on mount and when filters change
  useEffect(() => {
    loadUsers();
  }, [state.filters.limit, state.filters.skip]);

  const loadUsers = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      let response;
      
      if (state.filters.search.trim()) {
        response = await directoryService.searchUsers(state.filters.search, state.filters);
      } else {
        response = await directoryService.getUsers(state.filters);
      }

      // Apply client-side sorting
      let sortedUsers = response.users;
      if (state.filters.sortBy && state.filters.sortOrder) {
        sortedUsers = directoryService.sortUsers(
          response.users,
          state.filters.sortBy,
          state.filters.sortOrder
        );
      }

      const pagination = calculatePagination(response, state.filters);

      setState(prev => ({
        ...prev,
        users: sortedUsers,
        loading: false,
        pagination,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load users';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [state.filters]);

  const search = useCallback(async (query: string) => {
    const trimmedQuery = query.trim();
    
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, search: trimmedQuery, skip: 0 },
      loading: true,
      error: null,
    }));

    // Add to search history if not empty and not duplicate
    if (trimmedQuery && !state.searchHistory.includes(trimmedQuery)) {
      setState(prev => ({
        ...prev,
        searchHistory: [trimmedQuery, ...prev.searchHistory.slice(0, 9)], // Keep last 10
      }));
    }

    try {
      let response;
      
      if (trimmedQuery) {
        response = await directoryService.searchUsers(trimmedQuery, state.filters);
      } else {
        response = await directoryService.getUsers(state.filters);
      }

      // Apply client-side sorting
      let sortedUsers = response.users;
      if (state.filters.sortBy && state.filters.sortOrder) {
        sortedUsers = directoryService.sortUsers(
          response.users,
          state.filters.sortBy,
          state.filters.sortOrder
        );
      }

      const pagination = calculatePagination(response, state.filters);

      setState(prev => ({
        ...prev,
        users: sortedUsers,
        loading: false,
        pagination,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, [state.filters, state.searchHistory]);

  const sort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setState(prev => {
      const newFilters = { ...prev.filters, sortBy, sortOrder };
      const sortedUsers = directoryService.sortUsers(prev.users, sortBy, sortOrder);
      
      return {
        ...prev,
        filters: newFilters,
        users: sortedUsers,
      };
    });
  }, []);

  const changePage = useCallback((page: number) => {
    const skip = (page - 1) * state.filters.limit;
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, skip },
    }));
  }, [state.filters.limit]);

  const changePageSize = useCallback((limit: number) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, limit, skip: 0 },
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, search: '', skip: 0 },
    }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const clearCache = useCallback(() => {
    directoryService.clearCache();
  }, []);

  const refresh = useCallback(() => {
    directoryService.clearCache();
    loadUsers();
  }, [loadUsers]);

  // Memoized values
  const filteredUsers = useMemo(() => {
    return state.users;
  }, [state.users]);

  const cacheStats = useMemo(() => {
    return directoryService.getCacheStats();
  }, [state.users]);

  return {
    // State
    users: filteredUsers,
    loading: state.loading,
    error: state.error,
    filters: state.filters,
    pagination: state.pagination,
    searchHistory: state.searchHistory,
    
    // Actions
    search,
    sort,
    changePage,
    changePageSize,
    clearSearch,
    clearError,
    clearCache,
    refresh,
    loadUsers,
    
    // Utils
    cacheStats,
  };
};

/**
 * Calculate pagination info based on response and filters
 */
function calculatePagination(response: any, filters: UserFilters): PaginationInfo {
  const currentPage = Math.floor(filters.skip / filters.limit) + 1;
  const totalPages = Math.ceil(response.total / filters.limit);
  
  return {
    currentPage,
    totalPages,
    totalItems: response.total,
    itemsPerPage: filters.limit,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
  };
}
