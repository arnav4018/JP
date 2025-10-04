'use client';

import { useState, useEffect } from 'react';
import API from '@/services/api';

export default function TestAPIPage() {
  const [apiStatus, setApiStatus] = useState('testing');
  const [jobsData, setJobsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      setApiStatus('testing');
      setError(null);

      // Test health endpoint
      console.log('Testing API health...');
      const healthResponse = await API.util.health();
      console.log('Health response:', healthResponse);

      // Test jobs endpoint
      console.log('Testing jobs API...');
      const jobsResponse = await API.jobs.getAll({ limit: 5 });
      console.log('Jobs response:', jobsResponse);
      
      setJobsData(jobsResponse);
      setApiStatus('success');
    } catch (err) {
      console.error('API test failed:', err);
      setError(err instanceof Error ? err.message : 'API test failed');
      setApiStatus('error');
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--background-deep)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
          API Connection Test
        </h1>

        <div className="space-y-6">
          {/* API Status */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              API Status
            </h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                apiStatus === 'testing' ? 'bg-yellow-500' :
                apiStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span style={{ color: 'var(--text-secondary)' }}>
                {apiStatus === 'testing' ? 'Testing API connection...' :
                 apiStatus === 'success' ? 'API connection successful!' :
                 'API connection failed'}
              </span>
            </div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Jobs Data */}
          {jobsData && (
            <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Sample Jobs Data
              </h2>
              <div className="space-y-4">
                <div>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    <strong>Total Jobs:</strong> {jobsData.success ? jobsData.count : 'N/A'}
                  </p>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    <strong>API Response Format:</strong> {jobsData.success ? 'New Format (success/data/jobs)' : 'Legacy Format'}
                  </p>
                </div>
                
                {jobsData.success && jobsData.data && jobsData.data.jobs && (
                  <div>
                    <h3 className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Sample Job Titles:
                    </h3>
                    <ul className="space-y-1">
                      {jobsData.data.jobs.slice(0, 3).map((job: any, index: number) => (
                        <li key={job.id} style={{ color: 'var(--text-secondary)' }}>
                          • {job.title} at {job.company_name} ({job.location})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Retry Button */}
          <button
            onClick={testAPI}
            className="px-6 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
          >
            Test API Again
          </button>

          {/* API Configuration */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Configuration
            </h2>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</p>
              <p><strong>Environment:</strong> {process.env.NEXT_PUBLIC_ENVIRONMENT}</p>
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}