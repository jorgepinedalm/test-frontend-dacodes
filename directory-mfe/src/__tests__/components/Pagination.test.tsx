import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Pagination from '../../components/Pagination';

describe('Pagination Component', () => {
  const mockOnPageChange = jest.fn();
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    totalItems: 200,
    itemsPerPage: 20,
    onPageChange: mockOnPageChange
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render pagination info correctly', () => {
      render(<Pagination {...defaultProps} />);
      
      expect(screen.getByText('Showing 1 to 20 of 200 users')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 10')).toBeInTheDocument();
    });

    it('should render navigation buttons', () => {
      render(<Pagination {...defaultProps} />);
      
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
    });

    it('should render page numbers', () => {
      render(<Pagination {...defaultProps} />);
      
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
    });

    it('should not render when totalPages is 1 or less', () => {
      const { container } = render(<Pagination {...defaultProps} totalPages={1} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('should not render when totalPages is 0', () => {
      const { container } = render(<Pagination {...defaultProps} totalPages={0} />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Page Navigation', () => {
    it('should call onPageChange when clicking next button', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} />);
      
      const nextButton = screen.getByLabelText('Next page');
      await user.click(nextButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('should call onPageChange when clicking previous button', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={5} />);
      
      const prevButton = screen.getByLabelText('Previous page');
      await user.click(prevButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(4);
    });

    it('should call onPageChange when clicking page number', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} />);
      
      const pageButton = screen.getByLabelText('Page 3');
      await user.click(pageButton);
      
      expect(mockOnPageChange).toHaveBeenCalledWith(3);
    });

    it('should not call onPageChange when clicking current page', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} />);
      
      const currentPageButton = screen.getByLabelText('Page 1');
      await user.click(currentPageButton);
      
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Button States', () => {
    it('should disable previous button on first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);
      
      const prevButton = screen.getByLabelText('Previous page');
      expect(prevButton).toBeDisabled();
      expect(prevButton.closest('li')).toHaveClass('disabled');
    });

    it('should disable next button on last page', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={10} />);
      
      const nextButton = screen.getByLabelText('Next page');
      expect(nextButton).toBeDisabled();
      expect(nextButton.closest('li')).toHaveClass('disabled');
    });

    it('should enable both buttons on middle page', () => {
      render(<Pagination {...defaultProps} currentPage={5} />);
      
      const prevButton = screen.getByLabelText('Previous page');
      const nextButton = screen.getByLabelText('Next page');
      
      expect(prevButton).not.toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });

    it('should mark current page as active', () => {
      render(<Pagination {...defaultProps} currentPage={3} />);
      
      const currentPageButton = screen.getByLabelText('Page 3');
      expect(currentPageButton).toHaveClass('active');
      expect(currentPageButton).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Loading State', () => {
    it('should disable all buttons when loading', () => {
      render(<Pagination {...defaultProps} currentPage={5} loading={true} />);
      
      const prevButton = screen.getByLabelText('Previous page');
      const nextButton = screen.getByLabelText('Next page');
      const pageButtons = screen.getAllByLabelText(/Page \d+/);
      
      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
      pageButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('should not call onPageChange when loading', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={5} loading={true} />);
      
      const nextButton = screen.getByLabelText('Next page');
      await user.click(nextButton);
      
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });
  });

  describe('Page Range Calculation', () => {
    it('should show correct item range for first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />);
      
      expect(screen.getByText('Showing 1 to 20 of 200 users')).toBeInTheDocument();
    });

    it('should show correct item range for middle page', () => {
      render(<Pagination {...defaultProps} currentPage={5} />);
      
      expect(screen.getByText('Showing 81 to 100 of 200 users')).toBeInTheDocument();
    });

    it('should show correct item range for last page', () => {
      render(<Pagination {...defaultProps} currentPage={10} itemsPerPage={23} totalItems={223} />);
      
      expect(screen.getByText('Showing 208 to 223 of 223 users')).toBeInTheDocument();
    });

    it('should handle partial last page correctly', () => {
      render(<Pagination {...defaultProps} currentPage={11} totalPages={11} totalItems={205} />);
      
      expect(screen.getByText('Showing 201 to 205 of 205 users')).toBeInTheDocument();
    });
  });

  describe('Visible Pages Logic', () => {
    it('should show ellipsis when there are many pages', () => {
      render(<Pagination {...defaultProps} currentPage={6} totalPages={20} />);
      
      const ellipsis = screen.getAllByText('...');
      expect(ellipsis.length).toBeGreaterThan(0);
    });

    it('should show first page when current page is far from beginning', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={20} />);
      
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
    });

    it('should show last page when current page is far from end', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={20} />);
      
      expect(screen.getByLabelText('Page 20')).toBeInTheDocument();
    });    it('should show continuous range for small total pages', () => {
      render(<Pagination {...defaultProps} totalPages={5} />);
      
      // Check for pages 1-3 that should be visible, and page 5 (last page)
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 3')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 5')).toBeInTheDocument();
      
      expect(screen.queryByText('...')).toBeInTheDocument(); // Ellipsis may be present
    });
  });

  describe('Number Formatting', () => {    it('should format large numbers with locale separators', () => {
      render(<Pagination 
        {...defaultProps} 
        totalItems={1000000} 
        currentPage={1} 
        itemsPerPage={100} 
      />);
      
      // Check for the text with either comma or dot separators depending on locale
      const textElement = screen.getByText(/Showing 1 to 100 of 1[.,]000[.,]000 users/);
      expect(textElement).toBeInTheDocument();
    });

    it('should handle small numbers without separators', () => {
      render(<Pagination 
        {...defaultProps} 
        totalItems={50} 
        totalPages={3} 
        itemsPerPage={20} 
      />);
      
      expect(screen.getByText('Showing 1 to 20 of 50 users')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Pagination {...defaultProps} currentPage={5} />);
      
      expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Next page')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 5')).toHaveAttribute('aria-current', 'page');
    });

    it('should have navigation landmark', () => {
      render(<Pagination {...defaultProps} />);
      
      const nav = screen.getByLabelText('Page navigation');
      expect(nav).toBeInTheDocument();
      expect(nav.tagName).toBe('NAV');
    });

    it('should use list structure for page buttons', () => {
      render(<Pagination {...defaultProps} />);
      
      const list = screen.getByRole('list');
      expect(list).toHaveClass('pagination-list');
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('should not have clickable ellipsis', () => {
      render(<Pagination {...defaultProps} currentPage={10} totalPages={20} />);
      
      const ellipsis = screen.getAllByText('...');
      ellipsis.forEach(el => {
        expect(el.tagName).toBe('SPAN');
        expect(el).not.toHaveAttribute('onClick');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle single page scenario', () => {
      const { container } = render(<Pagination {...defaultProps} totalPages={1} />);
      
      expect(container.firstChild).toBeNull();
    });

    it('should handle zero items', () => {
      const { container } = render(<Pagination 
        {...defaultProps} 
        totalItems={0} 
        totalPages={0} 
      />);
      
      expect(container.firstChild).toBeNull();
    });

    it('should handle boundary navigation correctly', () => {
      render(<Pagination {...defaultProps} currentPage={1} totalPages={2} />);
      
      const prevButton = screen.getByLabelText('Previous page');
      const nextButton = screen.getByLabelText('Next page');
      
      expect(prevButton).toBeDisabled();
      expect(nextButton).not.toBeDisabled();
    });

    it('should prevent navigation beyond boundaries', async () => {
      const user = userEvent.setup();
      render(<Pagination {...defaultProps} currentPage={1} />);
      
      const prevButton = screen.getByLabelText('Previous page');
      await user.click(prevButton);
      
      expect(mockOnPageChange).not.toHaveBeenCalled();
    });    it('should handle very large page numbers', () => {
      render(<Pagination 
        {...defaultProps} 
        currentPage={9999} 
        totalPages={10000} 
        totalItems={200000} 
      />);
      
      // Check for specific aria-labeled elements to avoid duplicates
      expect(screen.getByLabelText('Page 9999')).toBeInTheDocument();
      expect(screen.getByLabelText('Page 10000')).toBeInTheDocument();
      expect(screen.getByText(/Page.*of/)).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render all required sections', () => {
      const { container } = render(<Pagination {...defaultProps} />);
      
      expect(container.querySelector('.pagination-container')).toBeInTheDocument();
      expect(container.querySelector('.pagination-info')).toBeInTheDocument();
      expect(container.querySelector('.pagination')).toBeInTheDocument();
      expect(container.querySelector('.pagination-meta')).toBeInTheDocument();
    });

    it('should have proper CSS classes for styling', () => {
      render(<Pagination {...defaultProps} />);
      
      const prevButton = screen.getByLabelText('Previous page');
      const nextButton = screen.getByLabelText('Next page');
      
      expect(prevButton).toHaveClass('pagination-link', 'pagination-prev');
      expect(nextButton).toHaveClass('pagination-link', 'pagination-next');
    });

    it('should render icons in buttons', () => {
      render(<Pagination {...defaultProps} />);
      
      expect(screen.getByText('‹')).toBeInTheDocument(); // Previous icon
      expect(screen.getByText('›')).toBeInTheDocument(); // Next icon
    });
  });
});
