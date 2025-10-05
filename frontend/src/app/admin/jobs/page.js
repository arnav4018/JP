'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuthStore';
import { 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Star,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Building,
  AlertTriangle,
  Download,
  RefreshCw,
  Plus,
  ArrowUpDown,
  ChevronDown,
  X,
  FileText,
  Flag,
  MessageSquare,
  ExternalLink,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

export default function JobManagementPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Authentication check
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=' + encodeURIComponent('/admin/jobs'));
        return;
      }
      
      // Check if user is recruiter or admin
      if (user && !['recruiter', 'admin'].includes(user.role)) {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, authLoading, user, router]);
  
  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent-interactive)' }}></div>
      </div>
    );
  }
  
  // Don't render if not authenticated or wrong role
  if (!isAuthenticated || (user && !['recruiter', 'admin'].includes(user.role))) {
    return null;
  }
  
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
  const [typeFilter, setTypeFilter] = useState('all'); // all, full-time, part-time, contract
  const [sortBy, setSortBy] = useState('created_date'); // created_date, title, company, applications
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showJobModal, setShowJobModal] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock job data - in real app, this would come from API
  useEffect(() => {
    const mockJobs = [
      {
        id: 1,
        title: 'Senior React Developer',
        company: 'TechCorp Inc.',
        company_id: 101,
        location: 'San Francisco, CA',
        type: 'full-time',
        salary: '$120,000 - $150,000',
        status: 'pending',
        created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        applications: 12,
        views: 456,
        is_featured: true,
        is_flagged: false,
        description: 'We are looking for a Senior React Developer to join our growing team...',
        requirements: 'React, TypeScript, Node.js, 5+ years experience',
        posted_by: 'John Smith',
        posted_by_email: 'john@techcorp.com'
      },
      {
        id: 2,
        title: 'Product Manager',
        company: 'StartupCo',
        company_id: 102,
        location: 'Remote',
        type: 'full-time',
        salary: '$90,000 - $120,000',
        status: 'approved',
        created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        applications: 28,
        views: 892,
        is_featured: false,
        is_flagged: false,
        description: 'Join our product team and help shape the future of our platform...',
        requirements: 'Product management experience, Agile, Analytics tools',
        posted_by: 'Sarah Johnson',
        posted_by_email: 'sarah@startupco.com'
      },
      {
        id: 3,
        title: 'Data Scientist',
        company: 'DataFlow Solutions',
        company_id: 103,
        location: 'New York, NY',
        type: 'full-time',
        salary: '$110,000 - $140,000',
        status: 'approved',
        created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        applications: 18,
        views: 634,
        is_featured: true,
        is_flagged: false,
        description: 'We are seeking a talented Data Scientist to join our analytics team...',
        requirements: 'Python, Machine Learning, SQL, Statistics background',
        posted_by: 'Mike Wilson',
        posted_by_email: 'mike@dataflow.com'
      },
      {
        id: 4,
        title: 'Frontend Developer',
        company: 'WebStudio',
        company_id: 104,
        location: 'Austin, TX',
        type: 'part-time',
        salary: '$60,000 - $80,000',
        status: 'rejected',
        created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        applications: 5,
        views: 123,
        is_featured: false,
        is_flagged: true,
        description: 'Looking for a part-time frontend developer...',
        requirements: 'HTML, CSS, JavaScript, React basics',
        posted_by: 'Lisa Chen',
        posted_by_email: 'lisa@webstudio.com',
        rejection_reason: 'Incomplete job description and requirements'
      },
      {
        id: 5,
        title: 'DevOps Engineer',
        company: 'CloudTech Ltd',
        company_id: 105,
        location: 'Seattle, WA',
        type: 'contract',
        salary: '$80 - $100/hour',
        status: 'pending',
        created_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        applications: 3,
        views: 89,
        is_featured: false,
        is_flagged: false,
        description: 'Contract position for DevOps Engineer...',
        requirements: 'AWS, Docker, Kubernetes, CI/CD experience',
        posted_by: 'Tom Anderson',
        posted_by_email: 'tom@cloudtech.com'
      }
    ];
    
    setJobs(mockJobs);
    setFilteredJobs(mockJobs);
  }, []);

  // Filter and search jobs
  useEffect(() => {
    let filtered = [...jobs];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(job => job.type === typeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'created_date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [jobs, searchQuery, statusFilter, typeFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, startIndex + itemsPerPage);

  const handleStatusChange = (jobId, newStatus) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      )
    );
    setShowConfirmModal(null);
  };

  const handleBulkStatusChange = (newStatus) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        selectedJobs.includes(job.id) ? { ...job, status: newStatus } : job
      )
    );
    setSelectedJobs([]);
    setShowBulkActions(false);
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === paginatedJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(paginatedJobs.map(job => job.id));
    }
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'rgb(249, 168, 37)', text: 'Pending', icon: Clock },
      approved: { bg: 'rgb(34, 197, 94)', text: 'Approved', icon: CheckCircle },
      rejected: { bg: 'rgb(239, 68, 68)', text: 'Rejected', icon: XCircle }
    };
    
    const config = statusConfig[status];
    const IconComponent = config.icon;
    
    return (
      <span 
        className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: config.bg }}
      >
        <IconComponent className="h-3 w-3" />
        <span>{config.text}</span>
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Job Management
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Review and manage job postings from companies
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setLoading(true)}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
            style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          
          <button
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8" style={{ color: 'rgb(249, 168, 37)' }} />
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {jobs.filter(j => j.status === 'pending').length}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Pending Review</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8" style={{ color: 'rgb(34, 197, 94)' }} />
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {jobs.filter(j => j.status === 'approved').length}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Approved</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
          <div className="flex items-center space-x-3">
            <XCircle className="h-8 w-8" style={{ color: 'rgb(239, 68, 68)' }} />
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {jobs.filter(j => j.status === 'rejected').length}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Rejected</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
          <div className="flex items-center space-x-3">
            <Flag className="h-8 w-8" style={{ color: 'rgb(239, 68, 68)' }} />
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                {jobs.filter(j => j.is_flagged).length}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Flagged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div 
        className="rounded-lg border p-6"
        style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--background-deep)',
              borderColor: 'var(--accent-subtle)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">All Types</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
          </select>
          
          {/* Sort */}
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
              <option value="created_date">Date Created</option>
              <option value="title">Job Title</option>
              <option value="company">Company</option>
              <option value="applications">Applications</option>
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
      </div>

      {/* Bulk Actions */}
      {selectedJobs.length > 0 && (
        <div 
          className="rounded-lg border p-4"
          style={{ backgroundColor: 'var(--accent-subtle)', borderColor: 'var(--accent-interactive)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {selectedJobs.length} job{selectedJobs.length > 1 ? 's' : ''} selected
            </span>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkStatusChange('approved')}
                className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Approve</span>
              </button>
              
              <button
                onClick={() => handleBulkStatusChange('rejected')}
                className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject</span>
              </button>
              
              <button
                onClick={() => setSelectedJobs([])}
                className="p-1 hover:opacity-80 transition-opacity"
                style={{ color: 'var(--text-secondary)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Table */}
      <div 
        className="rounded-lg border overflow-hidden"
        style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--background-deep)' }}>
              <tr>
                <th className="p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedJobs.length === paginatedJobs.length && paginatedJobs.length > 0}
                    onChange={handleSelectAll}
                    style={{ accentColor: 'var(--accent-interactive)' }}
                  />
                </th>
                <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Job Details
                </th>
                <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Company
                </th>
                <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Status
                </th>
                <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Performance
                </th>
                <th className="p-4 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Date Created
                </th>
                <th className="p-4 text-center text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Actions
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y" style={{ borderColor: 'var(--accent-subtle)' }}>
              {paginatedJobs.map((job) => (
                <tr key={job.id} className="hover:opacity-80 transition-opacity" style={{ backgroundColor: job.is_flagged ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedJobs.includes(job.id)}
                      onChange={() => handleSelectJob(job.id)}
                      style={{ accentColor: 'var(--accent-interactive)' }}
                    />
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-start space-x-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {job.title}
                          </h3>
                          {job.is_featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                          {job.is_flagged && <Flag className="h-4 w-4 text-red-500" />}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Briefcase className="h-3 w-3" />
                            <span className="capitalize">{job.type}</span>
                          </div>
                          {job.salary && (
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>{job.salary}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div>
                      <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {job.company}
                      </h4>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Posted by {job.posted_by}
                      </p>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    {getStatusBadge(job.status)}
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <FileText className="h-3 w-3" style={{ color: 'var(--accent-interactive)' }} />
                        <span style={{ color: 'var(--text-primary)' }}>{job.applications}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" style={{ color: 'var(--text-secondary)' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{job.views}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {formatDate(job.created_date)}
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowJobModal(job)}
                        className="p-2 rounded hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {job.applications > 0 && (
                        <Link
                          href={`/admin/jobs/${job.id}/applicants`}
                          className="p-2 rounded hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
                          title="View Applicants"
                        >
                          <Users className="h-4 w-4" />
                        </Link>
                      )}
                      
                      {job.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setShowConfirmModal({jobId: job.id, action: 'approve'})}
                            className="p-2 rounded hover:bg-green-700 transition-colors bg-green-600 text-white"
                            title="Approve"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => setShowConfirmModal({jobId: job.id, action: 'reject'})}
                            className="p-2 rounded hover:bg-red-700 transition-colors bg-red-600 text-white"
                            title="Reject"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--accent-subtle)' }}>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredJobs.length)} of {filteredJobs.length} jobs
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded transition-all ${currentPage === i + 1 ? '' : 'hover:opacity-80'}`}
                  style={{
                    backgroundColor: currentPage === i + 1 ? 'var(--accent-interactive)' : 'transparent',
                    color: currentPage === i + 1 ? 'var(--background-deep)' : 'var(--text-secondary)',
                    border: currentPage === i + 1 ? 'none' : '1px solid var(--accent-subtle)'
                  }}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {showJobModal && (
        <JobDetailsModal
          job={showJobModal}
          onClose={() => setShowJobModal(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmationModal
          job={jobs.find(j => j.id === showConfirmModal.jobId)}
          action={showConfirmModal.action}
          onConfirm={() => handleStatusChange(showConfirmModal.jobId, showConfirmModal.action === 'approve' ? 'approved' : 'rejected')}
          onCancel={() => setShowConfirmModal(null)}
        />
      )}
    </div>
  );
}

// Job Details Modal Component
const JobDetailsModal = ({ job, onClose, onStatusChange }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
        
        <div 
          className="relative inline-block w-full max-w-4xl p-6 my-8 text-left align-middle transition-all transform rounded-lg shadow-xl"
          style={{ backgroundColor: 'var(--background-panel)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                Job Details
              </h3>
              {job.is_featured && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
              {job.is_flagged && <Flag className="h-5 w-5 text-red-500" />}
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  {job.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>{job.company}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="capitalize">{job.type}</span>
                  </div>
                </div>
                {job.salary && (
                  <div className="flex items-center space-x-1 text-lg font-semibold mb-4" style={{ color: 'var(--accent-interactive)' }}>
                    <DollarSign className="h-5 w-5" />
                    <span>{job.salary}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Job Description
                </h4>
                <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {job.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Requirements
                </h4>
                <p className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                  {job.requirements}
                </p>
              </div>

              {job.status === 'rejected' && job.rejection_reason && (
                <div className="p-4 border rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgb(239, 68, 68)' }}>
                  <h4 className="font-semibold mb-2 text-red-600">Rejection Reason</h4>
                  <p className="text-red-700">{job.rejection_reason}</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status & Actions */}
              <div className="p-4 border rounded-lg" style={{ backgroundColor: 'var(--background-deep)', borderColor: 'var(--accent-subtle)' }}>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Status & Actions
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Current Status:</span>
                    <div className="flex items-center space-x-1">
                      {job.status === 'pending' && <Clock className="h-4 w-4 text-yellow-500" />}
                      {job.status === 'approved' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {job.status === 'rejected' && <XCircle className="h-4 w-4 text-red-500" />}
                      <span className="capitalize font-medium" style={{ color: 'var(--text-primary)' }}>{job.status}</span>
                    </div>
                  </div>
                  
                  {job.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => { onStatusChange(job.id, 'approved'); onClose(); }}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve</span>
                      </button>
                      
                      <button
                        onClick={() => { onStatusChange(job.id, 'rejected'); onClose(); }}
                        className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="p-4 border rounded-lg" style={{ backgroundColor: 'var(--background-deep)', borderColor: 'var(--accent-subtle)' }}>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Performance
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" style={{ color: 'var(--accent-interactive)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Applications</span>
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{job.applications}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Views</span>
                    </div>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{job.views}</span>
                  </div>
                </div>
              </div>

              {/* Job Info */}
              <div className="p-4 border rounded-lg" style={{ backgroundColor: 'var(--background-deep)', borderColor: 'var(--accent-subtle)' }}>
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Job Information
                </h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Posted by:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{job.posted_by}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Email:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{job.posted_by_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Created:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{new Date(job.created_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Featured:</span>
                    <span style={{ color: 'var(--text-primary)' }}>{job.is_featured ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ job, action, onConfirm, onCancel }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onCancel} />
        
        <div 
          className="relative inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform rounded-lg shadow-xl"
          style={{ backgroundColor: 'var(--background-panel)' }}
        >
          <div className="flex items-center space-x-3 mb-4">
            {action === 'approve' ? 
              <CheckCircle className="h-6 w-6 text-green-600" /> :
              <XCircle className="h-6 w-6 text-red-600" />
            }
            <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              {action === 'approve' ? 'Approve' : 'Reject'} Job
            </h3>
          </div>
          
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Are you sure you want to {action} the job "{job.title}" from {job.company}?
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 border rounded-lg font-medium transition-opacity hover:opacity-80"
              style={{ 
                borderColor: 'var(--accent-subtle)', 
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--background-deep)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90 text-white ${
                action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {action === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};