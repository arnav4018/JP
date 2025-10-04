'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/store/useAuthStore';
import { Eye, EyeOff, Mail, Lock, User, Building, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<'candidate' | 'recruiter'>('candidate');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    termsAccepted: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setSubmitError('Passwords do not match');
      return;
    }

    if (!formData.termsAccepted) {
      setSubmitError('Please accept the terms and conditions');
      return;
    }

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: userType,
        companyName: userType === 'recruiter' ? formData.company : undefined
      };

      // Use auth store register method
      const result = await register(userData);
      
      if (result.success) {
        // Redirect to profile completion or dashboard
        router.push('/profile');
      } else {
        setSubmitError(result.error || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setSubmitError(err.message || 'Registration failed. Please check your information and try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-medium transition-opacity hover:opacity-80" style={{ color: 'var(--accent-interactive)' }}>
              Sign in here
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

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-panel)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-panel)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-panel)', color: 'var(--text-primary)' }}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Company (for recruiters) */}
              {userType === 'recruiter' && (
                <div>
                  <label htmlFor="company" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Company name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                    </div>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      required={userType === 'recruiter'}
                      value={formData.company}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2"
                      style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-panel)', color: 'var(--text-primary)' }}
                      placeholder="Enter your company name"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-panel)', color: 'var(--text-primary)' }}
                    placeholder="At least 6 chars with uppercase, lowercase & number"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="transition-opacity hover:opacity-80"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2"
                    style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-panel)', color: 'var(--text-primary)' }}
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              {/* Error Display */}
              {submitError && (
                <div className="rounded-md p-4" style={{ backgroundColor: 'var(--accent-danger)', color: 'var(--background-panel)' }}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">{submitError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="flex items-center">
                <input
                  id="termsAccepted"
                  name="termsAccepted"
                  type="checkbox"
                  required
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="h-4 w-4 rounded"
                  style={{ accentColor: 'var(--accent-interactive)' }}
                />
                <label htmlFor="termsAccepted" className="ml-2 block text-sm" style={{ color: 'var(--text-primary)' }}>
                  I agree to the{' '}
                  <Link href="/terms" className="transition-opacity hover:opacity-80" style={{ color: 'var(--accent-interactive)' }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="transition-opacity hover:opacity-80" style={{ color: 'var(--accent-interactive)' }}>
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: 'var(--background-deep)', backgroundColor: 'var(--accent-interactive)' }}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}