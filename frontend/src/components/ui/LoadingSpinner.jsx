'use client';

import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ 
  size = 'medium', 
  color = 'var(--accent-interactive)', 
  text = null,
  className = '' 
}) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
    xlarge: 'h-16 w-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 
        className={`${sizeClasses[size]} animate-spin`}
        style={{ color }}
      />
      {text && (
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {text}
        </p>
      )}
    </div>
  );
}

export function LoadingPage({ text = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-deep)' }}>
      <LoadingSpinner size="large" text={text} />
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="animate-pulse">
      <div className="rounded-lg p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
        <div className="space-y-4">
          <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
          <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
          <div className="space-y-2">
            <div className="h-3 rounded w-full" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
            <div className="h-3 rounded w-5/6" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingTable({ rows = 5, columns = 4 }) {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, colIndex) => (
            <div key={colIndex} className="h-4 rounded" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
          ))}
        </div>
      ))}
    </div>
  );
}