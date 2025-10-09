import API from './api';

/**
 * Resume Service
 * Specialized service for resume-related operations
 * Provides high-level methods for resume builder integration
 */

class ResumeService {
  /**
   * Get all user resumes with pagination
   * @param {Object} params - Query parameters
   * @returns {Promise} User resumes
   */
  async getUserResumes(params = {}) {
    try {
      const response = await API.resumes.getAll(params);
      return {
        success: true,
        data: response.data,
        resumes: response.data.resumes || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('ResumeService: Failed to get user resumes:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        resumes: [],
        pagination: {}
      };
    }
  }

  /**
   * Get resume by ID
   * @param {string} resumeId - Resume ID
   * @returns {Promise} Resume data
   */
  async getResume(resumeId) {
    try {
      const response = await API.resumes.getById(resumeId);
      return {
        success: true,
        data: response.data,
        resume: response.data.resume
      };
    } catch (error) {
      console.error('ResumeService: Failed to get resume:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        resume: null
      };
    }
  }

  /**
   * Create new resume
   * @param {Object} resumeData - Resume data
   * @returns {Promise} Created resume
   */
  async createResume(resumeData) {
    try {
      // Prepare data for backend
      const preparedData = this.prepareResumeData(resumeData);
      
      const response = await API.resumes.create(preparedData);
      return {
        success: true,
        data: response.data,
        resume: response.data.resume
      };
    } catch (error) {
      console.error('ResumeService: Failed to create resume:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        resume: null
      };
    }
  }

  /**
   * Update existing resume
   * @param {string} resumeId - Resume ID
   * @param {Object} resumeData - Updated resume data
   * @returns {Promise} Updated resume
   */
  async updateResume(resumeId, resumeData) {
    try {
      // Prepare data for backend
      const preparedData = this.prepareResumeData(resumeData);
      
      const response = await API.resumes.update(resumeId, preparedData);
      return {
        success: true,
        data: response.data,
        resume: response.data.resume
      };
    } catch (error) {
      console.error('ResumeService: Failed to update resume:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        resume: null
      };
    }
  }

  /**
   * Delete resume
   * @param {string} resumeId - Resume ID
   * @returns {Promise} Deletion result
   */
  async deleteResume(resumeId) {
    try {
      await API.resumes.delete(resumeId);
      return {
        success: true,
        message: 'Resume deleted successfully'
      };
    } catch (error) {
      console.error('ResumeService: Failed to delete resume:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Clone resume
   * @param {string} resumeId - Resume ID to clone
   * @returns {Promise} Cloned resume
   */
  async cloneResume(resumeId) {
    try {
      const response = await API.resumes.clone(resumeId);
      return {
        success: true,
        data: response.data,
        resume: response.data.resume
      };
    } catch (error) {
      console.error('ResumeService: Failed to clone resume:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        resume: null
      };
    }
  }

  /**
   * Download resume
   * @param {string} resumeId - Resume ID
   * @param {string} format - Format (pdf, json)
   * @returns {Promise} File blob
   */
  async downloadResume(resumeId, format = 'pdf') {
    try {
      const response = await API.resumes.download(resumeId, format);
      return {
        success: true,
        blob: response.data,
        filename: `resume.${format}`
      };
    } catch (error) {
      console.error('ResumeService: Failed to download resume:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Get resume templates
   * @returns {Promise} Available templates
   */
  async getTemplates() {
    try {
      const response = await API.resumes.getTemplates();
      return {
        success: true,
        data: response.data,
        templates: response.data.templates || []
      };
    } catch (error) {
      console.error('ResumeService: Failed to get templates:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        templates: []
      };
    }
  }

  /**
   * Upload and parse resume file
   * @param {File} file - Resume file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Parsed resume data
   */
  async uploadAndParseResume(file, onProgress) {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await API.resumes.uploadAndParse(formData, (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      });

      return {
        success: true,
        data: response.data,
        resume: response.data.resume,
        parseResult: response.data.parseResult
      };
    } catch (error) {
      console.error('ResumeService: Failed to upload and parse resume:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Prepare resume data for backend submission
   * Transforms frontend data structure to match backend expectations
   * @private
   */
  prepareResumeData(resumeData) {
    // Map frontend structure to backend structure
    return {
      title: resumeData.name || resumeData.title || 'Untitled Resume',
      template: resumeData.template || 'classic',
      status: resumeData.status || 'draft',
      personalInfo: resumeData.personalInfo || {},
      summary: resumeData.personalInfo?.summary || resumeData.summary || '',
      experience: resumeData.experience || [],
      education: resumeData.education || [],
      skills: resumeData.skills || [],
      projects: resumeData.projects || [],
      certifications: resumeData.certifications || [],
      languages: resumeData.languages || [],
      customSections: resumeData.customSections || resumeData.custom_sections || [],
      settings: resumeData.settings || {},
      isPublic: resumeData.isPublic || resumeData.is_public || false
    };
  }

  /**
   * Transform backend resume data for frontend use
   * @private
   */
  transformResumeData(backendData) {
    if (!backendData) return null;

    return {
      id: backendData.id,
      name: backendData.title || 'Untitled Resume',
      template: backendData.template || 'classic',
      status: backendData.status || 'draft',
      lastModified: backendData.updated_at || backendData.updatedAt,
      createdAt: backendData.created_at || backendData.createdAt,
      
      personalInfo: {
        ...backendData.personal_info,
        summary: backendData.summary || backendData.personal_info?.summary || ''
      },
      
      experience: backendData.experience || [],
      education: backendData.education || [],
      skills: backendData.skills || {
        technical: [],
        languages: [],
        soft: [],
        tools: []
      },
      projects: backendData.projects || [],
      certifications: backendData.certifications || [],
      awards: backendData.awards || [],
      volunteer: backendData.volunteer || [],
      references: backendData.references || [],
      
      customSections: backendData.custom_sections || backendData.customSections || [],
      settings: backendData.settings || {},
      isPublic: backendData.is_public || backendData.isPublic || false,
      downloadCount: backendData.download_count || 0
    };
  }

  /**
   * Auto-save resume with debouncing
   * @param {string} resumeId - Resume ID
   * @param {Object} resumeData - Resume data
   * @param {number} delay - Debounce delay in ms
   * @returns {Promise} Auto-save result
   */
  async autoSave(resumeId, resumeData, delay = 2000) {
    // Clear existing timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
    }

    return new Promise((resolve, reject) => {
      this.autoSaveTimeout = setTimeout(async () => {
        try {
          const result = await this.updateResume(resumeId, resumeData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  }

  /**
   * Cancel auto-save
   */
  cancelAutoSave() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
  }
}

// Create singleton instance
const resumeService = new ResumeService();

export default resumeService;