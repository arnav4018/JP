'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import API from '@/services/api';
import authService from '@/services/authService';
import { 
  MapPin, 
  Clock, 
  Briefcase, 
  DollarSign, 
  Building, 
  Users, 
  Globe, 
  CheckCircle,
  ArrowLeft,
  BookmarkPlus,
  Share2,
  Calendar
} from 'lucide-react';
import Link from 'next/link';
import ApplicationModal from '@/components/ui/ApplicationModal';

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      await authService.waitForInitialization();
      setIsAuthenticated(authService.isAuthenticated());
      setUser(authService.getCurrentUser());
    };
    initAuth();
  }, []);

  useEffect(() => {
    const loadJobData = async () => {
      if (!params.jobId) return;

      setLoading(true);
      setError(null);

      try {
        // First try to fetch job details
        try {
          const jobData = await API.jobs.getById(params.jobId);
          setJob(jobData);
        } catch (detailError) {
          console.log('Individual job API failed, trying fallback:', detailError);
          
          // Fallback: Get job from jobs list
          const allJobsResponse = await API.jobs.getAll({ limit: 100 });
          const targetJob = allJobsResponse.data.jobs.find(job => job.id.toString() === params.jobId.toString());
          
          if (targetJob) {
            // Transform the job data to match expected format
            const transformedJob = {
              ...targetJob,
              company: targetJob.company_name || targetJob.company,
              postedDate: targetJob.created_at,
              type: targetJob.employment_type || 'Full-time',
              category: targetJob.experience_level || 'Not specified',
              salary: targetJob.salary_min && targetJob.salary_max 
                ? `₹${(targetJob.salary_min / 100000).toFixed(1)}L - ₹${(targetJob.salary_max / 100000).toFixed(1)}L`
                : targetJob.salary_min 
                  ? `₹${(targetJob.salary_min / 100000).toFixed(1)}L+`
                  : 'Not disclosed',
              requirements: targetJob.requirements || [],
              benefits: targetJob.benefits || []
            };
            setJob(transformedJob);
          } else {
            throw new Error('Job not found in jobs list either');
          }
        }

        // Check if user has applied (only if authenticated)
        if (isAuthenticated && user) {
          const userId = authService.getUserId();
          if (userId) {
            // Note: Application status check would need backend implementation
            // For now, we'll set it to null
            setApplicationStatus(null);
          }
        }
      } catch (err) {
        setError('Failed to load job details');
        console.error('Error loading job:', err);
      } finally {
        setLoading(false);
      }
    };

    loadJobData();
  }, [params.jobId, isAuthenticated, user]);

  const formatPostedDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'Full-time': { backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' },
      'Part-time': { backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' },
      'Contract': { backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' },
      'Freelance': { backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' },
      'Internship': { backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }
    };
    return colors[type] || { backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' };
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/jobs/${params.jobId}`));
      return;
    }
    setShowApplicationModal(true);
  };

  const handleSaveJob = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/jobs/${params.jobId}`));
      return;
    }
    setIsSaved(!isSaved);
    // In a real app, this would save to backend
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job at ${job.company}: ${job.title}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 rounded mb-6 w-1/4" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
      <div className="space-y-8">
        <div className="h-6 rounded w-3/4" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
        <div className="h-4 rounded w-1/2" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-4 rounded" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
          <div className="h-4 rounded" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 rounded w-full" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
          <div className="h-4 rounded w-5/6" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
          <div className="h-4 rounded w-4/6" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen" style={{ backgroundColor: 'var(--background-deep)' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LoadingSkeleton />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-deep)' }}>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {error}
            </h1>
            <Link
              href="/jobs"
              className="inline-flex items-center px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              href="/jobs"
              className="inline-flex items-center text-sm transition-colors hover:opacity-80"
              style={{ color: 'var(--accent-interactive)' }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="rounded-lg shadow-sm p-8" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
                {/* Job Header */}
                <div className="mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                        {job.title}
                      </h1>
                      <div className="flex items-center space-x-2 mb-4">
                        <Building className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                        <Link 
                          href={`/companies/${job.company.toLowerCase().replace(/\\s+/g, '-')}`}
                          className="text-lg font-medium transition-colors hover:opacity-80"
                          style={{ color: 'var(--accent-interactive)' }}
                        >
                          {job.company}
                        </Link>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={handleSaveJob}
                        className="inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                        style={{ 
                          borderColor: 'var(--accent-subtle)', 
                          color: isSaved ? 'var(--accent-interactive)' : 'var(--text-secondary)', 
                          backgroundColor: 'var(--background-deep)' 
                        }}
                      >
                        <BookmarkPlus className="h-4 w-4 mr-2" />
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                      <button
                        onClick={handleShare}
                        className="inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
                        style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)', backgroundColor: 'var(--background-deep)' }}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </button>
                    </div>
                  </div>

                  {/* Job Meta Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Briefcase className="h-4 w-4" />
                      <span>{job.category}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Clock className="h-4 w-4" />
                      <span>{formatPostedDate(job.postedDate)}</span>
                    </div>
                  </div>

                  {/* Job Type Badge */}
                  <div className="mb-6">
                    <span className="px-3 py-1 rounded-full text-sm font-medium" style={getJobTypeColor(job.type)}>
                      {job.type}
                    </span>
                  </div>
                </div>

                {/* Job Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    About this role
                  </h2>
                  <div className="prose max-w-none" style={{ color: 'var(--text-secondary)' }}>
                    <p className="text-base leading-relaxed">{job.description}</p>
                  </div>
                </div>

                {/* Requirements */}
                {job.requirements && job.requirements.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                      Requirements
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {job.requirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent-interactive)' }} />
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {job.benefits && job.benefits.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                      Benefits & Perks
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {job.benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent-interactive)' }} />
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Apply Section */}
                <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
                  {applicationStatus ? (
                    <div className="text-center">
                      <div className="mb-4">
                        <CheckCircle className="h-12 w-12 mx-auto" style={{ color: 'var(--accent-interactive)' }} />
                      </div>
                      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                        Application Submitted
                      </h3>
                      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                        Status: <span className="font-medium capitalize">{applicationStatus.status.replace('_', ' ')}</span>
                      </p>
                      <Link
                        href="/applications"
                        className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                        style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
                      >
                        View Application
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={handleApplyClick}
                        className="w-full mb-4 px-6 py-3 rounded-lg text-lg font-semibold transition-opacity hover:opacity-90"
                        style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
                      >
                        Apply Now
                      </button>
                      {!isAuthenticated && (
                        <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                          You'll be asked to sign in before applying
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Company Quick Info */}
                <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    About {job.company}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Building className="h-4 w-4" />
                      <span>Technology Company</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Users className="h-4 w-4" />
                      <span>100-500 employees</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Globe className="h-4 w-4" />
                      <span>www.{job.company.toLowerCase().replace(' ', '')}.com</span>
                    </div>
                  </div>
                  <Link
                    href={`/companies/${job.company.toLowerCase().replace(/\\s+/g, '-')}`}
                    className="inline-flex items-center mt-4 text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: 'var(--accent-interactive)' }}
                  >
                    View Company Profile
                  </Link>
                </div>

                {/* Job Stats */}
                <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Job Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>Job ID:</span>
                      <span style={{ color: 'var(--text-primary)' }}>#{job.id.toString().padStart(4, '0')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>Applications:</span>
                      <span style={{ color: 'var(--text-primary)' }}>23 candidates</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span style={{ color: 'var(--text-secondary)' }}>Posted:</span>
                      <span style={{ color: 'var(--text-primary)' }}>{formatPostedDate(job.postedDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Modal */}
        {showApplicationModal && (
          <ApplicationModal
            job={job}
            isOpen={showApplicationModal}
            onClose={() => setShowApplicationModal(false)}
            onSuccess={(applicationId) => {
              setShowApplicationModal(false);
              // Update application status
              setApplicationStatus({
                id: applicationId,
                status: 'applied',
                appliedAt: new Date().toISOString()
              });
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}