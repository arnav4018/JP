'use client';

import { useState, useEffect } from 'react';
import API from '@/services/api';
import authService from '@/services/authService';
import { X, Upload, FileText, CheckCircle, AlertCircle, User, Mail, Phone, MapPin } from 'lucide-react';

export default function ApplicationModal({ job, isOpen, onClose, onSuccess }) {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    coverLetter: '',
    resume: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Initialize auth and form data when modal opens
  useEffect(() => {
    const initAuth = async () => {
      await authService.waitForInitialization();
      setUser(authService.getCurrentUser());
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (isOpen && user) {
      const fullName = authService.getFullName();
      setFormData({
        fullName: fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location_city || '',
        coverLetter: `Dear Hiring Manager,\n\nI am excited to apply for the ${job.title} position at ${job.company_name || job.company}. With my background in ${user.skills?.join(', ') || 'the relevant field'}, I believe I would be a valuable addition to your team.\n\nBest regards,\n${fullName}`,
        resume: user.resume || null
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, user, job]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({
        ...prev,
        resume: {
          file,
          filename: file.name,
          uploadedAt: new Date().toISOString()
        }
      }));
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.resume) {
      setError('Please fill in all required fields and upload a resume');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const applicationData = {
        jobId: job.id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        coverLetter: formData.coverLetter,
        resume: formData.resume
      };

      const response = await API.jobs.apply(job.id, applicationData);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess(response.applicationId || response.id);
        }, 2000);
      } else {
        setError('Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error('Application submission error:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (err.status === 401) {
        errorMessage = 'Please log in to submit your application.';
      } else if (err.status === 404) {
        errorMessage = 'Job not found. It may have been removed or is no longer available.';
      } else if (err.status === 400) {
        errorMessage = err.message || 'Invalid application data. Please check all required fields.';
      } else if (err.status === 500) {
        errorMessage = 'Server error occurred. Our team has been notified. Please try again later.';
      } else if (err.message && err.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal content */}
        <div className="relative inline-block w-full max-w-2xl p-6 my-8 text-left align-middle transition-all transform rounded-lg shadow-xl" style={{ backgroundColor: 'var(--background-panel)' }}>
          {/* Success state */}
          {success && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--accent-interactive)' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Application Submitted!
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                Your application for <strong>{job.title}</strong> at <strong>{job.company}</strong> has been submitted successfully.
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                You'll receive a confirmation email shortly and can track your application status in your dashboard.
              </p>
            </div>
          )}

          {/* Form state */}
          {!success && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Apply for {job.title}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    at {job.company}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="p-2 rounded-lg hover:opacity-80 transition-opacity disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--accent-subtle)' }}
                >
                  <X className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                </button>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 rounded-lg flex items-center space-x-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgb(239, 68, 68)' }}>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      <User className="h-4 w-4 inline mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{ 
                        backgroundColor: 'var(--background-deep)',
                        borderColor: 'var(--accent-subtle)',
                        color: 'var(--text-primary)',
                        '--focus-ring-color': 'var(--accent-interactive)'
                      }}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{ 
                        backgroundColor: 'var(--background-deep)',
                        borderColor: 'var(--accent-subtle)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{ 
                        backgroundColor: 'var(--background-deep)',
                        borderColor: 'var(--accent-subtle)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{ 
                        backgroundColor: 'var(--background-deep)',
                        borderColor: 'var(--accent-subtle)',
                        color: 'var(--text-primary)'
                      }}
                      placeholder="Enter your location"
                    />
                  </div>
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    <FileText className="h-4 w-4 inline mr-1" />
                    Resume *
                  </label>
                  
                  {formData.resume ? (
                    <div className="p-4 border rounded-lg flex items-center justify-between" style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-deep)' }}>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                          <FileText className="h-5 w-5" style={{ color: 'var(--accent-interactive)' }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                            {formData.resume.filename}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {formData.resume.file ? 'New file selected' : 'From profile'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, resume: null }))}
                        className="p-1 rounded hover:opacity-80 transition-opacity"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive ? 'border-blue-400 bg-blue-50' : ''
                      }`}
                      style={{ 
                        borderColor: dragActive ? 'var(--accent-interactive)' : 'var(--accent-subtle)',
                        backgroundColor: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'var(--background-deep)'
                      }}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-secondary)' }} />
                      <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                        Drag and drop your resume here, or click to browse
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        PDF files only, max 5MB
                      </p>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileInputChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* Cover Letter */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Cover Letter
                  </label>
                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      backgroundColor: 'var(--background-deep)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="Tell us why you're interested in this position..."
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Optional: Personalize your application with a brief cover letter
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border rounded-lg font-medium transition-opacity hover:opacity-80 disabled:cursor-not-allowed"
                    style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)', backgroundColor: 'var(--background-deep)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.fullName || !formData.email || !formData.resume}
                    className="flex-1 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
                  >
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}