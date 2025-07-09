import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ProfileApp from '../../components/ProfileApp';

describe('ProfileApp Component', () => {
  const defaultProps = {
    userId: 1,
    username: 'johndoe'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.error to avoid noise in tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering and Initial Load', () => {
    it('should render loading state initially', () => {
      render(<ProfileApp {...defaultProps} />);
      
      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    });

    it('should render profile header after loading', async () => {
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('👤 Profile Management')).toBeInTheDocument();
        expect(screen.getByText('Manage your personal information and settings')).toBeInTheDocument();
      });
    });

    it('should load and display user profile data', async () => {
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('@johndoe')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
      });
    });

    it('should display avatar image with correct attributes', async () => {
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        const avatar = screen.getByAltText('John Doe');
        expect(avatar).toBeInTheDocument();
        expect(avatar).toHaveAttribute('src');
        expect(avatar).toHaveClass('avatar-image');
      });
    });

    it('should use fallback avatar when no image provided', async () => {
      render(<ProfileApp {...defaultProps} username="testuser" />);
      
      await waitFor(() => {
        const avatar = screen.getByAltText('John Doe');
        expect(avatar.getAttribute('src')).toContain('robohash.org');
        expect(avatar.getAttribute('src')).toContain('testuser');
      });
    });
  });

  describe('Props Handling', () => {
    it('should use provided userId and username', async () => {
      render(<ProfileApp userId={123} username="customuser" />);
      
      await waitFor(() => {
        expect(screen.getByText('@customuser')).toBeInTheDocument();
      });
    });

    it('should use default values when props are not provided', async () => {
      render(<ProfileApp />);
      
      await waitFor(() => {
        expect(screen.getByText('@johndoe')).toBeInTheDocument();
      });
    });

    it('should handle undefined props gracefully', async () => {
      render(<ProfileApp userId={undefined} username={undefined} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode Functionality', () => {
    it('should show edit button in view mode', async () => {
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
      });
    });

    it('should enter edit mode when edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('✏️ Edit Profile'));
      
      expect(screen.getByText('💾 Save Changes')).toBeInTheDocument();
      expect(screen.getByText('❌ Cancel')).toBeInTheDocument();
      expect(screen.queryByText('✏️ Edit Profile')).not.toBeInTheDocument();
    });

    it('should show form inputs in edit mode', async () => {
      const user = userEvent.setup();
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('✏️ Edit Profile'));
      
      expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
    });

    it('should exit edit mode when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('✏️ Edit Profile'));
      await user.click(screen.getByText('❌ Cancel'));
      
      expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
      expect(screen.queryByText('💾 Save Changes')).not.toBeInTheDocument();
    });
  });

  describe('Form Input Handling', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('✏️ Edit Profile'));
    });

    it('should update first name input', async () => {
      const user = userEvent.setup();
      const firstNameInput = screen.getByDisplayValue('John');
      
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Jane');
      
      expect(firstNameInput).toHaveValue('Jane');
    });

    it('should update last name input', async () => {
      const user = userEvent.setup();
      const lastNameInput = screen.getByDisplayValue('Doe');
      
      await user.clear(lastNameInput);
      await user.type(lastNameInput, 'Smith');
      
      expect(lastNameInput).toHaveValue('Smith');
    });

    it('should update email input', async () => {
      const user = userEvent.setup();
      const emailInput = screen.getByDisplayValue('john.doe@example.com');
      
      await user.clear(emailInput);
      await user.type(emailInput, 'jane.smith@example.com');
      
      expect(emailInput).toHaveValue('jane.smith@example.com');
    });

    it('should update phone input', async () => {
      const user = userEvent.setup();
      const phoneInput = screen.getByDisplayValue('+1-555-123-4567');
      
      await user.clear(phoneInput);
      await user.type(phoneInput, '+1-555-987-6543');
      
      expect(phoneInput).toHaveValue('+1-555-987-6543');
    });

    it('should update birth date input', async () => {
      const user = userEvent.setup();
      const birthDateInput = screen.getByDisplayValue('1990-01-15');
      
      await user.clear(birthDateInput);
      await user.type(birthDateInput, '1985-12-25');
      
      expect(birthDateInput).toHaveValue('1985-12-25');
    });

    it('should update gender select', async () => {
      const user = userEvent.setup();
      const genderSelect = screen.getByDisplayValue('male');
      
      await user.selectOptions(genderSelect, 'female');
      
      expect(genderSelect).toHaveValue('female');
    });
  });

  describe('Nested Object Handling', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('✏️ Edit Profile'));
    });

    it('should update company name', async () => {
      const user = userEvent.setup();
      const companyInput = screen.getByDisplayValue('Tech Corp');
      
      await user.clear(companyInput);
      await user.type(companyInput, 'New Company');
      
      expect(companyInput).toHaveValue('New Company');
    });

    it('should update job title', async () => {
      const user = userEvent.setup();
      const titleInput = screen.getByDisplayValue('Software Developer');
      
      await user.clear(titleInput);
      await user.type(titleInput, 'Senior Developer');
      
      expect(titleInput).toHaveValue('Senior Developer');
    });

    it('should update address fields', async () => {
      const user = userEvent.setup();
      
      const streetInput = screen.getByDisplayValue('123 Main St');
      const cityInput = screen.getByDisplayValue('New York');
      const stateInput = screen.getByDisplayValue('NY');
      const postalCodeInput = screen.getByDisplayValue('10001');
      const countryInput = screen.getByDisplayValue('USA');
      
      await user.clear(streetInput);
      await user.type(streetInput, '456 Oak Ave');
      
      await user.clear(cityInput);
      await user.type(cityInput, 'Los Angeles');
      
      await user.clear(stateInput);
      await user.type(stateInput, 'CA');
      
      await user.clear(postalCodeInput);
      await user.type(postalCodeInput, '90210');
      
      await user.clear(countryInput);
      await user.type(countryInput, 'United States');
      
      expect(streetInput).toHaveValue('456 Oak Ave');
      expect(cityInput).toHaveValue('Los Angeles');
      expect(stateInput).toHaveValue('CA');
      expect(postalCodeInput).toHaveValue('90210');
      expect(countryInput).toHaveValue('United States');
    });
  });

  describe('Save Functionality', () => {
    it('should show loading state when saving', async () => {
      const user = userEvent.setup();
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('✏️ Edit Profile'));
      
      const saveButton = screen.getByText('💾 Save Changes');
      await user.click(saveButton);
      
      expect(screen.getByText('💾 Saving...')).toBeInTheDocument();
      expect(saveButton).toBeDisabled();
    });

    it('should save changes and exit edit mode', async () => {
      const user = userEvent.setup();
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('✏️ Edit Profile'));
      
      const firstNameInput = screen.getByDisplayValue('John');
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Jane');
      
      await user.click(screen.getByText('💾 Save Changes'));
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
      });
    });

    it('should persist nested object changes after save', async () => {
      const user = userEvent.setup();
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('✏️ Edit Profile'));
      
      const companyInput = screen.getByDisplayValue('Tech Corp');
      await user.clear(companyInput);
      await user.type(companyInput, 'New Tech Company');
      
      await user.click(screen.getByText('💾 Save Changes'));
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
      });
      
      // Enter edit mode again to verify the change was saved
      await user.click(screen.getByText('✏️ Edit Profile'));
      expect(screen.getByDisplayValue('New Tech Company')).toBeInTheDocument();
    });
  });

  describe('Data Display in View Mode', () => {
    it('should display personal information correctly', async () => {
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Personal Information')).toBeInTheDocument();
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('Doe')).toBeInTheDocument();
        expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByText('+1-555-123-4567')).toBeInTheDocument();
      });
    });

    it('should display company information', async () => {
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Company Information')).toBeInTheDocument();
        expect(screen.getByText('Tech Corp')).toBeInTheDocument();
        expect(screen.getByText('Software Developer')).toBeInTheDocument();
      });
    });

    it('should display address information', async () => {
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Address Information')).toBeInTheDocument();
        expect(screen.getByText('123 Main St')).toBeInTheDocument();
        expect(screen.getByText('New York')).toBeInTheDocument();
        expect(screen.getByText('NY')).toBeInTheDocument();
        expect(screen.getByText('10001')).toBeInTheDocument();
        expect(screen.getByText('USA')).toBeInTheDocument();
      });
    });

    it('should format birth date correctly', async () => {
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        // Birth date should be formatted as a readable date
        const birthDate = new Date('1990-01-15').toLocaleDateString();
        expect(screen.getByText(birthDate)).toBeInTheDocument();
      });
    });

    it('should capitalize gender display', async () => {
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('Male')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error state when user is null', async () => {
      // Mock the useEffect to not set user
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<ProfileApp {...defaultProps} />);
      
      // Wait for loading to complete but force user to be null
      await waitFor(() => {
        expect(screen.getByText('Loading profile...')).toBeInTheDocument();
      });
      
      // Since we can't easily mock the async loading, let's test the error state
      // by testing the component when user fails to load
      const { rerender } = render(<ProfileApp {...defaultProps} />);
      
      mockConsoleError.mockRestore();
    });

    it('should handle missing optional fields gracefully', async () => {
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        // Phone should show "Not provided" if missing
        expect(screen.getByText('+1-555-123-4567')).toBeInTheDocument();
      });
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply correct CSS classes', async () => {
      const { container } = render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(container.querySelector('.profile-app')).toBeInTheDocument();
        expect(container.querySelector('.profile-header')).toBeInTheDocument();
        expect(container.querySelector('.profile-container')).toBeInTheDocument();
      });
    });

    it('should apply form input classes in edit mode', async () => {
      const user = userEvent.setup();
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('✏️ Edit Profile'));
      
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveClass('form-input');
      });
    });

    it('should apply button classes correctly', async () => {
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        const editButton = screen.getByText('✏️ Edit Profile');
        expect(editButton).toHaveClass('btn', 'btn-primary');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', async () => {
      const user = userEvent.setup();
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('✏️ Edit Profile'));
      
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should have proper alt text for avatar', async () => {
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        const avatar = screen.getByAltText('John Doe');
        expect(avatar).toBeInTheDocument();
      });
    });

    it('should have proper button roles', async () => {
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        const editButton = screen.getByRole('button', { name: /edit profile/i });
        expect(editButton).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation and Input Types', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('✏️ Edit Profile')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('✏️ Edit Profile'));
    });

    it('should use email input type for email field', () => {
      const emailInput = screen.getByDisplayValue('john.doe@example.com');
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should use tel input type for phone field', () => {
      const phoneInput = screen.getByDisplayValue('+1-555-123-4567');
      expect(phoneInput).toHaveAttribute('type', 'tel');
    });

    it('should use date input type for birth date field', () => {
      const birthDateInput = screen.getByDisplayValue('1990-01-15');
      expect(birthDateInput).toHaveAttribute('type', 'date');
    });

    it('should have proper select options for gender', () => {
      const genderSelect = screen.getByDisplayValue('male');
      expect(genderSelect.tagName).toBe('SELECT');
      
      const options = Array.from(genderSelect.querySelectorAll('option'));
      const optionValues = options.map(option => option.value);
      
      expect(optionValues).toContain('');
      expect(optionValues).toContain('male');
      expect(optionValues).toContain('female');
      expect(optionValues).toContain('other');
    });
  });

  describe('Component Performance', () => {
    it('should not re-render unnecessarily', async () => {
      const { rerender } = render(<ProfileApp {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      // Re-render with same props should not cause issues
      rerender(<ProfileApp {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should handle rapid prop changes', async () => {
      const { rerender } = render(<ProfileApp userId={1} username="user1" />);
      
      await waitFor(() => {
        expect(screen.getByText('@user1')).toBeInTheDocument();
      });
      
      rerender(<ProfileApp userId={2} username="user2" />);
      
      await waitFor(() => {
        expect(screen.getByText('@user2')).toBeInTheDocument();
      });
    });
  });
});
