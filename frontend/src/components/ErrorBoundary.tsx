import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * HRM & PMS - Global Error Boundary Component
 * Project: Human Resource Management & Project Management System
 * 
 * Catches JavaScript errors in child component tree,
 * logs error information, and displays a fallback UI
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console
    console.error('🚨 Error Boundary caught an error:', error);
    console.error('📍 Error Info:', errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    this.logErrorToService(error, errorInfo);
  }

  /**
   * Log error to external service (placeholder for future integration)
   */
  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In production, you might want to send this to a service like:
    // - Sentry
    // - LogRocket
    // - Custom error tracking API
    // - Console logging service
    
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // For now, just log to console
    console.error('📊 Error Data for Service:', errorData);
  };

  /**
   * Reset error boundary state
   */
  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  /**
   * Render fallback UI when an error occurs
   */
  renderErrorFallback = () => {
    const { error, errorInfo } = this.state;
    
    // Custom fallback UI provided via props
    if (this.props.fallback) {
      return <>{this.props.fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
            Something went wrong
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 text-center mb-6">
            We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
          </p>

          {/* Error Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mb-6 p-4 bg-gray-50 rounded-lg">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                Error Details (Development Only)
              </summary>
              <div className="mt-2 text-xs text-gray-600">
                <div className="mb-2">
                  <strong>Error:</strong> {error.message}
                </div>
                {error.stack && (
                  <div className="mb-2">
                    <strong>Stack Trace:</strong>
                    <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo && errorInfo.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={this.resetErrorBoundary}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200 font-medium"
            >
              Reload Page
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition duration-200 font-medium"
            >
              Go to Homepage
            </button>
          </div>

          {/* Support Information */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-500">
              If this problem persists, please contact our support team
            </p>
            <div className="flex justify-center space-x-4 mt-2">
              <a
                href="mailto:support@hrm-pms.com"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                support@hrm-pms.com
              </a>
              <span className="text-gray-300">|</span>
              <a
                href="/help"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Help Center
              </a>
            </div>
          </div>

          {/* App Information */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">
              HRM & PMS v1.0.0 • Error ID: {this.generateErrorId()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Generate a unique error ID for tracking
   */
  generateErrorId = (): string => {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  render() {
    if (this.state.hasError) {
      return this.renderErrorFallback();
    }

    // When there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
