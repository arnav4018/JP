'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/store/useAuthStore';
import API from '@/services/api';
import { 
  Briefcase, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin, 
  Calendar,
  Clock,
  DollarSign,
  Users,
  Filter,
  Search,
  ChevronDown,
  MoreVertical,
  Star,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function RecruiterJobsPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, paused, closed
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=' + encodeURIComponent('/recruiter/jobs'));
        return;
      }
      
      // Check if user is recruiter or admin
      if (user && !['recruiter', 'admin'].includes(user.role)) {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadJobs();
    }
  }, [isAuthenticated, user]);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch jobs from API first
      const response = await API.jobs.getMyJobs();
      setJobs(response.data?.jobs || []);
    } catch (apiError) {
      console.log('API failed, trying fallback data...');
      
      // Fallback to localStorage data (for demo purposes)
      try {
        const fallbackJobs = JSON.parse(localStorage.getItem('fallbackJobs') || '[]');
        
        // Filter jobs for current user if we have user email
        const userJobs = fallbackJobs.filter(job => 
          job.posted_by_email === user?.email || 
          job.posted_by === user?.name ||
          job.posted_by === `${user?.firstName} ${user?.lastName}`
        );
        
        setJobs(userJobs);
        
        if (userJobs.length === 0) {
          setError('No jobs found. Start by posting your first job!');
        }
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
        setError('Failed to load jobs. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'all' || job.status === filter;
    const matchesSearch = !searchQuery || 
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return { backgroundColor: 'rgb(34, 197, 94)', color: 'white' };
      case 'paused':
        return { backgroundColor: 'rgb(249, 168, 37)', color: 'white' };
      case 'closed':
        return { backgroundColor: 'rgb(156, 163, 175)', color: 'white' };
      default:
        return { backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' };
    }
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-deep)' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent-interactive)' }}></div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated || (user && !['recruiter', 'admin'].includes(user.role))) {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  My Job Posts
                </h1>
                <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                  Manage and track your job postings
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Link
                  href="/post-job"
                  className="inline-flex items-center px-6 py-3 rounded-lg font-medium text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Link>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="rounded-lg border p-4 mb-6" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-deep)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              {/* Filter Dropdown */}
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 pr-8"
                  style={{
                    backgroundColor: 'var(--background-deep)',
                    borderColor: 'var(--accent-subtle)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="all">All Jobs</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
              <div className="flex items-center">
                <Briefcase className="h-8 w-8" style={{ color: 'rgb(59, 130, 246)' }} />
                <div className="ml-4">
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{jobs.length}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Jobs</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
              <div className="flex items-center">
                <Eye className="h-8 w-8" style={{ color: 'rgb(34, 197, 94)' }} />
                <div className="ml-4">
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {jobs.filter(job => job.status === 'active').length}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Active Jobs</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
              <div className="flex items-center">
                <Users className="h-8 w-8" style={{ color: 'rgb(168, 85, 247)' }} />
                <div className="ml-4">
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {jobs.reduce((sum, job) => sum + (job.applications || 0), 0)}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total Applications</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
              <div className="flex items-center">
                <Star className="h-8 w-8" style={{ color: 'rgb(249, 168, 37)' }} />
                <div className="ml-4">
                  <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {jobs.filter(job => job.is_featured).length}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Featured Jobs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: 'var(--accent-interactive)' }}></div>
                <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Loading your jobs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--background-panel)' }}>
                <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: 'rgb(239, 68, 68)' }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>{error}</h3>
                <button
                  onClick={loadJobs}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
                >
                  Try Again
                </button>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--background-panel)' }}>
                <Briefcase className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  {jobs.length === 0 ? 'No jobs posted yet' : 'No jobs match your search'}
                </h3>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                  {jobs.length === 0 ? 'Start by creating your first job posting to attract great candidates.' : 'Try adjusting your search or filter criteria.'}
                </p>
                <Link
                  href="/post-job"
                  className="inline-flex items-center px-6 py-3 rounded-lg font-medium text-sm transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Job
                </Link>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} onUpdate={loadJobs} />
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Job Card Component
const JobCard = ({ job, onUpdate }) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
        return { backgroundColor: 'rgb(34, 197, 94)', color: 'white' };
      case 'paused':
        return { backgroundColor: 'rgb(249, 168, 37)', color: 'white' };
      case 'closed':
        return { backgroundColor: 'rgb(156, 163, 175)', color: 'white' };
      default:
        return { backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="rounded-lg border p-6" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {job.title}
            </h3>
            {job.is_featured && (
              <Star className="h-5 w-5" style={{ color: 'rgb(249, 168, 37)' }} />
            )}
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={getStatusColor(job.status)}
            >
              {job.status === 'approved' ? 'Active' : job.status || 'Active'}
            </span>
          </div>
          
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            {job.company}
          </p>

          <div className="flex flex-wrap gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            
            {job.salary && (
              <div className="flex items-center space-x-1">
                <DollarSign className="h-4 w-4" />
                <span>{job.salary}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Posted {formatDate(job.created_date || job.createdAt)}</span>
            </div>

            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{job.applications || 0} applications</span>
            </div>

            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{job.views || 0} views</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showActions && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-2 z-10" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
              <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                <Eye className="h-4 w-4" />
                <span>View Details</span>
              </button>
              
              <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                <Edit className="h-4 w-4" />
                <span>Edit Job</span>
              </button>
              
              <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                <Users className="h-4 w-4" />
                <span>View Applications</span>
              </button>
              
              <div className="border-t my-1" style={{ borderColor: 'var(--accent-subtle)' }}></div>
              
              <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm hover:opacity-80" style={{ color: 'rgb(239, 68, 68)' }}>
                <Trash2 className="h-4 w-4" />
                <span>Delete Job</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Job Description Preview */}
      <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
        {job.description}
      </p>

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {job.tags.slice(0, 5).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 rounded text-xs"
              style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
            >
              {tag}
            </span>
          ))}
          {job.tags.length > 5 && (
            <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}>
              +{job.tags.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};