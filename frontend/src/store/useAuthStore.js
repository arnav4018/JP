'use client';

// ⚠️ DEPRECATED: This store is being replaced by authService
// Use @/services/authService instead for new components

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockAuth } from '@/services/mockApi';

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
          const response = await mockAuth.login(email, password);
          if (response.success) {
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              loading: false,
              error: null
            });
            return { success: true };
          } else {
            set({ loading: false, error: response.error });
            return { success: false, error: response.error };
          }
        } catch (error) {
          const errorMessage = 'Login failed. Please try again.';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await mockAuth.register(userData);
          if (response.success) {
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              loading: false,
              error: null
            });
            return { success: true };
          } else {
            set({ loading: false, error: response.error });
            return { success: false, error: response.error };
          }
        } catch (error) {
          const errorMessage = 'Registration failed. Please try again.';
          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null
        });
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
        const { token } = get();
        if (!token) return;

        set({ loading: true });
        try {
          const user = await mockAuth.getCurrentUser(token);
          if (user) {
            set({
              user,
              isAuthenticated: true,
              loading: false,
              error: null
            });
          } else {
            // Token is invalid, clear auth state
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false,
              error: null
            });
          }
        } catch (error) {
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
    isLoggedIn: store.isLoggedIn,
    getUserId: store.getUserId,
    hasPermission: store.hasPermission
  };
};