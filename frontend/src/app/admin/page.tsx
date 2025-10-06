'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/store/useAuthStore';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp,
  DollarSign,
  Calendar,
  Activity,
  Shield,
  Settings,
  BarChart3,
  PieChart
} from 'lucide-react';
import apiClient from '@/services/httpClient';

interface DashboardStats {
  overview: {
    totalUsers: number;
    newUsers: number;
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    newApplications: number;
    totalPayments: number;
    newPayments: number;
    totalRevenue: number;
    pendingApplications: number;
  };
  usersByRole: Array<{ _id: string; count: number }>;
  topCompanies: Array<{ _id: string; jobCount: number; activeJobs: number }>;
  recentActivities: Array<{
    id: string;
    type: string;
    candidate: string;
    job: string;
    company: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent('/admin'));
      return;
    }

    if (user && user.role !== 'admin') {
      router.push('/profile');
      return;
    }

    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboardStats();
    }
  }, [isAuthenticated, authLoading, router, user]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/admin/dashboard/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error: any) {
      setError('Failed to load dashboard statistics');
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-deep)' }}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent-interactive)' }}></div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
                  <Shield className="h-8 w-8 mr-3" style={{ color: 'var(--accent-interactive)' }} />
                  Admin Dashboard
                </h1>
                <p className="text-lg mt-2" style={{ color: 'var(--text-secondary)' }}>
                  Monitor and manage your job portal
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={fetchDashboardStats}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)', backgroundColor: 'var(--background-panel)' }}
                >
                  <Activity className="h-4 w-4 mr-2" />
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  className="inline-flex items-center px-4 py-2 text-white rounded-md hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: 'var(--accent-interactive)' }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loading && !stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-lg shadow-md p-6 animate-pulse" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Total Users</p>
                      <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {stats.overview.totalUsers.toLocaleString()}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--accent-interactive)' }}>
                        +{stats.overview.newUsers} new this month
                      </p>
                    </div>
                    <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                      <Users className="h-6 w-6" style={{ color: 'var(--accent-interactive)' }} />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Active Jobs</p>
                      <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {stats.overview.activeJobs.toLocaleString()}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        of {stats.overview.totalJobs} total jobs
                      </p>
                    </div>
                    <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                      <Briefcase className="h-6 w-6" style={{ color: 'var(--accent-interactive)' }} />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Applications</p>
                      <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        {stats.overview.totalApplications.toLocaleString()}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--accent-interactive)' }}>
                        +{stats.overview.newApplications} new this month
                      </p>
                    </div>
                    <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                      <FileText className="h-6 w-6" style={{ color: 'var(--accent-interactive)' }} />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Revenue</p>
                      <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        ${stats.overview.totalRevenue.toLocaleString()}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--accent-interactive)' }}>
                        +{stats.overview.newPayments} payments this month
                      </p>
                    </div>
                    <div className="p-3 rounded-full" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                      <DollarSign className="h-6 w-6" style={{ color: 'var(--accent-interactive)' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                
                {/* Users by Role */}
                <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <PieChart className="h-5 w-5 mr-2" />
                    Users by Role
                  </h3>
                  <div className="space-y-4">
                    {stats.usersByRole.map((role) => (
                      <div key={role._id} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                          {role._id}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                backgroundColor: 'var(--accent-interactive)',
                                width: `${(role.count / stats.overview.totalUsers) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {role.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Companies */}
                <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Top Companies
                  </h3>
                  <div className="space-y-4">
                    {stats.topCompanies.slice(0, 5).map((company) => (
                      <div key={company._id} className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {company._id || 'Unknown Company'}
                        </span>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {company.jobCount} jobs
                          </span>
                          <span className="text-sm font-medium" style={{ color: 'var(--accent-interactive)' }}>
                            {company.activeJobs} active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--text-primary)' }}>
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activities
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          Candidate
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          Job
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {stats.recentActivities.map((activity) => (
                        <tr key={activity.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                            {activity.candidate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                            {activity.job}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-primary)' }}>
                            {activity.company}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {activity.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Welcome to Admin Dashboard
              </h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                Click refresh to load dashboard statistics
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}