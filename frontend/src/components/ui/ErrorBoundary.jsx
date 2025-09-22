'use client';

import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

export function ErrorMessage({ 
  error, 
  onRetry = null, 
  title = 'Something went wrong',
  className = '' 
}) {
  return (
    <div className={`text-center p-6 ${className}`}>
      <AlertTriangle className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
      <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        {error || 'An unexpected error occurred. Please try again.'}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
}

export function ErrorPage({ 
  error, 
  onRetry = null, 
  title = 'Page Error',
  showHomeButton = true 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-deep)' }}>
      <div className="max-w-md w-full text-center p-6">
        <AlertTriangle className="h-16 w-16 mx-auto mb-6" style={{ color: 'var(--text-secondary)' }} />
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {error || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="space-y-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          )}
          {showHomeButton && (
            <a
              href="/"
              className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium border transition-opacity hover:opacity-90"
              style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function NetworkError({ onRetry = null }) {
  return (
    <ErrorMessage
      error="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      title="Network Error"
    />
  );
}

export function NotFoundError({ message = "The requested resource was not found.", onGoBack = null }) {
  return (
    <div className="text-center p-6">
      <div className="text-6xl font-bold mb-4" style={{ color: 'var(--text-secondary)' }}>
        404
      </div>
      <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
        Not Found
      </h3>
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        {message}
      </p>
      {onGoBack && (
        <button
          onClick={onGoBack}
          className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </button>
      )}
    </div>
  );
}

export function APIError({ error, onRetry = null }) {
  let title = 'API Error';
  let message = error?.message || 'An error occurred while communicating with the server.';
  
  switch (error?.type) {
    case 'NETWORK_ERROR':
      title = 'Network Error';
      message = 'Unable to connect to the server. Please check your internet connection.';
      break;
    case 'AUTHENTICATION_ERROR':
      title = 'Authentication Required';
      message = 'You need to log in to access this resource.';
      break;
    case 'AUTHORIZATION_ERROR':
      title = 'Access Denied';
      message = 'You do not have permission to access this resource.';
      break;
    case 'NOT_FOUND_ERROR':
      title = 'Not Found';
      message = 'The requested resource was not found.';
      break;
    case 'VALIDATION_ERROR':
      title = 'Invalid Data';
      message = 'Please check your input and try again.';
      break;
    case 'RATE_LIMIT_ERROR':
      title = 'Too Many Requests';
      message = 'Please wait a moment before trying again.';
      break;
    case 'SERVER_ERROR':
      title = 'Server Error';
      message = 'The server encountered an error. Please try again later.';
      break;
  }

  return (
    <ErrorMessage
      error={message}
      onRetry={onRetry}
      title={title}
    />
  );
}