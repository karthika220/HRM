import React from 'react';

/**
 * HRM & PMS - Error Test Component
 * Component for testing the ErrorBoundary functionality
 */
const ErrorTest: React.FC = () => {
  const handleThrowError = () => {
    // This will trigger the ErrorBoundary
    throw new Error('This is a test error to demonstrate the ErrorBoundary component');
  };

  const handleAsyncError = async () => {
    // This won't be caught by ErrorBoundary (async errors need try-catch)
    try {
      throw new Error('This is an async error');
    } catch (error) {
      console.error('Async error caught:', error);
    }
  };

  const handleUndefinedError = () => {
    // This will trigger the ErrorBoundary
    const obj: any = undefined;
    obj.someProperty.someMethod(); // This will throw
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Error Boundary Test</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Error Scenarios</h2>
        <p className="text-gray-600 mb-6">
          Click the buttons below to test different error scenarios. The ErrorBoundary will catch these errors and show a friendly fallback UI.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={handleThrowError}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
          >
            Throw Synchronous Error
          </button>
          
          <button
            onClick={handleUndefinedError}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition duration-200"
          >
            Throw Undefined Error
          </button>
          
          <button
            onClick={handleAsyncError}
            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition duration-200"
          >
            Throw Async Error (with try-catch)
          </button>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Error Boundary Information</h3>
        <ul className="text-blue-700 space-y-2">
          <li>• Catches JavaScript errors in component tree</li>
          <li>• Shows user-friendly fallback UI</li>
          <li>• Logs error details to console</li>
          <li>• Provides recovery options</li>
          <li>• Works in development and production</li>
        </ul>
      </div>

      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-800 mb-3">Recovery Options</h3>
        <p className="text-green-700">
          When an error occurs, the ErrorBoundary provides several options to recover:
        </p>
        <ul className="text-green-700 mt-2 space-y-1">
          <li>• <strong>Try Again:</strong> Reset the error boundary and retry</li>
          <li>• <strong>Reload Page:</strong> Refresh the entire page</li>
          <li>• <strong>Go to Homepage:</strong> Navigate to the main page</li>
        </ul>
      </div>
    </div>
  );
};

export default ErrorTest;
