'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, User, Briefcase, LogOut, Settings, FileText, Bell, ChevronDown, Users, PenTool, MessageSquare, Shield, Building } from 'lucide-react';
import { useAuth } from '@/store/useAuthStore';
import LiveChat from '@/components/ui/LiveChat';

export default function Navbar() {
  const { isAuthenticated, user, logout, initializeAuth } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  
  // Check if user is admin (in real app, this would come from user data/JWT token)
  const isAdmin = user?.role === 'admin' || user?.isAdmin;
  // For demo purposes, you can also check by email or other criteria
  const isAdminUser = isAdmin || user?.email?.includes('admin');

  // Initialize auth on component mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'application',
      title: 'Application Update',
      message: 'Your application for Frontend Developer at TechCorp has been reviewed',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      id: 2,
      type: 'job_match',
      title: 'New Job Match',
      message: 'We found 3 new jobs matching your profile',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false
    },
    {
      id: 3,
      type: 'referral',
      title: 'Referral Bonus',
      message: 'You earned $500 from your referral for John Smith',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true
    },
    {
      id: 4,
      type: 'system',
      title: 'Profile Complete',
      message: 'Complete your profile to get better job recommendations',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="shadow-lg border-b sticky top-0 z-50" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--accent-interactive)' }}>
                <Briefcase className="h-6 w-6" style={{ color: 'var(--background-deep)' }} />
              </div>
              <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>JobPortal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <NavLink href="/jobs">Find Jobs</NavLink>
            <NavLink href="/companies">Companies</NavLink>
            {isAuthenticated && (
              <>
                <NavLink href="/resume-builder">Resume Builder</NavLink>
                <NavLink href="/referrals">Refer & Earn</NavLink>
                <NavLink href="/pricing">Pricing</NavLink>
              </>
            )}
            {isAdminUser && (
              <NavLink href="/admin">Admin Panel</NavLink>
            )}
            <NavLink href="/about">About</NavLink>
            <NavLink href="/contact">Contact</NavLink>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NavLink href="/applications">My Applications</NavLink>
                
                {/* Live Chat Button */}
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="relative p-2 rounded-lg transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                  title="Live Chat Support"
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
                
                {/* Notifications Dropdown */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 rounded-lg transition-colors hover:opacity-80"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span 
                        className="absolute -top-1 -right-1 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: '#ef4444' }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg border py-2 max-h-96 overflow-y-auto" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
                      <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--accent-subtle)' }}>
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="text-xs" style={{ color: 'var(--accent-interactive)' }}>Mark all as read</span>
                          )}
                        </div>
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No notifications yet</p>
                        </div>
                      ) : (
                        <div className="divide-y" style={{ borderColor: 'var(--accent-subtle)' }}>
                          {notifications.map((notification) => (
                            <NotificationItem key={notification.id} notification={notification} />
                          ))}
                        </div>
                      )}
                      
                      <div className="px-4 py-2 border-t" style={{ borderColor: 'var(--accent-subtle)' }}>
                        <button className="text-sm w-full text-center hover:opacity-80 transition-opacity" style={{ color: 'var(--accent-interactive)' }}>
                          View all notifications
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* User Menu Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg transition-colors hover:opacity-80"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                  >
                    <User className="h-5 w-5" />
                    <span className="text-sm font-medium">{user?.name || 'User'}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg border py-2" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-sm transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--accent-interactive)';
                          e.target.style.backgroundColor = 'var(--accent-subtle)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--text-secondary)';
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        <span>Profile Settings</span>
                      </Link>
                      
                      <Link
                        href="/applications"
                        className="flex items-center space-x-3 px-4 py-2 text-sm transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--accent-interactive)';
                          e.target.style.backgroundColor = 'var(--accent-subtle)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--text-secondary)';
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <FileText className="h-4 w-4" />
                        <span>My Applications</span>
                      </Link>
                      
                      <Link
                        href="/profile/resumes"
                        className="flex items-center space-x-3 px-4 py-2 text-sm transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--accent-interactive)';
                          e.target.style.backgroundColor = 'var(--accent-subtle)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--text-secondary)';
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <PenTool className="h-4 w-4" />
                        <span>My Resumes</span>
                      </Link>
                      
                      <Link
                        href="/referrals"
                        className="flex items-center space-x-3 px-4 py-2 text-sm transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--accent-interactive)';
                          e.target.style.backgroundColor = 'var(--accent-subtle)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--text-secondary)';
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Users className="h-4 w-4" />
                        <span>Refer & Earn</span>
                      </Link>
                      
                      <Link
                        href="/pricing"
                        className="flex items-center space-x-3 px-4 py-2 text-sm transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--accent-interactive)';
                          e.target.style.backgroundColor = 'var(--accent-subtle)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--text-secondary)';
                          e.target.style.backgroundColor = 'transparent';
                        }}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Building className="h-4 w-4" />
                        <span>Pricing Plans</span>
                      </Link>
                      
                      {/* Admin Panel Access */}
                      {isAdminUser && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-3 px-4 py-2 text-sm transition-colors hover:opacity-80"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => {
                            e.target.style.color = 'var(--accent-interactive)';
                            e.target.style.backgroundColor = 'var(--accent-subtle)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = 'var(--text-secondary)';
                            e.target.style.backgroundColor = 'transparent';
                          }}
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Shield className="h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      
                      <div className="border-t my-2" style={{ borderColor: 'var(--accent-subtle)' }}></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-2 text-sm w-full transition-colors hover:opacity-80"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          e.target.style.color = 'var(--accent-interactive)';
                          e.target.style.backgroundColor = 'var(--accent-subtle)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.color = 'var(--text-secondary)';
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <NavLink href="/login">Sign In</NavLink>
                <Link
                  href="/signup"
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ 
                    backgroundColor: 'var(--accent-interactive)', 
                    color: 'var(--background-deep)'
                  }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4" style={{ borderColor: 'var(--accent-subtle)' }}>
            <div className="space-y-2">
              <MobileNavLink href="/jobs" onClick={() => setIsMobileMenuOpen(false)}>
                Find Jobs
              </MobileNavLink>
              <MobileNavLink href="/companies" onClick={() => setIsMobileMenuOpen(false)}>
                Companies
              </MobileNavLink>
              
              {isAuthenticated && (
                <>
                  <MobileNavLink href="/resume-builder" onClick={() => setIsMobileMenuOpen(false)}>
                    Resume Builder
                  </MobileNavLink>
                  <MobileNavLink href="/referrals" onClick={() => setIsMobileMenuOpen(false)}>
                    Refer & Earn
                  </MobileNavLink>
                  <MobileNavLink href="/pricing" onClick={() => setIsMobileMenuOpen(false)}>
                    Pricing
                  </MobileNavLink>
                  {isAdminUser && (
                    <MobileNavLink href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      Admin Panel
                    </MobileNavLink>
                  )}
                </>
              )}
              
              <MobileNavLink href="/about" onClick={() => setIsMobileMenuOpen(false)}>
                About
              </MobileNavLink>
              <MobileNavLink href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                Contact
              </MobileNavLink>
              
              {/* Mobile Auth Section */}
              <div className="border-t pt-4 mt-4" style={{ borderColor: 'var(--accent-subtle)' }}>
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 mb-2" style={{ color: 'var(--text-primary)' }}>
                      <div className="flex items-center space-x-2 text-sm font-medium">
                        <User className="h-4 w-4" />
                        <span>Welcome, {user?.name || 'User'}</span>
                      </div>
                    </div>
                    
                    <MobileNavLink href="/applications" onClick={() => setIsMobileMenuOpen(false)}>
                      My Applications
                    </MobileNavLink>
                    
                    <MobileNavLink href="/profile/resumes" onClick={() => setIsMobileMenuOpen(false)}>
                      My Resumes
                    </MobileNavLink>
                    
                    <MobileNavLink href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                      Profile Settings
                    </MobileNavLink>
                    
                    {/* Live Chat Support */}
                    <button
                      onClick={() => {
                        setIsChatOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium transition-all hover:opacity-80 rounded-lg mx-2"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => {
                        e.target.style.color = 'var(--accent-interactive)';
                        e.target.style.backgroundColor = 'var(--accent-subtle)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'var(--text-secondary)';
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>Live Chat Support</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-base font-medium transition-all hover:opacity-80 rounded-lg mx-2"
                      style={{ color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => {
                        e.target.style.color = 'var(--accent-interactive)';
                        e.target.style.backgroundColor = 'var(--accent-subtle)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = 'var(--text-secondary)';
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <MobileNavLink href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </MobileNavLink>
                    <div className="px-3 py-2">
                      <Link
                        href="/signup"
                        className="block w-full text-center px-4 py-3 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                        style={{ 
                          backgroundColor: 'var(--accent-interactive)', 
                          color: 'var(--background-deep)'
                        }}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Live Chat Component */}
      {isChatOpen && (
        <LiveChat 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </nav>
  );
}

// Helper Components
const NavLink = ({ href, children, className = "" }) => (
  <Link
    href={href}
    className={`px-3 py-2 text-sm font-medium transition-colors hover:opacity-80 ${className}`}
    style={{ color: 'var(--text-secondary)' }}
    onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'}
    onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ href, children, onClick }) => (
  <Link
    href={href}
    className="block px-3 py-2 text-base font-medium transition-all hover:opacity-80 rounded-lg mx-2"
    style={{ color: 'var(--text-secondary)' }}
    onMouseEnter={(e) => {
      e.target.style.color = 'var(--accent-interactive)';
      e.target.style.backgroundColor = 'var(--accent-subtle)';
    }}
    onMouseLeave={(e) => {
      e.target.style.color = 'var(--text-secondary)';
      e.target.style.backgroundColor = 'transparent';
    }}
    onClick={onClick}
  >
    {children}
  </Link>
);

// Notification Item Component
const NotificationItem = ({ notification }) => {
  const formatTime = (timestamp) => {
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

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application':
        return <FileText className="h-4 w-4" />;
      case 'job_match':
        return <Briefcase className="h-4 w-4" />;
      case 'referral':
        return <Users className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div 
      className="px-4 py-3 hover:opacity-80 transition-colors cursor-pointer"
      style={{ 
        backgroundColor: !notification.read ? 'var(--accent-subtle)' : 'transparent'
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = 'var(--accent-subtle)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = !notification.read ? 'var(--accent-subtle)' : 'transparent';
      }}
    >
      <div className="flex items-start space-x-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
          style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
        >
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 
              className="text-sm font-medium truncate" 
              style={{ color: 'var(--text-primary)' }}
            >
              {notification.title}
            </h4>
            {!notification.read && (
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0 ml-2"
                style={{ backgroundColor: 'var(--accent-interactive)' }}
              ></div>
            )}
          </div>
          
          <p 
            className="text-xs mb-1 line-clamp-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {notification.message}
          </p>
          
          <span 
            className="text-xs"
            style={{ color: 'var(--text-secondary)', opacity: 0.7 }}
          >
            {formatTime(notification.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};
