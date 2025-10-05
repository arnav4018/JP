'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/store/useAuthStore';
import API from '@/services/api';
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Briefcase,
  Star,
  CreditCard,
  Check,
  X,
  ArrowLeft,
  Building,
  Calendar,
  FileText,
  Zap,
  Eye,
  TrendingUp,
  Target
} from 'lucide-react';

export default function PostJob() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time',
    salary: '',
    description: '',
    requirements: '',
    benefits: '',
    tags: '',
    applicationDeadline: '',
    isFeatured: false
  });
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=' + encodeURIComponent('/post-job'));
        return;
      }
      
      // Check if user is recruiter or admin
      if (user && !['recruiter', 'admin'].includes(user.role)) {
        router.push('/');
        return;
      }
    }
  }, [isAuthenticated, authLoading, user, router]);

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
    return null; // Will redirect to login or home page
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'isFeatured') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
      
      // Show payment modal when featured is enabled
      if (checked) {
        setShowPaymentModal(true);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare job data for API
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        salary: formData.salary,
        description: formData.description,
        requirements: formData.requirements,
        benefits: formData.benefits,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        applicationDeadline: formData.applicationDeadline,
        isFeatured: formData.isFeatured
      };

      // Call API to create job
      const response = await API.jobs.create(jobData);
      
      if (response.success !== false) {
        // Job created successfully
        console.log('Job posted successfully:', response);
        
        // Redirect to My Jobs page to see the posted job
        router.push('/recruiter/jobs?posted=true');
      } else {
        // Handle API error
        console.error('Failed to post job:', response.message);
        alert('Failed to post job: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error posting job:', error);
      
      // If API fails, use local storage as fallback (for demo purposes)
      console.log('API failed, using local storage fallback...');
      try {
        // Generate a unique ID
        const jobId = Date.now();
        
        // Create the job object with current timestamp
        const newJob = {
          ...jobData,
          id: jobId,
          status: 'approved', // Auto-approve for demo
          created_date: new Date().toISOString(),
          applications: 0,
          views: 0,
          is_featured: jobData.isFeatured,
          is_flagged: false,
          posted_by: user?.name || user?.firstName + ' ' + user?.lastName || 'You',
          posted_by_email: user?.email || 'your@email.com'
        };
        
        // Store in localStorage
        const existingJobs = JSON.parse(localStorage.getItem('fallbackJobs') || '[]');
        existingJobs.push(newJob);
        localStorage.setItem('fallbackJobs', JSON.stringify(existingJobs));
        
        console.log('Job saved to local storage:', newJob);
        alert('Job posted successfully! (Using local storage as API is unavailable)');
        
        // Redirect to My Jobs page
        router.push('/recruiter/jobs?posted=true&fallback=true');
        return;
        
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        alert('Failed to post job: ' + (error.message || 'Network error. Please try again.'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 mb-4 text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-interactive)' }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Post a New Job
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Find the perfect candidate for your open position
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Basic Information */}
                <div 
                  className="rounded-lg border p-6"
                  style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
                >
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Basic Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Job Title*
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: 'var(--background-deep)',
                          borderColor: 'var(--accent-subtle)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="e.g. Senior Frontend Developer"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Company Name*
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: 'var(--background-deep)',
                          borderColor: 'var(--accent-subtle)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="e.g. TechCorp Inc."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Location*
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: 'var(--background-deep)',
                          borderColor: 'var(--accent-subtle)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="e.g. San Francisco, CA or Remote"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Job Type*
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: 'var(--background-deep)',
                          borderColor: 'var(--accent-subtle)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                        <option value="freelance">Freelance</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Salary Range
                      </label>
                      <input
                        type="text"
                        name="salary"
                        value={formData.salary}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: 'var(--background-deep)',
                          borderColor: 'var(--accent-subtle)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="e.g. $80,000 - $120,000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Application Deadline
                      </label>
                      <input
                        type="date"
                        name="applicationDeadline"
                        value={formData.applicationDeadline}
                        onChange={handleInputChange}
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

                {/* Job Description */}
                <div 
                  className="rounded-lg border p-6"
                  style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
                >
                  <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    Job Details
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Job Description*
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-y"
                        style={{
                          backgroundColor: 'var(--background-deep)',
                          borderColor: 'var(--accent-subtle)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Requirements
                      </label>
                      <textarea
                        name="requirements"
                        value={formData.requirements}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-y"
                        style={{
                          backgroundColor: 'var(--background-deep)',
                          borderColor: 'var(--accent-subtle)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="List required skills, experience, and qualifications..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Benefits & Perks
                      </label>
                      <textarea
                        name="benefits"
                        value={formData.benefits}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-y"
                        style={{
                          backgroundColor: 'var(--background-deep)',
                          borderColor: 'var(--accent-subtle)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="Health insurance, remote work, equity, etc..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: 'var(--background-deep)',
                          borderColor: 'var(--accent-subtle)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="React, JavaScript, Node.js, MongoDB"
                      />
                    </div>
                  </div>
                </div>

                {/* Featured Listing Toggle */}
                <div 
                  className="rounded-lg border p-6"
                  style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-3">
                      <Star className="h-6 w-6 mt-1" style={{ color: 'var(--accent-interactive)' }} />
                      <div>
                        <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
                          Feature this Job Listing
                        </h3>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                          Get 3x more visibility and priority placement in search results
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <span className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>3x more views</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4" />
                            <span>Priority ranking</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Target className="h-4 w-4" />
                            <span>Featured badge</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-xl font-bold" style={{ color: 'var(--accent-interactive)' }}>
                        $49
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="isFeatured"
                          checked={formData.isFeatured}
                          onChange={handleInputChange}
                          className="sr-only peer"
                        />
                        <div 
                          className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"
                          style={{
                            backgroundColor: formData.isFeatured ? 'var(--accent-interactive)' : '#d1d5db'
                          }}
                        ></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 border rounded-lg font-medium transition-opacity hover:opacity-80"
                    style={{ 
                      borderColor: 'var(--accent-subtle)', 
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--background-panel)'
                    }}
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50"
                    style={{ 
                      backgroundColor: 'var(--accent-interactive)', 
                      color: 'var(--background-deep)'
                    }}
                  >
                    {isSubmitting ? 'Posting Job...' : 'Post Job'}
                  </button>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <JobPostingSidebar />
            </div>
          </div>

          {/* Payment Modal */}
          {showPaymentModal && (
            <PaymentModal
              isOpen={showPaymentModal}
              onClose={() => {
                setShowPaymentModal(false);
                if (formData.isFeatured) {
                  setFormData(prev => ({ ...prev, isFeatured: false }));
                }
              }}
              onConfirm={() => {
                setShowPaymentModal(false);
                // Keep isFeatured as true since payment was confirmed
              }}
              amount={49}
              description="Feature this job listing for 30 days"
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// Sidebar Component
const JobPostingSidebar = () => (
  <div className="space-y-6">
    {/* Posting Tips */}
    <div 
      className="rounded-lg border p-6"
      style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
    >
      <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
        💡 Posting Tips
      </h3>
      
      <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <div className="flex items-start space-x-2">
          <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'green' }} />
          <span>Write a clear, specific job title</span>
        </div>
        <div className="flex items-start space-x-2">
          <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'green' }} />
          <span>Include salary range to attract quality candidates</span>
        </div>
        <div className="flex items-start space-x-2">
          <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'green' }} />
          <span>List specific skills and requirements</span>
        </div>
        <div className="flex items-start space-x-2">
          <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'green' }} />
          <span>Highlight company benefits and culture</span>
        </div>
      </div>
    </div>

    {/* Pricing Info */}
    <div 
      className="rounded-lg border p-6"
      style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
    >
      <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
        📊 Job Posting Stats
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Standard Post</span>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Free</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Featured Post</span>
          <span className="font-medium" style={{ color: 'var(--accent-interactive)' }}>$49</span>
        </div>
        
        <div className="border-t pt-4" style={{ borderColor: 'var(--accent-subtle)' }}>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Featured posts get 3x more applications and stay at the top of search results for 30 days.
          </p>
        </div>
      </div>
    </div>

    {/* Support */}
    <div 
      className="rounded-lg border p-6"
      style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
    >
      <h3 className="font-semibold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>
        🤝 Need Help?
      </h3>
      
      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        Our team is here to help you create the perfect job posting.
      </p>
      
      <button 
        className="w-full px-4 py-2 border rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
        style={{ borderColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }}
      >
        Contact Support
      </button>
    </div>
  </div>
);

// Payment Modal Component
const PaymentModal = ({ isOpen, onClose, onConfirm, amount, description }) => {
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  if (!isOpen) return null;

  const handlePayment = () => {
    // Simulate payment processing
    setTimeout(() => {
      onConfirm();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
        
        <div 
          className="relative inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform rounded-lg shadow-xl"
          style={{ backgroundColor: 'var(--background-panel)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              Complete Payment
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Order Summary */}
          <div 
            className="rounded-lg border p-4 mb-6"
            style={{ backgroundColor: 'var(--background-deep)', borderColor: 'var(--accent-subtle)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {description}
              </span>
              <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                ${amount}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span>30-day featured placement</span>
              <span>✨ 3x more visibility</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              Payment Method
            </h4>
            
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  value="card"
                  checked={selectedPayment === 'card'}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  style={{ accentColor: 'var(--accent-interactive)' }}
                />
                <CreditCard className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                <span style={{ color: 'var(--text-primary)' }}>Credit/Debit Card</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  value="paypal"
                  checked={selectedPayment === 'paypal'}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  style={{ accentColor: 'var(--accent-interactive)' }}
                />
                <div className="h-5 w-5 rounded" style={{ backgroundColor: '#0070ba' }}></div>
                <span style={{ color: 'var(--text-primary)' }}>PayPal</span>
              </label>
            </div>
          </div>

          {/* Card Details */}
          {selectedPayment === 'card' && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardData.number}
                  onChange={(e) => setCardData(prev => ({...prev, number: e.target.value}))}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--background-deep)',
                    borderColor: 'var(--accent-subtle)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => setCardData(prev => ({...prev, expiry: e.target.value}))}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-deep)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                    CVC
                  </label>
                  <input
                    type="text"
                    value={cardData.cvc}
                    onChange={(e) => setCardData(prev => ({...prev, cvc: e.target.value}))}
                    placeholder="123"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: 'var(--background-deep)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardData.name}
                  onChange={(e) => setCardData(prev => ({...prev, name: e.target.value}))}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: 'var(--background-deep)',
                    borderColor: 'var(--accent-subtle)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Total */}
          <div 
            className="flex items-center justify-between py-4 border-t border-b mb-6"
            style={{ borderColor: 'var(--accent-subtle)' }}
          >
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Total</span>
            <span className="text-xl font-bold" style={{ color: 'var(--accent-interactive)' }}>
              ${amount}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
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
              onClick={handlePayment}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: 'var(--accent-interactive)', 
                color: 'var(--background-deep)'
              }}
            >
              Pay ${amount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};