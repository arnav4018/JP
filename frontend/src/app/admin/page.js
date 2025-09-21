'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuthStore';
import { 
  Users,
  Briefcase,
  Building,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  UserPlus,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Activity,
  Calendar,
  MapPin,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Filter,
  Download,
  Zap,
  Target,
  Award
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('7d'); // 24h, 7d, 30d, 3m
  const [selectedMetric, setSelectedMetric] = useState('users');

  // Mock data - in real app, this would come from API
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalUsers: 12847,
      totalJobs: 1423,
      totalCompanies: 289,
      totalRevenue: 45678,
      growthRates: {
        users: 12.5,
        jobs: 8.3,
        companies: 15.7,
        revenue: 22.4
      }
    },
    recentActivity: [
      {
        id: 1,
        type: 'user_signup',
        user: 'John Smith',
        action: 'created an account',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        status: 'success'
      },
      {
        id: 2,
        type: 'job_posted',
        user: 'TechCorp Inc.',
        action: 'posted a job: Senior React Developer',
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        status: 'pending'
      },
      {
        id: 3,
        type: 'application',
        user: 'Sarah Johnson',
        action: 'applied for Frontend Developer at StartupCo',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'success'
      },
      {
        id: 4,
        type: 'payment',
        user: 'DataFlow Solutions',
        action: 'upgraded to Professional plan',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        status: 'success'
      },
      {
        id: 5,
        type: 'job_approved',
        user: 'CloudTech Ltd',
        action: 'job listing approved: DevOps Engineer',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'success'
      }
    ],
    topPerformingJobs: [
      { id: 1, title: 'Senior React Developer', company: 'TechCorp', applications: 45, views: 892 },
      { id: 2, title: 'Product Manager', company: 'StartupCo', applications: 38, views: 756 },
      { id: 3, title: 'Data Scientist', company: 'DataFlow', applications: 32, views: 634 },
      { id: 4, title: 'UX Designer', company: 'DesignHub', applications: 28, views: 521 },
      { id: 5, title: 'DevOps Engineer', company: 'CloudTech', applications: 24, views: 445 }
    ],
    quickStats: {
      pendingJobs: 23,
      activeApplications: 1847,
      flaggedContent: 3,
      systemHealth: 99.9
    },
    chartData: {
      userGrowth: [
        { date: '2024-01-01', users: 8500, jobs: 950, companies: 180 },
        { date: '2024-01-02', users: 8650, jobs: 980, companies: 185 },
        { date: '2024-01-03', users: 8800, jobs: 1020, companies: 190 },
        { date: '2024-01-04', users: 9200, jobs: 1080, companies: 200 },
        { date: '2024-01-05', users: 9800, jobs: 1150, companies: 220 },
        { date: '2024-01-06', users: 10500, jobs: 1250, companies: 240 },
        { date: '2024-01-07', users: 12847, jobs: 1423, companies: 289 }
      ]
    }
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_signup':
        return <UserPlus className="h-4 w-4" style={{ color: 'rgb(34, 197, 94)' }} />;
      case 'job_posted':
        return <Briefcase className="h-4 w-4" style={{ color: 'rgb(59, 130, 246)' }} />;
      case 'application':
        return <FileText className="h-4 w-4" style={{ color: 'rgb(168, 85, 247)' }} />;
      case 'payment':
        return <DollarSign className="h-4 w-4" style={{ color: 'rgb(34, 197, 94)' }} />;
      case 'job_approved':
        return <CheckCircle className="h-4 w-4" style={{ color: 'rgb(34, 197, 94)' }} />;
      default:
        return <Activity className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'rgb(34, 197, 94)';
      case 'pending':
        return 'rgb(249, 168, 37)';
      case 'error':
        return 'rgb(239, 68, 68)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Welcome back, {user?.name || 'Admin'}! 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Here's what's happening with your job portal today
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-sm"
            style={{
              backgroundColor: 'var(--background-panel)',
              borderColor: 'var(--accent-subtle)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="3m">Last 3 months</option>
          </select>
          
          <button
            className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:opacity-80 transition-opacity text-sm"
            style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={dashboardData.overview.totalUsers.toLocaleString()}
          change={dashboardData.overview.growthRates.users}
          icon={Users}
          color="rgb(59, 130, 246)"
        />
        
        <MetricCard
          title="Active Jobs"
          value={dashboardData.overview.totalJobs.toLocaleString()}
          change={dashboardData.overview.growthRates.jobs}
          icon={Briefcase}
          color="rgb(168, 85, 247)"
        />
        
        <MetricCard
          title="Companies"
          value={dashboardData.overview.totalCompanies.toLocaleString()}
          change={dashboardData.overview.growthRates.companies}
          icon={Building}
          color="rgb(34, 197, 94)"
        />
        
        <MetricCard
          title="Revenue"
          value={`$${dashboardData.overview.totalRevenue.toLocaleString()}`}
          change={dashboardData.overview.growthRates.revenue}
          icon={DollarSign}
          color="rgb(249, 168, 37)"
        />
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <QuickActionCard
          title="Pending Jobs"
          value={dashboardData.quickStats.pendingJobs}
          subtitle="Awaiting approval"
          action="Review"
          href="/admin/jobs"
          color="rgb(249, 168, 37)"
          icon={Clock}
        />
        
        <QuickActionCard
          title="Applications"
          value={dashboardData.quickStats.activeApplications}
          subtitle="Active applications"
          action="View"
          href="/admin/applications"
          color="rgb(59, 130, 246)"
          icon={FileText}
        />
        
        <QuickActionCard
          title="Flagged Content"
          value={dashboardData.quickStats.flaggedContent}
          subtitle="Needs attention"
          action="Moderate"
          href="/admin/moderation"
          color="rgb(239, 68, 68)"
          icon={AlertTriangle}
        />
        
        <QuickActionCard
          title="System Health"
          value={`${dashboardData.quickStats.systemHealth}%`}
          subtitle="All systems operational"
          action="Monitor"
          href="/admin/system"
          color="rgb(34, 197, 94)"
          icon={Activity}
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Growth Chart */}
        <div 
          className="rounded-lg border p-6"
          style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Platform Growth
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Track user, job, and company growth over time
              </p>
            </div>
            
            <div className="flex space-x-2">
              {['users', 'jobs', 'companies'].map(metric => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                    selectedMetric === metric ? '' : 'opacity-60'
                  }`}
                  style={{
                    backgroundColor: selectedMetric === metric ? 'var(--accent-interactive)' : 'var(--accent-subtle)',
                    color: selectedMetric === metric ? 'var(--background-deep)' : 'var(--text-secondary)'
                  }}
                >
                  {metric.charAt(0).toUpperCase() + metric.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Simple Chart Visualization */}
          <div className="space-y-4">
            <div className="flex items-end space-x-2 h-48">
              {dashboardData.chartData.userGrowth.map((data, index) => {
                const value = data[selectedMetric];
                const maxValue = Math.max(...dashboardData.chartData.userGrowth.map(d => d[selectedMetric]));
                const height = (value / maxValue) * 100;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                      style={{ 
                        height: `${height}%`,
                        backgroundColor: 'var(--accent-interactive)',
                        minHeight: '4px'
                      }}
                      title={`${value.toLocaleString()} ${selectedMetric}`}
                    />
                    <span className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(data.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: 'var(--text-secondary)' }}>
                Current: {dashboardData.chartData.userGrowth[dashboardData.chartData.userGrowth.length - 1][selectedMetric].toLocaleString()}
              </span>
              <span style={{ color: 'rgb(34, 197, 94)' }}>
                ↑ {dashboardData.overview.growthRates[selectedMetric]}% from last period
              </span>
            </div>
          </div>
        </div>

        {/* Top Performing Jobs */}
        <div 
          className="rounded-lg border p-6"
          style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Top Performing Jobs
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Jobs with highest engagement this week
              </p>
            </div>
            
            <Link
              href="/admin/jobs"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'var(--accent-interactive)' }}
            >
              View all
            </Link>
          </div>
          
          <div className="space-y-4">
            {dashboardData.topPerformingJobs.map((job, index) => (
              <div key={job.id} className="flex items-center justify-between p-3 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: 'var(--background-deep)' }}>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
                  >
                    {index + 1}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {job.title}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {job.company}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" style={{ color: 'var(--accent-interactive)' }} />
                      <span style={{ color: 'var(--text-primary)' }}>{job.applications}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{job.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div 
        className="rounded-lg border p-6"
        style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Recent Activity
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Latest actions across your platform
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              className="p-2 border rounded-lg hover:opacity-80 transition-opacity"
              style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
            >
              <Filter className="h-4 w-4" />
            </button>
            
            <button
              className="p-2 border rounded-lg hover:opacity-80 transition-opacity"
              style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {dashboardData.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg hover:opacity-80 transition-opacity" style={{ backgroundColor: 'var(--background-deep)' }}>
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--accent-subtle)' }}
              >
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  <span className="font-medium">{activity.user}</span>
                  {' '}
                  <span>{activity.action}</span>
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
              
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                style={{ backgroundColor: getStatusColor(activity.status) }}
              />
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: 'var(--accent-subtle)' }}>
          <Link
            href="/admin/activity"
            className="text-sm font-medium hover:opacity-80 transition-opacity"
            style={{ color: 'var(--accent-interactive)' }}
          >
            View all activity
          </Link>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
const MetricCard = ({ title, value, change, icon: Icon, color }) => (
  <div 
    className="rounded-lg border p-6 hover:shadow-lg transition-shadow"
    style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
  >
    <div className="flex items-center justify-between mb-4">
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
      
      <div className={`flex items-center space-x-1 text-sm font-medium ${change >= 0 ? '' : ''}`} style={{ color: change >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)' }}>
        {change >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
        <span>{Math.abs(change)}%</span>
      </div>
    </div>
    
    <div>
      <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </h3>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </p>
    </div>
  </div>
);

// Quick Action Card Component
const QuickActionCard = ({ title, value, subtitle, action, href, color, icon: Icon }) => (
  <Link
    href={href}
    className="block rounded-lg border p-4 hover:shadow-lg transition-shadow hover:opacity-90"
    style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
  >
    <div className="flex items-center justify-between mb-3">
      <Icon className="h-5 w-5" style={{ color }} />
      <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }}>
        {action}
      </span>
    </div>
    
    <div>
      <h4 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
        {value}
      </h4>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {title}
      </p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
        {subtitle}
      </p>
    </div>
  </Link>
);