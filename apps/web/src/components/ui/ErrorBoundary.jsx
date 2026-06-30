// apps/web/src/components/ui/ErrorBoundary.jsx

import { Component } from 'react';
import Button from './Button';

/**
 * Error boundary component that catches JavaScript errors anywhere
 * in the child component tree and displays a custom fallback UI.
 * Prevents the entire app from crashing when a single component fails.
 * Never shows browser-default error overlays.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Update state when an error is caught so the next render
   * shows the fallback UI.
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Log error details for debugging.
   * In production, this would send to an error monitoring service.
   */
  componentDidCatch(error, errorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  /**
   * Reset the error state and attempt to re-render children.
   */
  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI - never uses browser default error display
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            {/* Error icon */}
            <span className="error-boundary__icon" aria-hidden="true">
              ⚠️
            </span>

            {/* Error title */}
            <h2 className="error-boundary__title">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h2>

            {/* Error description */}
            <p className="error-boundary__description">
              {this.props.fallbackMessage ||
                'An unexpected error occurred. Please try again.'}
            </p>

            {/* Error details shown only in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-boundary__details">
                <summary>Error details</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}

            {/* Retry button */}
            <Button
              variant="primary"
              onClick={this.handleRetry}
              className="error-boundary__action"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    // No error - render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;