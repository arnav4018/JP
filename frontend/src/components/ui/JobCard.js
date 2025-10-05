'use client';

import Link from 'next/link';
import { memo } from 'react';
import { MapPin, Clock, Briefcase, DollarSign, Building } from 'lucide-react';

function JobCard({ job }) {
  // Transform backend data to match frontend expectations
  const transformedJob = {
    id: job.id || job._id || Math.random().toString(36).substr(2, 9), // Fallback ID if none exists
    title: job.title,
    description: job.description,
    company: job.company_name || job.company || null,
    location: job.location,
    salary: job.salary_min && job.salary_max 
      ? `₹${Math.round(job.salary_min / 100000)}L - ₹${Math.round(job.salary_max / 100000)}L`
      : job.salary,
    category: job.experience_level || job.category,
    type: job.type || 'Full-time', // Default to Full-time if not specified
    postedDate: job.created_at || job.postedDate,
    requirements: Array.isArray(job.requirements) ? job.requirements : 
      (typeof job.requirements === 'string' ? job.requirements.split(',').map(s => s.trim()).filter(Boolean) : []),
    benefits: Array.isArray(job.benefits) ? job.benefits : 
      (typeof job.benefits === 'string' ? job.benefits.split(',').map(s => s.trim()).filter(Boolean) : [])
  };

  const formatPostedDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getJobTypeColor = (type) => {
    // Using inline styles for consistent theming
    const colors = {
      'Full-time': { backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' },
      'Part-time': { backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' },
      'Contract': { backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' },
      'Freelance': { backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' },
      'Internship': { backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }
    };
    return colors[type] || { backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' };
  };

  return (
    <div className="rounded-lg shadow-md border p-6 hover:shadow-lg transition-shadow duration-200" style={{ backgroundColor: 'var(--background-panel)', borderColor: 'var(--accent-subtle)' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link href={`/jobs/${transformedJob.id}`} className="block group">
            <h3 className="text-xl font-semibold transition-colors mb-1" style={{ color: 'var(--text-primary)' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}>
              {transformedJob.title}
            </h3>
          </Link>
          <div className="flex items-center space-x-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
            <Building className="h-4 w-4" />
            {transformedJob.company ? (
              <Link 
                href={`/companies/${transformedJob.company.toLowerCase().replace(/\s+/g, '-')}`}
                className="transition-colors font-medium"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => e.target.style.color = 'var(--accent-interactive)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                {transformedJob.company}
              </Link>
            ) : (
              <span className="font-medium">
                Company Name Not Available
              </span>
            )}
          </div>
        </div>
        
        {/* Job Type Badge */}
        <span className="px-3 py-1 rounded-full text-xs font-medium" style={getJobTypeColor(transformedJob.type)}>
          {transformedJob.type}
        </span>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <MapPin className="h-4 w-4" />
          <span>{transformedJob.location}</span>
        </div>
        
        {transformedJob.salary && (
          <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <DollarSign className="h-4 w-4" />
            <span>{transformedJob.salary}</span>
          </div>
        )}
        
        <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Briefcase className="h-4 w-4" />
          <span>{transformedJob.category}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          <Clock className="h-4 w-4" />
          <span>{formatPostedDate(transformedJob.postedDate)}</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
        {transformedJob.description}
      </p>

      {/* Skills/Requirements */}
      {Array.isArray(transformedJob.requirements) && transformedJob.requirements.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {transformedJob.requirements.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 rounded text-xs"
                style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}
              >
                {skill}
              </span>
            ))}
            {transformedJob.requirements.length > 4 && (
              <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--text-secondary)' }}>
                +{transformedJob.requirements.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Benefits Preview */}
      {Array.isArray(transformedJob.benefits) && transformedJob.benefits.length > 0 && (
        <div className="mb-4">
          <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Benefits:</p>
          <div className="flex flex-wrap gap-1">
            {transformedJob.benefits.slice(0, 3).map((benefit, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 rounded"
                style={{ color: 'var(--accent-interactive)', backgroundColor: 'var(--accent-subtle)' }}
              >
                {benefit}
              </span>
            ))}
            {transformedJob.benefits.length > 3 && (
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                +{transformedJob.benefits.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--accent-subtle)' }}>
        <Link
          href={`/jobs/${transformedJob.id}`}
          className="text-sm font-medium transition-colors"
          style={{ color: 'var(--accent-interactive)' }}
          onMouseEnter={(e) => e.target.style.opacity = '0.8'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          View Details
        </Link>
        
        <div className="flex space-x-2">
          <button className="px-4 py-2 border rounded-lg text-sm font-medium transition-opacity hover:opacity-80" style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)', backgroundColor: 'var(--background-deep)' }}>
            Save
          </button>
          <Link
            href={`/jobs/${transformedJob.id}`}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
          >
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default memo(JobCard);
