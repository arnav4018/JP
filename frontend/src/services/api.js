import httpClient from './httpClient';

// API Service Layer for Job Portal
// This service layer provides all API endpoints for communication with the backend

const API = {
  // =============================================================================
  // AUTHENTICATION ENDPOINTS
  // =============================================================================
  auth: {
    /**
     * User registration
     * @param {Object} userData - User registration data
     * @returns {Promise} Registration response
     */
    register: (userData) => {
      return httpClient.post('/auth/register', userData);
    },

    /**
     * User login
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise} Login response with token
     */
    login: (email, password) => {
      return httpClient.post('/auth/login', { email, password });
    },

    /**
     * Refresh authentication token
     * @param {string} refreshToken - Refresh token
     * @returns {Promise} New access token
     */
    refreshToken: (refreshToken) => {
      return httpClient.post('/auth/refresh-token', { refreshToken });
    },

    /**
     * Logout user
     * @returns {Promise} Logout response
     */
    logout: () => {
      return httpClient.post('/auth/logout');
    },

    /**
     * Get current user profile
     * @returns {Promise} User profile data
     */
    getProfile: () => {
      return httpClient.get('/auth/me');
    },

    /**
     * Update user profile
     * @param {Object} profileData - Updated profile data
     * @returns {Promise} Updated profile
     */
    updateProfile: (profileData) => {
      return httpClient.put('/auth/profile', profileData);
    },

    /**
     * Change user password
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise} Password change response
     */
    changePassword: (currentPassword, newPassword) => {
      return httpClient.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
    },

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise} Password reset response
     */
    forgotPassword: (email) => {
      return httpClient.post('/auth/forgot-password', { email });
    },

    /**
     * Reset password with token
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise} Password reset response
     */
    resetPassword: (token, newPassword) => {
      return httpClient.put(`/auth/reset-password/${token}`, { newPassword });
    }
  },

  // =============================================================================
  // JOB ENDPOINTS
  // =============================================================================
  jobs: {
    /**
     * Get all jobs with filters and pagination
     * @param {Object} params - Query parameters
     * @returns {Promise} Jobs list with pagination
     */
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return httpClient.get(`/jobs?${queryString}`);
    },

    /**
     * Get job by ID
     * @param {string} jobId - Job ID
     * @returns {Promise} Job details
     */
    getById: (jobId) => {
      return httpClient.get(`/jobs/${jobId}`);
    },

    /**
     * Create new job (Recruiters/Admin only)
     * @param {Object} jobData - Job data
     * @returns {Promise} Created job
     */
    create: (jobData) => {
      return httpClient.post('/jobs', jobData);
    },

    /**
     * Update job (Recruiters/Admin only)
     * @param {string} jobId - Job ID
     * @param {Object} jobData - Updated job data
     * @returns {Promise} Updated job
     */
    update: (jobId, jobData) => {
      return httpClient.put(`/jobs/${jobId}`, jobData);
    },

    /**
     * Delete job (Recruiters/Admin only)
     * @param {string} jobId - Job ID
     * @returns {Promise} Deletion response
     */
    delete: (jobId) => {
      return httpClient.delete(`/jobs/${jobId}`);
    },

    /**
     * Search jobs
     * @param {string} searchTerm - Search term
     * @param {Object} filters - Additional filters
     * @returns {Promise} Search results
     */
    search: (searchTerm, filters = {}) => {
      return httpClient.get('/jobs', {
        params: { search: searchTerm, ...filters }
      });
    },

    /**
     * Get jobs by recruiter (My Jobs)
     * @returns {Promise} Recruiter's jobs
     */
    getMyJobs: () => {
      return httpClient.get('/jobs/user/my-jobs');
    },

    /**
     * Get job applications (Recruiters/Admin only)
     * @param {string} jobId - Job ID
     * @returns {Promise} Job applications
     */
    getApplications: (jobId) => {
      return httpClient.get(`/jobs/${jobId}/applications`);
    },

    /**
     * Apply to job
     * @param {string} jobId - Job ID
     * @param {Object} applicationData - Application data
     * @returns {Promise} Application response
     */
    apply: (jobId, applicationData) => {
      return httpClient.post(`/jobs/${jobId}/apply`, applicationData);
    }
  },

  // =============================================================================
  // APPLICATION ENDPOINTS
  // =============================================================================
  applications: {
    /**
     * Get user's applications
     * @returns {Promise} User applications
     */
    getMy: () => {
      return httpClient.get('/jobs/user/my-applications');
    },

    /**
     * Get application by ID
     * @param {string} applicationId - Application ID
     * @returns {Promise} Application details
     */
    getById: (applicationId) => {
      return httpClient.get(`/applications/${applicationId}`);
    },

    /**
     * Update application status (Recruiters/Admin only)
     * @param {string} jobId - Job ID
     * @param {string} applicationId - Application ID
     * @param {string} status - New status
     * @returns {Promise} Updated application
     */
    updateStatus: (jobId, applicationId, status) => {
      return httpClient.put(`/jobs/${jobId}/applications/${applicationId}`, { status });
    },

    /**
     * Withdraw application
     * @param {string} applicationId - Application ID
     * @returns {Promise} Withdrawal response
     */
    withdraw: (applicationId) => {
      return httpClient.patch(`/applications/${applicationId}`, {
        status: 'withdrawn'
      });
    }
  },

  // =============================================================================
  // RESUME ENDPOINTS
  // =============================================================================
  resumes: {
    /**
     * Upload resume file
     * @param {FormData} formData - Resume file data
     * @param {Function} onUploadProgress - Upload progress callback
     * @returns {Promise} Upload response
     */
    upload: (formData, onUploadProgress = null) => {
      return httpClient.upload('/resumes/upload', formData, onUploadProgress);
    },

    /**
     * Get user's resumes
     * @returns {Promise} User resumes
     */
    getMy: () => {
      return httpClient.get('/resumes');
    },

    /**
     * Create/Update online resume
     * @param {Object} resumeData - Resume data
     * @returns {Promise} Resume response
     */
    createOrUpdate: (resumeData) => {
      return httpClient.post('/resumes', resumeData);
    },

    /**
     * Delete resume
     * @param {string} resumeId - Resume ID
     * @returns {Promise} Deletion response
     */
    delete: (resumeId) => {
      return httpClient.delete(`/resumes/${resumeId}`);
    },

    /**
     * Download resume
     * @param {string} resumeId - Resume ID
     * @returns {Promise} Resume file
     */
    download: (resumeId) => {
      return httpClient.get(`/resumes/${resumeId}/download`, {
        responseType: 'blob'
      });
    }
  },

  // =============================================================================
  // NOTIFICATION ENDPOINTS
  // =============================================================================
  notifications: {
    /**
     * Get user notifications
     * @param {Object} params - Query parameters
     * @returns {Promise} Notifications list
     */
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return httpClient.get(`/notifications?${queryString}`);
    },

    /**
     * Mark notification as read
     * @param {string} notificationId - Notification ID
     * @returns {Promise} Update response
     */
    markAsRead: (notificationId) => {
      return httpClient.patch(`/notifications/${notificationId}/read`);
    },

    /**
     * Mark all notifications as read
     * @returns {Promise} Update response
     */
    markAllAsRead: () => {
      return httpClient.patch('/notifications/mark-all-read');
    },

    /**
     * Delete notification
     * @param {string} notificationId - Notification ID
     * @returns {Promise} Deletion response
     */
    delete: (notificationId) => {
      return httpClient.delete(`/notifications/${notificationId}`);
    },

    /**
     * Get unread count
     * @returns {Promise} Unread count
     */
    getUnreadCount: () => {
      return httpClient.get('/notifications/unread-count');
    }
  },

  // =============================================================================
  // MESSAGING ENDPOINTS
  // =============================================================================
  messages: {
    /**
     * Get conversations
     * @returns {Promise} Conversations list
     */
    getConversations: () => {
      return httpClient.get('/messages/conversations');
    },

    /**
     * Get messages in conversation
     * @param {string} conversationId - Conversation ID
     * @returns {Promise} Messages list
     */
    getMessages: (conversationId) => {
      return httpClient.get(`/messages/conversations/${conversationId}`);
    },

    /**
     * Send message
     * @param {string} conversationId - Conversation ID
     * @param {Object} messageData - Message data
     * @returns {Promise} Sent message
     */
    send: (conversationId, messageData) => {
      return httpClient.post(`/messages/conversations/${conversationId}`, messageData);
    },

    /**
     * Create new conversation
     * @param {Object} conversationData - Conversation data
     * @returns {Promise} Created conversation
     */
    createConversation: (conversationData) => {
      return httpClient.post('/messages/conversations', conversationData);
    },

    /**
     * Mark messages as read
     * @param {string} conversationId - Conversation ID
     * @returns {Promise} Update response
     */
    markAsRead: (conversationId) => {
      return httpClient.patch(`/messages/conversations/${conversationId}/read`);
    }
  },

  // =============================================================================
  // ADMIN ENDPOINTS
  // =============================================================================
  admin: {
    /**
     * Get dashboard statistics
     * @returns {Promise} Dashboard data
     */
    getDashboard: () => {
      return httpClient.get('/admin/dashboard');
    },

    /**
     * Get all users (Admin only)
     * @param {Object} params - Query parameters
     * @returns {Promise} Users list
     */
    getUsers: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return httpClient.get(`/admin/users?${queryString}`);
    },

    /**
     * Get all jobs (Admin only)
     * @param {Object} params - Query parameters
     * @returns {Promise} Jobs list
     */
    getJobs: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return httpClient.get(`/admin/jobs?${queryString}`);
    },

    /**
     * Get system settings
     * @returns {Promise} System settings
     */
    getSettings: () => {
      return httpClient.get('/admin/settings');
    },

    /**
     * Update system settings
     * @param {Object} settings - Settings data
     * @returns {Promise} Updated settings
     */
    updateSettings: (settings) => {
      return httpClient.put('/admin/settings', settings);
    },

    /**
     * Export data
     * @param {string} exportType - Type of export (users, jobs, applications)
     * @param {Object} filters - Export filters
     * @returns {Promise} Export file
     */
    exportData: (exportType, filters = {}) => {
      const queryString = new URLSearchParams(filters).toString();
      return httpClient.get(`/admin/export/${exportType}?${queryString}`, {
        responseType: 'blob'
      });
    }
  },

  // =============================================================================
  // PAYMENT ENDPOINTS
  // =============================================================================
  payments: {
    /**
     * Create payment intent
     * @param {Object} paymentData - Payment data
     * @returns {Promise} Payment intent
     */
    createIntent: (paymentData) => {
      return httpClient.post('/payments/create-intent', paymentData);
    },

    /**
     * Confirm payment
     * @param {string} paymentId - Payment ID
     * @param {Object} confirmationData - Confirmation data
     * @returns {Promise} Payment confirmation
     */
    confirm: (paymentId, confirmationData) => {
      return httpClient.post(`/payments/${paymentId}/confirm`, confirmationData);
    },

    /**
     * Get payment history
     * @returns {Promise} Payment history
     */
    getHistory: () => {
      return httpClient.get('/payments/history');
    },

    /**
     * Get payment by ID
     * @param {string} paymentId - Payment ID
     * @returns {Promise} Payment details
     */
    getById: (paymentId) => {
      return httpClient.get(`/payments/${paymentId}`);
    }
  },

  // =============================================================================
  // REFERRAL ENDPOINTS
  // =============================================================================
  referrals: {
    /**
     * Get referral program details
     * @returns {Promise} Referral program info
     */
    getProgram: () => {
      return httpClient.get('/referrals/program');
    },

    /**
     * Send referral
     * @param {Object} referralData - Referral data
     * @returns {Promise} Referral response
     */
    send: (referralData) => {
      return httpClient.post('/referrals', referralData);
    },

    /**
     * Get user's referrals
     * @returns {Promise} User referrals
     */
    getMy: () => {
      return httpClient.get('/referrals/my-referrals');
    },

    /**
     * Get referral statistics
     * @returns {Promise} Referral stats
     */
    getStats: () => {
      return httpClient.get('/referrals/stats');
    }
  },

  // =============================================================================
  // UTILITY ENDPOINTS
  // =============================================================================
  util: {
    /**
     * Health check
     * @returns {Promise} API health status
     */
    health: () => {
      return httpClient.get('/health');
    },

    /**
     * Upload file
     * @param {FormData} formData - File data
     * @param {Function} onUploadProgress - Progress callback
     * @returns {Promise} Upload response
     */
    uploadFile: (formData, onUploadProgress = null) => {
      return httpClient.upload('/upload', formData, onUploadProgress);
    },

    /**
     * Get app configuration
     * @returns {Promise} App configuration
     */
    getConfig: () => {
      return httpClient.get('/config');
    }
  }
};

// Export API service
export default API;

// Export individual services for convenience
export const {
  auth,
  jobs,
  applications,
  resumes,
  notifications,
  messages,
  admin,
  payments,
  referrals,
  util
} = API;