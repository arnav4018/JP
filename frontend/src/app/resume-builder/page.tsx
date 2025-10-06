'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/store/useAuthStore';
import { 
  FileText, 
  Download, 
  Eye, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy,
  Save,
  Upload,
  Palette,
  User,
  Briefcase,
  GraduationCap,
  Award
} from 'lucide-react';
import apiClient from '@/services/httpClient';

interface Resume {
  id: string;
  title: string;
  template: string;
  status: 'draft' | 'completed';
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
  };
  lastUpdated: string;
  downloadCount?: number;
}

export default function ResumeBuilderPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [showNewResumeModal, setShowNewResumeModal] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('modern');

  const templates = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean and professional design with subtle colors',
      preview: '/images/templates/modern-preview.png'
    },
    {
      id: 'classic',
      name: 'Classic',
      description: 'Traditional format suitable for conservative industries',
      preview: '/images/templates/classic-preview.png'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Eye-catching design for creative professionals',
      preview: '/images/templates/creative-preview.png'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean and simple layout focusing on content',
      preview: '/images/templates/minimal-preview.png'
    }
  ];

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent('/resume-builder'));
      return;
    }

    if (user?.role !== 'candidate') {
      router.push('/profile');
      return;
    }

    fetchResumes();
  }, [isAuthenticated, authLoading, router, user]);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/resumes');
      if (response.data.success) {
        setResumes(response.data.data.resumes);
      }
    } catch (error: any) {
      setError('Failed to load resumes');
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewResume = async () => {
    if (!newResumeTitle.trim()) {
      setError('Please enter a resume title');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/api/resumes', {
        title: newResumeTitle,
        template: selectedTemplate,
        personalInfo: {
          firstName: user?.firstName || user?.first_name || '',
          lastName: user?.lastName || user?.last_name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          location: user?.location || ''
        }
      });

      if (response.data.success) {
        setShowNewResumeModal(false);
        setNewResumeTitle('');
        fetchResumes();
        // Navigate to resume editor
        router.push(`/resume-builder/edit/${response.data.data.resume.id}`);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create resume');
    } finally {
      setLoading(false);
    }
  };

  const duplicateResume = async (resumeId: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post(`/api/resumes/${resumeId}/clone`);
      if (response.data.success) {
        fetchResumes();
      }
    } catch (error: any) {
      setError('Failed to duplicate resume');
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.delete(`/api/resumes/${resumeId}`);
      if (response.data.success) {
        fetchResumes();
      }
    } catch (error: any) {
      setError('Failed to delete resume');
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = async (resumeId: string, format: 'pdf' | 'json' = 'pdf') => {
    try {
      const response = await apiClient.get(`/api/resumes/${resumeId}/download?format=${format}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: format === 'pdf' ? 'application/pdf' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resume.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      setError('Failed to download resume');
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

  if (!isAuthenticated || user?.role !== 'candidate') {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Resume Builder
                </h1>
                <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Create professional resumes to stand out to employers
                </p>
              </div>
              <button
                onClick={() => setShowNewResumeModal(true)}
                className="inline-flex items-center px-6 py-3 text-white rounded-lg shadow-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: 'var(--accent-interactive)' }}
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Resume
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Resume Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-lg shadow-md p-6 animate-pulse" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))
            ) : resumes.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  No resumes yet
                </h3>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Create your first professional resume to get started
                </p>
                <button
                  onClick={() => setShowNewResumeModal(true)}
                  className="inline-flex items-center px-6 py-3 text-white rounded-lg shadow-md hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--accent-interactive)' }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Resume
                </button>
              </div>
            ) : (
              resumes.map((resume) => (
                <div key={resume.id} className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--background-panel)' }}>
                  {/* Resume Preview */}
                  <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                    <FileText className="h-16 w-16" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  
                  {/* Resume Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {resume.title}
                        </h3>
                        <p className="text-sm capitalize" style={{ color: 'var(--text-secondary)' }}>
                          {resume.template} template
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        resume.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {resume.status === 'completed' ? 'Completed' : 'Draft'}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Last updated: {new Date(resume.lastUpdated).toLocaleDateString()}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/resume-builder/edit/${resume.id}`)}
                          className="p-2 rounded-md hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }}
                          title="Edit Resume"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/resume-builder/preview/${resume.id}`)}
                          className="p-2 rounded-md hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }}
                          title="Preview Resume"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadResume(resume.id)}
                          className="p-2 rounded-md hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }}
                          title="Download Resume"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => duplicateResume(resume.id)}
                          className="p-2 rounded-md hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
                          title="Duplicate Resume"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteResume(resume.id)}
                          className="p-2 rounded-md hover:opacity-80 transition-opacity text-red-500"
                          title="Delete Resume"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* New Resume Modal */}
      {showNewResumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full rounded-lg shadow-xl" style={{ backgroundColor: 'var(--background-panel)' }}>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Create New Resume
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Resume Title
                  </label>
                  <input
                    type="text"
                    value={newResumeTitle}
                    onChange={(e) => setNewResumeTitle(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-offset-2"
                    style={{ 
                      borderColor: 'var(--accent-subtle)', 
                      backgroundColor: 'var(--background-deep)',
                      color: 'var(--text-primary)',
                      
                    }}
                    placeholder="e.g. Software Engineer Resume"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Choose Template
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedTemplate === template.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="aspect-[3/4] bg-gray-100 rounded mb-2 flex items-center justify-center">
                          <Palette className="h-8 w-8" style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        <h3 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                          {template.name}
                        </h3>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {template.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowNewResumeModal(false);
                    setNewResumeTitle('');
                    setError('');
                  }}
                  className="px-4 py-2 border rounded-md hover:opacity-80 transition-opacity"
                  style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={createNewResume}
                  disabled={loading || !newResumeTitle.trim()}
                  className="px-4 py-2 text-white rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent-interactive)' }}
                >
                  {loading ? 'Creating...' : 'Create Resume'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
