'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/ui/SearchBar';
import JobCard from '@/components/ui/JobCard';
import FilterSidebar from '@/components/ui/FilterSidebar';
import SortDropdown from '@/components/ui/SortDropdown';
import API from '@/services/api';
import authService from '@/services/authService';
import { useJobStore } from '@/store/useJobStore';
import { Filter, X, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import SaveSearchModal from '@/components/ui/SaveSearchModal';

export default function JobsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);
  const {
    jobs,
    totalJobs,
    currentPage,
    loading,
    error,
    setJobs,
    setTotalJobs,
    setLoading,
    setError,
    setCurrentPage,
    getFilters,
    hasActiveFilters,
    clearFilters
  } = useJobStore();

  // Initialize authentication
  useEffect(() => {
    const initAuth = async () => {
      await authService.waitForInitialization();
      setIsAuthenticated(authService.isAuthenticated());
    };
    initAuth();
  }, []);

  // Load jobs when filters change
  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const filters = getFilters();
        const response = await API.jobs.getAll({
          ...filters,
          page: currentPage,
          limit: 10
        });
        
        setJobs(response.jobs);
        setTotalJobs(response.total);
      } catch (err) {
        setError('Failed to load jobs');
        console.error('Error loading jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [
    currentPage,
    setJobs,
    setTotalJobs,
    setLoading,
    setError,
    getFilters
  ]);

  const totalPages = Math.ceil(totalJobs / 10);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSearch = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const currentUrl = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentUrl)}`;
      return;
    }
    setShowSaveSearchModal(true);
  };

  const handleSaveSearchSuccess = (savedSearch) => {
    setShowSaveSearchModal(false);
    // Could add a toast notification here
    console.log('Search saved successfully:', savedSearch);
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="rounded-lg p-6 animate-pulse" style={{ backgroundColor: 'var(--background-panel)' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="h-6 rounded mb-2 w-2/3" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
              <div className="h-4 rounded mb-2 w-1/3" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
            </div>
            <div className="h-6 rounded w-16" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
            <div className="h-4 rounded w-1/2" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
            <div className="h-4 rounded w-2/3" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
            <div className="h-4 rounded w-1/3" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 rounded w-full" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
            <div className="h-3 rounded w-5/6" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
          </div>
        </div>
      ))}
    </div>
  );

  const Pagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6 mt-8" style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-panel)' }}>
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            className="relative inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-panel)', color: 'var(--text-secondary)' }}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="relative ml-3 inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-panel)', color: 'var(--text-secondary)' }}
          >
            Next
          </button>
        </div>
        
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Showing <span className="font-medium">{Math.min((currentPage - 1) * 10 + 1, totalJobs)}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * 10, totalJobs)}</span> of{' '}
              <span className="font-medium">{totalJobs}</span> results
            </p>
          </div>
          
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!hasPrevPage}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 ring-1 ring-inset hover:opacity-80 transition-opacity focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--accent-subtle)' }}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {getPageNumbers().map((pageNum, index) => (
                pageNum === '...' ? (
                  <span key={index} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset" style={{ color: 'var(--text-secondary)', borderColor: 'var(--accent-subtle)' }}>
                    ...
                  </span>
                ) : (
                  <button
                    key={index}
                    onClick={() => handlePageChange(pageNum as number)}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset hover:opacity-80 transition-opacity focus:z-20 focus:outline-offset-0"
                    style={{
                      borderColor: 'var(--accent-subtle)',
                      backgroundColor: currentPage === pageNum ? 'var(--accent-interactive)' : 'transparent',
                      color: currentPage === pageNum ? 'var(--background-deep)' : 'var(--text-primary)'
                    }}
                  >
                    {pageNum}
                  </button>
                )
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 ring-1 ring-inset hover:opacity-80 transition-opacity focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'var(--text-secondary)', borderColor: 'var(--accent-subtle)' }}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background-deep)' }}>
        {/* Search Header */}
        <div className="border-b" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <SearchBar size="default" />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block lg:w-1/4">
              <div className="sticky top-8">
                <FilterSidebar isOpen={true} onClose={() => {}} showMobileHeader={false} />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {totalJobs > 0 ? `${totalJobs} Jobs Found` : 'Job Search'}
                  </h1>
                  {hasActiveFilters() && (
                    <div className="flex items-center mt-2 gap-2">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active filters:</span>
                      <button
                        onClick={clearFilters}
                        className="text-sm underline hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--accent-interactive)' }}
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Save Search Button */}
                  {totalJobs > 0 && (
                    <button
                      onClick={handleSaveSearch}
                      className="hidden sm:flex items-center px-4 py-2 border rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
                      style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-panel)', color: 'var(--text-secondary)' }}
                      title={isAuthenticated ? 'Save this search' : 'Login to save searches'}
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save Search
                    </button>
                  )}
                  
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setIsMobileFilterOpen(true)}
                    className="lg:hidden flex items-center px-4 py-2 border rounded-lg text-sm font-medium hover:opacity-80 transition-opacity flex-1 sm:flex-initial"
                    style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-panel)', color: 'var(--text-secondary)' }}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {hasActiveFilters() && (
                      <span className="ml-2 text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}>
                        •
                      </span>
                    )}
                  </button>

                  {/* Sort Dropdown */}
                  <SortDropdown />
                </div>
              </div>

              {/* Error State */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Job Results */}
              {loading ? (
                <LoadingSkeleton />
              ) : jobs.length === 0 ? (
                <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <div className="mb-4">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                      <Filter className="h-8 w-8" style={{ color: 'var(--text-secondary)' }} />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    No jobs found
                  </h3>
                  <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                    Try adjusting your search criteria or filters.
                  </p>
                  {hasActiveFilters() && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm transition-opacity hover:opacity-90"
                      style={{ color: 'var(--background-deep)', backgroundColor: 'var(--accent-interactive)' }}
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              <Pagination />
            </div>
          </div>
        </div>

        {/* Mobile Filter Modal */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMobileFilterOpen(false)} />
            <div className="fixed inset-y-0 left-0 w-full max-w-sm shadow-xl" style={{ backgroundColor: 'var(--background-panel)' }}>
              <FilterSidebar
                isOpen={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                showMobileHeader={true}
              />
            </div>
          </div>
        )}

        {/* Save Search Modal */}
        <SaveSearchModal
          isOpen={showSaveSearchModal}
          onClose={() => setShowSaveSearchModal(false)}
          onSuccess={handleSaveSearchSuccess}
        />
      </div>
    </MainLayout>
  );
}