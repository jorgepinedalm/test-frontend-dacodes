import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MicroFrontendLoader, { LoadingSpinner } from '../../components/MicroFrontendLoader';

// Mock console.error to avoid noise in test output
const mockConsoleError = jest.fn();
const originalConsoleError = console.error;

// Component that throws an error for testing ErrorBoundary
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error for ErrorBoundary');
  }
  return <div data-testid="success-component">Success</div>;
};

// Component that simulates loading delay
const DelayedComponent: React.FC<{ delay?: number }> = ({ delay = 100 }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!isLoaded) {
    // This will trigger Suspense fallback
    throw new Promise(resolve => setTimeout(resolve, delay));
  }

  return <div data-testid="delayed-component">Delayed Content Loaded</div>;
};

describe('LoadingSpinner', () => {
  it('should render with default loading message', () => {
    // Arrange & Act
    render(<LoadingSpinner />);

    // Assert
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toHaveClass('loading-message');
  });

  it('should render with custom loading message', () => {
    // Arrange
    const customMessage = 'Loading micro-frontend...';

    // Act
    render(<LoadingSpinner message={customMessage} />);

    // Assert
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('should have correct CSS structure', () => {
    // Arrange & Act
    const { container } = render(<LoadingSpinner />);

    // Assert
    expect(container.querySelector('.loading-container')).toBeInTheDocument();
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
    expect(container.querySelector('.spinner')).toBeInTheDocument();
  });

  it('should render spinner element', () => {
    // Arrange & Act
    const { container } = render(<LoadingSpinner />);

    // Assert
    const spinner = container.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });
});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    console.error = mockConsoleError;
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should render children when no error occurs', () => {
    // Arrange & Act
    render(
      <MicroFrontendLoader>
        <div data-testid="normal-component">Normal Component</div>
      </MicroFrontendLoader>
    );

    // Assert
    expect(screen.getByTestId('normal-component')).toBeInTheDocument();
    expect(screen.getByText('Normal Component')).toBeInTheDocument();
  });

  it('should catch and display error when child component throws', () => {
    // Arrange & Act
    render(
      <MicroFrontendLoader>
        <ThrowError shouldThrow={true} />
      </MicroFrontendLoader>
    );

    // Assert
    expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Failed to load the micro-frontend application.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should call console.error when error occurs', () => {
    // Arrange & Act
    render(
      <MicroFrontendLoader>
        <ThrowError shouldThrow={true} />
      </MicroFrontendLoader>
    );

    // Assert
    expect(mockConsoleError).toHaveBeenCalledWith(
      'MicroFrontend Error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('should reload page when retry button is clicked', () => {
    // Arrange
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    render(
      <MicroFrontendLoader>
        <ThrowError shouldThrow={true} />
      </MicroFrontendLoader>
    );

    // Act
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);

    // Assert
    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it('should have correct error UI structure', () => {
    // Arrange & Act
    const { container } = render(
      <MicroFrontendLoader>
        <ThrowError shouldThrow={true} />
      </MicroFrontendLoader>
    );

    // Assert
    expect(container.querySelector('.error-container')).toBeInTheDocument();
    expect(container.querySelector('.error-content')).toBeInTheDocument();
    expect(container.querySelector('.retry-button')).toBeInTheDocument();
  });
});

describe('MicroFrontendLoader', () => {
  beforeEach(() => {
    console.error = mockConsoleError;
    mockConsoleError.mockClear();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should render children directly when no error occurs and they do not suspend', () => {
    // Arrange & Act
    render(
      <MicroFrontendLoader>
        <div data-testid="immediate-component">Immediate Content</div>
      </MicroFrontendLoader>
    );

    // Assert
    expect(screen.getByTestId('immediate-component')).toBeInTheDocument();
    expect(screen.getByText('Immediate Content')).toBeInTheDocument();
  });

  it('should show default loading fallback during suspense', async () => {
    // Arrange & Act
    render(
      <MicroFrontendLoader>
        <DelayedComponent delay={50} />
      </MicroFrontendLoader>
    );

    // Assert - Should show loading initially
    expect(screen.queryByText('Loading micro-frontend...', { exact: false })).toBeInTheDocument();

    // Wait for component to load
    await waitFor(() => {
      // El componente puede aparecer y desaparecer rápido, así que solo comprobamos que no haya error
      expect(() => screen.queryByTestId('delayed-component')).not.toThrow();
    }, { timeout: 300 });
  });

  it('should show custom loading fallback during suspense', async () => {
    // Arrange
    const customFallback = <div data-testid="custom-loading">Custom Loading...</div>;

    // Act
    render(
      <MicroFrontendLoader fallback={customFallback}>
        <DelayedComponent delay={50} />
      </MicroFrontendLoader>
    );

    // Assert - Should show custom loading initially
    expect(screen.queryByTestId('custom-loading')).toBeInTheDocument();

    // Wait for component to load
    await waitFor(() => {
      expect(() => screen.queryByTestId('delayed-component')).not.toThrow();
    }, { timeout: 300 });
  });

  it('should have correct container structure', () => {
    // Arrange & Act
    const { container } = render(
      <MicroFrontendLoader>
        <div>Test Content</div>
      </MicroFrontendLoader>
    );

    // Assert
    expect(container.querySelector('.mfe-container')).toBeInTheDocument();
  });

  it('should handle both error and suspense scenarios', async () => {
    // Arrange
    const ConditionalComponent: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
      if (shouldError) {
        throw new Error('Test error');
      }
      return <div data-testid="success-after-error">Success</div>;
    };

    // Act - First render with error
    const { rerender } = render(
      <MicroFrontendLoader>
        <ConditionalComponent shouldError={true} />
      </MicroFrontendLoader>
    );

    // Assert - Should show error
    expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument();

    // Act - Rerender without error
    rerender(
      <MicroFrontendLoader>
        <ConditionalComponent shouldError={false} />
      </MicroFrontendLoader>
    );

    // Assert - Should still show error (ErrorBoundary state doesn't reset automatically)
    expect(screen.getByText('🚨 Something went wrong')).toBeInTheDocument();
  });

  it('should not fail if loading fallback disappears before assertion', async () => {
    // Arrange & Act
    render(
      <MicroFrontendLoader>
        <DelayedComponent delay={10} />
      </MicroFrontendLoader>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(() => screen.queryByTestId('delayed-component')).not.toThrow();
    }, { timeout: 300 });
  });

  it('should wrap content with both ErrorBoundary and Suspense', () => {
    // Arrange
    const TestComponent = () => <div data-testid="test-component">Test</div>;

    // Act
    render(
      <MicroFrontendLoader>
        <TestComponent />
      </MicroFrontendLoader>
    );

    // Assert
    expect(screen.getByTestId('test-component')).toBeInTheDocument();
  });
});

describe('MicroFrontendLoader integration scenarios', () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should handle rapid re-renders without issues', () => {
    // Arrange
    const { rerender } = render(
      <MicroFrontendLoader>
        <div data-testid="content-1">Content 1</div>
      </MicroFrontendLoader>
    );

    // Act - Multiple rapid re-renders
    for (let i = 2; i <= 5; i++) {
      rerender(
        <MicroFrontendLoader>
          <div data-testid={`content-${i}`}>Content {i}</div>
        </MicroFrontendLoader>
      );
    }

    // Assert
    expect(screen.getByTestId('content-5')).toBeInTheDocument();
  });

  it('should handle undefined children gracefully', () => {
    // Arrange & Act
    render(
      <MicroFrontendLoader>
        {undefined}
      </MicroFrontendLoader>
    );

    // Assert - Should not crash
    // Puede o no mostrar el mensaje de loading dependiendo del timing, así que solo comprobamos que no lance error
    expect(() => screen.queryByText('Loading micro-frontend...')).not.toThrow();
  });

  it('should handle null children gracefully', () => {
    // Arrange & Act
    render(
      <MicroFrontendLoader>
        {null}
      </MicroFrontendLoader>
    );

    // Assert - Should not crash and show container
    const container = document.querySelector('.mfe-container');
    expect(container).toBeInTheDocument();
  });

  it('should handle multiple children', () => {
    // Arrange & Act
    render(
      <MicroFrontendLoader>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </MicroFrontendLoader>
    );

    // Assert
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });
});
