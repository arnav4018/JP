'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuthStore';
import { 
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  Database,
  Users,
  Building,
  Briefcase,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Plus,
  Minus,
  Eye,
  Archive,
  Settings,
  BarChart3,
  PieChart,
  TrendingUp,
  Activity,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar as CalendarIcon,
  FileJson,
  FileCode,
  Table,
  Layers,
  Target,
  Filter as FilterIcon,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  Zap,
  Save,
  Trash2
} from 'lucide-react';

export default function AdminDataExportPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [exportType, setExportType] = useState('users'); // users, companies, jobs, applications, analytics
  const [exportFormat, setExportFormat] = useState('csv'); // csv, xlsx, json, pdf
  const [filters, setFilters] = useState({
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    userFilters: {
      userType: 'all', // all, job_seekers, recruiters
      isVerified: 'all', // all, verified, unverified
      isActive: 'all', // all, active, inactive
      registrationSource: 'all' // all, organic, referral, social
    },
    companyFilters: {
      size: 'all', // all, startup, small, medium, large, enterprise
      industry: 'all',
      isVerified: 'all',
      subscriptionStatus: 'all' // all, active, expired, trial, none
    },
    jobFilters: {
      status: 'all', // all, active, expired, closed, pending
      type: 'all', // all, full-time, part-time, contract, internship
      isFeatured: 'all', // all, featured, regular
      hasApplications: 'all' // all, has_applications, no_applications
    },
    includeFields: {
      personalData: true,
      contactInfo: true,
      preferences: true,
      activity: true,
      analytics: false
    }
  });
  
  const [exportHistory, setExportHistory] = useState([]);
  const [currentExport, setCurrentExport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [exportStats, setExportStats] = useState({
    totalRecords: 0,
    selectedRecords: 0,
    estimatedFileSize: '0 KB'
  });

  // Load export history on mount
  useEffect(() => {
    loadExportHistory();
    updateExportStats();
  }, [exportType, filters]);

  const loadExportHistory = () => {
    // Mock export history - in real app, this would come from API
    const mockHistory = [
      {
        id: 1,
        type: 'users',
        format: 'csv',
        fileName: 'users_2024_01_15.csv',
        recordCount: 1250,
        fileSize: '2.4 MB',
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        downloadUrl: '/exports/users_2024_01_15.csv'
      },
      {
        id: 2,
        type: 'companies',
        format: 'xlsx',
        fileName: 'companies_2024_01_14.xlsx',
        recordCount: 89,
        fileSize: '456 KB',
        status: 'completed',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        downloadUrl: '/exports/companies_2024_01_14.xlsx'
      },
      {
        id: 3,
        type: 'jobs',
        format: 'json',
        fileName: 'jobs_2024_01_13.json',
        recordCount: 342,
        fileSize: '1.8 MB',
        status: 'processing',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        progress: 65
      },
      {
        id: 4,
        type: 'analytics',
        format: 'pdf',
        fileName: 'analytics_report_2024_01_10.pdf',
        recordCount: 0,
        fileSize: '3.2 MB',
        status: 'failed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        error: 'Insufficient permissions for analytics data'
      }
    ];
    
    setExportHistory(mockHistory);
  };

  const updateExportStats = () => {
    // Mock stats calculation - in real app, this would query database
    let totalRecords = 0;
    let selectedRecords = 0;
    let estimatedSize = 0;

    switch (exportType) {
      case 'users':
        totalRecords = 12450;
        selectedRecords = Math.floor(totalRecords * 0.7); // Simulated filter result
        estimatedSize = selectedRecords * 0.002; // ~2KB per user record
        break;
      case 'companies':
        totalRecords = 892;
        selectedRecords = Math.floor(totalRecords * 0.8);
        estimatedSize = selectedRecords * 0.003; // ~3KB per company record
        break;
      case 'jobs':
        totalRecords = 3421;
        selectedRecords = Math.floor(totalRecords * 0.6);
        estimatedSize = selectedRecords * 0.004; // ~4KB per job record
        break;
      case 'applications':
        totalRecords = 28934;
        selectedRecords = Math.floor(totalRecords * 0.5);
        estimatedSize = selectedRecords * 0.001; // ~1KB per application record
        break;
      case 'analytics':
        totalRecords = 1;
        selectedRecords = 1;
        estimatedSize = 5; // ~5MB for analytics report
        break;
    }

    setExportStats({
      totalRecords,
      selectedRecords,
      estimatedFileSize: estimatedSize > 1 ? `${estimatedSize.toFixed(1)} MB` : `${(estimatedSize * 1024).toFixed(0)} KB`
    });
  };

  const handleFilterChange = (section, key, value) => {
    setFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleExport = async () => {
    setLoading(true);
    setCurrentExport({
      type: exportType,
      format: exportFormat,
      status: 'processing',
      progress: 0
    });

    try {
      // Simulate export process with progress updates
      for (let progress = 0; progress <= 100; progress += 10) {
        setCurrentExport(prev => ({ ...prev, progress }));
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Simulate successful export
      const fileName = `${exportType}_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      
      const newExport = {
        id: Date.now(),
        type: exportType,
        format: exportFormat,
        fileName,
        recordCount: exportStats.selectedRecords,
        fileSize: exportStats.estimatedFileSize,
        status: 'completed',
        createdAt: new Date(),
        downloadUrl: `/exports/${fileName}`
      };

      setExportHistory(prev => [newExport, ...prev]);
      setCurrentExport(null);

      // Show success feedback
      const successAlert = document.createElement('div');
      successAlert.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successAlert.textContent = 'Export completed successfully!';
      document.body.appendChild(successAlert);
      setTimeout(() => document.body.removeChild(successAlert), 3000);

    } catch (error) {
      setCurrentExport(prev => ({ ...prev, status: 'failed', error: error.message }));
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      // Mock preview data
      const mockPreviewData = {
        columns: getColumnsForType(exportType),
        rows: getMockRowsForType(exportType).slice(0, 5), // Show first 5 rows
        totalRows: exportStats.selectedRecords
      };
      
      setPreviewData(mockPreviewData);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setLoading(false);
    }
  };

  const getColumnsForType = (type) => {
    const columns = {
      users: ['ID', 'Name', 'Email', 'User Type', 'Verified', 'Registration Date', 'Last Login', 'Profile Completion'],
      companies: ['ID', 'Company Name', 'Email', 'Industry', 'Size', 'Verified', 'Subscription', 'Jobs Posted', 'Registration Date'],
      jobs: ['ID', 'Title', 'Company', 'Location', 'Type', 'Status', 'Featured', 'Applications', 'Posted Date', 'Expires Date'],
      applications: ['ID', 'Job Title', 'Company', 'Applicant Name', 'Applicant Email', 'Status', 'Applied Date', 'Resume', 'Cover Letter'],
      analytics: ['Metric', 'Value', 'Previous Period', 'Change %', 'Trend', 'Updated Date']
    };
    return columns[type] || [];
  };

  const getMockRowsForType = (type) => {
    const rows = {
      users: [
        ['1', 'John Smith', 'john@example.com', 'Job Seeker', 'Yes', '2024-01-10', '2024-01-15 14:30', '85%'],
        ['2', 'Sarah Johnson', 'sarah@company.com', 'Recruiter', 'Yes', '2024-01-08', '2024-01-15 09:15', '92%'],
        ['3', 'Mike Wilson', 'mike@email.com', 'Job Seeker', 'No', '2024-01-12', '2024-01-14 16:45', '67%'],
        ['4', 'Lisa Chen', 'lisa@techcorp.com', 'Recruiter', 'Yes', '2024-01-05', '2024-01-15 11:20', '88%'],
        ['5', 'David Brown', 'david@example.com', 'Job Seeker', 'Yes', '2024-01-11', '2024-01-13 13:10', '73%']
      ],
      companies: [
        ['1', 'TechCorp Inc.', 'hr@techcorp.com', 'Technology', 'Large', 'Yes', 'Premium', '12', '2024-01-01'],
        ['2', 'StartupCo', 'contact@startupco.com', 'Technology', 'Startup', 'Yes', 'Basic', '8', '2024-01-03'],
        ['3', 'DataFlow Solutions', 'jobs@dataflow.com', 'Analytics', 'Medium', 'Yes', 'Premium', '15', '2023-12-28'],
        ['4', 'WebStudio', 'hire@webstudio.com', 'Design', 'Small', 'No', 'Trial', '3', '2024-01-08'],
        ['5', 'CloudTech Ltd', 'careers@cloudtech.com', 'Technology', 'Medium', 'Yes', 'Basic', '9', '2024-01-02']
      ],
      jobs: [
        ['1', 'Senior React Developer', 'TechCorp Inc.', 'San Francisco, CA', 'Full-time', 'Active', 'Yes', '12', '2024-01-10', '2024-02-10'],
        ['2', 'Product Manager', 'StartupCo', 'Remote', 'Full-time', 'Active', 'No', '28', '2024-01-08', '2024-02-08'],
        ['3', 'Data Scientist', 'DataFlow Solutions', 'New York, NY', 'Full-time', 'Active', 'Yes', '18', '2024-01-05', '2024-02-05'],
        ['4', 'Frontend Developer', 'WebStudio', 'Austin, TX', 'Part-time', 'Closed', 'No', '5', '2024-01-03', '2024-02-03'],
        ['5', 'DevOps Engineer', 'CloudTech Ltd', 'Seattle, WA', 'Contract', 'Active', 'No', '3', '2024-01-12', '2024-02-12']
      ],
      applications: [
        ['1', 'Senior React Developer', 'TechCorp Inc.', 'John Smith', 'john@example.com', 'Under Review', '2024-01-12', 'Yes', 'Yes'],
        ['2', 'Product Manager', 'StartupCo', 'Sarah Wilson', 'sarah.w@email.com', 'Shortlisted', '2024-01-11', 'Yes', 'Yes'],
        ['3', 'Data Scientist', 'DataFlow Solutions', 'Mike Johnson', 'mike.j@example.com', 'Applied', '2024-01-13', 'Yes', 'No'],
        ['4', 'Frontend Developer', 'WebStudio', 'Lisa Brown', 'lisa.b@email.com', 'Rejected', '2024-01-09', 'Yes', 'Yes'],
        ['5', 'DevOps Engineer', 'CloudTech Ltd', 'David Chen', 'david.c@example.com', 'Applied', '2024-01-14', 'Yes', 'Yes']
      ],
      analytics: [
        ['Total Users', '12,450', '11,892', '+4.7%', 'Up', '2024-01-15'],
        ['Active Job Seekers', '8,920', '8,634', '+3.3%', 'Up', '2024-01-15'],
        ['Total Companies', '892', '856', '+4.2%', 'Up', '2024-01-15'],
        ['Active Job Postings', '2,156', '2,089', '+3.2%', 'Up', '2024-01-15'],
        ['Applications Submitted', '28,934', '27,123', '+6.7%', 'Up', '2024-01-15']
      ]
    };
    return rows[type] || [];
  };

  const getStatusBadge = (status, progress = 0) => {
    const statusConfig = {
      completed: { bg: 'rgb(34, 197, 94)', text: 'Completed', icon: CheckCircle },
      processing: { bg: 'rgb(249, 168, 37)', text: `Processing (${progress}%)`, icon: Clock },
      failed: { bg: 'rgb(239, 68, 68)', text: 'Failed', icon: AlertTriangle }
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

  const exportTypeOptions = [
    { id: 'users', name: 'Users', icon: Users, description: 'Export user accounts and profiles' },
    { id: 'companies', name: 'Companies', icon: Building, description: 'Export company profiles and details' },
    { id: 'jobs', name: 'Job Postings', icon: Briefcase, description: 'Export job listings and details' },
    { id: 'applications', name: 'Applications', icon: FileText, description: 'Export job applications and resumes' },
    { id: 'analytics', name: 'Analytics Report', icon: BarChart3, description: 'Export comprehensive analytics data' }
  ];

  const formatOptions = [
    { id: 'csv', name: 'CSV', icon: Table, description: 'Comma-separated values (best for spreadsheets)' },
    { id: 'xlsx', name: 'Excel', icon: FileSpreadsheet, description: 'Microsoft Excel format with formatting' },
    { id: 'json', name: 'JSON', icon: FileJson, description: 'JavaScript Object Notation (for developers)' },
    { id: 'pdf', name: 'PDF', icon: FileText, description: 'Portable Document Format (for reports)' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Data Export
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Export user data, company information, and analytics in various formats
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
          >
            <FilterIcon className="h-4 w-4" />
            <span>Advanced Filters</span>
            {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          <button
            onClick={loadExportHistory}
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Export Configuration */}
      <div 
        className="rounded-lg border p-6"
        style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Export Configuration
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Data Type
            </label>
            <div className="grid grid-cols-1 gap-3">
              {exportTypeOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={option.id}
                    onClick={() => setExportType(option.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:opacity-80 ${
                      exportType === option.id ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: exportType === option.id ? 'var(--accent-subtle)' : 'var(--background-deep)',
                      borderColor: exportType === option.id ? 'var(--accent-interactive)' : 'var(--accent-subtle)',
                      ringColor: exportType === option.id ? 'var(--accent-interactive)' : 'transparent'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5" style={{ color: 'var(--accent-interactive)' }} />
                      <div>
                        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {option.name}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              Export Format
            </label>
            <div className="grid grid-cols-1 gap-3">
              {formatOptions.map((option) => {
                const IconComponent = option.icon;
                return (
                  <div
                    key={option.id}
                    onClick={() => setExportFormat(option.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:opacity-80 ${
                      exportFormat === option.id ? 'ring-2' : ''
                    }`}
                    style={{
                      backgroundColor: exportFormat === option.id ? 'var(--accent-subtle)' : 'var(--background-deep)',
                      borderColor: exportFormat === option.id ? 'var(--accent-interactive)' : 'var(--accent-subtle)',
                      ringColor: exportFormat === option.id ? 'var(--accent-interactive)' : 'transparent'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5" style={{ color: 'var(--accent-interactive)' }} />
                      <div>
                        <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {option.name}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Basic Filters */}
        <div className="mt-6">
          <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
            Date Range
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleFilterChange('dateRange', 'start', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--background-deep)',
                  borderColor: 'var(--accent-subtle)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleFilterChange('dateRange', 'end', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--background-deep)',
                  borderColor: 'var(--accent-subtle)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-6 p-4 border rounded-lg" style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-deep)' }}>
            <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
              Advanced Filters
            </h3>
            
            {/* User Specific Filters */}
            {exportType === 'users' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    User Type
                  </label>
                  <select
                    value={filters.userFilters.userType}
                    onChange={(e) => handleFilterChange('userFilters', 'userType', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-panel)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="job_seekers">Job Seekers</option>
                    <option value="recruiters">Recruiters</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Verification Status
                  </label>
                  <select
                    value={filters.userFilters.isVerified}
                    onChange={(e) => handleFilterChange('userFilters', 'isVerified', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-panel)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Users</option>
                    <option value="verified">Verified Only</option>
                    <option value="unverified">Unverified Only</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Activity Status
                  </label>
                  <select
                    value={filters.userFilters.isActive}
                    onChange={(e) => handleFilterChange('userFilters', 'isActive', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-panel)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Registration Source
                  </label>
                  <select
                    value={filters.userFilters.registrationSource}
                    onChange={(e) => handleFilterChange('userFilters', 'registrationSource', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-panel)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Sources</option>
                    <option value="organic">Organic</option>
                    <option value="referral">Referral</option>
                    <option value="social">Social Media</option>
                  </select>
                </div>
              </div>
            )}

            {/* Company Specific Filters */}
            {exportType === 'companies' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Company Size
                  </label>
                  <select
                    value={filters.companyFilters.size}
                    onChange={(e) => handleFilterChange('companyFilters', 'size', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-panel)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Sizes</option>
                    <option value="startup">Startup (1-10)</option>
                    <option value="small">Small (11-50)</option>
                    <option value="medium">Medium (51-200)</option>
                    <option value="large">Large (201-1000)</option>
                    <option value="enterprise">Enterprise (1000+)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Industry
                  </label>
                  <select
                    value={filters.companyFilters.industry}
                    onChange={(e) => handleFilterChange('companyFilters', 'industry', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-panel)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Industries</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Verification
                  </label>
                  <select
                    value={filters.companyFilters.isVerified}
                    onChange={(e) => handleFilterChange('companyFilters', 'isVerified', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-panel)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Companies</option>
                    <option value="verified">Verified Only</option>
                    <option value="unverified">Unverified Only</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Subscription Status
                  </label>
                  <select
                    value={filters.companyFilters.subscriptionStatus}
                    onChange={(e) => handleFilterChange('companyFilters', 'subscriptionStatus', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-panel)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Subscription</option>
                    <option value="expired">Expired Subscription</option>
                    <option value="trial">Trial Period</option>
                    <option value="none">No Subscription</option>
                  </select>
                </div>
              </div>
            )}

            {/* Job Specific Filters */}
            {exportType === 'jobs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Job Status
                  </label>
                  <select
                    value={filters.jobFilters.status}
                    onChange={(e) => handleFilterChange('jobFilters', 'status', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-panel)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="closed">Closed</option>
                    <option value="pending">Pending Approval</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Job Type
                  </label>
                  <select
                    value={filters.jobFilters.type}
                    onChange={(e) => handleFilterChange('jobFilters', 'type', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-panel)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Featured Status
                  </label>
                  <select
                    value={filters.jobFilters.isFeatured}
                    onChange={(e) => handleFilterChange('jobFilters', 'isFeatured', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-panel)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Jobs</option>
                    <option value="featured">Featured Only</option>
                    <option value="regular">Regular Only</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Applications
                  </label>
                  <select
                    value={filters.jobFilters.hasApplications}
                    onChange={(e) => handleFilterChange('jobFilters', 'hasApplications', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-panel)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="all">All Jobs</option>
                    <option value="has_applications">With Applications</option>
                    <option value="no_applications">No Applications</option>
                  </select>
                </div>
              </div>
            )}

            {/* Include Fields */}
            <div className="mt-6">
              <h4 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                Include Fields
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(filters.includeFields).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleFilterChange('includeFields', key, e.target.checked)}
                      className="rounded focus:ring-2"
                      style={{ accentColor: 'var(--accent-interactive)' }}
                    />
                    <span className="text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Export Stats */}
        <div className="mt-6 p-4 border rounded-lg" style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--accent-subtle)' }}>
          <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Export Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4" style={{ color: 'var(--accent-interactive)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Total Records:</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {exportStats.totalRecords.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" style={{ color: 'var(--accent-interactive)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Selected:</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {exportStats.selectedRecords.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Archive className="h-4 w-4" style={{ color: 'var(--accent-interactive)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Estimated Size:</span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {exportStats.estimatedFileSize}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handlePreview}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
            style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
          >
            <Eye className="h-4 w-4" />
            <span>Preview Data</span>
          </button>
          
          <button
            onClick={handleExport}
            disabled={loading || exportStats.selectedRecords === 0}
            className="flex items-center space-x-2 px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white"
            style={{ backgroundColor: 'var(--accent-interactive)' }}
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span>{loading ? 'Exporting...' : 'Start Export'}</span>
          </button>
        </div>
      </div>

      {/* Current Export Progress */}
      {currentExport && (
        <div 
          className="rounded-lg border p-6"
          style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-interactive)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Export in Progress
            </h3>
            {getStatusBadge(currentExport.status, currentExport.progress)}
          </div>
          
          {currentExport.status === 'processing' && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${currentExport.progress}%`,
                  backgroundColor: 'var(--accent-interactive)'
                }}
              />
            </div>
          )}
          
          {currentExport.status === 'failed' && currentExport.error && (
            <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="text-sm">{currentExport.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Export History */}
      <div 
        className="rounded-lg border"
        style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Export History
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--accent-subtle)' }}>
                  <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    File Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Format
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Records
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Size
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Created
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {exportHistory.map((export_item) => (
                  <tr key={export_item.id} className="border-b hover:opacity-80 transition-opacity" style={{ borderColor: 'var(--accent-subtle)' }}>
                    <td className="py-3 px-4">
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {export_item.fileName}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize" style={{ color: 'var(--text-secondary)' }}>
                        {export_item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-xs font-medium px-2 py-1 rounded" style={{ 
                        backgroundColor: 'var(--accent-subtle)', 
                        color: 'var(--text-primary)' 
                      }}>
                        {export_item.format}
                      </span>
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                      {export_item.recordCount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'var(--text-secondary)' }}>
                      {export_item.fileSize}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(export_item.status, export_item.progress)}
                    </td>
                    <td className="py-3 px-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {export_item.createdAt.toLocaleDateString()} {export_item.createdAt.toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center space-x-2">
                        {export_item.status === 'completed' && export_item.downloadUrl && (
                          <button
                            onClick={() => window.open(export_item.downloadUrl, '_blank')}
                            className="p-2 rounded hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          className="p-2 rounded hover:opacity-80 transition-opacity text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={() => setShowPreview(false)} />
            
            <div 
              className="relative inline-block w-full max-w-6xl p-6 my-8 text-left align-middle transition-all transform rounded-lg shadow-xl"
              style={{ backgroundColor: 'var(--background-panel)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                    Data Preview - {exportType.charAt(0).toUpperCase() + exportType.slice(1)}
                  </h3>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Showing first 5 rows of {previewData.totalRows.toLocaleString()} total records
                  </p>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1 rounded hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border rounded-lg" style={{ borderColor: 'var(--accent-subtle)' }}>
                  <thead style={{ backgroundColor: 'var(--background-deep)' }}>
                    <tr>
                      {previewData.columns.map((column, index) => (
                        <th key={index} className="px-4 py-3 text-left text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t hover:opacity-80 transition-opacity" style={{ borderColor: 'var(--accent-subtle)' }}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity"
                  style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}