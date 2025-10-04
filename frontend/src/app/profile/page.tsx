'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import SavedSearches from '@/components/ui/SavedSearches';
import { useAuth } from '@/store/useAuthStore';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit3, Settings, Bookmark, FileText, Bell, PenTool, Users } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent('/profile'));
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
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

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Profile Header */}
          <div className="rounded-lg shadow-md overflow-hidden mb-8" style={{ backgroundColor: 'var(--background-panel)' }}>
            <div className="h-32" style={{ background: 'linear-gradient(to right, var(--accent-interactive), var(--accent-interactive))' }}></div>
            <div className="relative px-6 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6">
                <div className="w-32 h-32 rounded-full p-2 shadow-lg" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <div className="w-full h-full rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                    <User className="h-16 w-16" style={{ color: 'var(--text-secondary)' }} />
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left flex-1">
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.first_name && user.last_name 
                      ? `${user.first_name} ${user.last_name}`
                      : user.name || 'User'
                    }
                  </h1>
                  <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{user.profile?.title || 'Job Seeker'}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                  <button className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium hover:opacity-80 transition-opacity" style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)', backgroundColor: 'var(--background-panel)' }}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                  <Link
                    href="/resume-builder"
                    className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium hover:opacity-80 transition-opacity"
                    style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)', backgroundColor: 'var(--background-panel)' }}
                  >
                    <PenTool className="h-4 w-4 mr-2" />
                    Resume Builder
                  </Link>
                  <Link
                    href="/applications"
                    className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium hover:opacity-80 transition-opacity"
                    style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)', backgroundColor: 'var(--background-panel)' }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Applications
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="rounded-lg shadow-sm" style={{ backgroundColor: 'var(--background-panel)' }}>
              <div className="flex border-b" style={{ borderColor: 'var(--accent-subtle)' }}>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'profile' ? 'border-b-2' : 'hover:opacity-80'
                  }`}
                  style={{
                    borderBottomColor: activeTab === 'profile' ? 'var(--accent-interactive)' : 'transparent',
                    color: activeTab === 'profile' ? 'var(--accent-interactive)' : 'var(--text-secondary)'
                  }}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  Profile
                </button>
                
                <button
                  onClick={() => setActiveTab('searches')}
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'searches' ? 'border-b-2' : 'hover:opacity-80'
                  }`}
                  style={{
                    borderBottomColor: activeTab === 'searches' ? 'var(--accent-interactive)' : 'transparent',
                    color: activeTab === 'searches' ? 'var(--accent-interactive)' : 'var(--text-secondary)'
                  }}
                >
                  <Bookmark className="h-4 w-4 inline mr-2" />
                  Saved Searches
                </button>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-6">
              
              {/* Contact Information */}
              <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</span>
                  </div>
                  {user.profile?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.profile.phone}</span>
                    </div>
                  )}
                  {user.profile?.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.profile.location}</span>
                    </div>
                  )}
                  {user.createdAt && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Joined {formatJoinDate(user.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/applications"
                    className="block w-full text-left px-4 py-3 rounded-lg border hover:opacity-80 transition-opacity"
                    style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-deep)' }}
                  >
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-5 w-5" style={{ color: 'var(--accent-interactive)' }} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>View Applications</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Track your job applications</div>
                      </div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/jobs"
                    className="block w-full text-left px-4 py-3 rounded-lg border hover:opacity-80 transition-opacity"
                    style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-deep)' }}
                  >
                    <div className="flex items-center space-x-3">
                      <Briefcase className="h-5 w-5" style={{ color: 'var(--accent-interactive)' }} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Browse Jobs</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Find new opportunities</div>
                      </div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/resume-builder"
                    className="block w-full text-left px-4 py-3 rounded-lg border hover:opacity-80 transition-opacity"
                    style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-deep)' }}
                  >
                    <div className="flex items-center space-x-3">
                      <PenTool className="h-5 w-5" style={{ color: 'var(--accent-interactive)' }} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Resume Builder</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Create professional resumes</div>
                      </div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/profile/resumes"
                    className="block w-full text-left px-4 py-3 rounded-lg border hover:opacity-80 transition-opacity"
                    style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-deep)' }}
                  >
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5" style={{ color: 'var(--accent-interactive)' }} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>My Resumes</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>View and manage resumes</div>
                      </div>
                    </div>
                  </Link>
                  
                  <Link
                    href="/referrals"
                    className="block w-full text-left px-4 py-3 rounded-lg border hover:opacity-80 transition-opacity"
                    style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-deep)' }}
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5" style={{ color: 'var(--accent-interactive)' }} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Refer & Earn</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Share jobs and earn rewards</div>
                      </div>
                    </div>
                  </Link>
                  
                  <button
                    onClick={() => setActiveTab('searches')}
                    className="w-full text-left px-4 py-3 rounded-lg border hover:opacity-80 transition-opacity"
                    style={{ borderColor: 'var(--accent-subtle)', backgroundColor: 'var(--background-deep)' }}
                  >
                    <div className="flex items-center space-x-3">
                      <Bookmark className="h-5 w-5" style={{ color: 'var(--accent-interactive)' }} />
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Saved Searches</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Quick access to your searches</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              
                {/* About */}
                <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>About</h3>
                  <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {user.profile?.bio || 'Complete your profile to add a bio and showcase your experience to potential employers.'}
                  </p>
                </div>

              {/* Experience */}
              <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Experience</h3>
                <div className="space-y-6">
                  <div className="border-l-2 pl-4" style={{ borderColor: 'var(--accent-interactive)' }}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Senior Software Engineer</h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Tech Corp</p>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>2022 - Present</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Lead development of customer-facing web applications using React and Node.js. 
                      Collaborated with cross-functional teams to deliver high-quality software solutions.
                    </p>
                  </div>
                  
                  <div className="border-l-2 pl-4" style={{ borderColor: 'var(--accent-subtle)' }}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Software Engineer</h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>StartupCo</p>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>2020 - 2022</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Developed and maintained full-stack applications. Implemented new features and 
                      optimized existing codebase for better performance.
                    </p>
                  </div>
                </div>
              </div>

                {/* Skills */}
                <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.profile?.skills && user.profile.skills.length > 0 ? (
                      user.profile.skills.map((skill: string) => (
                        <span
                          key={skill}
                          className="px-3 py-1 text-sm rounded-full"
                          style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }}
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Add your skills to help employers find you for relevant positions.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Saved Searches Tab */}
              <SavedSearches />
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}