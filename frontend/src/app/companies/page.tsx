'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Search, MapPin, Users, ExternalLink, Star, Building, Filter } from 'lucide-react';

// Mock companies data - in real app this would come from your API
const mockCompanies = [
  {
    id: 1,
    name: 'TechCorp Solutions',
    logo: '/api/placeholder/100/100',
    industry: 'Technology',
    size: '1000-5000 employees',
    location: 'San Francisco, CA',
    description: 'Leading technology solutions provider specializing in cloud computing and AI.',
    rating: 4.5,
    openJobs: 12,
    website: 'https://techcorp.com',
    founded: 2010,
    benefits: ['Health Insurance', 'Remote Work', '401k', 'Flexible Hours']
  },
  {
    id: 2,
    name: 'DataFlow Analytics',
    logo: '/api/placeholder/100/100',
    industry: 'Data & Analytics',
    size: '200-500 employees',
    location: 'New York, NY',
    description: 'Data analytics company helping businesses make data-driven decisions.',
    rating: 4.3,
    openJobs: 8,
    website: 'https://dataflow.com',
    founded: 2015,
    benefits: ['Health Insurance', 'Stock Options', 'Learning Budget', 'Gym Membership']
  },
  {
    id: 3,
    name: 'Green Energy Corp',
    logo: '/api/placeholder/100/100',
    industry: 'Renewable Energy',
    size: '500-1000 employees',
    location: 'Austin, TX',
    description: 'Pioneer in renewable energy solutions and sustainable technology.',
    rating: 4.7,
    openJobs: 15,
    website: 'https://greenenergy.com',
    founded: 2012,
    benefits: ['Health Insurance', 'Remote Work', 'Unlimited PTO', 'Environmental Impact']
  },
  {
    id: 4,
    name: 'FinanceHub',
    logo: '/api/placeholder/100/100',
    industry: 'Financial Services',
    size: '100-200 employees',
    location: 'Boston, MA',
    description: 'Modern financial services platform revolutionizing personal finance.',
    rating: 4.2,
    openJobs: 6,
    website: 'https://financehub.com',
    founded: 2018,
    benefits: ['Health Insurance', 'Stock Options', 'Professional Development', 'Flexible Hours']
  },
  {
    id: 5,
    name: 'HealthTech Innovations',
    logo: '/api/placeholder/100/100',
    industry: 'Healthcare Technology',
    size: '50-100 employees',
    location: 'Seattle, WA',
    description: 'Innovative healthcare technology solutions improving patient care.',
    rating: 4.6,
    openJobs: 9,
    website: 'https://healthtech.com',
    founded: 2020,
    benefits: ['Health Insurance', 'Remote Work', 'Stock Options', 'Medical Benefits']
  },
  {
    id: 6,
    name: 'EduLearn Platform',
    logo: '/api/placeholder/100/100',
    industry: 'Education Technology',
    size: '200-500 employees',
    location: 'Chicago, IL',
    description: 'Online learning platform connecting students with quality education.',
    rating: 4.4,
    openJobs: 11,
    website: 'https://edulearn.com',
    founded: 2016,
    benefits: ['Health Insurance', 'Learning Budget', 'Flexible Hours', 'Remote Work']
  }
];

const industries = [
  'All Industries',
  'Technology',
  'Data & Analytics',
  'Renewable Energy',
  'Financial Services',
  'Healthcare Technology',
  'Education Technology'
];

const companySizes = [
  'All Sizes',
  '1-50 employees',
  '50-100 employees',
  '100-200 employees',
  '200-500 employees',
  '500-1000 employees',
  '1000-5000 employees',
  '5000+ employees'
];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState(mockCompanies);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedSize, setSelectedSize] = useState('All Sizes');
  const [sortBy, setSortBy] = useState('name');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter and search companies
  useEffect(() => {
    let filtered = mockCompanies;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply industry filter
    if (selectedIndustry !== 'All Industries') {
      filtered = filtered.filter(company => company.industry === selectedIndustry);
    }

    // Apply size filter
    if (selectedSize !== 'All Sizes') {
      filtered = filtered.filter(company => company.size === selectedSize);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return b.rating - a.rating;
        case 'jobs':
          return b.openJobs - a.openJobs;
        case 'founded':
          return b.founded - a.founded;
        default:
          return 0;
      }
    });

    setCompanies(filtered);
  }, [searchTerm, selectedIndustry, selectedSize, sortBy]);

  const CompanyCard = ({ company }: { company: any }) => (
    <div 
      className="p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      style={{ 
        backgroundColor: 'var(--background-panel)', 
        borderColor: 'var(--accent-subtle)',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="flex items-start space-x-4">
        {/* Company Logo */}
        <div 
          className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'var(--accent-subtle)' }}
        >
          <Building className="h-8 w-8" style={{ color: 'var(--accent-interactive)' }} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Company Name and Rating */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {company.name}
            </h3>
            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
              <Star className="h-4 w-4 fill-current" style={{ color: '#f59e0b' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                {company.rating}
              </span>
            </div>
          </div>

          {/* Company Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center space-x-1">
              <Building className="h-4 w-4" />
              <span>{company.industry}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{company.size}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{company.location}</span>
            </div>
          </div>

          {/* Company Description */}
          <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {company.description}
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap gap-2 mb-4">
            {company.benefits.slice(0, 3).map((benefit: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full"
                style={{ 
                  backgroundColor: 'var(--accent-subtle)', 
                  color: 'var(--text-secondary)' 
                }}
              >
                {benefit}
              </span>
            ))}
            {company.benefits.length > 3 && (
              <span
                className="px-2 py-1 text-xs rounded-full"
                style={{ 
                  backgroundColor: 'var(--accent-subtle)', 
                  color: 'var(--text-secondary)' 
                }}
              >
                +{company.benefits.length - 3} more
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium" style={{ color: 'var(--accent-interactive)' }}>
                {company.openJobs} open positions
              </span>
              <span>Founded {company.founded}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1.5 text-sm rounded-lg border transition-colors hover:opacity-80"
                style={{ 
                  borderColor: 'var(--accent-interactive)', 
                  color: 'var(--accent-interactive)' 
                }}
              >
                View Jobs
              </button>
              <button
                className="p-1.5 rounded-lg transition-colors hover:opacity-80"
                style={{ color: 'var(--text-secondary)' }}
                title="Visit Website"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--background-deep)' }}>
        {/* Hero Section */}
        <div className="py-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              Discover Amazing Companies
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: 'var(--text-secondary)' }}>
              Explore top companies, learn about their culture, benefits, and find your next career opportunity
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
            {/* Search Bar */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <input
                type="text"
                placeholder="Search companies by name, industry, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  borderColor: 'var(--accent-subtle)', 
                  backgroundColor: 'var(--background-panel)', 
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Industry:
                </label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'var(--accent-subtle)', 
                    backgroundColor: 'var(--background-panel)', 
                    color: 'var(--text-primary)' 
                  }}
                >
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Size:
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'var(--accent-subtle)', 
                    backgroundColor: 'var(--background-panel)', 
                    color: 'var(--text-primary)' 
                  }}
                >
                  {companySizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: 'var(--accent-subtle)', 
                    backgroundColor: 'var(--background-panel)', 
                    color: 'var(--text-primary)' 
                  }}
                >
                  <option value="name">Company Name</option>
                  <option value="rating">Rating</option>
                  <option value="jobs">Open Jobs</option>
                  <option value="founded">Founded Year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Showing {companies.length} companies
          </p>
        </div>

        {/* Companies Grid */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          {companies.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {companies.map(company => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
              <h3 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                No companies found
              </h3>
              <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
                Try adjusting your search criteria or filters to find more companies.
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}