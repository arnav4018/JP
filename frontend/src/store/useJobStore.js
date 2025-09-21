import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useJobStore = create(
  persist(
    (set, get) => ({
      // Search and filter state
      searchQuery: '',
      location: '',
      jobType: '',
      salaryRange: '',
      experienceLevel: '',
      category: '',
      remoteType: '', // 'remote', 'hybrid', 'onsite'
      sortBy: 'newest', // 'newest', 'oldest', 'salary-high', 'salary-low', 'relevance'
      
      // Results state
      jobs: [],
      totalJobs: 0,
      currentPage: 1,
      loading: false,
      error: null,

      // Filter options (could be fetched from API)
      filterOptions: {
        jobTypes: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
        categories: ['Technology', 'Design', 'Marketing', 'Data Science', 'Sales', 'Finance', 'HR'],
        experienceLevels: ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'],
        salaryRanges: [
          '0-30k',
          '30k-50k', 
          '50k-70k',
          '70k-90k',
          '90k-120k',
          '120k+'
        ],
        remoteTypes: ['Remote', 'Hybrid', 'On-site']
      },

      // Actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setLocation: (location) => set({ location }),
      setJobType: (jobType) => set({ jobType }),
      setSalaryRange: (range) => set({ salaryRange: range }),
      setExperienceLevel: (level) => set({ experienceLevel: level }),
      setCategory: (category) => set({ category }),
      setRemoteType: (type) => set({ remoteType: type }),
      setSortBy: (sortBy) => set({ sortBy }),
      setCurrentPage: (page) => set({ currentPage: page }),
      
      setJobs: (jobs) => set({ jobs }),
      setTotalJobs: (total) => set({ totalJobs: total }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Clear all filters
      clearFilters: () => set({
        searchQuery: '',
        location: '',
        jobType: '',
        salaryRange: '',
        experienceLevel: '',
        category: '',
        remoteType: '',
        sortBy: 'newest',
        currentPage: 1
      }),

      // Get current filters as object
      getFilters: () => {
        const state = get();
        return {
          search: state.searchQuery,
          location: state.location,
          type: state.jobType,
          salary: state.salaryRange,
          experience: state.experienceLevel,
          category: state.category,
          remote: state.remoteType,
          sort: state.sortBy,
          page: state.currentPage
        };
      },

      // Check if any filters are active
      hasActiveFilters: () => {
        const state = get();
        return !!(
          state.searchQuery ||
          state.location ||
          state.jobType ||
          state.salaryRange ||
          state.experienceLevel ||
          state.category ||
          state.remoteType
        );
      }
    }),
    {
      name: 'job-search-store', // persist key
      partialize: (state) => ({
        // Only persist search preferences, not results
        searchQuery: state.searchQuery,
        location: state.location,
        jobType: state.jobType,
        salaryRange: state.salaryRange,
        experienceLevel: state.experienceLevel,
        category: state.category,
        remoteType: state.remoteType,
        sortBy: state.sortBy
      })
    }
  )
);