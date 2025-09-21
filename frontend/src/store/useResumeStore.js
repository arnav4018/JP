'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Default resume structure
const defaultResumeData = {
  id: null,
  name: 'Untitled Resume',
  template: 'classic', // classic, modern, creative
  lastModified: new Date().toISOString(),
  
  // Personal Information
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    website: '',
    linkedin: '',
    github: '',
    portfolio: '',
    summary: ''
  },
  
  // Education
  education: [],
  
  // Work Experience
  experience: [],
  
  // Skills
  skills: {
    technical: [],
    languages: [],
    soft: [],
    tools: []
  },
  
  // Projects
  projects: [],
  
  // Certifications
  certifications: [],
  
  // Awards
  awards: [],
  
  // Volunteer Experience
  volunteer: [],
  
  // References
  references: []
};

// Education item structure
const defaultEducation = {
  id: Date.now(),
  institution: '',
  degree: '',
  field: '',
  startDate: '',
  endDate: '',
  current: false,
  gpa: '',
  location: '',
  description: '',
  achievements: []
};

// Experience item structure
const defaultExperience = {
  id: Date.now(),
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  current: false,
  location: '',
  description: '',
  achievements: [],
  technologies: []
};

// Project item structure
const defaultProject = {
  id: Date.now(),
  name: '',
  description: '',
  technologies: [],
  startDate: '',
  endDate: '',
  url: '',
  github: '',
  achievements: []
};

// Certification item structure
const defaultCertification = {
  id: Date.now(),
  name: '',
  issuer: '',
  issueDate: '',
  expiryDate: '',
  credentialId: '',
  url: ''
};

// Award item structure
const defaultAward = {
  id: Date.now(),
  title: '',
  issuer: '',
  date: '',
  description: ''
};

// Volunteer item structure
const defaultVolunteer = {
  id: Date.now(),
  organization: '',
  role: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  achievements: []
};

// Reference item structure
const defaultReference = {
  id: Date.now(),
  name: '',
  position: '',
  company: '',
  email: '',
  phone: '',
  relationship: ''
};

export const useResumeStore = create(
  persist(
    (set, get) => ({
      // Current resume being edited
      currentResume: { ...defaultResumeData },
      
      // All saved resumes
      savedResumes: [],
      
      // UI state
      selectedTemplate: 'classic',
      previewMode: false,
      
      // Actions
      
      // Create new resume
      createNewResume: (name = 'Untitled Resume') => {
        const newResume = {
          ...defaultResumeData,
          id: Date.now().toString(),
          name,
          lastModified: new Date().toISOString()
        };
        set({ currentResume: newResume });
        return newResume;
      },
      
      // Load existing resume
      loadResume: (resumeId) => {
        const { savedResumes } = get();
        const resume = savedResumes.find(r => r.id === resumeId);
        if (resume) {
          set({ currentResume: resume, selectedTemplate: resume.template });
        }
        return resume;
      },
      
      // Save current resume
      saveResume: () => {
        const { currentResume, savedResumes } = get();
        const updatedResume = {
          ...currentResume,
          lastModified: new Date().toISOString()
        };
        
        const existingIndex = savedResumes.findIndex(r => r.id === currentResume.id);
        let updatedSavedResumes;
        
        if (existingIndex >= 0) {
          // Update existing resume
          updatedSavedResumes = [...savedResumes];
          updatedSavedResumes[existingIndex] = updatedResume;
        } else {
          // Add new resume
          if (!updatedResume.id) {
            updatedResume.id = Date.now().toString();
          }
          updatedSavedResumes = [...savedResumes, updatedResume];
        }
        
        set({ 
          currentResume: updatedResume,
          savedResumes: updatedSavedResumes 
        });
        
        return updatedResume;
      },
      
      // Delete resume
      deleteResume: (resumeId) => {
        const { savedResumes } = get();
        const updatedSavedResumes = savedResumes.filter(r => r.id !== resumeId);
        set({ savedResumes: updatedSavedResumes });
      },
      
      // Update resume field
      updateResumeField: (field, value) => {
        const { currentResume } = get();
        const updatedResume = {
          ...currentResume,
          [field]: value,
          lastModified: new Date().toISOString()
        };
        set({ currentResume: updatedResume });
      },
      
      // Update nested field (e.g., personalInfo.firstName)
      updateNestedField: (section, field, value) => {
        const { currentResume } = get();
        const updatedResume = {
          ...currentResume,
          [section]: {
            ...currentResume[section],
            [field]: value
          },
          lastModified: new Date().toISOString()
        };
        set({ currentResume: updatedResume });
      },
      
      // Array management functions
      
      // Add item to array section
      addArrayItem: (section, item = null) => {
        const { currentResume } = get();
        let newItem;
        
        switch (section) {
          case 'education':
            newItem = item || { ...defaultEducation, id: Date.now() };
            break;
          case 'experience':
            newItem = item || { ...defaultExperience, id: Date.now() };
            break;
          case 'projects':
            newItem = item || { ...defaultProject, id: Date.now() };
            break;
          case 'certifications':
            newItem = item || { ...defaultCertification, id: Date.now() };
            break;
          case 'awards':
            newItem = item || { ...defaultAward, id: Date.now() };
            break;
          case 'volunteer':
            newItem = item || { ...defaultVolunteer, id: Date.now() };
            break;
          case 'references':
            newItem = item || { ...defaultReference, id: Date.now() };
            break;
          default:
            return;
        }
        
        const updatedResume = {
          ...currentResume,
          [section]: [...currentResume[section], newItem],
          lastModified: new Date().toISOString()
        };
        set({ currentResume: updatedResume });
      },
      
      // Update item in array section
      updateArrayItem: (section, itemId, updatedData) => {
        const { currentResume } = get();
        const updatedArray = currentResume[section].map(item =>
          item.id === itemId ? { ...item, ...updatedData } : item
        );
        
        const updatedResume = {
          ...currentResume,
          [section]: updatedArray,
          lastModified: new Date().toISOString()
        };
        set({ currentResume: updatedResume });
      },
      
      // Remove item from array section
      removeArrayItem: (section, itemId) => {
        const { currentResume } = get();
        const updatedArray = currentResume[section].filter(item => item.id !== itemId);
        
        const updatedResume = {
          ...currentResume,
          [section]: updatedArray,
          lastModified: new Date().toISOString()
        };
        set({ currentResume: updatedResume });
      },
      
      // Reorder array items
      reorderArrayItems: (section, startIndex, endIndex) => {
        const { currentResume } = get();
        const items = [...currentResume[section]];
        const [reorderedItem] = items.splice(startIndex, 1);
        items.splice(endIndex, 0, reorderedItem);
        
        const updatedResume = {
          ...currentResume,
          [section]: items,
          lastModified: new Date().toISOString()
        };
        set({ currentResume: updatedResume });
      },
      
      // Skills management
      addSkill: (category, skill) => {
        const { currentResume } = get();
        if (!skill.trim()) return;
        
        const updatedSkills = {
          ...currentResume.skills,
          [category]: [...currentResume.skills[category], skill.trim()]
        };
        
        const updatedResume = {
          ...currentResume,
          skills: updatedSkills,
          lastModified: new Date().toISOString()
        };
        set({ currentResume: updatedResume });
      },
      
      removeSkill: (category, index) => {
        const { currentResume } = get();
        const updatedSkills = {
          ...currentResume.skills,
          [category]: currentResume.skills[category].filter((_, i) => i !== index)
        };
        
        const updatedResume = {
          ...currentResume,
          skills: updatedSkills,
          lastModified: new Date().toISOString()
        };
        set({ currentResume: updatedResume });
      },
      
      // Template management
      changeTemplate: (templateName) => {
        const { currentResume } = get();
        const updatedResume = {
          ...currentResume,
          template: templateName,
          lastModified: new Date().toISOString()
        };
        set({ 
          currentResume: updatedResume,
          selectedTemplate: templateName 
        });
      },
      
      // UI state management
      togglePreviewMode: () => {
        const { previewMode } = get();
        set({ previewMode: !previewMode });
      },
      
      // Import from user profile
      importFromProfile: (userProfile) => {
        const { currentResume } = get();
        const updatedPersonalInfo = {
          ...currentResume.personalInfo,
          firstName: userProfile.name?.split(' ')[0] || '',
          lastName: userProfile.name?.split(' ').slice(1).join(' ') || '',
          email: userProfile.email || '',
          phone: userProfile.profile?.phone || '',
          address: userProfile.profile?.location || '',
          summary: userProfile.profile?.bio || ''
        };
        
        const updatedSkills = {
          ...currentResume.skills,
          technical: userProfile.profile?.skills || []
        };
        
        const updatedResume = {
          ...currentResume,
          personalInfo: updatedPersonalInfo,
          skills: updatedSkills,
          lastModified: new Date().toISOString()
        };
        
        set({ currentResume: updatedResume });
      },
      
      // Reset to default
      resetResume: () => {
        set({ currentResume: { ...defaultResumeData } });
      },
      
      // Get resume completion percentage
      getCompletionPercentage: () => {
        const { currentResume } = get();
        let completed = 0;
        let total = 0;
        
        // Personal info (required fields)
        const requiredPersonalFields = ['firstName', 'lastName', 'email', 'phone'];
        requiredPersonalFields.forEach(field => {
          total++;
          if (currentResume.personalInfo[field]) completed++;
        });
        
        // Summary
        total++;
        if (currentResume.personalInfo.summary) completed++;
        
        // Experience
        total++;
        if (currentResume.experience.length > 0) completed++;
        
        // Education
        total++;
        if (currentResume.education.length > 0) completed++;
        
        // Skills
        total++;
        const hasSkills = Object.values(currentResume.skills).some(skillArray => skillArray.length > 0);
        if (hasSkills) completed++;
        
        return Math.round((completed / total) * 100);
      }
    }),
    {
      name: 'resume-builder-store',
      partialize: (state) => ({
        // Persist all saved resumes and current work
        savedResumes: state.savedResumes,
        currentResume: state.currentResume,
        selectedTemplate: state.selectedTemplate
      })
    }
  )
);

// Export default structures for external use
export {
  defaultResumeData,
  defaultEducation,
  defaultExperience,
  defaultProject,
  defaultCertification,
  defaultAward,
  defaultVolunteer,
  defaultReference
};