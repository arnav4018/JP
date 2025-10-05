'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import FormInput from '@/components/ui/FormInput';
import { createLoginValidator } from '@/utils/validation';
import { useAuth } from '@/store/useAuthStore';
import { Eye, EyeOff, Mail, Lock, Github, Linkedin, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'candidate' | 'recruiter'>('candidate');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validator = createLoginValidator();

  const validateField = useCallback((fieldName: string, value: string) => {
    const fieldValidator = createLoginValidator();
    const isValid = fieldValidator.validate({ [fieldName]: value });
    const fieldError = fieldValidator.getFieldError(fieldName);
    
    setErrors(prev => ({
      ...prev,
      [fieldName]: fieldError || ''
    }));
    
    return !fieldError;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    // Validate all fields
    const isValid = validator.validate(formData);
    setErrors(validator.getErrors());
    
    if (!isValid) {
      // Mark all fields as touched to show errors
      setTouched({ email: true, password: true });
      return;
    }
    
    try {
      // Use auth store login method
      const result = await login(formData.email, formData.password);
      
      if (result.success && result.user) {
        // Redirect based on user role and user type selection
        const user = result.user;
        console.log('Login successful, user role:', user.role, 'selected type:', userType);
        
        // Verify that the user's role matches the selected user type
        if (user.role !== userType) {
          setSubmitError(`This account is registered as a ${user.role}. Please select the correct account type.`);
          return;
        }
        
        // Redirect based on user role
        if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'recruiter') {
          router.push('/post-job');
        } else {
          router.push('/');
        }
      } else {
        setSubmitError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('Network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Authentication service not found. Please contact support.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setSubmitError(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
    
    // Validate field in real-time if it has been touched
    if (touched[name]) {
      validateField(name, value);
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Or{' '}
            <Link href="/signup" className="font-medium transition-opacity hover:opacity-80" style={{ color: 'var(--accent-interactive)' }}>
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10" style={{ backgroundColor: 'var(--background-panel)' }}>
            {/* User Type Toggle */}
            <div className="mb-6">
              <div className="flex rounded-lg p-1" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setUserType('candidate')}
                  className="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: userType === 'candidate' ? 'var(--background-panel)' : 'transparent',
                    color: userType === 'candidate' ? 'var(--accent-interactive)' : 'var(--text-secondary)',
                    boxShadow: userType === 'candidate' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                  }}
                >
                  Job Seeker
                </button>
                <button
                  type="button"
                  onClick={() => setUserType('recruiter')}
                  className="flex-1 py-2 px-4 text-sm font-medium rounded-md transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: userType === 'recruiter' ? 'var(--background-panel)' : 'transparent',
                    color: userType === 'recruiter' ? 'var(--accent-interactive)' : 'var(--text-secondary)',
                    boxShadow: userType === 'recruiter' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
                  }}
                >
                  Recruiter
                </button>
              </div>
            </div>

            {/* Submit Error */}
            {submitError && (
              <div className="mb-6 p-3 rounded-lg flex items-center space-x-2" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-600">{submitError}</span>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <FormInput
                label="Email address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email ? errors.email : ''}
                icon={Mail}
                placeholder="Enter your email"
                required
                autoComplete="email"
              />

              {/* Password */}
              <FormInput
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password ? errors.password : ''}
                icon={Lock}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                showPasswordToggle
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded"
                    style={{ accentColor: 'var(--accent-interactive)' }}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: 'var(--text-primary)' }}>
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium transition-opacity hover:opacity-80" style={{ color: 'var(--accent-interactive)' }}>
                    Forgot your password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: 'var(--background-deep)', backgroundColor: 'var(--accent-interactive)' }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" style={{ borderColor: 'var(--accent-subtle)' }} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2" style={{ backgroundColor: 'var(--background-panel)', color: 'var(--text-secondary)' }}>Or continue with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-panel)', color: 'var(--text-secondary)' }}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-2">Google</span>
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium transition-opacity hover:opacity-80"
                  style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-panel)', color: 'var(--text-secondary)' }}
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="ml-2">LinkedIn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}