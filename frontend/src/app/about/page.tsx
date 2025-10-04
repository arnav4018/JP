'use client';

import MainLayout from '@/components/layout/MainLayout';
import { 
  Target, 
  Users, 
  Award, 
  Globe, 
  Heart, 
  Shield, 
  Zap, 
  CheckCircle,
  TrendingUp,
  Briefcase,
  Star
} from 'lucide-react';

const stats = [
  { number: '10,000+', label: 'Active Job Seekers', icon: Users },
  { number: '2,500+', label: 'Partner Companies', icon: Briefcase },
  { number: '15,000+', label: 'Jobs Posted', icon: TrendingUp },
  { number: '95%', label: 'Success Rate', icon: CheckCircle }
];

const values = [
  {
    icon: Heart,
    title: 'People First',
    description: 'We believe that great companies are built by great people. Our platform puts human connections at the center of every job match.'
  },
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'We maintain the highest standards of integrity in our platform, ensuring transparent communication between all parties.'
  },
  {
    icon: Zap,
    title: 'Innovation',
    description: 'We continuously evolve our technology and processes to provide the most efficient and effective job matching experience.'
  },
  {
    icon: Globe,
    title: 'Global Impact',
    description: 'Our goal is to connect talent worldwide, breaking down barriers and creating opportunities across all industries and locations.'
  }
];

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'Chief Executive Officer',
    bio: 'Former VP at LinkedIn with 15+ years in talent acquisition and HR technology.',
    image: '/api/placeholder/150/150'
  },
  {
    name: 'Michael Chen',
    role: 'Chief Technology Officer',
    bio: 'Ex-Google engineer specializing in AI and machine learning applications for recruitment.',
    image: '/api/placeholder/150/150'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Product',
    bio: 'Product leader with experience at Uber and Airbnb, focused on user experience design.',
    image: '/api/placeholder/150/150'
  },
  {
    name: 'David Thompson',
    role: 'VP of Business Development',
    bio: 'Former McKinsey consultant with expertise in partnership strategy and market expansion.',
    image: '/api/placeholder/150/150'
  }
];

const milestones = [
  {
    year: '2020',
    title: 'Company Founded',
    description: 'Started with a vision to revolutionize job matching using AI technology.'
  },
  {
    year: '2021',
    title: 'Series A Funding',
    description: 'Raised $5M to expand our team and enhance platform capabilities.'
  },
  {
    year: '2022',
    title: '1,000+ Companies',
    description: 'Reached milestone of 1,000+ companies actively using our platform.'
  },
  {
    year: '2023',
    title: 'Global Expansion',
    description: 'Expanded operations to serve companies and job seekers worldwide.'
  },
  {
    year: '2024',
    title: 'AI-Powered Matching',
    description: 'Launched advanced AI algorithms for more accurate job recommendations.'
  }
];

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background-deep)' }}>
        {/* Hero Section */}
        <div className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Connecting Talent with Opportunity
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              We're on a mission to transform the way people find jobs and companies discover talent through 
              innovative technology and human-centered design.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                    <stat.icon className="h-8 w-8" style={{ color: 'var(--accent-interactive)' }} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {stat.number}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-interactive)' }}>
                    <Target className="h-6 w-6" style={{ color: 'var(--background-deep)' }} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Our Mission
                  </h2>
                </div>
                <p className="text-lg mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  At JobPortal, we believe that finding the right job shouldn't be a matter of luck. 
                  Our advanced AI-powered platform analyzes skills, experience, and career goals to 
                  create perfect matches between candidates and employers.
                </p>
                <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  We're committed to making the job search process more efficient, transparent, 
                  and successful for everyone involved.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="h-32 rounded-lg" style={{ backgroundColor: 'var(--accent-subtle)' }}></div>
                  <div className="h-24 rounded-lg" style={{ backgroundColor: 'var(--background-panel)', border: '2px solid var(--accent-subtle)' }}></div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="h-24 rounded-lg" style={{ backgroundColor: 'var(--background-panel)', border: '2px solid var(--accent-subtle)' }}></div>
                  <div className="h-32 rounded-lg" style={{ backgroundColor: 'var(--accent-interactive)', opacity: 0.1 }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-20 px-6" style={{ backgroundColor: 'var(--background-panel)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Our Core Values
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                These principles guide everything we do and shape the culture we're building
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                    <value.icon className="h-8 w-8" style={{ color: 'var(--accent-interactive)' }} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Meet Our Team
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Passionate professionals dedicated to revolutionizing the job search experience
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-center p-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-2" style={{ backgroundColor: 'var(--background-panel)', border: '1px solid var(--accent-subtle)' }}>
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-subtle)' }}>
                    <Users className="h-12 w-12" style={{ color: 'var(--accent-interactive)' }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--accent-interactive)' }}>
                    {member.role}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="py-20 px-6" style={{ backgroundColor: 'var(--background-panel)' }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Our Journey
              </h2>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                Key milestones in our mission to transform job searching
              </p>
            </div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-interactive)' }}>
                      <span className="text-sm font-bold" style={{ color: 'var(--background-deep)' }}>
                        {milestone.year}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      {milestone.title}
                    </h3>
                    <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Ready to Find Your Next Opportunity?
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of professionals who have found their dream jobs through our platform
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:opacity-90 hover:shadow-lg"
                style={{ 
                  backgroundColor: 'var(--accent-interactive)', 
                  color: 'var(--background-deep)' 
                }}
              >
                Get Started Today
              </button>
              <button 
                className="px-8 py-3 rounded-lg font-semibold border transition-all duration-300 hover:opacity-80"
                style={{ 
                  borderColor: 'var(--accent-interactive)', 
                  color: 'var(--accent-interactive)' 
                }}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}