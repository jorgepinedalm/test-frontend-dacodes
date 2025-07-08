import React from 'react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  loading = false
}) => {
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const range = [];
    const rangeWithDots = [];

    // Calculate the range of pages to show
    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    // Add first page
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Add middle pages
    rangeWithDots.push(...range);

    // Add last page
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter((page, index, array) => array.indexOf(page) === index);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && !loading) {
      onPageChange(page);
    }
  };

  const getItemRange = () => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return { start, end };
  };

  if (totalPages <= 1) {
    return null;
  }

  const { start, end } = getItemRange();
  const visiblePages = getVisiblePages();

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span className="pagination-text">
          Showing {start.toLocaleString()} to {end.toLocaleString()} of {totalItems.toLocaleString()} users
        </span>
      </div>

      <nav className="pagination" aria-label="Page navigation">
        <ul className="pagination-list">
          {/* Previous button */}
          <li className={`pagination-item ${currentPage === 1 || loading ? 'disabled' : ''}`}>
            <button
              className="pagination-link pagination-prev"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              aria-label="Previous page"
            >
              <span className="pagination-icon">‹</span>
              <span className="pagination-label">Previous</span>
            </button>
          </li>

          {/* First page button */}
          {visiblePages[0] !== 1 && (
            <li className="pagination-item">
              <button
                className={`pagination-link ${currentPage === 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(1)}
                disabled={loading}
                aria-label="Page 1"
                aria-current={currentPage === 1 ? 'page' : undefined}
              >
                1
              </button>
            </li>
          )}

          {/* Page numbers */}
          {visiblePages.map((page, index) => (
            <li key={index} className="pagination-item">
              {page === '...' ? (
                <span className="pagination-dots">...</span>
              ) : (
                <button
                  className={`pagination-link ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page as number)}
                  disabled={loading}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          {/* Next button */}
          <li className={`pagination-item ${currentPage === totalPages || loading ? 'disabled' : ''}`}>
            <button
              className="pagination-link pagination-next"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              aria-label="Next page"
            >
              <span className="pagination-label">Next</span>
              <span className="pagination-icon">›</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* Page size info */}
      <div className="pagination-meta">
        <span className="pagination-text">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    </div>
  );
};

export default Pagination;
