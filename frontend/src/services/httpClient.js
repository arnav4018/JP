import axios from 'axios';

// Create axios instance with default configuration
const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const tokenManager = {
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },

  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  getRefreshToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  },

  setRefreshToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', token);
    }
  }
};

// Request interceptor to add auth token
httpClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
httpClient.interceptors.response.use(
  (response) => {
    // Log response time in development
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
      const endTime = new Date();
      const duration = endTime.getTime() - response.config.metadata.startTime.getTime();
      console.log(`API Request: ${response.config.method.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      throw {
        message: 'Network error. Please check your internet connection.',
        type: 'NETWORK_ERROR',
        originalError: error
      };
    }

    const { status, data } = error.response;

    // Handle token refresh for 401 errors
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
            { refreshToken }
          );

          const { token } = response.data;
          tokenManager.setToken(token);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return httpClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        tokenManager.removeToken();
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }

    // Handle different error types
    const errorResponse = {
      message: data?.message || 'An error occurred',
      status,
      type: 'API_ERROR',
      errors: data?.errors || [],
      originalError: error
    };

    // Log errors in development
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status,
        message: errorResponse.message,
        errors: errorResponse.errors
      });
    }

    // Handle specific error codes
    switch (status) {
      case 400:
        errorResponse.type = 'VALIDATION_ERROR';
        break;
      case 401:
        errorResponse.type = 'AUTHENTICATION_ERROR';
        errorResponse.message = 'Please log in to continue';
        break;
      case 403:
        errorResponse.type = 'AUTHORIZATION_ERROR';
        errorResponse.message = 'You do not have permission to perform this action';
        break;
      case 404:
        errorResponse.type = 'NOT_FOUND_ERROR';
        errorResponse.message = 'The requested resource was not found';
        break;
      case 429:
        errorResponse.type = 'RATE_LIMIT_ERROR';
        errorResponse.message = 'Too many requests. Please try again later';
        break;
      case 500:
        errorResponse.type = 'SERVER_ERROR';
        errorResponse.message = 'Internal server error. Please try again later';
        break;
      default:
        errorResponse.type = 'UNKNOWN_ERROR';
    }

    throw errorResponse;
  }
);

// HTTP methods with enhanced error handling
const httpMethods = {
  async get(url, config = {}) {
    try {
      const response = await httpClient.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async post(url, data, config = {}) {
    try {
      const response = await httpClient.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async put(url, data, config = {}) {
    try {
      const response = await httpClient.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async patch(url, data, config = {}) {
    try {
      const response = await httpClient.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async delete(url, config = {}) {
    try {
      const response = await httpClient.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // File upload method
  async upload(url, formData, onUploadProgress = null) {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (onUploadProgress) {
        config.onUploadProgress = onUploadProgress;
      }

      const response = await httpClient.post(url, formData, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// Export both the client instance and methods
export default httpMethods;
export { httpClient, tokenManager };