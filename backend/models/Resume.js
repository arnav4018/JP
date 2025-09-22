const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Resume title is required'],
        trim: true,
        maxlength: [100, 'Resume title cannot exceed 100 characters']
    },
    template: {
        type: String,
        enum: ['modern', 'classic', 'creative', 'minimal', 'professional'],
        default: 'modern'
    },
    // Personal Information
    personalInfo: {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
        },
        location: {
            address: String,
            city: String,
            state: String,
            country: String,
            zipCode: String
        },
        linkedinUrl: {
            type: String,
            match: [/^https:\/\/(www\.)?linkedin\.com\/.*/, 'Please enter a valid LinkedIn URL']
        },
        portfolioUrl: {
            type: String,
            match: [/^https?:\/\/.+/, 'Please enter a valid portfolio URL']
        },
        githubUrl: {
            type: String,
            match: [/^https:\/\/(www\.)?github\.com\/.*/, 'Please enter a valid GitHub URL']
        }
    },
    // Professional Summary
    summary: {
        type: String,
        maxlength: [500, 'Summary cannot exceed 500 characters'],
        trim: true
    },
    // Work Experience
    experience: [{
        jobTitle: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true
        },
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true
        },
        location: {
            city: String,
            state: String,
            country: String
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required']
        },
        endDate: {
            type: Date,
            validate: {
                validator: function(value) {
                    return !value || value > this.startDate;
                },
                message: 'End date must be after start date'
            }
        },
        isCurrentJob: {
            type: Boolean,
            default: false
        },
        description: {
            type: String,
            maxlength: [1000, 'Job description cannot exceed 1000 characters'],
            trim: true
        },
        achievements: [{
            type: String,
            trim: true,
            maxlength: [200, 'Achievement cannot exceed 200 characters']
        }],
        technologies: [{
            type: String,
            trim: true
        }]
    }],
    // Education
    education: [{
        degree: {
            type: String,
            required: [true, 'Degree is required'],
            trim: true
        },
        fieldOfStudy: {
            type: String,
            required: [true, 'Field of study is required'],
            trim: true
        },
        institution: {
            type: String,
            required: [true, 'Institution name is required'],
            trim: true
        },
        location: {
            city: String,
            state: String,
            country: String
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required']
        },
        endDate: {
            type: Date,
            validate: {
                validator: function(value) {
                    return !value || value > this.startDate;
                },
                message: 'End date must be after start date'
            }
        },
        gpa: {
            type: Number,
            min: [0, 'GPA cannot be negative'],
            max: [4, 'GPA cannot exceed 4.0']
        },
        honors: [{
            type: String,
            trim: true
        }]
    }],
    // Skills
    skills: {
        technical: [{
            name: {
                type: String,
                required: true,
                trim: true
            },
            level: {
                type: String,
                enum: ['beginner', 'intermediate', 'advanced', 'expert'],
                default: 'intermediate'
            },
            category: {
                type: String,
                enum: ['programming', 'framework', 'database', 'tools', 'cloud', 'other'],
                default: 'other'
            }
        }],
        soft: [{
            type: String,
            trim: true
        }],
        languages: [{
            language: {
                type: String,
                required: true,
                trim: true
            },
            proficiency: {
                type: String,
                enum: ['basic', 'intermediate', 'fluent', 'native'],
                default: 'intermediate'
            }
        }]
    },
    // Projects
    projects: [{
        name: {
            type: String,
            required: [true, 'Project name is required'],
            trim: true
        },
        description: {
            type: String,
            maxlength: [500, 'Project description cannot exceed 500 characters'],
            trim: true
        },
        technologies: [{
            type: String,
            trim: true
        }],
        startDate: Date,
        endDate: Date,
        url: {
            type: String,
            match: [/^https?:\/\/.+/, 'Please enter a valid project URL']
        },
        githubUrl: {
            type: String,
            match: [/^https:\/\/(www\.)?github\.com\/.*/, 'Please enter a valid GitHub URL']
        },
        features: [{
            type: String,
            trim: true,
            maxlength: [200, 'Feature description cannot exceed 200 characters']
        }]
    }],
    // Certifications
    certifications: [{
        name: {
            type: String,
            required: [true, 'Certification name is required'],
            trim: true
        },
        issuer: {
            type: String,
            required: [true, 'Certification issuer is required'],
            trim: true
        },
        issueDate: {
            type: Date,
            required: [true, 'Issue date is required']
        },
        expiryDate: Date,
        credentialId: {
            type: String,
            trim: true
        },
        credentialUrl: {
            type: String,
            match: [/^https?:\/\/.+/, 'Please enter a valid credential URL']
        }
    }],
    // Additional Sections
    awards: [{
        title: {
            type: String,
            required: [true, 'Award title is required'],
            trim: true
        },
        issuer: {
            type: String,
            required: [true, 'Award issuer is required'],
            trim: true
        },
        date: {
            type: Date,
            required: [true, 'Award date is required']
        },
        description: {
            type: String,
            maxlength: [300, 'Award description cannot exceed 300 characters'],
            trim: true
        }
    }],
    volunteering: [{
        organization: {
            type: String,
            required: [true, 'Organization name is required'],
            trim: true
        },
        role: {
            type: String,
            required: [true, 'Role is required'],
            trim: true
        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required']
        },
        endDate: Date,
        description: {
            type: String,
            maxlength: [500, 'Volunteering description cannot exceed 500 characters'],
            trim: true
        }
    }],
    // Metadata
    status: {
        type: String,
        enum: ['draft', 'active', 'archived'],
        default: 'draft'
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    lastDownloaded: Date,
    // Parsed resume data (when uploaded)
    parsedData: {
        rawText: String,
        extractedSkills: [String],
        extractedExperience: Number,
        extractedCompanies: [String],
        extractedEducation: [String],
        confidence: {
            type: Number,
            min: 0,
            max: 1
        }
    },
    // File information
    uploadedFile: {
        filename: String,
        originalName: String,
        mimeType: String,
        size: Number,
        url: String,
        uploadDate: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
resumeSchema.virtual('personalInfo.fullName').get(function() {
    return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for total experience
resumeSchema.virtual('totalExperience').get(function() {
    if (!this.experience || this.experience.length === 0) return 0;
    
    let totalMonths = 0;
    this.experience.forEach(exp => {
        const startDate = new Date(exp.startDate);
        const endDate = exp.isCurrentJob ? new Date() : new Date(exp.endDate);
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
        totalMonths += months;
    });
    
    return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
});

// Index for search
resumeSchema.index({
    'personalInfo.firstName': 'text',
    'personalInfo.lastName': 'text',
    'personalInfo.email': 'text',
    title: 'text',
    summary: 'text',
    'skills.technical.name': 'text',
    'experience.jobTitle': 'text',
    'experience.companyName': 'text'
});

// Compound indexes
resumeSchema.index({ user: 1, status: 1 });
resumeSchema.index({ user: 1, createdAt: -1 });
resumeSchema.index({ isPublic: 1, status: 1 });

// Pre-save middleware
resumeSchema.pre('save', function(next) {
    // Update current job end dates
    this.experience.forEach(exp => {
        if (exp.isCurrentJob) {
            exp.endDate = null;
        }
    });
    
    // Validate that only one experience can be current
    const currentJobs = this.experience.filter(exp => exp.isCurrentJob);
    if (currentJobs.length > 1) {
        return next(new Error('Only one job can be marked as current'));
    }
    
    next();
});

// Method to generate resume summary statistics
resumeSchema.methods.getStatistics = function() {
    return {
        totalExperience: this.totalExperience,
        totalProjects: this.projects.length,
        totalSkills: this.skills.technical.length + this.skills.soft.length,
        totalCertifications: this.certifications.length,
        totalEducation: this.education.length,
        lastUpdated: this.updatedAt,
        downloadCount: this.downloadCount
    };
};

// Method to export resume data for PDF generation
resumeSchema.methods.exportForPDF = function() {
    const resume = this.toObject();
    
    // Clean up and format data for PDF generation
    return {
        personalInfo: resume.personalInfo,
        summary: resume.summary,
        experience: resume.experience.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)),
        education: resume.education.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)),
        skills: resume.skills,
        projects: resume.projects.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)),
        certifications: resume.certifications.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate)),
        awards: resume.awards.sort((a, b) => new Date(b.date) - new Date(a.date)),
        volunteering: resume.volunteering.sort((a, b) => new Date(b.startDate) - new Date(a.startDate)),
        template: resume.template,
        metadata: {
            totalExperience: this.totalExperience,
            generatedAt: new Date()
        }
    };
};

// Static method to find public resumes
resumeSchema.statics.findPublicResumes = function(filters = {}) {
    const { skills, experience, location, page = 1, limit = 10 } = filters;
    const query = { isPublic: true, status: 'active' };
    
    if (skills && skills.length > 0) {
        query['skills.technical.name'] = { $in: skills };
    }
    
    if (experience) {
        // This would require a more complex aggregation for calculated virtual field
    }
    
    if (location) {
        query.$or = [
            { 'personalInfo.location.city': new RegExp(location, 'i') },
            { 'personalInfo.location.state': new RegExp(location, 'i') },
            { 'personalInfo.location.country': new RegExp(location, 'i') }
        ];
    }
    
    return this.find(query)
        .populate('user', 'firstName lastName avatar')
        .sort({ updatedAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));
};

module.exports = mongoose.model('Resume', resumeSchema);