'use client';

import { useState, useEffect } from 'react';
import API from '@/services/api';
import authService from '@/services/authService';

export default function TestApiPage() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [healthError, setHealthError] = useState(null);
  const [authStatus, setAuthStatus] = useState(null);
  const [jobsData, setJobsData] = useState(null);
  const [jobsError, setJobsError] = useState(null);
  const [loading, setLoading] = useState({
    health: false,
    jobs: false
  });

  // Test health endpoint
  const testHealth = async () => {
    setLoading(prev => ({ ...prev, health: true }));
    setHealthError(null);
    
    try {
      const response = await API.util.health();
      setHealthStatus(response);
    } catch (error) {
      setHealthError(error);
      console.error('Health check failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, health: false }));
    }
  };

  // Test jobs endpoint
  const testJobs = async () => {
    setLoading(prev => ({ ...prev, jobs: true }));
    setJobsError(null);
    
    try {
      const response = await API.jobs.getAll({ limit: 5 });
      setJobsData(response);
    } catch (error) {
      setJobsError(error);
      console.error('Jobs fetch failed:', error);
    } finally {
      setLoading(prev => ({ ...prev, jobs: false }));
    }
  };

  // Initialize auth status
  useEffect(() => {
    const initAuth = async () => {
      await authService.waitForInitialization();
      setAuthStatus({
        isAuthenticated: authService.isAuthenticated(),
        user: authService.getCurrentUser(),
        userId: authService.getUserId(),
        role: authService.getUserRole()
      });
    };
    initAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          API Integration Test Dashboard
        </h1>

        {/* Environment Info */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}
            </div>
            <div>
              <strong>Base URL:</strong> {process.env.NEXT_PUBLIC_BASE_URL}
            </div>
            <div>
              <strong>Socket URL:</strong> {process.env.NEXT_PUBLIC_SOCKET_URL}
            </div>
            <div>
              <strong>Environment:</strong> {process.env.NEXT_PUBLIC_ENVIRONMENT}
            </div>
          </div>
        </div>

        {/* Authentication Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          {authStatus ? (
            <div className="space-y-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${authStatus.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {authStatus.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </div>
              {authStatus.user && (
                <div className="text-sm text-gray-600">
                  <div><strong>User ID:</strong> {authStatus.userId}</div>
                  <div><strong>Role:</strong> {authStatus.role}</div>
                  <div><strong>Name:</strong> {authService.getFullName()}</div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-gray-500">Loading auth status...</div>
          )}
        </div>

        {/* Health Check Test */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Health Check Test</h2>
            <button
              onClick={testHealth}
              disabled={loading.health}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading.health ? 'Testing...' : 'Test Health API'}
            </button>
          </div>
          
          {healthStatus && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-medium text-green-800 mb-2">✅ Health Check Successful</h3>
              <pre className="text-sm text-green-700 overflow-auto">
                {JSON.stringify(healthStatus, null, 2)}
              </pre>
            </div>
          )}
          
          {healthError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="font-medium text-red-800 mb-2">❌ Health Check Failed</h3>
              <div className="text-sm text-red-700">
                <div><strong>Type:</strong> {healthError.type}</div>
                <div><strong>Status:</strong> {healthError.status}</div>
                <div><strong>Message:</strong> {healthError.message}</div>
              </div>
            </div>
          )}
        </div>

        {/* Jobs API Test */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Jobs API Test</h2>
            <button
              onClick={testJobs}
              disabled={loading.jobs}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading.jobs ? 'Fetching...' : 'Test Jobs API'}
            </button>
          </div>
          
          {jobsData && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-medium text-green-800 mb-2">✅ Jobs API Successful</h3>
              <div className="text-sm text-green-700 mb-2">
                <strong>Total Jobs:</strong> {jobsData.total || jobsData.jobs?.length || 0}
              </div>
              <details className="text-sm">
                <summary className="cursor-pointer font-medium">View Response Data</summary>
                <pre className="mt-2 text-green-700 overflow-auto max-h-64">
                  {JSON.stringify(jobsData, null, 2)}
                </pre>
              </details>
            </div>
          )}
          
          {jobsError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="font-medium text-red-800 mb-2">❌ Jobs API Failed</h3>
              <div className="text-sm text-red-700">
                <div><strong>Type:</strong> {jobsError.type}</div>
                <div><strong>Status:</strong> {jobsError.status}</div>
                <div><strong>Message:</strong> {jobsError.message}</div>
                {jobsError.errors?.length > 0 && (
                  <div>
                    <strong>Errors:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {jobsError.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Network & Browser Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="text-sm space-y-1">
            <div><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</div>
            <div><strong>Page URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
            <div><strong>Local Storage Available:</strong> {typeof localStorage !== 'undefined' ? 'Yes' : 'No'}</div>
            <div><strong>Session Storage Available:</strong> {typeof sessionStorage !== 'undefined' ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}