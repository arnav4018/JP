// Mock API service for job portal development
// This simulates backend API responses while the backend is being developed

export const mockJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'Tech Corp',
    location: 'Remote',
    type: 'Full-time',
    salary: '$70,000 - $90,000',
    postedDate: '2024-12-15',
    description: 'We are looking for a skilled Frontend Developer to join our dynamic team...',
    requirements: ['React', 'JavaScript', 'HTML/CSS', 'Git'],
    benefits: ['Health Insurance', 'Remote Work', '401k'],
    category: 'Technology'
  },
  {
    id: 2,
    title: 'UX Designer',
    company: 'DesignHub',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$65,000 - $85,000',
    postedDate: '2024-12-14',
    description: 'Join our creative team as a UX Designer and help shape amazing user experiences...',
    requirements: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping'],
    benefits: ['Health Insurance', 'Dental', 'Creative Environment'],
    category: 'Design'
  },
  {
    id: 3,
    title: 'Backend Developer',
    company: 'DataSystems Inc',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$80,000 - $100,000',
    postedDate: '2024-12-13',
    description: 'We need a Backend Developer to build scalable server-side applications...',
    requirements: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
    benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours'],
    category: 'Technology'
  },
  {
    id: 4,
    title: 'Marketing Specialist',
    company: 'GrowthCo',
    location: 'Chicago, IL',
    type: 'Contract',
    salary: '$50,000 - $65,000',
    postedDate: '2024-12-12',
    description: 'Looking for a Marketing Specialist to drive our digital marketing campaigns...',
    requirements: ['Digital Marketing', 'Social Media', 'Analytics', 'Content Creation'],
    benefits: ['Flexible Schedule', 'Professional Development'],
    category: 'Marketing'
  },
  {
    id: 5,
    title: 'Data Analyst',
    company: 'Analytics Pro',
    location: 'Remote',
    type: 'Part-time',
    salary: '$45,000 - $60,000',
    postedDate: '2024-12-11',
    description: 'Join our data team to analyze and interpret complex datasets...',
    requirements: ['SQL', 'Python', 'Tableau', 'Excel'],
    benefits: ['Remote Work', 'Flexible Hours', 'Learning Budget'],
    category: 'Data Science'
  }
];

export const mockCompanies = [
  {
    id: 1,
    name: 'Tech Corp',
    industry: 'Technology',
    size: '100-500 employees',
    location: 'San Francisco, CA',
    website: 'https://techcorp.com',
    description: 'Leading technology company focused on innovative solutions.'
  },
  {
    id: 2,
    name: 'DesignHub',
    industry: 'Design',
    size: '50-100 employees',
    location: 'New York, NY',
    website: 'https://designhub.com',
    description: 'Creative agency specializing in user experience and digital design.'
  },
  {
    id: 3,
    name: 'DataSystems Inc',
    industry: 'Technology',
    size: '200-1000 employees',
    location: 'San Francisco, CA',
    website: 'https://datasystems.com',
    description: 'Enterprise data solutions and analytics platform provider.'
  }
];

// Simulate API delay for realistic development experience
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const fetchJobs = async (filters = {}) => {
  await delay(500); // Simulate network delay
  
  let filteredJobs = [...mockJobs];
  
  // Apply filters
  if (filters.location) {
    filteredJobs = filteredJobs.filter(job => 
      job.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }
  
  if (filters.type) {
    filteredJobs = filteredJobs.filter(job => job.type === filters.type);
  }
  
  if (filters.category) {
    filteredJobs = filteredJobs.filter(job => job.category === filters.category);
  }
  
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredJobs = filteredJobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm) ||
      job.company.toLowerCase().includes(searchTerm) ||
      job.description.toLowerCase().includes(searchTerm)
    );
  }
  
  return {
    jobs: filteredJobs,
    total: filteredJobs.length,
    page: filters.page || 1,
    limit: filters.limit || 10
  };
};

export const fetchJobById = async (id) => {
  await delay(300);
  const job = mockJobs.find(job => job.id === parseInt(id));
  if (!job) {
    throw new Error('Job not found');
  }
  return job;
};

export const fetchCompanies = async () => {
  await delay(400);
  return mockCompanies;
};

export const fetchCompanyById = async (id) => {
  await delay(300);
  const company = mockCompanies.find(company => company.id === parseInt(id));
  if (!company) {
    throw new Error('Company not found');
  }
  return company;
};

export const submitJobApplication = async (jobId, applicationData) => {
  await delay(800); // Simulate form submission delay
  
  // Mock successful submission
  return {
    success: true,
    message: 'Application submitted successfully!',
    applicationId: `APP-${Date.now()}`,
    jobId,
    applicantEmail: applicationData.email
  };
};

export const searchJobs = async (query) => {
  await delay(400);
  const searchResults = mockJobs.filter(job =>
    job.title.toLowerCase().includes(query.toLowerCase()) ||
    job.company.toLowerCase().includes(query.toLowerCase()) ||
    job.description.toLowerCase().includes(query.toLowerCase())
  );
  
  return searchResults;
};

// Mock user data
export const mockUsers = [
  {
    id: 1,
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'candidate',
    profile: {
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      title: 'Frontend Developer',
      experience: '3 years',
      skills: ['React', 'JavaScript', 'HTML/CSS', 'Node.js'],
      bio: 'Passionate frontend developer with experience in modern web technologies.',
      resume: {
        filename: 'john_doe_resume.pdf',
        uploadedAt: '2024-12-10T10:30:00Z'
      }
    },
    preferences: {
      jobTypes: ['Full-time', 'Remote'],
      locations: ['San Francisco, CA', 'Remote'],
      categories: ['Technology', 'Design'],
      salaryMin: 70000,
      experienceLevel: 'Mid Level'
    },
    createdAt: '2024-11-15T08:00:00Z'
  }
];

// Mock applications data
export const mockApplications = [
  {
    id: 'APP-001',
    jobId: 1,
    userId: 1,
    status: 'applied',
    appliedAt: '2024-12-16T14:30:00Z',
    lastUpdated: '2024-12-16T14:30:00Z',
    statusHistory: [
      { status: 'applied', timestamp: '2024-12-16T14:30:00Z', note: 'Application submitted' }
    ]
  },
  {
    id: 'APP-002',
    jobId: 2,
    userId: 1,
    status: 'shortlisted',
    appliedAt: '2024-12-14T09:15:00Z',
    lastUpdated: '2024-12-17T10:00:00Z',
    statusHistory: [
      { status: 'applied', timestamp: '2024-12-14T09:15:00Z', note: 'Application submitted' },
      { status: 'shortlisted', timestamp: '2024-12-17T10:00:00Z', note: 'Moved to shortlist for interview' }
    ]
  },
  {
    id: 'APP-003',
    jobId: 3,
    userId: 1,
    status: 'rejected',
    appliedAt: '2024-12-12T16:45:00Z',
    lastUpdated: '2024-12-18T11:30:00Z',
    statusHistory: [
      { status: 'applied', timestamp: '2024-12-12T16:45:00Z', note: 'Application submitted' },
      { status: 'under_review', timestamp: '2024-12-15T14:20:00Z', note: 'Application under review' },
      { status: 'rejected', timestamp: '2024-12-18T11:30:00Z', note: 'Position filled with another candidate' }
    ]
  }
];

// Mock applicants data with skill matching
export const mockApplicants = [
  {
    id: 'APPLICANT-001',
    jobId: 1,
    userId: 1,
    applicationId: 'APP-001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    appliedAt: '2024-12-16T14:30:00Z',
    status: 'applied',
    skillMatch: 95,
    profile: {
      title: 'Senior Frontend Developer',
      location: 'San Francisco, CA',
      experience: '5 years',
      skills: ['React', 'JavaScript', 'TypeScript', 'HTML/CSS', 'Git', 'Node.js'],
      bio: 'Experienced frontend developer with expertise in React and modern web technologies.'
    },
    resume: {
      filename: 'john_smith_resume.pdf',
      uploadedAt: '2024-12-16T14:30:00Z'
    }
  },
  {
    id: 'APPLICANT-002',
    jobId: 1,
    userId: 2,
    applicationId: 'APP-004',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    appliedAt: '2024-12-15T10:20:00Z',
    status: 'shortlisted',
    skillMatch: 87,
    profile: {
      title: 'Frontend Developer',
      location: 'Remote',
      experience: '3 years',
      skills: ['React', 'JavaScript', 'HTML/CSS', 'Vue.js', 'SASS'],
      bio: 'Creative frontend developer with a passion for user experience and clean code.'
    },
    resume: {
      filename: 'sarah_johnson_resume.pdf',
      uploadedAt: '2024-12-15T10:20:00Z'
    }
  },
  {
    id: 'APPLICANT-003',
    jobId: 1,
    userId: 3,
    applicationId: 'APP-005',
    name: 'Mike Chen',
    email: 'mike.chen@example.com',
    appliedAt: '2024-12-17T09:45:00Z',
    status: 'applied',
    skillMatch: 78,
    profile: {
      title: 'Junior Frontend Developer',
      location: 'New York, NY',
      experience: '2 years',
      skills: ['JavaScript', 'HTML/CSS', 'Bootstrap', 'jQuery'],
      bio: 'Motivated junior developer looking to grow skills in modern frontend frameworks.'
    },
    resume: {
      filename: 'mike_chen_resume.pdf',
      uploadedAt: '2024-12-17T09:45:00Z'
    }
  },
  {
    id: 'APPLICANT-004',
    jobId: 2,
    userId: 4,
    applicationId: 'APP-006',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    appliedAt: '2024-12-14T16:15:00Z',
    status: 'interview_scheduled',
    skillMatch: 92,
    profile: {
      title: 'Senior UX Designer',
      location: 'New York, NY',
      experience: '6 years',
      skills: ['Figma', 'Adobe Creative Suite', 'User Research', 'Prototyping', 'Sketch', 'InVision'],
      bio: 'Senior UX designer with extensive experience in user-centered design and research.'
    },
    resume: {
      filename: 'emily_rodriguez_portfolio.pdf',
      uploadedAt: '2024-12-14T16:15:00Z'
    }
  }
];

// Mock saved searches
export const mockSavedSearches = [
  {
    id: 'SEARCH-001',
    userId: 1,
    name: 'Frontend Developer Remote',
    filters: {
      search: 'frontend developer',
      location: 'remote',
      type: 'Full-time',
      category: 'Technology'
    },
    alertEnabled: true,
    createdAt: '2024-12-10T12:00:00Z',
    lastNotified: '2024-12-19T08:00:00Z'
  },
  {
    id: 'SEARCH-002',
    userId: 1,
    name: 'UX Designer SF',
    filters: {
      search: 'UX designer',
      location: 'San Francisco',
      type: 'Full-time',
      category: 'Design'
    },
    alertEnabled: false,
    createdAt: '2024-12-05T10:15:00Z'
  }
];

// Mock user authentication functions
export const mockAuth = {
  login: async (email, password) => {
    await delay(600);
    const user = mockUsers.find(u => u.email === email);
    if (user && password) { // Simple mock validation
      return {
        success: true,
        user,
        token: 'mock-jwt-token-' + user.id
      };
    }
    return {
      success: false,
      error: 'Invalid credentials'
    };
  },
  
  register: async (userData) => {
    await delay(700);
    const newUser = {
      id: Date.now(),
      email: userData.email,
      name: userData.name,
      role: 'candidate',
      profile: {
        phone: userData.phone || '',
        location: userData.location || '',
        title: userData.title || '',
        experience: '',
        skills: [],
        bio: ''
      },
      preferences: {
        jobTypes: [],
        locations: [],
        categories: [],
        salaryMin: 0,
        experienceLevel: ''
      },
      createdAt: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return {
      success: true,
      user: newUser,
      token: 'mock-jwt-token-' + newUser.id
    };
  },

  getCurrentUser: async (token) => {
    await delay(300);
    if (token && token.startsWith('mock-jwt-token-')) {
      const userId = parseInt(token.replace('mock-jwt-token-', ''));
      const user = mockUsers.find(u => u.id === userId);
      return user || null;
    }
    return null;
  },

  updateProfile: async (userId, profileData) => {
    await delay(500);
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.profile = { ...user.profile, ...profileData };
      return { success: true, user };
    }
    return { success: false, error: 'User not found' };
  }
};

// Application management functions
export const fetchUserApplications = async (userId) => {
  await delay(400);
  const applications = mockApplications.filter(app => app.userId === userId);
  
  // Add job details to applications
  const applicationsWithJobDetails = applications.map(app => ({
    ...app,
    job: mockJobs.find(job => job.id === app.jobId)
  }));
  
  return applicationsWithJobDetails;
};

export const getApplicationById = async (applicationId) => {
  await delay(300);
  const application = mockApplications.find(app => app.id === applicationId);
  if (application) {
    return {
      ...application,
      job: mockJobs.find(job => job.id === application.jobId)
    };
  }
  throw new Error('Application not found');
};

export const checkApplicationStatus = async (userId, jobId) => {
  await delay(200);
  return mockApplications.find(app => app.userId === userId && app.jobId === jobId);
};

// Saved searches management
export const fetchSavedSearches = async (userId) => {
  await delay(300);
  return mockSavedSearches.filter(search => search.userId === userId);
};

export const saveJobSearch = async (userId, searchData) => {
  await delay(400);
  const newSearch = {
    id: `SEARCH-${Date.now()}`,
    userId,
    name: searchData.name,
    filters: searchData.filters,
    alertEnabled: searchData.alertEnabled || false,
    createdAt: new Date().toISOString()
  };
  mockSavedSearches.push(newSearch);
  return { success: true, search: newSearch };
};

export const deleteSavedSearch = async (searchId) => {
  await delay(300);
  const index = mockSavedSearches.findIndex(search => search.id === searchId);
  if (index !== -1) {
    mockSavedSearches.splice(index, 1);
    return { success: true };
  }
  return { success: false, error: 'Search not found' };
};

export const toggleSearchAlert = async (searchId, enabled) => {
  await delay(300);
  const search = mockSavedSearches.find(s => s.id === searchId);
  if (search) {
    search.alertEnabled = enabled;
    return { success: true, search };
  }
  return { success: false, error: 'Search not found' };
};

// Fetch job applicants for recruiters
export const fetchJobApplicants = async (jobId, sortBy = 'appliedAt', sortOrder = 'desc') => {
  await delay(400);
  let applicants = mockApplicants.filter(applicant => applicant.jobId === parseInt(jobId));
  
  // Apply sorting
  applicants.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'appliedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  return {
    applicants,
    total: applicants.length,
    jobDetails: mockJobs.find(job => job.id === parseInt(jobId))
  };
};

// Update applicant status
export const updateApplicantStatus = async (applicantId, newStatus) => {
  await delay(300);
  const applicant = mockApplicants.find(app => app.id === applicantId);
  if (applicant) {
    applicant.status = newStatus;
    return { success: true, applicant };
  }
  return { success: false, error: 'Applicant not found' };
};

// Personalized job recommendations
export const fetchPersonalizedJobs = async (userId, limit = 10) => {
  await delay(500);
  const user = mockUsers.find(u => u.id === userId);
  if (!user) return { jobs: [], total: 0 };

  const { preferences } = user;
  let personalizedJobs = [...mockJobs];

  // Filter by user preferences
  if (preferences.jobTypes.length > 0) {
    personalizedJobs = personalizedJobs.filter(job => 
      preferences.jobTypes.includes(job.type)
    );
  }

  if (preferences.categories.length > 0) {
    personalizedJobs = personalizedJobs.filter(job => 
      preferences.categories.includes(job.category)
    );
  }

  if (preferences.locations.length > 0) {
    personalizedJobs = personalizedJobs.filter(job => 
      preferences.locations.some(loc => 
        job.location.toLowerCase().includes(loc.toLowerCase()) || 
        loc.toLowerCase() === 'remote'
      )
    );
  }

  // Sort by relevance (mock scoring based on skills match)
  if (user.profile.skills.length > 0) {
    personalizedJobs = personalizedJobs.map(job => {
      const skillMatches = job.requirements ? 
        job.requirements.filter(req => 
          user.profile.skills.some(skill => 
            skill.toLowerCase().includes(req.toLowerCase()) ||
            req.toLowerCase().includes(skill.toLowerCase())
          )
        ).length : 0;
      
      return { ...job, relevanceScore: skillMatches };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  return {
    jobs: personalizedJobs.slice(0, limit),
    total: personalizedJobs.length
  };
};
