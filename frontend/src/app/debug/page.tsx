'use client';

import { useAuth } from '@/store/useAuthStore';
import MainLayout from '@/components/layout/MainLayout';

export default function DebugPage() {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <MainLayout>
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="rounded-lg shadow-md p-6 mb-6" style={{ backgroundColor: 'var(--background-panel)' }}>
            <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              🔧 System Debug Info
            </h1>
            
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Authentication Status
                </h2>
                <div className="space-y-2">
                  <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                  <p><strong>Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>User:</strong> {user ? '✅ Found' : '❌ Not found'}</p>
                </div>
              </div>

              {user && (
                <div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    User Data
                  </h2>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(user, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  LocalStorage Tokens
                </h2>
                <div className="space-y-2">
                  <p><strong>Auth Token:</strong> {typeof window !== 'undefined' && localStorage.getItem('authToken') ? '✅ Found' : '❌ Not found'}</p>
                  <p><strong>Refresh Token:</strong> {typeof window !== 'undefined' && localStorage.getItem('refreshToken') ? '✅ Found' : '❌ Not found'}</p>
                  <p><strong>User Data:</strong> {typeof window !== 'undefined' && localStorage.getItem('user') ? '✅ Found' : '❌ Not found'}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  Page Links Status
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <a href="/profile" className="text-blue-600 hover:underline">✅ Profile Page</a>
                  <a href="/applications" className="text-blue-600 hover:underline">✅ Applications Page</a>
                  <a href="/resume-builder" className="text-blue-600 hover:underline">✅ Resume Builder</a>
                  <a href="/referrals" className="text-blue-600 hover:underline">✅ Referrals Page</a>
                  <a href="/pricing" className="text-blue-600 hover:underline">✅ Pricing Page</a>
                  <a href="/jobs" className="text-blue-600 hover:underline">✅ Jobs Page</a>
                  <a href="/companies" className="text-blue-600 hover:underline">✅ Companies Page</a>
                  <a href="/about" className="text-blue-600 hover:underline">✅ About Page</a>
                  <a href="/contact" className="text-blue-600 hover:underline">✅ Contact Page</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}