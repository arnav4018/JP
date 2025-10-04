'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '@/services/api';
import { tokenManager } from '@/services/httpClient';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Authentication state
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await API.auth.login(email, password);
          if (response.success && response.data) {
            // Store tokens in localStorage
            tokenManager.setToken(response.data.token);
            if (response.data.refreshToken) {
              tokenManager.setRefreshToken(response.data.refreshToken);
            }
            
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              loading: false,
              error: null
            });
            return { success: true, user: response.data.user };
          } else {
            const errorMessage = response.message || 'Login failed';
            set({ loading: false, error: errorMessage });
            return { success: false, error: errorMessage };
          }
        } catch (error) {
          const errorMessage = error.message || 'Login failed. Please try again.';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await API.auth.register(userData);
          if (response.success && response.data) {
            // Store tokens in localStorage
            tokenManager.setToken(response.data.token);
            if (response.data.refreshToken) {
              tokenManager.setRefreshToken(response.data.refreshToken);
            }
            
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              loading: false,
              error: null
            });
            return { success: true, user: response.data.user };
          } else {
            const errorMessage = response.message || 'Registration failed';
            set({ loading: false, error: errorMessage });
            return { success: false, error: errorMessage };
          }
        } catch (error) {
          const errorMessage = error.message || 'Registration failed. Please try again.';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      logout: async () => {
        try {
          // Call logout API
          await API.auth.logout();
        } catch (error) {
          console.warn('Logout API call failed:', error);
        } finally {
          // Clear tokens from localStorage
          tokenManager.removeToken();
          
          // Clear store state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });
          
          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      },

      updateProfile: async (profileData) => {
        const { user, token } = get();
        if (!user || !token) return { success: false, error: 'Not authenticated' };

        set({ loading: true, error: null });
        try {
          const response = await mockAuth.updateProfile(user.id, profileData);
          if (response.success) {
            set({ 
              user: response.user,
              loading: false,
              error: null
            });
            return { success: true };
          } else {
            set({ loading: false, error: response.error });
            return { success: false, error: response.error };
          }
        } catch (error) {
          const errorMessage = 'Failed to update profile. Please try again.';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Initialize user from token (for page refresh)
      initializeAuth: async () => {
        console.log('🔍 Initializing auth...');
        
        // First check localStorage for token
        const token = tokenManager.getToken();
        const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        
        console.log('📱 Token from localStorage:', token ? 'Found' : 'Not found');
        console.log('👤 User data from localStorage:', userData ? 'Found' : 'Not found');
        
        if (!token) {
          console.log('❌ No token found, clearing auth state');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });
          return;
        }
        
        // If we have user data in localStorage, use it immediately while validating
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log('👤 Setting user from localStorage:', parsedUser.email);
            set({
              user: parsedUser,
              token: token,
              isAuthenticated: true,
              loading: true, // Still loading while we validate
              error: null
            });
          } catch (e) {
            console.warn('⚠️ Failed to parse user data from localStorage');
          }
        }

        console.log('🔄 Validating token with API...');
        set({ loading: true });
        try {
          // Try to get current user profile to validate token
          const response = await API.auth.getProfile();
          const user = response.data?.user || response.user;
          
          console.log('✅ API response received:', user ? 'User found' : 'No user');
          
          if (user) {
            console.log('🎉 Auth successful! User:', user.email, 'Role:', user.role);
            set({
              user,
              token,
              isAuthenticated: true,
              loading: false,
              error: null
            });
            
            // Update localStorage with fresh user data
            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(user));
            }
          } else {
            throw new Error('No user data received');
          }
        } catch (error) {
          console.warn('⚠️ Token validation failed:', error.message);
          
          // If it's a 401 error, the token is expired/invalid
          if (error.status === 401 || error.type === 'AUTHENTICATION_ERROR') {
            console.log('🗑️ Clearing invalid tokens and auth state');
            // Clear everything from localStorage and store
            tokenManager.removeToken();
            if (typeof window !== 'undefined') {
              localStorage.removeItem('user');
            }
          }
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });
        }
      },

      clearError: () => set({ error: null }),
      
      // Clear all auth data (for debugging)
      clearAuth: () => {
        console.log('🧹 Manually clearing all auth data');
        tokenManager.removeToken();
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null
        });
      },

      // Utility functions
      isLoggedIn: () => {
        const { isAuthenticated, user, token } = get();
        return isAuthenticated && user && token;
      },

      getUserId: () => {
        const { user } = get();
        return user?.id || null;
      },

      hasPermission: (permission) => {
        const { user } = get();
        // For now, just check if user exists
        // In a real app, you'd check user roles/permissions
        return !!user;
      }
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        // Only persist essential auth data
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// Hook for checking if user is authenticated
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    loading: store.loading,
    error: store.error,
    login: store.login,
    register: store.register,
    logout: store.logout,
    updateProfile: store.updateProfile,
    initializeAuth: store.initializeAuth,
    clearError: store.clearError,
    clearAuth: store.clearAuth,
    isLoggedIn: store.isLoggedIn,
    getUserId: store.getUserId,
    hasPermission: store.hasPermission
  };
};
