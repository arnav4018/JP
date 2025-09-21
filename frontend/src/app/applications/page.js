'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { fetchUserApplications } from '@/services/mockApi';
import { useAuth } from '@/store/useAuthStore';
import { 
  Calendar,
  MapPin,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  FileText,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';
import Link from 'next/link';

const ApplicationStatus = {
  applied: { 
    label: 'Applied', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100', 
    icon: FileText,
    description: 'Your application has been submitted'
  },
  under_review: { 
    label: 'Under Review', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100', 
    icon: Eye,
    description: 'Your application is being reviewed'
  },
  shortlisted: { 
    label: 'Shortlisted', 
    color: 'text-green-600', 
    bgColor: 'bg-green-100', 
    icon: CheckCircle,
    description: 'You have been shortlisted for interview'
  },
  interview_scheduled: { 
    label: 'Interview Scheduled', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-100', 
    icon: Calendar,
    description: 'Interview has been scheduled'
  },
  rejected: { 
    label: 'Not Selected', 
    color: 'text-red-600', 
    bgColor: 'bg-red-100', 
    icon: XCircle,
    description: 'Application was not successful'
  },
  hired: { 
    label: 'Hired', 
    color: 'text-green-700', 
    bgColor: 'bg-green-200', 
    icon: CheckCircle,
    description: 'Congratulations! You got the job'
  }
};

export default function ApplicationsPage() {
  const router = useRouter();
  const { isAuthenticated, getUserId, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, shortlisted, rejected
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent('/applications'));
      return;
    }

    if (isAuthenticated) {
      loadApplications();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadApplications = async () => {
    const userId = getUserId();
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const userApplications = await fetchUserApplications(userId);
      setApplications(userApplications);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredApplications = () => {
    let filtered = applications;

    // Apply status filter
    if (filter !== 'all') {
      if (filter === 'pending') {
        filtered = filtered.filter(app => ['applied', 'under_review'].includes(app.status));
      } else if (filter === 'shortlisted') {
        filtered = filtered.filter(app => ['shortlisted', 'interview_scheduled'].includes(app.status));
      } else if (filter === 'rejected') {
        filtered = filtered.filter(app => app.status === 'rejected');
      } else {
        filtered = filtered.filter(app => app.status === filter);
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app => 
        app.job.title.toLowerCase().includes(query) ||
        app.job.company.toLowerCase().includes(query) ||
        app.job.location.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
  };

  const ApplicationTimeline = ({ application }) => {
    const StatusIcon = ApplicationStatus[application.status]?.icon || AlertCircle;
    
    return (
      <div className="ml-4 mt-4">
        <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          Application Timeline
        </h4>
        <div className="space-y-3">
          {application.statusHistory.map((status, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                index === 0 ? ApplicationStatus[status.status]?.bgColor || 'bg-gray-100' : 'bg-gray-100'
              }`}>
                <StatusIcon className={`w-3 h-3 ${
                  index === 0 ? ApplicationStatus[status.status]?.color || 'text-gray-600' : 'text-gray-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${
                    index === 0 ? ApplicationStatus[status.status]?.color || 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {ApplicationStatus[status.status]?.label || status.status.replace('_', ' ')}
                  </p>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(status.timestamp)}
                  </span>
                </div>
                {status.note && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {status.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ApplicationCard = ({ application }) => {
    const statusInfo = ApplicationStatus[application.status] || ApplicationStatus.applied;
    const StatusIcon = statusInfo.icon;

    return (
      <div className="rounded-lg border shadow-sm p-6 transition-shadow hover:shadow-md" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link 
              href={`/jobs/${application.jobId}`}
              className="block group"
            >
              <h3 className="text-lg font-semibold transition-colors group-hover:opacity-80" style={{ color: 'var(--text-primary)' }}>
                {application.job.title}
              </h3>
            </Link>
            <div className="flex items-center space-x-2 mt-1">
              <Building className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
              <Link
                href={`/companies/${application.job.company.toLowerCase().replace(/\\s+/g, '-')}`}
                className="text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--accent-interactive)' }}
              >
                {application.job.company}
              </Link>
            </div>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
            <StatusIcon className="h-3 w-3 inline mr-1" />
            {statusInfo.label}
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{application.job.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Applied {formatDate(application.appliedAt)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Updated {formatDate(application.lastUpdated)}</span>
          </div>
        </div>

        {/* Status Description */}
        <div className="mb-4">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {statusInfo.description}
          </p>
        </div>

        {/* Timeline (collapsible) */}
        {application.statusHistory.length > 1 && (
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium transition-colors hover:opacity-80" style={{ color: 'var(--accent-interactive)' }}>
              View Application Timeline
              <ArrowRight className="h-4 w-4 inline ml-1 transition-transform group-open:rotate-90" />
            </summary>
            <ApplicationTimeline application={application} />
          </details>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor: 'var(--accent-subtle)' }}>
          <Link
            href={`/jobs/${application.jobId}`}
            className="text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--accent-interactive)' }}
          >
            View Job Details
          </Link>
          
          <div className="flex space-x-2">
            {application.status === 'interview_scheduled' && (
              <button className="px-3 py-1 rounded text-xs font-medium transition-opacity hover:opacity-80" style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}>
                View Interview
              </button>
            )}
            {application.status === 'shortlisted' && (
              <span className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }}>
                Awaiting Interview
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="rounded-lg p-6 animate-pulse" style={{ backgroundColor: 'var(--background-panel)' }}>
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="h-5 rounded mb-2 w-2/3" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
              <div className="h-4 rounded w-1/3" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
            </div>
            <div className="h-6 rounded w-20" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="h-4 rounded" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
            <div className="h-4 rounded" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
            <div className="h-4 rounded" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
          </div>
          <div className="h-3 rounded w-3/4" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
        </div>
      ))}
    </div>
  );

  if (authLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-deep)' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent-interactive)' }}></div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  const filteredApplications = getFilteredApplications();
  const statusCounts = {
    all: applications.length,
    pending: applications.filter(app => ['applied', 'under_review'].includes(app.status)).length,
    shortlisted: applications.filter(app => ['shortlisted', 'interview_scheduled'].includes(app.status)).length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              My Applications
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Track the status of your job applications
            </p>
          </div>

          {/* Filters and Search */}
          <div className="rounded-lg shadow-sm p-6 mb-8" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Status Filter */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: 'All Applications', count: statusCounts.all },
                    { key: 'pending', label: 'Pending', count: statusCounts.pending },
                    { key: 'shortlisted', label: 'Shortlisted', count: statusCounts.shortlisted },
                    { key: 'rejected', label: 'Rejected', count: statusCounts.rejected }
                  ].map(({ key, label, count }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === key 
                          ? 'opacity-100' 
                          : 'opacity-70 hover:opacity-90'
                      }`}
                      style={{
                        backgroundColor: filter === key ? 'var(--accent-interactive)' : 'var(--accent-subtle)',
                        color: filter === key ? 'var(--background-deep)' : 'var(--text-primary)'
                      }}
                    >
                      {label} ({count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="flex-shrink-0 w-full sm:w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                  <input
                    type="text"
                    placeholder="Search applications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{
                      backgroundColor: 'var(--background-deep)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Applications List */}
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--background-panel)' }}>
              <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {error}
              </h3>
              <button
                onClick={loadApplications}
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
              >
                Try Again
              </button>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--background-panel)' }}>
              <FileText className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                {searchQuery || filter !== 'all' 
                  ? 'No applications found' 
                  : "You haven't applied to any jobs yet"
                }
              </h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                {searchQuery || filter !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Start exploring job opportunities and apply to positions that interest you'
                }
              </p>
              <Link
                href="/jobs"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}