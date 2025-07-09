import React, { act } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import UserTable from '../../components/UserTable';
import { User } from '../../types/directory';

// Mock the formatting utilities
jest.mock('../../utils/formatting', () => ({
  formatFullName: jest.fn((user) => `${user.firstName} ${user.lastName}`),
  formatCompany: jest.fn((company) => company.name),
  formatEmail: jest.fn((email) => ({
    name: email.split('@')[0],
    domain: email.split('@')[1]
  })),
  getUserAvatar: jest.fn((user) => ({
    type: 'initials',
    value: `${user.firstName[0]}${user.lastName[0]}`
  })),
  generateAvatarColor: jest.fn(() => '#007bff')
}));

const mockUsers: User[] = [
  {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      age: 30,
      gender: 'male',
      image: 'https://example.com/avatar1.jpg',
      company: {
          name: 'Acme Corp',
          title: 'Software Engineer',
          department: ''
      },
      address: {
          city: 'New York',
          address: '',
          postalCode: '',
          state: '',
          country: ''
      },
      phone: '',
      website: '',
      birthDate: '',
      bank: {
          cardExpire: '',
          cardNumber: '',
          cardType: '',
          currency: '',
          iban: ''
      }
  },
  {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'janesmith',
      email: 'jane.smith@company.com',
      age: 28,
      gender: 'female',
      image: '',
      company: {
          name: 'Tech Solutions',
          title: 'Product Manager',
          department: ''
      },
      address: {
          city: 'San Francisco',
          address: '',
          postalCode: '',
          state: '',
          country: ''
      },
      phone: '',
      website: '',
      birthDate: '',
      bank: {
          cardExpire: '',
          cardNumber: '',
          cardType: '',
          currency: '',
          iban: ''
      }
  }
];

describe('UserTable Component', () => {
  const mockOnSort = jest.fn();
  const defaultProps = {
    users: mockUsers,
    loading: false,
    onSort: mockOnSort,
    currentSort: {
      column: 'firstName' as keyof User,
      direction: 'asc' as const
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render table headers correctly', () => {
      render(<UserTable {...defaultProps} />);
      
      expect(screen.getByText(/Name/)).toBeInTheDocument();
      expect(screen.getByText(/Username/)).toBeInTheDocument();
      expect(screen.getByText(/Email/)).toBeInTheDocument();
      expect(screen.getByText(/Company/)).toBeInTheDocument();
      expect(screen.getByText(/Age/)).toBeInTheDocument();
      expect(screen.getByText(/City/)).toBeInTheDocument();
    });

    it('should render user data correctly', () => {
      render(<UserTable {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('@johndoe')).toBeInTheDocument();
      expect(screen.getByText('john.doe')).toBeInTheDocument();
      expect(screen.getByText('@example.com')).toBeInTheDocument();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('New York')).toBeInTheDocument();
    });

    it('should render user avatars', () => {
      render(<UserTable {...defaultProps} />);
      
      // Check for avatar initials
      expect(screen.getByText('JD')).toBeInTheDocument();
      expect(screen.getByText('JS')).toBeInTheDocument();
    });

    it('should render gender information', () => {
      render(<UserTable {...defaultProps} />);
      
      expect(screen.getByText('male')).toBeInTheDocument();
      expect(screen.getByText('female')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner when loading and no users', () => {
      render(<UserTable {...defaultProps} users={[]} loading={true} />);
      
      expect(screen.getByText('Loading users...')).toBeInTheDocument();
      expect(screen.getByRole('table')).not.toBeInTheDocument();
    });

    it('should show loading overlay when loading with existing users', () => {
      render(<UserTable {...defaultProps} loading={true} />);
      
      expect(screen.getByText('Loading more users...')).toBeInTheDocument();
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('should not show loading when not loading', () => {
      render(<UserTable {...defaultProps} />);
      
      expect(screen.queryByText('Loading users...')).not.toBeInTheDocument();
      expect(screen.queryByText('Loading more users...')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no users and not loading', () => {
      render(<UserTable {...defaultProps} users={[]} loading={false} />);
      
      expect(screen.getByText('No users found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search criteria or refresh the page.')).toBeInTheDocument();
      expect(screen.getByText('👤')).toBeInTheDocument();
    });

    it('should not show empty state when loading', () => {
      render(<UserTable {...defaultProps} users={[]} loading={true} />);
      
      expect(screen.queryByText('No users found')).not.toBeInTheDocument();
    });

    it('should not show empty state when users exist', () => {
      render(<UserTable {...defaultProps} />);
      
      expect(screen.queryByText('No users found')).not.toBeInTheDocument();
    });
  });

  describe('Sorting Functionality', () => {
    it('should call onSort when clicking sortable headers', async () => {
      const user = userEvent.setup();
      render(<UserTable {...defaultProps} />);
      
      const nameHeader = screen.getByText(/Name/).closest('th');
      await user.click(nameHeader!);
      
      expect(mockOnSort).toHaveBeenCalledWith('firstName', 'desc');
    });

    it('should show correct sort icons', () => {
      render(<UserTable {...defaultProps} />);
      
      // Current sort column should show up arrow (asc)
      expect(screen.getByText(/Name ↑/)).toBeInTheDocument();
      
      // Other columns should show neutral sort icon
      expect(screen.getByText(/Username ↕️/)).toBeInTheDocument();
    });

    it('should handle sort direction change', async () => {
      const user = userEvent.setup();
      const props = {
        ...defaultProps,
        currentSort: {
          column: 'email' as keyof User,
          direction: 'desc' as const
        }
      };
      
      render(<UserTable {...props} />);
      
      const emailHeader = screen.getByText(/Email/).closest('th');
      await user.click(emailHeader!);
      
      expect(mockOnSort).toHaveBeenCalledWith('email', 'asc');
    });

    it('should sort by company name', async () => {
      const user = userEvent.setup();
      render(<UserTable {...defaultProps} />);
      
      const companyHeader = screen.getByText(/Company/).closest('th');
      await user.click(companyHeader!);
      
      expect(mockOnSort).toHaveBeenCalledWith('company.name', 'asc');
    });

    it('should sort by city', async () => {
      const user = userEvent.setup();
      render(<UserTable {...defaultProps} />);
      
      const cityHeader = screen.getByText(/City/).closest('th');
      await user.click(cityHeader!);
      
      expect(mockOnSort).toHaveBeenCalledWith('address.city', 'asc');
    });
  });

  describe('Sort Icons', () => {
    it('should show up arrow for ascending sort', () => {
      const props = {
        ...defaultProps,
        currentSort: {
          column: 'firstName' as keyof User,
          direction: 'asc' as const
        }
      };
      
      render(<UserTable {...props} />);
      
      expect(screen.getByText(/Name ↑/)).toBeInTheDocument();
    });

    it('should show down arrow for descending sort', () => {
      const props = {
        ...defaultProps,
        currentSort: {
          column: 'firstName' as keyof User,
          direction: 'desc' as const
        }
      };
      
      render(<UserTable {...props} />);
      
      expect(screen.getByText(/Name ↓/)).toBeInTheDocument();
    });

    it('should show neutral icon for non-sorted columns', () => {
      render(<UserTable {...defaultProps} />);
      
      expect(screen.getByText(/Username ↕️/)).toBeInTheDocument();
      expect(screen.getByText(/Email ↕️/)).toBeInTheDocument();
    });
  });

  describe('Table Structure', () => {
    it('should have proper table structure', () => {
      render(<UserTable {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      const headers = screen.getAllByRole('columnheader');
      expect(headers).toHaveLength(7); // User, Name, Username, Email, Company, Age, City
      
      const rows = screen.getAllByRole('row');
      expect(rows).toHaveLength(3); // 1 header + 2 data rows
    });

    it('should have sortable class on clickable headers', () => {
      render(<UserTable {...defaultProps} />);
      
      const nameHeader = screen.getByText(/Name/).closest('th');
      expect(nameHeader).toHaveClass('sortable');
    });

    it('should render table wrapper and container', () => {
      const { container } = render(<UserTable {...defaultProps} />);
      
      expect(container.querySelector('.user-table-container')).toBeInTheDocument();
      expect(container.querySelector('.table-wrapper')).toBeInTheDocument();
    });
  });

  describe('User Data Formatting', () => {
    it('should format email correctly', () => {
      render(<UserTable {...defaultProps} />);
      
      // Check if email is split into name and domain
      expect(screen.getByText('john.doe')).toBeInTheDocument();
      expect(screen.getByText('@example.com')).toBeInTheDocument();
    });

    it('should format company information', () => {
      render(<UserTable {...defaultProps} />);
      
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    });

    it('should show user avatar with background color', () => {
      const { container } = render(<UserTable {...defaultProps} />);
      
      const avatarElements = container.querySelectorAll('.avatar-initials');
      expect(avatarElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper table structure for screen readers', () => {
      render(<UserTable {...defaultProps} />);
      
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();
      
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).toHaveLength(7);
    });

    it('should have alt text for avatar images', () => {
      const usersWithImages = [
        {
          ...mockUsers[0],
          image: 'https://example.com/avatar.jpg'
        }
      ];
      
      // Mock getUserAvatar to return image type
      const formatUtils = require('../../utils/formatting');
      formatUtils.getUserAvatar.mockReturnValue({
        type: 'image',
        value: 'https://example.com/avatar.jpg'
      });
      
      render(<UserTable {...defaultProps} users={usersWithImages} />);
      
      const avatarImage = screen.getByAltText('John Doe');
      expect(avatarImage).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty user array', () => {
      render(<UserTable {...defaultProps} users={[]} />);
      
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });

    it('should handle users with missing data', () => {
      const incompleteUser: User = {
        id: 3,
        firstName: 'Test',
        lastName: '',
        username: '',
        email: '',
        age: 0,
        gender: 'other',
        image: '',
        company: {
            name: '',
            title: '',
            department: ''
        },
        address: {
            city: '',
            address: '',
            postalCode: '',
            state: '',
            country: ''
        },
        phone: '',
        website: '',
        birthDate: '',
        bank: {
            cardExpire: '',
            cardNumber: '',
            cardType: '',
            currency: '',
            iban: ''
        }
      };
      
      render(<UserTable {...defaultProps} users={[incompleteUser]} />);
      
      expect(screen.getByText('Test ')).toBeInTheDocument(); // Name with empty lastName
    });

    it('should handle very long data gracefully', () => {
      const userWithLongData: User = {
        ...mockUsers[0],
        firstName: 'VeryLongFirstNameThatExceedsNormalLength',
        lastName: 'VeryLongLastNameThatExceedsNormalLength',
        company: {
            name: 'Very Long Company Name That Exceeds Normal Length',
            title: 'Very Long Job Title That Exceeds Normal Length',
            department: ''
        }
      };
      
      render(<UserTable {...defaultProps} users={[userWithLongData]} />);
      
      expect(screen.getByText('VeryLongFirstNameThatExceedsNormalLength VeryLongLastNameThatExceedsNormalLength')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently with many users', () => {
      const manyUsers = Array.from({ length: 100 }, (_, i) => ({
        ...mockUsers[0],
        id: i + 1,
        firstName: `User${i}`,
        email: `user${i}@example.com`
      }));
      
      const { container } = render(<UserTable {...defaultProps} users={manyUsers} />);
      
      const rows = container.querySelectorAll('tbody tr');
      expect(rows).toHaveLength(100);
    });
  });
});
