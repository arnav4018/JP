'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/useAuthStore';
import { 
  BarChart3,
  Users,
  Briefcase,
  Settings,
  Download,
  MessageSquare,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  Shield,
  Home,
  FileText,
  DollarSign,
  Target,
  TrendingUp,
  User,
  Building
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is admin (in real app, this would be a proper role check)
  const isAdmin = user?.email === 'admin@jobportal.com' || user?.role === 'admin';

  useEffect(() => {
    if (!loading && (!isAuthenticated || !isAdmin)) {
      router.push('/login?redirect=' + encodeURIComponent('/admin'));
    }
  }, [isAuthenticated, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--accent-interactive)' }}></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect to login
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3, current: pathname === '/admin' },
    { name: 'Job Management', href: '/admin/jobs', icon: Briefcase, current: pathname === '/admin/jobs' },
    { name: 'User Management', href: '/admin/users', icon: Users, current: pathname === '/admin/users' },
    { name: 'Company Management', href: '/admin/companies', icon: Building, current: pathname === '/admin/companies' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, current: pathname === '/admin/settings' },
    { name: 'Data Export', href: '/admin/export', icon: Download, current: pathname === '/admin/export' },
    { name: 'Reports', href: '/admin/reports', icon: FileText, current: pathname === '/admin/reports' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-deep)' }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--background-panel)', borderRight: '1px solid var(--accent-subtle)' }}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 border-b" style={{ borderColor: 'var(--accent-subtle)' }}>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent-interactive)' }}>
                <Shield className="h-6 w-6" style={{ color: 'var(--background-deep)' }} />
              </div>
              <div>
                <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                  Admin Panel
                </h1>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Management Dashboard
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:opacity-80 ${
                    item.current ? '' : ''
                  }`}
                  style={{
                    backgroundColor: item.current ? 'var(--accent-interactive)' : 'transparent',
                    color: item.current ? 'var(--background-deep)' : 'var(--text-secondary)'
                  }}
                  onClick={() => setSidebarOpen(false)}
                >
                  <IconComponent className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t" style={{ borderColor: 'var(--accent-subtle)' }}>
            <div className="flex items-center space-x-3 mb-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--accent-subtle)' }}
              >
                <User className="h-5 w-5" style={{ color: 'var(--accent-interactive)' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {user?.name || 'Admin'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Administrator
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Link
                href="/"
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-xs border rounded-lg hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
              >
                <Home className="h-4 w-4" />
                <span>Main Site</span>
              </Link>
              
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-xs border rounded-lg hover:opacity-80 transition-opacity text-red-600"
                style={{ borderColor: '#ef4444' }}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div 
          className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b"
          style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:opacity-80 transition-opacity"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div>
              <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {navigation.find(item => item.current)?.name || 'Admin Dashboard'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Manage your job portal platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 border rounded-lg focus:outline-none focus:ring-2 text-sm"
                  style={{
                    backgroundColor: 'var(--background-deep)',
                    borderColor: 'var(--accent-subtle)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:opacity-80 transition-opacity" style={{ color: 'var(--text-secondary)' }}>
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center text-white bg-red-500">
                3
              </span>
            </button>

            {/* Quick stats */}
            <div className="hidden xl:flex items-center space-x-6 pl-6 border-l" style={{ borderColor: 'var(--accent-subtle)' }}>
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--accent-interactive)' }}>
                  142
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Active Jobs
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--accent-interactive)' }}>
                  1,247
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Total Users
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium" style={{ color: 'var(--accent-interactive)' }}>
                  89
                </p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Companies
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}