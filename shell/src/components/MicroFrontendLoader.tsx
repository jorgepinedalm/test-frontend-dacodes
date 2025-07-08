import React, { Suspense } from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MicroFrontend Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <div className="error-content">
            <h2>🚨 Something went wrong</h2>
            <p>Failed to load the micro-frontend application.</p>
            <button 
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface MicroFrontendLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const MicroFrontendLoader: React.FC<MicroFrontendLoaderProps> = ({ 
  children, 
  fallback = <LoadingSpinner message="Loading micro-frontend..." /> 
}) => {
  return (
    <div className="mfe-container">
      <ErrorBoundary>
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

export default MicroFrontendLoader;
export { LoadingSpinner };
