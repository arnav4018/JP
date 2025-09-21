'use client';

import { useJobStore } from '@/store/useJobStore';
import { X, Filter } from 'lucide-react';

export default function FilterSidebar({ isOpen, onClose, showMobileHeader = true }) {
  const {
    jobType,
    salaryRange,
    experienceLevel,
    category,
    remoteType,
    filterOptions,
    setJobType,
    setSalaryRange,
    setExperienceLevel,
    setCategory,
    setRemoteType,
    clearFilters,
    hasActiveFilters
  } = useJobStore();

  const handleFilterChange = (filterType, value) => {
    const setters = {
      jobType: setJobType,
      salaryRange: setSalaryRange,
      experienceLevel: setExperienceLevel,
      category: setCategory,
      remoteType: setRemoteType
    };
    
    const currentValue = {
      jobType,
      salaryRange,
      experienceLevel,
      category,
      remoteType
    }[filterType];
    
    // Toggle filter - if same value is clicked, clear it
    const newValue = currentValue === value ? '' : value;
    setters[filterType](newValue);
  };

  const FilterSection = ({ title, options, currentValue, filterType }) => (
    <div className="mb-6">
      <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name={filterType}
              value={option}
              checked={currentValue === option}
              onChange={() => handleFilterChange(filterType, option)}
              className="h-4 w-4"
              style={{ accentColor: 'var(--accent-interactive)' }}
            />
            <span className="ml-3 text-sm group-hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`${isOpen ? 'block' : 'hidden lg:block'} lg:sticky lg:top-20`} style={{ backgroundColor: 'var(--background-panel)' }}>
      {/* Mobile Header */}
      {showMobileHeader && (
        <div className="lg:hidden flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--accent-subtle)' }}>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-opacity hover:opacity-80"
            style={{ backgroundColor: 'var(--accent-subtle)' }}
          >
            <X className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      )}

      <div className="p-6 lg:p-0">
        {/* Header with Clear Filters */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Filters</h2>
          </div>
          {hasActiveFilters() && (
            <button
              onClick={clearFilters}
              className="text-sm transition-opacity hover:opacity-80"
              style={{ color: 'var(--accent-interactive)' }}
            >
              Clear all
            </button>
          )}
        </div>

        {/* Mobile Clear Filters */}
        {hasActiveFilters() && (
          <div className="lg:hidden mb-4">
            <button
              onClick={clearFilters}
              className="w-full py-2 px-4 border rounded-lg transition-opacity hover:opacity-80 text-sm"
              style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)', backgroundColor: 'var(--background-deep)' }}
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Filter Sections */}
        <div className="space-y-6">
          <FilterSection
            title="Job Type"
            options={filterOptions.jobTypes}
            currentValue={jobType}
            filterType="jobType"
          />

          <FilterSection
            title="Category"
            options={filterOptions.categories}
            currentValue={category}
            filterType="category"
          />

          <FilterSection
            title="Experience Level"
            options={filterOptions.experienceLevels}
            currentValue={experienceLevel}
            filterType="experienceLevel"
          />

          <FilterSection
            title="Salary Range"
            options={filterOptions.salaryRanges}
            currentValue={salaryRange}
            filterType="salaryRange"
          />

          <FilterSection
            title="Work Type"
            options={filterOptions.remoteTypes}
            currentValue={remoteType}
            filterType="remoteType"
          />
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters() && (
          <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--accent-subtle)' }}>
            <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Active Filters</h3>
            <div className="space-y-2">
              {jobType && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Type: {jobType}</span>
                  <button
                    onClick={() => setJobType('')}
                    className="ml-2 transition-opacity hover:opacity-80"
                    style={{ color: 'var(--accent-interactive)' }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {category && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Category: {category}</span>
                  <button
                    onClick={() => setCategory('')}
                    className="ml-2 transition-opacity hover:opacity-80"
                    style={{ color: 'var(--accent-interactive)' }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {experienceLevel && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Experience: {experienceLevel}</span>
                  <button
                    onClick={() => setExperienceLevel('')}
                    className="ml-2 transition-opacity hover:opacity-80"
                    style={{ color: 'var(--accent-interactive)' }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {salaryRange && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Salary: ${salaryRange}</span>
                  <button
                    onClick={() => setSalaryRange('')}
                    className="ml-2 transition-opacity hover:opacity-80"
                    style={{ color: 'var(--accent-interactive)' }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {remoteType && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Work Type: {remoteType}</span>
                  <button
                    onClick={() => setRemoteType('')}
                    className="ml-2 transition-opacity hover:opacity-80"
                    style={{ color: 'var(--accent-interactive)' }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}