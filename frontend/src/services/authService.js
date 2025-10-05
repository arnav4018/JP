import API from './api';
import { tokenManager } from './httpClient';

/**
 * Authentication Service
 * Handles user authentication, token management, and user state
 */
class AuthService {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.initPromise = null;
    
    // Initialize authentication state on construction (client-side only)
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  /**
   * Initialize authentication state
   * @returns {Promise} Initialization promise
   */
  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._loadUserFromStorage();
    await this.initPromise;
    
    this.isInitialized = true;
    return this.initPromise;
  }

  /**
   * Load user from local storage and validate token
   * @private
   */
  async _loadUserFromStorage() {
    try {
      // Skip initialization on server-side
      if (typeof window === 'undefined') {
        return;
      }
      
      const token = tokenManager.getToken();
      const userData = localStorage.getItem('user');

      if (token && userData) {
        this.currentUser = JSON.parse(userData);
        
        // Validate token by fetching current user profile
        try {
          const profile = await API.auth.getProfile();
          this.currentUser = profile.user || profile;
          this._saveUserToStorage(this.currentUser);
        } catch (error) {
          console.warn('Token validation failed:', error.message);
          this.logout();
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.logout();
    }
  }

  /**
   * Save user data to local storage
   * @param {Object} user - User data
   * @private
   */
  _saveUserToStorage(user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  async register(userData) {
    try {
      const response = await API.auth.register(userData);
      
      // Handle different response formats
      let success = false;
      let token = null;
      let refreshToken = null;
      let user = null;
      
      if (response.success || response.token) {
        success = true;
        // Format 1: response.data.user, response.data.token
        if (response.data) {
          user = response.data.user;
          token = response.data.token;
          refreshToken = response.data.refreshToken;
        } 
        // Format 2: response.user, response.token (direct)
        else {
          user = response.user;
          token = response.token;
          refreshToken = response.refreshToken;
        }
      }
      
      if (success && token && user) {
        tokenManager.setToken(token);
        if (refreshToken) {
          tokenManager.setRefreshToken(refreshToken);
        }
        
        this.currentUser = user;
        this._saveUserToStorage(this.currentUser);
        
        return {
          success: true,
          user: this.currentUser,
          message: response.message || 'Registration successful'
        };
      }
      
      return {
        success: false,
        message: response.message || 'Registration failed'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.message || 'Registration failed',
        errors: error.errors || []
      };
    }
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  async login(email, password) {
    try {
      const response = await API.auth.login(email, password);
      
      // Handle different response formats
      let success = false;
      let token = null;
      let refreshToken = null;
      let user = null;
      
      if (response.success || response.token) {
        success = true;
        // Format 1: response.data.user, response.data.token
        if (response.data) {
          user = response.data.user;
          token = response.data.token;
          refreshToken = response.data.refreshToken;
        } 
        // Format 2: response.user, response.token (direct)
        else {
          user = response.user;
          token = response.token;
          refreshToken = response.refreshToken;
        }
      }
      
      if (success && token && user) {
        tokenManager.setToken(token);
        if (refreshToken) {
          tokenManager.setRefreshToken(refreshToken);
        }
        
        this.currentUser = user;
        this._saveUserToStorage(this.currentUser);
        
        return {
          success: true,
          user: this.currentUser,
          message: response.message || 'Login successful'
        };
      }
      
      return {
        success: false,
        message: response.message || 'Login failed'
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.message || 'Login failed',
        errors: error.errors || []
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Call logout endpoint if user is authenticated
      if (this.isAuthenticated()) {
        await API.auth.logout();
      }
    } catch (error) {
      console.warn('Logout API call failed:', error.message);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local state
      this.currentUser = null;
      tokenManager.removeToken();
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Update result
   */
  async updateProfile(profileData) {
    try {
      const response = await API.auth.updateProfile(profileData);
      
      if (response.success) {
        this.currentUser = { ...this.currentUser, ...response.user };
        this._saveUserToStorage(this.currentUser);
        
        return {
          success: true,
          user: this.currentUser,
          message: response.message || 'Profile updated successfully'
        };
      }
      
      return {
        success: false,
        message: response.message || 'Profile update failed'
      };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        message: error.message || 'Profile update failed',
        errors: error.errors || []
      };
    }
  }

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Change result
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await API.auth.changePassword(currentPassword, newPassword);
      
      return {
        success: response.success,
        message: response.message || 'Password changed successfully'
      };
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        message: error.message || 'Password change failed',
        errors: error.errors || []
      };
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Reset request result
   */
  async requestPasswordReset(email) {
    try {
      const response = await API.auth.forgotPassword(email);
      
      return {
        success: response.success,
        message: response.message || 'Password reset instructions sent to your email'
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        message: error.message || 'Password reset request failed'
      };
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Reset result
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await API.auth.resetPassword(token, newPassword);
      
      return {
        success: response.success,
        message: response.message || 'Password reset successfully'
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        message: error.message || 'Password reset failed'
      };
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!(this.currentUser && tokenManager.getToken());
  }

  /**
   * Get current user
   * @returns {Object|null} Current user data
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Get user ID
   * @returns {string|null} User ID
   */
  getUserId() {
    return this.currentUser?.id || this.currentUser?._id || null;
  }

  /**
   * Get user role
   * @returns {string|null} User role
   */
  getUserRole() {
    return this.currentUser?.role || null;
  }

  /**
   * Check if user has specific role
   * @param {string} role - Role to check
   * @returns {boolean} Role check result
   */
  hasRole(role) {
    return this.getUserRole() === role;
  }

  /**
   * Check if user has any of the specified roles
   * @param {string[]} roles - Roles to check
   * @returns {boolean} Role check result
   */
  hasAnyRole(roles) {
    const userRole = this.getUserRole();
    return roles.includes(userRole);
  }

  /**
   * Check if user is admin
   * @returns {boolean} Admin check result
   */
  isAdmin() {
    return this.hasRole('admin');
  }

  /**
   * Check if user is recruiter
   * @returns {boolean} Recruiter check result
   */
  isRecruiter() {
    return this.hasRole('recruiter');
  }

  /**
   * Check if user is candidate
   * @returns {boolean} Candidate check result
   */
  isCandidate() {
    return this.hasRole('candidate');
  }

  /**
   * Get user's full name
   * @returns {string} Full name
   */
  getFullName() {
    if (!this.currentUser) return '';
    
    const firstName = this.currentUser.first_name || this.currentUser.firstName || '';
    const lastName = this.currentUser.last_name || this.currentUser.lastName || '';
    
    return `${firstName} ${lastName}`.trim();
  }

  /**
   * Get user's avatar URL
   * @returns {string|null} Avatar URL
   */
  getAvatarUrl() {
    return this.currentUser?.avatar || null;
  }

  /**
   * Check if user profile is complete
   * @returns {boolean} Profile completion status
   */
  isProfileComplete() {
    if (!this.currentUser) return false;
    
    const requiredFields = ['first_name', 'last_name', 'email'];
    return requiredFields.every(field => 
      this.currentUser[field] || this.currentUser[field.replace('_', '')]
    );
  }

  /**
   * Wait for authentication initialization
   * @returns {Promise<void>}
   */
  async waitForInitialization() {
    if (this.isInitialized) return;
    
    if (this.initPromise) {
      await this.initPromise;
    } else {
      await this.initialize();
    }
  }

  /**
   * Force refresh user data
   * @returns {Promise<void>}
   */
  async refreshUser() {
    try {
      const response = await API.auth.getProfile();
      this.currentUser = response.user || response;
      this._saveUserToStorage(this.currentUser);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      if (error.type === 'AUTHENTICATION_ERROR') {
        this.logout();
      }
    }
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;