'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/store/useAuthStore';
import { fetchSavedSearches, deleteSavedSearch, toggleSearchAlert } from '@/services/mockApi';
import { 
  Search, 
  Bell, 
  BellOff, 
  Trash2, 
  Play, 
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  User,
  Settings,
  AlertCircle,
  Bookmark
} from 'lucide-react';
import Link from 'next/link';

export default function SavedSearches() {
  const { getUserId } = useAuth();
  const [savedSearches, setSavedSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSavedSearches();
  }, []);

  const loadSavedSearches = async () => {
    const userId = getUserId();
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const searches = await fetchSavedSearches(userId);
      setSavedSearches(searches);
    } catch (err) {
      setError('Failed to load saved searches');
      console.error('Error loading saved searches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSearch = async (searchId) => {
    if (!confirm('Are you sure you want to delete this saved search?')) {
      return;
    }

    try {
      const response = await deleteSavedSearch(searchId);
      if (response.success) {
        setSavedSearches(prev => prev.filter(search => search.id !== searchId));
      } else {
        alert('Failed to delete search. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting search:', error);
      alert('Failed to delete search. Please try again.');
    }
  };

  const handleToggleAlert = async (searchId, enabled) => {
    try {
      const response = await toggleSearchAlert(searchId, enabled);
      if (response.success) {
        setSavedSearches(prev => 
          prev.map(search => 
            search.id === searchId 
              ? { ...search, alertEnabled: enabled }
              : search
          )
        );
      } else {
        alert('Failed to update alert settings. Please try again.');
      }
    } catch (error) {
      console.error('Error updating alert:', error);
      alert('Failed to update alert settings. Please try again.');
    }
  };

  const formatSearchFilters = (filters) => {
    const parts = [];
    if (filters.search) parts.push(`"${filters.search}"`);
    if (filters.location) parts.push(`in ${filters.location}`);
    if (filters.type) parts.push(filters.type);
    if (filters.category) parts.push(filters.category);
    if (filters.salary) parts.push(`${filters.salary} salary`);
    if (filters.experience) parts.push(filters.experience);
    if (filters.remote) parts.push(filters.remote);
    
    return parts.join(' • ');
  };

  const buildSearchUrl = (filters) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'newest') {
        // Map filter keys to URL params
        const paramMap = {
          search: 'q',
          location: 'location',
          type: 'type',
          category: 'category',
          salary: 'salary',
          experience: 'experience',
          remote: 'remote'
        };
        
        const paramKey = paramMap[key] || key;
        params.set(paramKey, value);
      }
    });
    
    return `/jobs?${params.toString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="p-4 rounded-lg border animate-pulse" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="h-5 rounded mb-2 w-2/3" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
              <div className="h-3 rounded w-3/4" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
            </div>
            <div className="h-8 rounded w-16" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
          </div>
          <div className="flex justify-between items-center">
            <div className="h-3 rounded w-1/3" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
            <div className="flex space-x-2">
              <div className="h-8 rounded w-8" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
              <div className="h-8 rounded w-8" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Saved Searches
          </h2>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Saved Searches
          </h2>
        </div>
        <div className="text-center py-12 rounded-lg border" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
          <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            {error}
          </h3>
          <button
            onClick={loadSavedSearches}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Saved Searches
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Quick access to your favorite job searches
          </p>
        </div>
        {savedSearches.length > 0 && (
          <Link
            href="/jobs"
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
          >
            <Search className="h-4 w-4 mr-2" />
            New Search
          </Link>
        )}
      </div>

      {savedSearches.length === 0 ? (
        <div className="text-center py-12 rounded-lg border" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
          <Bookmark className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            No saved searches yet
          </h3>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Save your job searches to quickly access them later and get notified about new matches.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
          >
            <Search className="h-4 w-4 mr-2" />
            Start Searching
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {savedSearches.map((search) => (
            <div 
              key={search.id}
              className="p-6 rounded-lg border transition-shadow hover:shadow-md"
              style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {search.name}
                  </h3>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {formatSearchFilters(search.filters) || 'All jobs'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleAlert(search.id, !search.alertEnabled)}
                    className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: 'var(--background-deep)' }}
                    title={search.alertEnabled ? 'Disable email alerts' : 'Enable email alerts'}
                  >
                    {search.alertEnabled ? (
                      <Bell className="h-4 w-4" style={{ color: 'var(--accent-interactive)' }} />
                    ) : (
                      <BellOff className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                    )}
                  </button>
                  
                  <button
                    onClick={() => handleDeleteSearch(search.id)}
                    className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: 'var(--background-deep)' }}
                    title="Delete this search"
                  >
                    <Trash2 className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                  </button>
                </div>
              </div>

              {/* Search Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created {formatDate(search.createdAt)}</span>
                  </div>
                  {search.lastNotified && (
                    <div className="flex items-center space-x-1">
                      <Bell className="h-3 w-3" />
                      <span>Last alert {formatDate(search.lastNotified)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Alert Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {search.alertEnabled ? (
                    <>
                      <Bell className="h-3 w-3" style={{ color: 'var(--accent-interactive)' }} />
                      <span className="text-xs" style={{ color: 'var(--accent-interactive)' }}>
                        Email alerts enabled
                      </span>
                    </>
                  ) : (
                    <>
                      <BellOff className="h-3 w-3" style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        No alerts
                      </span>
                    </>
                  )}
                </div>

                <Link
                  href={buildSearchUrl(search.filters)}
                  className="inline-flex items-center px-3 py-1 rounded text-xs font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Run Search
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}