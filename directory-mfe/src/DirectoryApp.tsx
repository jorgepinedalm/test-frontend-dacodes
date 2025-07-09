import React from 'react';
import { useDirectory } from './hooks/useDirectory';
import SearchBar from './components/SearchBar';
import './DirectoryApp.css';
import UserTable from './components/UserTable';
import Pagination from './components/Pagination';

interface DirectoryAppProps {
  onViewProfile?: (userId: number) => void;
}

const DirectoryApp: React.FC<DirectoryAppProps> = ({ onViewProfile }) => {
  const {
    users,
    loading,
    error,
    filters,
    pagination,
    searchHistory,
    search,
    sort,
    changePage,
    changePageSize,
    clearSearch,
    clearError,
    refresh
  } = useDirectory();

  return (
    <div className="directory-app">
      <div className="directory-header">
        <h1>User Directory</h1>
        <p>Browse and search through user profiles</p>
      </div>

      <div className="directory-controls">
        <SearchBar
          value={filters.search}
          onSearch={search}
          onClear={clearSearch}
          searchHistory={searchHistory}
          disabled={loading}
        />
        
        <div className="control-actions">
          <button 
            onClick={refresh}
            disabled={loading}
            className="refresh-button"
          >
            🔄 Refresh
          </button>
          
          <select
            value={filters.limit}
            onChange={(e) => changePageSize(Number(e.target.value))}
            disabled={loading}
            className="page-size-select"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={clearError} className="error-close">×</button>
        </div>
      )}      <UserTable
        users={users}
        loading={loading}
        onSort={sort}
        currentSort={{
          column: filters.sortBy,
          direction: filters.sortOrder
        }}
        onViewProfile={onViewProfile}
      /><Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        onPageChange={changePage}
        loading={loading}
      />
    </div>
  );
};

export default DirectoryApp;
