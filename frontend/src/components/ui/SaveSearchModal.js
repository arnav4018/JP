'use client';

import { useState } from 'react';
import { useAuth } from '@/store/useAuthStore';
import { useJobStore } from '@/store/useJobStore';
import { saveJobSearch } from '@/services/mockApi';
import { X, Save, Bell, BellOff, AlertCircle, CheckCircle } from 'lucide-react';

export default function SaveSearchModal({ isOpen, onClose, onSuccess }) {
  const { getUserId } = useAuth();
  const { getFilters } = useJobStore();
  const [formData, setFormData] = useState({
    name: '',
    alertEnabled: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const generateSearchName = () => {
    const filters = getFilters();
    const parts = [];
    
    if (filters.search) parts.push(filters.search);
    if (filters.location) parts.push(`in ${filters.location}`);
    if (filters.type) parts.push(filters.type);
    if (filters.category) parts.push(filters.category);
    
    return parts.length > 0 ? parts.join(' ') : 'My Job Search';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Please enter a name for your search');
      return;
    }

    const userId = getUserId();
    if (!userId) {
      setError('You must be logged in to save searches');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filters = getFilters();
      const searchData = {
        name: formData.name.trim(),
        filters,
        alertEnabled: formData.alertEnabled
      };

      const response = await saveJobSearch(userId, searchData);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess(response.search);
        }, 2000);
      } else {
        setError('Failed to save search. Please try again.');
      }
    } catch (err) {
      setError('Failed to save search. Please try again.');
      console.error('Save search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !success) {
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      alertEnabled: true
    });
    setError(null);
    setSuccess(false);
  };

  // Reset form when modal opens
  useState(() => {
    if (isOpen) {
      resetForm();
      setFormData(prev => ({
        ...prev,
        name: generateSearchName()
      }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filters = getFilters();
  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'newest');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal content */}
        <div className="relative inline-block w-full max-w-lg p-6 my-8 text-left align-middle transition-all transform rounded-lg shadow-xl" style={{ backgroundColor: 'var(--background-panel)' }}>
          
          {/* Success state */}
          {success && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--accent-interactive)' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Search Saved!
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                Your search "<strong>{formData.name}</strong>" has been saved successfully.
              </p>
              {formData.alertEnabled && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  You'll receive email notifications when new matching jobs are posted.
                </p>
              )}
            </div>
          )}

          {/* Form state */}
          {!success && (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Save Job Search
                  </h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Save this search to easily find it later
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

              {/* Current Search Summary */}
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--background-deep)', border: '1px solid var(--accent-subtle)' }}>
                <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Current Search Criteria:
                </h3>
                {hasActiveFilters ? (
                  <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {filters.search && (
                      <div>Keywords: <span className="font-medium">{filters.search}</span></div>
                    )}
                    {filters.location && (
                      <div>Location: <span className="font-medium">{filters.location}</span></div>
                    )}
                    {filters.type && (
                      <div>Job Type: <span className="font-medium">{filters.type}</span></div>
                    )}
                    {filters.category && (
                      <div>Category: <span className="font-medium">{filters.category}</span></div>
                    )}
                    {filters.salary && (
                      <div>Salary: <span className="font-medium">{filters.salary}</span></div>
                    )}
                    {filters.experience && (
                      <div>Experience: <span className="font-medium">{filters.experience}</span></div>
                    )}
                    {filters.remote && (
                      <div>Remote Type: <span className="font-medium">{filters.remote}</span></div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    All jobs (no specific filters applied)
                  </p>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 rounded-lg flex items-center space-x-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgb(239, 68, 68)' }}>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Search Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    <Save className="h-4 w-4 inline mr-1" />
                    Search Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    maxLength={100}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      backgroundColor: 'var(--background-deep)',
                      borderColor: 'var(--accent-subtle)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="e.g., Frontend Developer Remote Jobs"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Give your search a descriptive name to easily identify it later
                  </p>
                </div>

                {/* Email Alerts */}
                <div>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="alertEnabled"
                      checked={formData.alertEnabled}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border focus:ring-2"
                      style={{ 
                        accentColor: 'var(--accent-interactive)',
                        borderColor: 'var(--accent-subtle)'
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {formData.alertEnabled ? (
                          <Bell className="h-4 w-4" style={{ color: 'var(--accent-interactive)' }} />
                        ) : (
                          <BellOff className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                        )}
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          Email notifications
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                        Get notified when new jobs matching your search are posted
                      </p>
                    </div>
                  </label>
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
                    disabled={loading || !formData.name.trim()}
                    className="flex-1 px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
                  >
                    {loading ? 'Saving...' : 'Save Search'}
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