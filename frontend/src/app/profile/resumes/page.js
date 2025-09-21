'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useResumeStore } from '@/store/useResumeStore';
import { useAuth } from '@/store/useAuthStore';
import { 
  FileText, 
  Plus, 
  Edit, 
  Download, 
  Trash2, 
  Eye, 
  Copy, 
  Calendar,
  MoreVertical,
  ArrowLeft,
  Search,
  Filter,
  Grid,
  List,
  Star,
  StarOff
} from 'lucide-react';

const templateNames = {
  classic: 'Classic',
  modern: 'Modern',
  creative: 'Creative'
};

export default function ResumesDashboard() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { savedResumes, deleteResume, loadResume, createNewResume } = useResumeStore();
  
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastModified'); // 'lastModified', 'name', 'template'
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent('/profile/resumes'));
      return;
    }
  }, [isAuthenticated, authLoading, router]);

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

  const filteredResumes = savedResumes
    .filter(resume => 
      resume.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.personalInfo?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resume.personalInfo?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'template':
          return a.template.localeCompare(b.template);
        case 'lastModified':
        default:
          return new Date(b.lastModified) - new Date(a.lastModified);
      }
    });

  const handleCreateNewResume = () => {
    createNewResume();
    router.push('/resume-builder');
  };

  const handleEditResume = (resumeId) => {
    loadResume(resumeId);
    router.push('/resume-builder');
  };

  const handleDeleteResume = (resumeId) => {
    deleteResume(resumeId);
    setShowDeleteModal(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCompletionPercentage = (resume) => {
    let completed = 0;
    let total = 5; // Basic sections

    if (resume.personalInfo?.firstName && resume.personalInfo?.lastName) completed++;
    if (resume.personalInfo?.email && resume.personalInfo?.phone) completed++;
    if (resume.personalInfo?.summary) completed++;
    if (resume.experience?.length > 0) completed++;
    if (Object.values(resume.skills || {}).some(arr => arr.length > 0)) completed++;

    return Math.round((completed / total) * 100);
  };

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/profile')}
                className="p-2 rounded-lg hover:opacity-80 transition-opacity"
                style={{ backgroundColor: 'var(--background-panel)', border: '1px solid var(--accent-subtle)' }}
              >
                <ArrowLeft className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
              </button>
              
              <div>
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  My Resumes
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Manage and download your professional resumes
                </p>
              </div>
            </div>

            <button
              onClick={handleCreateNewResume}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
            >
              <Plus className="h-5 w-5" />
              <span>Create New Resume</span>
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--background-panel)',
                  borderColor: 'var(--accent-subtle)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--background-panel)',
                borderColor: 'var(--accent-subtle)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="lastModified">Last Modified</option>
              <option value="name">Name</option>
              <option value="template">Template</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex border rounded-lg" style={{ borderColor: 'var(--accent-subtle)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'opacity-100' : 'opacity-60'} hover:opacity-80 transition-opacity`}
                style={{ 
                  backgroundColor: viewMode === 'grid' ? 'var(--accent-subtle)' : 'transparent',
                  color: 'var(--text-secondary)'
                }}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'opacity-100' : 'opacity-60'} hover:opacity-80 transition-opacity`}
                style={{ 
                  backgroundColor: viewMode === 'list' ? 'var(--accent-subtle)' : 'transparent',
                  color: 'var(--text-secondary)'
                }}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Resumes Grid/List */}
          {filteredResumes.length === 0 ? (
            <EmptyState onCreateNew={handleCreateNewResume} hasSearch={searchQuery.length > 0} />
          ) : (
            <div className={viewMode === 'grid' ? 
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 
              'space-y-4'
            }>
              {filteredResumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  viewMode={viewMode}
                  onEdit={() => handleEditResume(resume.id)}
                  onDelete={() => setShowDeleteModal(resume.id)}
                  onView={() => handleEditResume(resume.id)}
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  getCompletionPercentage={getCompletionPercentage}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <DeleteModal
              resume={savedResumes.find(r => r.id === showDeleteModal)}
              onConfirm={() => handleDeleteResume(showDeleteModal)}
              onCancel={() => setShowDeleteModal(null)}
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// Resume Card Component
const ResumeCard = ({ 
  resume, 
  viewMode, 
  onEdit, 
  onDelete, 
  onView,
  activeDropdown,
  setActiveDropdown,
  getCompletionPercentage,
  formatDate
}) => {
  const completionPercentage = getCompletionPercentage(resume);
  const dropdownId = `dropdown-${resume.id}`;

  if (viewMode === 'list') {
    return (
      <div 
        className="flex items-center p-4 rounded-lg border transition-shadow hover:shadow-md"
        style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
      >
        {/* Resume Preview */}
        <div className="flex-shrink-0 mr-4">
          <div 
            className="w-12 h-16 rounded border flex items-center justify-center cursor-pointer hover:opacity-80"
            style={{ backgroundColor: 'var(--accent-subtle)', borderColor: 'var(--accent-interactive)' }}
            onClick={onView}
          >
            <FileText className="h-6 w-6" style={{ color: 'var(--accent-interactive)' }} />
          </div>
        </div>

        {/* Resume Info */}
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {resume.name}
            </h3>
            <span 
              className="px-2 py-1 rounded text-xs font-medium"
              style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }}
            >
              {templateNames[resume.template]}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span>Modified {formatDate(resume.lastModified)}</span>
            <span>{completionPercentage}% Complete</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 rounded hover:opacity-80 transition-opacity"
            style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
            title="Edit resume"
          >
            <Edit className="h-4 w-4" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId)}
              className="p-2 rounded hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {activeDropdown === dropdownId && (
              <ActionsDropdown
                resume={resume}
                onEdit={onEdit}
                onDelete={onDelete}
                onClose={() => setActiveDropdown(null)}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div 
      className="rounded-lg border p-6 transition-shadow hover:shadow-lg group"
      style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
            {resume.name}
          </h3>
          <div className="flex items-center space-x-2">
            <span 
              className="px-2 py-1 rounded text-xs font-medium"
              style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }}
            >
              {templateNames[resume.template]}
            </span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId)}
            className="p-1 rounded hover:opacity-80 transition-opacity opacity-0 group-hover:opacity-100"
            style={{ color: 'var(--text-secondary)' }}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {activeDropdown === dropdownId && (
            <ActionsDropdown
              resume={resume}
              onEdit={onEdit}
              onDelete={onDelete}
              onClose={() => setActiveDropdown(null)}
            />
          )}
        </div>
      </div>

      {/* Preview */}
      <div 
        className="w-full h-32 rounded border mb-4 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
        style={{ backgroundColor: 'var(--accent-subtle)', borderColor: 'var(--accent-interactive)' }}
        onClick={onView}
      >
        <FileText className="h-8 w-8" style={{ color: 'var(--accent-interactive)' }} />
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
          <span>Completion</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--accent-subtle)' }}>
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              backgroundColor: 'var(--accent-interactive)',
              width: `${completionPercentage}%`
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(resume.lastModified)}</span>
        </div>
        
        <button
          onClick={onEdit}
          className="flex items-center space-x-1 px-3 py-1 rounded hover:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
        >
          <Edit className="h-3 w-3" />
          <span>Edit</span>
        </button>
      </div>
    </div>
  );
};

// Actions Dropdown Component
const ActionsDropdown = ({ resume, onEdit, onDelete, onClose }) => (
  <>
    <div className="fixed inset-0 z-40" onClick={onClose} />
    <div 
      className="absolute right-0 top-full mt-2 w-48 rounded-lg border shadow-lg py-2 z-50"
      style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
    >
      <button
        onClick={() => { onEdit(); onClose(); }}
        className="flex items-center space-x-3 px-4 py-2 text-sm w-full text-left hover:opacity-80 transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--accent-subtle)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        <Edit className="h-4 w-4" />
        <span>Edit Resume</span>
      </button>
      
      <button
        onClick={() => { /* TODO: Implement duplicate */ onClose(); }}
        className="flex items-center space-x-3 px-4 py-2 text-sm w-full text-left hover:opacity-80 transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--accent-subtle)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        <Copy className="h-4 w-4" />
        <span>Duplicate</span>
      </button>
      
      <button
        onClick={() => { /* TODO: Implement download */ onClose(); }}
        className="flex items-center space-x-3 px-4 py-2 text-sm w-full text-left hover:opacity-80 transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--accent-subtle)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        <Download className="h-4 w-4" />
        <span>Download PDF</span>
      </button>
      
      <div className="border-t my-2" style={{ borderColor: 'var(--accent-subtle)' }} />
      
      <button
        onClick={() => { onDelete(); onClose(); }}
        className="flex items-center space-x-3 px-4 py-2 text-sm w-full text-left hover:opacity-80 transition-colors text-red-600"
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
        }}
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete</span>
      </button>
    </div>
  </>
);

// Empty State Component
const EmptyState = ({ onCreateNew, hasSearch }) => (
  <div className="text-center py-12">
    <FileText className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
    <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
      {hasSearch ? 'No resumes found' : 'No resumes yet'}
    </h3>
    <p className="mb-6 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
      {hasSearch 
        ? 'Try adjusting your search terms to find the resume you\'re looking for.'
        : 'Create your first professional resume using our easy-to-use builder with multiple templates.'
      }
    </p>
    {!hasSearch && (
      <button
        onClick={onCreateNew}
        className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
        style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
      >
        <Plus className="h-5 w-5" />
        <span>Create Your First Resume</span>
      </button>
    )}
  </div>
);

// Delete Modal Component
const DeleteModal = ({ resume, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
      <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onCancel} />
      
      <div 
        className="relative inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform rounded-lg shadow-xl"
        style={{ backgroundColor: 'var(--background-panel)' }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <Trash2 className="h-6 w-6 text-red-600" />
          <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            Delete Resume
          </h3>
        </div>
        
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete "<strong>{resume?.name}</strong>"? This action cannot be undone.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border rounded-lg font-medium transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)', backgroundColor: 'var(--background-deep)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90 bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);