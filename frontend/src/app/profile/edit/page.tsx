'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/store/useAuthStore';
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Save, X, Plus, Trash2, Building, Globe, Users, Award } from 'lucide-react';
import apiClient from '@/services/httpClient';

interface Experience {
  id?: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id?: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function ProfileEditPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [title, setTitle] = useState('');
  const [website, setWebsite] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  
  // Recruiter specific fields
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companySize, setCompanySize] = useState('');
  
  // Experience and Education
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent('/profile/edit'));
      return;
    }
    
    // Pre-fill form with existing user data
    if (user) {
      setFirstName(user.firstName || user.first_name || '');
      setLastName(user.lastName || user.last_name || '');
      setPhone(user.phone || user.profile?.phone || '');
      setLocation(user.location || user.profile?.location || '');
      setBio(user.bio || user.profile?.bio || '');
      setTitle(user.title || user.profile?.title || '');
      setWebsite(user.website || user.profile?.website || '');
      setSkills(user.skills || user.profile?.skills || []);
      
      if (user.role === 'recruiter') {
        setCompanyName(user.companyName || user.company_name || '');
        setCompanyWebsite(user.companyWebsite || user.company_website || '');
        setCompanySize(user.companySize || user.company_size || '');
      }
    }
  }, [isAuthenticated, authLoading, router, user]);

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const profileData = {
        firstName,
        lastName,
        phone,
        location,
        bio,
        title,
        website,
        skills,
        ...(user?.role === 'recruiter' && {
          companyName,
          companyWebsite,
          companySize
        })
      };

      const result = await updateProfile(profileData);
      
      if (result.success) {
        router.push('/profile');
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addExperience = () => {
    setExperiences([...experiences, {
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
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
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--background-deep)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Edit Profile
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Update your information to help {user?.role === 'recruiter' ? 'candidates find you' : 'employers find you'}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/profile')}
                  className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ borderColor: 'var(--accent-subtle)', color: 'var(--text-secondary)', backgroundColor: 'var(--background-panel)' }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium text-white hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent-interactive)', borderColor: 'var(--accent-interactive)' }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-6">
              
              {/* Personal Information */}
              <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  <User className="h-5 w-5 inline mr-2" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        First Name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-offset-2"
                        style={{ 
                          borderColor: 'var(--accent-subtle)', 
                          backgroundColor: 'var(--background-deep)',
                          color: 'var(--text-primary)'
                        }}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-offset-2"
                        style={{ 
                          borderColor: 'var(--accent-subtle)', 
                          backgroundColor: 'var(--background-deep)',
                          color: 'var(--text-primary)',
                          
                        }}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Professional Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-offset-2"
                      style={{ 
                        borderColor: 'var(--accent-subtle)', 
                        backgroundColor: 'var(--background-deep)',
                        color: 'var(--text-primary)',
                        
                      }}
                      placeholder={user?.role === 'recruiter' ? "e.g. Senior Hiring Manager" : "e.g. Software Engineer"}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-offset-2"
                      style={{ 
                        borderColor: 'var(--accent-subtle)', 
                        backgroundColor: 'var(--background-deep)',
                        color: 'var(--text-primary)',
                        
                      }}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-offset-2"
                      style={{ 
                        borderColor: 'var(--accent-subtle)', 
                        backgroundColor: 'var(--background-deep)',
                        color: 'var(--text-primary)',
                        
                      }}
                      placeholder="City, State, Country"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Website / Portfolio
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-offset-2"
                      style={{ 
                        borderColor: 'var(--accent-subtle)', 
                        backgroundColor: 'var(--background-deep)',
                        color: 'var(--text-primary)',
                        
                      }}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
              </div>

              {/* Company Information (Recruiters only) */}
              {user?.role === 'recruiter' && (
                <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                    <Building className="h-5 w-5 inline mr-2" />
                    Company Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-offset-2"
                        style={{ 
                          borderColor: 'var(--accent-subtle)', 
                          backgroundColor: 'var(--background-deep)',
                          color: 'var(--text-primary)',
                          
                        }}
                        placeholder="Enter your company name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Company Website
                      </label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-offset-2"
                        style={{ 
                          borderColor: 'var(--accent-subtle)', 
                          backgroundColor: 'var(--background-deep)',
                          color: 'var(--text-primary)',
                          
                        }}
                        placeholder="https://company.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        Company Size
                      </label>
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-offset-2"
                        style={{ 
                          borderColor: 'var(--accent-subtle)', 
                          backgroundColor: 'var(--background-deep)',
                          color: 'var(--text-primary)',
                          
                        }}
                      >
                        <option value="">Select company size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501-1000">501-1,000 employees</option>
                        <option value="1000+">1,000+ employees</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills */}
              <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  <Award className="h-5 w-5 inline mr-2" />
                  Skills
                </h3>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-offset-2"
                      style={{ 
                        borderColor: 'var(--accent-subtle)', 
                        backgroundColor: 'var(--background-deep)',
                        color: 'var(--text-primary)',
                        
                      }}
                      placeholder="Add a skill"
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 text-white rounded-md hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: 'var(--accent-interactive)' }}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 text-sm rounded-full"
                        style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-interactive)' }}
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:opacity-70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* Bio */}
              <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  About You
                </h3>
                <div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-offset-2"
                    style={{ 
                      borderColor: 'var(--accent-subtle)', 
                      backgroundColor: 'var(--background-deep)',
                      color: 'var(--text-primary)',
                      
                    }}
                    placeholder={user?.role === 'recruiter' 
                      ? "Tell candidates about your company culture, what you're looking for, and why they should work with you..."
                      : "Tell employers about your experience, goals, and what makes you a great candidate..."
                    }
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    {bio.length}/500 characters
                  </p>
                </div>
              </div>

              {/* Experience Section (for candidates) */}
              {user?.role === 'candidate' && (
                <div className="rounded-lg shadow-md p-6" style={{ backgroundColor: 'var(--background-panel)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                      <Briefcase className="h-5 w-5 inline mr-2" />
                      Experience
                    </h3>
                    <button
                      onClick={addExperience}
                      className="inline-flex items-center px-3 py-2 text-sm text-white rounded-md hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: 'var(--accent-interactive)' }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Experience
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {experiences.length === 0 ? (
                      <p className="text-sm text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                        No experience added yet. Click "Add Experience" to get started.
                      </p>
                    ) : (
                      experiences.map((exp, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3" style={{ borderColor: 'var(--accent-subtle)' }}>
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                              Experience {index + 1}
                            </h4>
                            <button
                              onClick={() => removeExperience(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Job Title"
                              value={exp.title}
                              onChange={(e) => updateExperience(index, 'title', e.target.value)}
                              className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-offset-2"
                              style={{ 
                                borderColor: 'var(--accent-subtle)', 
                                backgroundColor: 'var(--background-deep)',
                                color: 'var(--text-primary)',
                                
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Company"
                              value={exp.company}
                              onChange={(e) => updateExperience(index, 'company', e.target.value)}
                              className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-offset-2"
                              style={{ 
                                borderColor: 'var(--accent-subtle)', 
                                backgroundColor: 'var(--background-deep)',
                                color: 'var(--text-primary)',
                                
                              }}
                            />
                          </div>
                          
                          <textarea
                            placeholder="Job description..."
                            rows={3}
                            value={exp.description}
                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-offset-2"
                            style={{ 
                              borderColor: 'var(--accent-subtle)', 
                              backgroundColor: 'var(--background-deep)',
                              color: 'var(--text-primary)',
                              
                            }}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
