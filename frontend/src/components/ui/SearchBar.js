'use client';

import { useState, memo, useCallback } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useJobStore } from '@/store/useJobStore';
import { useRouter } from 'next/navigation';

function SearchBar({ size = 'default', showLocationFirst = false, glassEffect = false }) {
  const router = useRouter();
  const { 
    searchQuery, 
    location, 
    setSearchQuery, 
    setLocation 
  } = useJobStore();
  
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [localLocation, setLocalLocation] = useState(location);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    
    // Update store with search values
    setSearchQuery(localQuery);
    setLocation(localLocation);
    
    // Navigate to jobs page if not already there
    if (window.location.pathname !== '/jobs') {
      router.push('/jobs');
    }
  }, [localQuery, localLocation, setSearchQuery, setLocation, router]);
  
  const handleQuickSearch = useCallback((term) => {
    setLocalQuery(term);
    setSearchQuery(term);
    if (window.location.pathname !== '/jobs') {
      router.push('/jobs');
    }
  }, [setSearchQuery, router]);

  const sizeClasses = {
    small: 'py-2 text-sm',
    default: 'py-3',
    large: 'py-4 text-lg'
  };

  const containerClasses = {
    small: 'max-w-2xl',
    default: 'max-w-4xl',
    large: 'max-w-5xl'
  };

  return (
    <div className={`w-full ${containerClasses[size]} mx-auto`}>
      <form onSubmit={handleSearch} className="relative">
        <div 
          className={`flex flex-col md:flex-row rounded-xl shadow-2xl border overflow-hidden ${
            glassEffect ? 'backdrop-blur-xl' : ''
          }`} 
          style={{
            backgroundColor: glassEffect 
              ? 'rgba(var(--background-panel-rgb), 0.15)' 
              : 'var(--background-panel)',
            borderColor: glassEffect 
              ? 'rgba(var(--accent-interactive-rgb), 0.2)' 
              : 'var(--accent-subtle)',
            boxShadow: glassEffect 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(var(--accent-interactive-rgb), 0.1), inset 0 1px 0 rgba(var(--accent-interactive-rgb), 0.15)'
              : undefined
          }}
        >
          
          {/* Job Title/Keywords Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <input
              type="text"
              placeholder="Job title, keywords, or company"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className={`block w-full pl-10 pr-3 ${sizeClasses[size]} border-0 border-r focus:ring-0 focus:outline-none transition-all duration-200`}
              style={{
                borderColor: glassEffect 
                  ? 'rgba(var(--accent-subtle-rgb), 0.3)' 
                  : 'var(--accent-subtle)',
                backgroundColor: glassEffect 
                  ? 'rgba(var(--background-panel-rgb), 0.2)' 
                  : 'var(--background-panel)',
                color: 'var(--text-primary)',
                backdropFilter: glassEffect ? 'blur(10px)' : 'none'
              }}
            />
          </div>

          {/* Location Input */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
            </div>
            <input
              type="text"
              placeholder="City, state, or remote"
              value={localLocation}
              onChange={(e) => setLocalLocation(e.target.value)}
              className={`block w-full pl-10 pr-3 ${sizeClasses[size]} border-0 focus:ring-0 focus:outline-none transition-all duration-200`}
              style={{
                backgroundColor: glassEffect 
                  ? 'rgba(var(--background-panel-rgb), 0.2)' 
                  : 'var(--background-panel)',
                color: 'var(--text-primary)',
                backdropFilter: glassEffect ? 'blur(10px)' : 'none'
              }}
            />
          </div>

          {/* Search Button */}
          <div className="flex-shrink-0">
            <button
              type="submit"
              className={`w-full md:w-auto px-6 ${sizeClasses[size]} font-medium transition-all duration-200 focus:outline-none hover:opacity-90 hover:scale-[1.02]`}
              style={{
                backgroundColor: glassEffect 
                  ? 'var(--accent-interactive)' 
                  : 'var(--accent-interactive)',
                color: 'var(--background-deep)',
                boxShadow: glassEffect 
                  ? '0 8px 25px -8px rgba(var(--accent-interactive-rgb), 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                  : '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              Search Jobs
            </button>
          </div>
        </div>
      </form>

      {/* Quick Search Suggestions */}
      <div className={`mt-6 flex flex-wrap gap-3 justify-center items-center ${glassEffect ? 'backdrop-blur-sm' : ''}`}>
        <span 
          className="text-sm font-medium px-3 py-1 rounded-full" 
          style={{ 
            color: 'var(--text-secondary)',
            backgroundColor: glassEffect 
              ? 'rgba(var(--background-panel-rgb), 0.3)' 
              : 'transparent'
          }}
        >
          Popular searches:
        </span>
        {[
          'Frontend Developer',
          'Data Scientist',
          'Product Manager',
          'UX Designer',
          'Remote Jobs'
        ].map((term) => (
          <button
            key={term}
            onClick={() => handleQuickSearch(term)}
            className={`text-sm font-medium px-3 py-1 rounded-full transition-all duration-200 hover:scale-105 ${
              glassEffect ? 'backdrop-blur-sm border' : 'hover:underline'
            }`}
            style={{
              color: 'var(--accent-interactive)',
              backgroundColor: glassEffect 
                ? 'rgba(var(--accent-interactive-rgb), 0.1)' 
                : 'transparent',
              borderColor: glassEffect 
                ? 'rgba(var(--accent-interactive-rgb), 0.2)' 
                : 'transparent'
            }}
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(SearchBar);
