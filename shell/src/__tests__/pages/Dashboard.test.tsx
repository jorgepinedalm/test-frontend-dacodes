import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from '../../pages/Dashboard';

describe('Dashboard', () => {
  it('should render main heading', () => {
    // Arrange & Act
    render(<Dashboard />);

    // Assert
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Welcome to Modular People Portal')).toBeInTheDocument();
  });

  it('should render author subtitle', () => {
    // Arrange & Act
    render(<Dashboard />);

    // Assert
    expect(screen.getByText('By Jorge Pineda Montagut')).toBeInTheDocument();
  });

  it('should render main description', () => {
    // Arrange & Act
    render(<Dashboard />);

    // Assert
    const description = screen.getByText(/A React TypeScript microfrontend application/i);
    expect(description).toBeInTheDocument();
    expect(description).toHaveTextContent(
      'A React TypeScript microfrontend application with authentication, user directory, and memory game functionality.'
    );
  });

  it('should render all feature cards', () => {
    // Arrange & Act
    render(<Dashboard />);

    // Assert
    expect(screen.getByText('🔐 Authentication')).toBeInTheDocument();
    expect(screen.getByText('👥 Directory')).toBeInTheDocument();
    expect(screen.getByText('🎮 Memory Game')).toBeInTheDocument();
  });

  describe('component structure and CSS classes', () => {
    it('should have correct main container CSS class', () => {
      // Arrange & Act
      const { container } = render(<Dashboard />);
      const mainDiv = container.firstChild as HTMLElement;

      // Assert
      expect(mainDiv).toHaveClass('dashboard-container');
    });

    it('should have correct content container CSS class', () => {
      // Arrange & Act
      const { container } = render(<Dashboard />);
      const contentDiv = container.querySelector('.dashboard-content');

      // Assert
      expect(contentDiv).toBeInTheDocument();
      expect(contentDiv).toHaveClass('dashboard-content');
    });

    it('should have features grid with correct CSS class', () => {
      // Arrange & Act
      const { container } = render(<Dashboard />);
      const featuresGrid = container.querySelector('.features-grid');

      // Assert
      expect(featuresGrid).toBeInTheDocument();
      expect(featuresGrid).toHaveClass('features-grid');
    });

    it('should have feature cards with correct CSS classes', () => {
      // Arrange & Act
      const { container } = render(<Dashboard />);
      const featureCards = container.querySelectorAll('.feature-card');

      // Assert
      expect(featureCards).toHaveLength(3);
      featureCards.forEach(card => {
        expect(card).toHaveClass('feature-card');
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper heading hierarchy', () => {
      // Arrange & Act
      render(<Dashboard />);

      // Assert
      const h1 = screen.getByRole('heading', { level: 1 });
      const h3s = screen.getAllByRole('heading', { level: 3 });
      
      expect(h1).toBeInTheDocument();
      expect(h3s).toHaveLength(3);
    });
  });
});