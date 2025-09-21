'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuthStore';
import { fetchJobApplicants, updateApplicantStatus } from '@/services/mockApi';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  MoreVertical,
  Star,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Mail,
  Phone,
  User,
  Award,
  TrendingUp,
  ArrowUpDown,
  FileText
} from 'lucide-react';
import Link from 'next/link';

const ApplicationStatus = {
  applied: { label: 'Applied', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: FileText },
  shortlisted: { label: 'Shortlisted', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  interview_scheduled: { label: 'Interview Scheduled', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Calendar },
  rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle },
  hired: { label: 'Hired', color: 'text-green-700', bgColor: 'bg-green-200', icon: Award }
};

export default function JobApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  const [applicants, setApplicants] = useState([]);
  const [jobDetails, setJobDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('skillMatch');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedApplicants, setSelectedApplicants] = useState([]);

  useEffect(() => {
    // Check authentication and permissions
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/login');
      return;
    }
    
    loadApplicants();
  }, [isAuthenticated, user, params.jobId, sortBy, sortOrder]);

  const loadApplicants = async () => {
    if (!params.jobId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchJobApplicants(params.jobId, sortBy, sortOrder);
      setApplicants(response.applicants);
      setJobDetails(response.jobDetails);
    } catch (err) {
      setError('Failed to load applicants');
      console.error('Error loading applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicantId, newStatus) => {
    try {
      await updateApplicantStatus(applicantId, newStatus);
      // Update local state
      setApplicants(prev => 
        prev.map(applicant => 
          applicant.id === applicantId ? { ...applicant, status: newStatus } : applicant
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSkillMatchColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getFilteredApplicants = () => {
    let filtered = applicants;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(applicant =>
        applicant.name.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        applicant.profile.title.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(applicant => applicant.status === statusFilter);
    }

    return filtered;
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const ApplicantCard = ({ applicant }) => {
    const statusInfo = ApplicationStatus[applicant.status] || ApplicationStatus.applied;
    const StatusIcon = statusInfo.icon;

    return (
      <div className="rounded-lg border p-6 transition-shadow hover:shadow-md" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-subtle)' }}>
              <User className="h-6 w-6" style={{ color: 'var(--text-secondary)' }} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {applicant.name}
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${getSkillMatchColor(applicant.skillMatch)}`}>
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  {applicant.skillMatch}% Match
                </div>
              </div>
              
              <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                {applicant.profile.title}
              </p>
              
              <div className="flex items-center space-x-4 text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{applicant.profile.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{applicant.profile.experience}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Applied {formatDate(applicant.appliedAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <Mail className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                <a href={`mailto:${applicant.email}`} className="text-sm hover:opacity-80" style={{ color: 'var(--accent-interactive)' }}>
                  {applicant.email}
                </a>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
              <StatusIcon className="h-3 w-3 inline mr-1" />
              {statusInfo.label}
            </div>
            
            <div className="relative">
              <button
                className="p-2 rounded hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Skills</h4>
          <div className="flex flex-wrap gap-2">
            {applicant.profile.skills.slice(0, 6).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded text-xs"
                style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
              >
                {skill}
              </span>
            ))}
            {applicant.profile.skills.length > 6 && (
              <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}>
                +{applicant.profile.skills.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--accent-subtle)' }}>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 rounded text-xs font-medium transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
            >
              <Eye className="h-3 w-3 inline mr-1" />
              View Profile
            </button>
            <button
              className="px-3 py-1 border rounded text-xs font-medium transition-opacity hover:opacity-80"
              style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
            >
              <FileText className="h-3 w-3 inline mr-1" />
              Resume
            </button>
          </div>
          
          <div className="flex space-x-2">
            {applicant.status === 'applied' && (
              <>
                <button
                  onClick={() => handleStatusUpdate(applicant.id, 'shortlisted')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => handleStatusUpdate(applicant.id, 'rejected')}
                  className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </>
            )}
            {applicant.status === 'shortlisted' && (
              <button
                onClick={() => handleStatusUpdate(applicant.id, 'interview_scheduled')}
                className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700 transition-colors"
              >
                Schedule Interview
              </button>
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
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-12 h-12 rounded-full" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
            <div className="flex-1">
              <div className="h-5 rounded mb-2 w-1/3" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
              <div className="h-4 rounded mb-2 w-1/4" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
              <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            {error}
          </h1>
          <Link
            href="/admin/jobs"
            className="inline-flex items-center px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const filteredApplicants = getFilteredApplicants();
  const statusCounts = {
    all: applicants.length,
    applied: applicants.filter(app => app.status === 'applied').length,
    shortlisted: applicants.filter(app => app.status === 'shortlisted').length,
    interview_scheduled: applicants.filter(app => app.status === 'interview_scheduled').length,
    rejected: applicants.filter(app => app.status === 'rejected').length
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-deep)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              href="/admin/jobs"
              className="inline-flex items-center text-sm transition-colors hover:opacity-80 mr-4"
              style={{ color: 'var(--accent-interactive)' }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </div>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                {jobDetails?.title} - Applicants
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                {jobDetails?.company} • {applicants.length} applicants
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="rounded-lg p-6 mb-8" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search applicants..."
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

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--background-deep)',
                borderColor: 'var(--accent-subtle)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="all">All Status</option>
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Sort Options */}
            <div className="flex space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--background-deep)',
                  borderColor: 'var(--accent-subtle)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="skillMatch">Skill Match</option>
                <option value="appliedAt">Application Date</option>
                <option value="name">Name</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border rounded-lg hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All', count: statusCounts.all },
              { key: 'applied', label: 'Applied', count: statusCounts.applied },
              { key: 'shortlisted', label: 'Shortlisted', count: statusCounts.shortlisted },
              { key: 'interview_scheduled', label: 'Interview Scheduled', count: statusCounts.interview_scheduled },
              { key: 'rejected', label: 'Rejected', count: statusCounts.rejected }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === key ? 'opacity-100' : 'opacity-70 hover:opacity-90'
                }`}
                style={{
                  backgroundColor: statusFilter === key ? 'var(--accent-interactive)' : 'var(--accent-subtle)',
                  color: statusFilter === key ? 'var(--background-deep)' : 'var(--text-primary)'
                }}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>

        {/* Applicants List */}
        {filteredApplicants.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--background-panel)' }}>
            <User className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              No applicants found
            </h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters or search terms'
                : 'No applicants have applied to this job yet'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredApplicants.map((applicant) => (
              <ApplicantCard key={applicant.id} applicant={applicant} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}