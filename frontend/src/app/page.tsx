'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import MainLayout from '@/components/layout/MainLayout';
import SearchBar from '@/components/ui/SearchBar';
import JobCard from '@/components/ui/JobCard';
import { fetchJobs, fetchPersonalizedJobs } from '@/services/mockApi';
import { TrendingUp, Users, Building, Star, Briefcase, User, Heart, Sparkles, Zap, Rocket } from 'lucide-react';
import Cookies from 'js-cookie';
import { useJobStore } from '@/store/useJobStore';
import { useAuth } from '@/store/useAuthStore';
import '@/styles/homepage-animations.css';

export default function Home() {
  const { isAuthenticated, getUserId, user } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [personalizedJobs, setPersonalizedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [personalizedLoading, setPersonalizedLoading] = useState(false);
  const [lastSearch, setLastSearch] = useState<any>(null);
  const { searchQuery, location } = useJobStore();
  
  // Scroll-triggered animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    // Observe all scroll-reveal elements
    const scrollElements = document.querySelectorAll('.scroll-reveal');
    scrollElements.forEach((el) => observer.observe(el));

    return () => {
      scrollElements.forEach((el) => observer.unobserve(el));
    };
  }, [featuredJobs, personalizedJobs]); // Re-run when content changes
  
  // Professional hero image from public directory
  const heroImage = {
    src: '/office.jpg',
    alt: 'Professional office scene with modern design'
  };

  useEffect(() => {
    // Load featured jobs (limit to first 6)
    const loadFeaturedJobs = async () => {
      try {
        const response = await fetchJobs({ limit: 6 });
        setFeaturedJobs(response.jobs);
      } catch (error) {
        console.error('Failed to load featured jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedJobs();

    // Check for last search in cookies
    const savedSearch = Cookies.get('lastSearch');
    if (savedSearch) {
      try {
        setLastSearch(JSON.parse(savedSearch));
      } catch (error) {
        console.error('Failed to parse last search cookie:', error);
      }
    }
  }, []);

  // Load personalized jobs when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      const loadPersonalizedJobs = async () => {
        const userId = getUserId();
        if (!userId) return;

        setPersonalizedLoading(true);
        try {
          const response = await fetchPersonalizedJobs(userId, 6);
          setPersonalizedJobs(response.jobs);
        } catch (error) {
          console.error('Failed to load personalized jobs:', error);
        } finally {
          setPersonalizedLoading(false);
        }
      };

      loadPersonalizedJobs();
    } else {
      setPersonalizedJobs([]);
    }
  }, [isAuthenticated, getUserId]);

  // Save search to cookies when user performs a search
  useEffect(() => {
    if (searchQuery || location) {
      const searchData = {
        query: searchQuery,
        location: location,
        timestamp: new Date().toISOString()
      };
      Cookies.set('lastSearch', JSON.stringify(searchData), { expires: 30 }); // 30 days
      setLastSearch(searchData);
    }
  }, [searchQuery, location]);

  const stats = [
    { icon: Briefcase, label: 'Active Jobs', value: '10,000+' },
    { icon: Users, label: 'Job Seekers', value: '50,000+' },
    { icon: Building, label: 'Companies', value: '2,500+' },
    { icon: Star, label: 'Success Rate', value: '95%' }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section 
        className="relative py-32 md:py-40 overflow-hidden"
        style={{
          background: `
            linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.2) 100%),
            url('${heroImage.src}'),
            linear-gradient(135deg, var(--background-panel) 0%, var(--background-deep) 50%, var(--accent-subtle) 100%)
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '700px'
        }}
      >
        
        {/* Enhanced Background Pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, var(--accent-interactive) 1px, transparent 0)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <User className="h-6 w-6" style={{ color: 'var(--accent-interactive)' }} />
                  <span className="text-lg font-medium px-4 py-2 rounded-full" style={{ 
                    color: 'var(--accent-interactive)',
                    background: 'rgba(var(--accent-interactive-rgb), 0.1)',
                    border: '1px solid rgba(var(--accent-interactive-rgb), 0.2)'
                  }}>
                    Welcome back, {user?.name || 'User'}!
                  </span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight" style={{ 
                  color: 'var(--text-primary)', 
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' 
                }}>
                  Your Next{' '}
                  <span style={{ color: 'var(--accent-interactive)' }}>
                    Opportunity
                  </span>{' '}
                  Awaits
                </h1>
                <p className="text-xl md:text-2xl mb-16 max-w-4xl mx-auto leading-relaxed" style={{ 
                  color: 'var(--text-secondary)', 
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)' 
                }}>
                  We've curated personalized job recommendations just for you based on your profile and preferences.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight" style={{ 
                  color: 'var(--text-primary)', 
                  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)' 
                }}>
                  Find Your{' '}
                  <span style={{ color: 'var(--accent-interactive)' }}>
                    Dream Job
                  </span>
                </h1>
                <p className="text-xl md:text-2xl mb-16 max-w-4xl mx-auto leading-relaxed" style={{ 
                  color: 'var(--text-secondary)', 
                  textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)' 
                }}>
                  Discover thousands of job opportunities from top companies.{' '}
                  <span className="font-semibold" style={{ color: 'var(--accent-interactive)' }}>
                    Your next career move is just a search away.
                  </span>
                </p>
              </>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative z-10">
            <SearchBar size="large" glassEffect={true} />
          </div>

          {/* Last Search Section */}
          {lastSearch && !searchQuery && !location && (
            <div className="mt-8 text-center relative z-10">
              <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-lg" style={{
                backgroundColor: 'rgba(var(--background-panel-rgb), 0.8)',
                border: '1px solid rgba(var(--accent-interactive-rgb), 0.2)',
                backdropFilter: 'blur(8px)'
              }}>
                <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent-interactive)' }} />
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Your last search:{' '}
                  <span className="font-bold" style={{ color: 'var(--accent-interactive)' }}>
                    "{lastSearch.query}"
                  </span>
                  {lastSearch.location && (
                    <span>
                      {' '}in{' '}
                      <span className="font-bold" style={{ color: 'var(--accent-interactive)' }}>
                        {lastSearch.location}
                      </span>
                    </span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Subtle Floating Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 rounded-full flex items-center justify-center float-gentle" style={{
          backgroundColor: 'rgba(var(--accent-interactive-rgb), 0.1)',
          border: '1px solid rgba(var(--accent-interactive-rgb), 0.2)'
        }}>
          <Briefcase className="h-6 w-6" style={{ color: 'var(--accent-interactive)', opacity: 0.7 }} />
        </div>
        
        <div className="absolute top-40 right-20 w-20 h-20 rounded-full flex items-center justify-center float-reverse" style={{
          backgroundColor: 'rgba(var(--accent-interactive-rgb), 0.08)',
          border: '1px solid rgba(var(--accent-interactive-rgb), 0.15)'
        }}>
          <Building className="h-8 w-8" style={{ color: 'var(--accent-interactive)', opacity: 0.6 }} />
        </div>
        
        <div className="absolute bottom-20 left-1/4 w-14 h-14 rounded-full flex items-center justify-center float-gentle" style={{
          backgroundColor: 'rgba(var(--accent-interactive-rgb), 0.1)',
          border: '1px solid rgba(var(--accent-interactive-rgb), 0.2)'
        }}>
          <Users className="h-5 w-5" style={{ color: 'var(--accent-interactive)', opacity: 0.7 }} />
        </div>
        
        <div className="absolute top-1/2 right-10 w-12 h-12 rounded-full flex items-center justify-center float-reverse" style={{
          backgroundColor: 'rgba(var(--accent-interactive-rgb), 0.08)',
          border: '1px solid rgba(var(--accent-interactive-rgb), 0.15)'
        }}>
          <Star className="h-4 w-4" style={{ color: 'var(--accent-interactive)', opacity: 0.6 }} />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Platform Statistics
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full" style={{ backgroundColor: 'var(--accent-interactive)' }}></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center p-6 rounded-lg hover-lift" style={{
                  backgroundColor: 'var(--background-panel)',
                  border: '1px solid rgba(var(--accent-interactive-rgb), 0.1)',
                  transition: 'all 0.3s ease'
                }}>
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl mb-6" style={{
                    backgroundColor: 'rgba(var(--accent-interactive-rgb), 0.1)'
                  }}>
                    <IconComponent className="h-8 w-8" style={{ color: 'var(--accent-interactive)' }} />
                  </div>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent-interactive)' }}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Personalized Jobs Section - Only for authenticated users */}
      {isAuthenticated && (
        <section className="py-24" style={{ backgroundColor: 'var(--background-panel)' }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Heart className="h-6 w-6" style={{ color: 'var(--accent-interactive)' }} />
                <h2 className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Recommended For You
                </h2>
              </div>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Jobs tailored to your skills and preferences
              </p>
            </div>

            {personalizedLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="rounded-lg p-6 animate-pulse" style={{ backgroundColor: 'var(--background-deep)' }}>
                    <div className="h-4 rounded mb-3" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
                    <div className="h-3 rounded mb-2 w-3/4" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
                    <div className="h-3 rounded mb-4 w-1/2" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
                    <div className="space-y-2">
                      <div className="h-2 rounded w-full" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
                      <div className="h-2 rounded w-5/6" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : personalizedJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalizedJobs.map((job, index) => (
                  <div key={job.id} className="relative">
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {job.relevanceScore > 0 ? `${job.relevanceScore} matches` : 'Recommended'}
                      </div>
                    </div>
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-lg" style={{ backgroundColor: 'var(--background-deep)' }}>
                <Heart className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                  Complete Your Profile
                </h3>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                  Add your skills and preferences to get personalized job recommendations.
                </p>
                <a
                  href="/profile"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
                >
                  Complete Profile
                </a>
              </div>
            )}

            <div className="text-center mt-12">
                <a
                  href="/jobs"
                  className="inline-flex items-center px-8 py-3 font-semibold rounded-lg transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ 
                    backgroundColor: 'var(--accent-interactive)', 
                    color: 'var(--background-deep)'
                  }}
                >
                  View All Jobs
                </a>
            </div>
          </div>
        </section>
      )}

      {/* Featured Jobs Section */}
      <section className={`py-24 ${isAuthenticated ? '' : 'bg-var(--background-panel)'}`} style={{ backgroundColor: isAuthenticated ? 'var(--background-deep)' : 'var(--background-panel)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {isAuthenticated ? 'More Opportunities' : 'Featured Jobs'}
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              {isAuthenticated ? 'Explore additional job opportunities' : 'Handpicked opportunities from leading companies'}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="rounded-lg p-6 animate-pulse" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <div className="h-4 rounded mb-3" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
                  <div className="h-3 rounded mb-2 w-3/4" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
                  <div className="h-3 rounded mb-4 w-1/2" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
                  <div className="space-y-2">
                    <div className="h-2 rounded w-full" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
                    <div className="h-2 rounded w-5/6" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
              <a
                href="/jobs"
                className="inline-flex items-center px-8 py-3 font-semibold rounded-lg transition-all hover:opacity-90 hover:shadow-lg"
                style={{ 
                  backgroundColor: 'var(--accent-interactive)', 
                  color: 'var(--background-deep)'
                }}
              >
                View All Jobs
              </a>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              How It Works
            </h2>
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Get hired in 3 simple steps
            </p>
            <div className="w-24 h-1 mx-auto mt-4 rounded-full" style={{ backgroundColor: 'var(--accent-interactive)' }}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center p-6 rounded-lg" style={{
              backgroundColor: 'var(--background-panel)',
              border: '1px solid rgba(var(--accent-interactive-rgb), 0.1)'
            }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{
                backgroundColor: 'rgba(var(--accent-interactive-rgb), 0.1)',
                border: '2px solid var(--accent-interactive)'
              }}>
                <span className="text-2xl font-bold" style={{ color: 'var(--accent-interactive)' }}>1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Create Your Profile
              </h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Build a comprehensive profile showcasing your skills, experience, and career goals.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg" style={{
              backgroundColor: 'var(--background-panel)',
              border: '1px solid rgba(var(--accent-interactive-rgb), 0.1)'
            }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{
                backgroundColor: 'rgba(var(--accent-interactive-rgb), 0.1)',
                border: '2px solid var(--accent-interactive)'
              }}>
                <span className="text-2xl font-bold" style={{ color: 'var(--accent-interactive)' }}>2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Search & Apply
              </h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Browse thousands of jobs, filter by your preferences, and apply with one click.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-lg" style={{
              backgroundColor: 'var(--background-panel)',
              border: '1px solid rgba(var(--accent-interactive-rgb), 0.1)'
            }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{
                backgroundColor: 'rgba(var(--accent-interactive-rgb), 0.1)',
                border: '2px solid var(--accent-interactive)'
              }}>
                <span className="text-2xl font-bold" style={{ color: 'var(--accent-interactive)' }}>3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Get Hired
              </h3>
              <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Connect with recruiters, ace your interviews, and land your dream job.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{ backgroundColor: 'var(--accent-interactive)' }}>
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--background-deep)' }}>
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl mb-8" style={{ color: 'var(--background-panel)' }}>
            Join thousands of professionals who found their perfect job through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="px-8 py-3 font-medium rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--background-deep)', color: 'var(--accent-interactive)' }}
            >
              Sign Up Now
            </a>
            <a
              href="/jobs"
              className="px-8 py-3 border-2 font-medium rounded-lg transition-all hover:opacity-90"
              style={{ borderColor: 'var(--background-deep)', color: 'var(--background-deep)', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'var(--background-deep)';
                e.target.style.color = 'var(--accent-interactive)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'var(--background-deep)';
              }}
            >
              Browse Jobs
            </a>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
