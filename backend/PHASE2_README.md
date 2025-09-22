# Phase 2: Application Lifecycle & Resume Management

## Overview

Phase 2 enhances the job portal with comprehensive application tracking system (ATS) and resume management capabilities, including:

- **Advanced Application Tracking**: Complete ATS with interview scheduling, assessments, and communication logs
- **Resume Upload & Parsing**: Automatic extraction of data from PDF resumes using AI-powered parsing
- **Online Resume Builder**: Create professional resumes using multiple templates
- **PDF Generation**: Generate beautiful PDFs from resume data using Puppeteer
- **File Management**: Support for local storage and AWS S3 cloud storage

## New Features

### 📋 Enhanced Application Tracking System (ATS)

- **Comprehensive Status Tracking**: 13 different application statuses from 'applied' to 'hired'
- **Interview Management**: Schedule, track, and provide feedback for multiple interview rounds
- **Assessment System**: Assign and track coding tests, technical assessments, and evaluations
- **Communication Logs**: Track all communication between candidates and recruiters
- **Application Analytics**: Real-time statistics and reporting for recruiters

### 📄 Resume Management

- **Upload & Parse**: Upload PDF resumes and extract structured data automatically
- **Online Resume Builder**: Create resumes using structured JSON data
- **Multiple Templates**: 5 professional resume templates (Modern, Classic, Creative, Minimal, Professional)
- **PDF Generation**: Convert resume data to professional PDF documents
- **Public Resume Gallery**: Allow candidates to make resumes publicly searchable

### ☁️ File Storage & Management

- **Flexible Storage**: Support for both local storage and AWS S3
- **File Type Validation**: Comprehensive validation for resumes, images, and documents
- **Automatic File Management**: Organized folder structure and cleanup
- **Resume Parsing**: AI-powered extraction of skills, experience, education, and contact info

## API Endpoints

### Application Management

#### Apply to Job
```http
POST /api/applications/apply/:jobId
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Form data:
resumeType: "uploaded" | "online_resume" | "external_url"
resumeId: <resume-id> (if using online_resume)
coverLetter: "text"
resume: <file> (if uploading)
salaryExpectation: {amount: 50000, currency: "INR", period: "yearly"}
availability: {startDate: "2024-01-15", noticePeriod: "1_month"}
```

#### Get My Applications (Candidate)
```http
GET /api/applications/my-applications?status=applied&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Job Applications (Recruiter)
```http
GET /api/applications/job/:jobId?status=under_review&page=1&limit=10
Authorization: Bearer <token>
```

#### Update Application Status
```http
PUT /api/applications/:applicationId/status
Authorization: Bearer <token>
Content-Type: application/json

{
    "status": "shortlisted",
    "rejection": {
        "reason": "qualifications_not_met",
        "feedback": "Experience requirements not met"
    },
    "offer": {
        "position": "Senior Developer",
        "salary": {
            "amount": 80000,
            "currency": "INR",
            "period": "yearly"
        },
        "benefits": ["Health Insurance", "401k"],
        "startDate": "2024-02-01",
        "offerDate": "2024-01-15",
        "expiryDate": "2024-01-22"
    }
}
```

#### Schedule Interview
```http
POST /api/applications/:applicationId/interview
Authorization: Bearer <token>
Content-Type: application/json

{
    "type": "technical",
    "scheduledDate": "2024-01-20T10:00:00Z",
    "duration": 60,
    "interviewer": {
        "name": "John Smith",
        "title": "Senior Developer",
        "email": "john.smith@company.com"
    },
    "meetingUrl": "https://zoom.us/j/123456789",
    "location": "Conference Room A"
}
```

#### Add Assessment
```http
POST /api/applications/:applicationId/assessment
Authorization: Bearer <token>
Content-Type: application/json

{
    "type": "coding",
    "title": "React Development Challenge",
    "description": "Build a todo app using React and TypeScript",
    "dueDate": "2024-01-25T23:59:59Z",
    "assessmentUrl": "https://assessment.company.com/challenge/123"
}
```

#### Application Statistics
```http
GET /api/applications/stats?jobId=<job-id>&dateFrom=2024-01-01&dateTo=2024-01-31
Authorization: Bearer <token>
```

### Resume Management

#### Create Resume
```http
POST /api/resumes
Authorization: Bearer <token>
Content-Type: application/json

{
    "title": "Software Developer Resume",
    "template": "modern",
    "personalInfo": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "location": {
            "city": "New York",
            "state": "NY",
            "country": "USA"
        },
        "linkedinUrl": "https://linkedin.com/in/johndoe"
    },
    "summary": "Experienced software developer with 5+ years...",
    "experience": [{
        "jobTitle": "Senior Developer",
        "companyName": "Tech Corp",
        "location": {"city": "New York", "state": "NY"},
        "startDate": "2020-01-15",
        "endDate": "2023-12-31",
        "isCurrentJob": false,
        "description": "Led development of web applications...",
        "achievements": [
            "Improved application performance by 40%",
            "Led a team of 5 developers"
        ],
        "technologies": ["React", "Node.js", "MongoDB"]
    }],
    "education": [{
        "degree": "Bachelor of Computer Science",
        "institution": "University of Technology",
        "fieldOfStudy": "Computer Science",
        "startDate": "2016-09-01",
        "endDate": "2020-05-30",
        "gpa": 3.8
    }],
    "skills": {
        "technical": [{
            "name": "JavaScript",
            "level": "expert",
            "category": "programming"
        }],
        "soft": ["Leadership", "Communication"],
        "languages": [{
            "language": "English",
            "proficiency": "native"
        }]
    },
    "projects": [{
        "name": "E-commerce Platform",
        "description": "Built a full-stack e-commerce solution",
        "technologies": ["React", "Node.js", "MongoDB"],
        "url": "https://github.com/johndoe/ecommerce",
        "features": ["Payment integration", "Real-time inventory"]
    }]
}
```

#### Get User's Resumes
```http
GET /api/resumes?page=1&limit=10&status=active&template=modern
Authorization: Bearer <token>
```

#### Upload and Parse Resume
```http
POST /api/resumes/upload-parse
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Form data:
resume: <pdf-file>
```

#### Download Resume as PDF
```http
GET /api/resumes/:id/download?format=pdf
Authorization: Bearer <token>
```

#### Get Resume Preview
```http
GET /api/resumes/:id/preview
Authorization: Bearer <token>
```

#### Get Public Resumes
```http
GET /api/resumes/public?skills=javascript,react&experience=3&location=New York&page=1&limit=10
```

#### Clone Resume
```http
POST /api/resumes/:id/clone
Authorization: Bearer <token>
```

#### Get Resume Templates
```http
GET /api/resumes/templates
```

## Database Models

### Application Model
```javascript
{
    candidate: ObjectId,
    job: ObjectId,
    recruiter: ObjectId,
    status: "applied" | "under_review" | "shortlisted" | "interview_scheduled" | 
            "interviewed" | "assessment_sent" | "assessment_completed" | 
            "reference_check" | "offer_extended" | "offer_accepted" | 
            "offer_declined" | "rejected" | "withdrawn",
    resume: {
        type: "uploaded" | "online_resume" | "external_url",
        resumeId: ObjectId,
        fileUrl: String,
        fileName: String,
        fileSize: Number,
        uploadDate: Date
    },
    coverLetter: String,
    salaryExpectation: {
        amount: Number,
        currency: String,
        period: String,
        isNegotiable: Boolean
    },
    availability: {
        startDate: Date,
        noticePeriod: String,
        noticePeriodDetails: String
    },
    interviews: [{
        type: String,
        scheduledDate: Date,
        duration: Number,
        interviewer: Object,
        location: String,
        meetingUrl: String,
        status: String,
        feedback: Object
    }],
    assessments: [{
        type: String,
        title: String,
        description: String,
        dueDate: Date,
        status: String,
        score: Number,
        feedback: String
    }],
    communications: [{
        type: String,
        direction: String,
        subject: String,
        content: String,
        sender: ObjectId,
        recipient: ObjectId,
        timestamp: Date
    }]
}
```

### Resume Model
```javascript
{
    user: ObjectId,
    title: String,
    template: "modern" | "classic" | "creative" | "minimal" | "professional",
    personalInfo: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        location: Object,
        linkedinUrl: String,
        portfolioUrl: String,
        githubUrl: String
    },
    summary: String,
    experience: [{
        jobTitle: String,
        companyName: String,
        location: Object,
        startDate: Date,
        endDate: Date,
        isCurrentJob: Boolean,
        description: String,
        achievements: [String],
        technologies: [String]
    }],
    education: [{
        degree: String,
        fieldOfStudy: String,
        institution: String,
        location: Object,
        startDate: Date,
        endDate: Date,
        gpa: Number,
        honors: [String]
    }],
    skills: {
        technical: [{
            name: String,
            level: String,
            category: String
        }],
        soft: [String],
        languages: [{
            language: String,
            proficiency: String
        }]
    },
    projects: [{
        name: String,
        description: String,
        technologies: [String],
        startDate: Date,
        endDate: Date,
        url: String,
        githubUrl: String,
        features: [String]
    }],
    certifications: [{
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
        credentialUrl: String
    }],
    parsedData: {
        rawText: String,
        extractedSkills: [String],
        extractedExperience: Number,
        extractedCompanies: [String],
        extractedEducation: [String],
        confidence: Number
    }
}
```

## Resume Parsing Features

The resume parser can extract:

- **Personal Information**: Name, email, phone number
- **Skills**: Technical skills from a comprehensive database of 100+ technologies
- **Work Experience**: Company names, job titles, date ranges, calculated total experience
- **Education**: Degrees, institutions, fields of study
- **Contact Information**: Email addresses and phone numbers
- **Professional Summary**: Objective or summary sections

### Supported Formats
- PDF files (primary)
- Support for multiple PDF structures and layouts
- Confidence scoring for parsing accuracy

## File Storage Options

### Local Storage (Default)
Files are stored in organized directories:
```
uploads/
├── resumes/         # Uploaded resume files
├── avatars/         # User profile pictures
├── logos/           # Company logos
├── documents/       # Other documents
└── generated_resumes/  # Generated PDF files
```

### AWS S3 Storage (Optional)
Configure AWS S3 by setting environment variables:
```env
USE_S3_STORAGE=true
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=job-portal-uploads
```

## Resume Templates

### Available Templates
1. **Modern**: Clean design with color accents and modern typography
2. **Classic**: Traditional format suitable for conservative industries
3. **Creative**: Eye-catching design for creative professionals
4. **Minimal**: Clean, minimalist design focusing on content
5. **Professional**: Corporate-friendly design with professional styling

## Environment Variables

Add these to your `.env` file:

```env
# AWS S3 Configuration (optional)
USE_S3_STORAGE=false
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=job-portal-uploads

# Base URL for local file serving
BASE_URL=http://localhost:5000

# File size limits
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=pdf,doc,docx
```

## Dependencies Added

```json
{
    "multer": "File upload handling",
    "multer-s3": "AWS S3 integration for multer",
    "pdf-parse": "PDF text extraction",
    "puppeteer": "PDF generation from HTML",
    "aws-sdk": "AWS services integration",
    "sharp": "Image processing",
    "uuid": "Unique file name generation",
    "mime-types": "MIME type detection"
}
```

## Testing the APIs

### 1. Test Resume Upload and Parsing
```bash
curl -X POST http://localhost:5000/api/resumes/upload-parse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@path/to/resume.pdf"
```

### 2. Test Job Application with Resume
```bash
curl -X POST http://localhost:5000/api/applications/apply/JOB_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "resume=@path/to/resume.pdf" \
  -F "resumeType=uploaded" \
  -F "coverLetter=I am interested in this position..."
```

### 3. Test Resume PDF Generation
```bash
curl -X GET http://localhost:5000/api/resumes/RESUME_ID/download \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output resume.pdf
```

## Error Handling

The system includes comprehensive error handling for:
- File upload errors (size limits, file types)
- Resume parsing failures
- PDF generation errors
- S3 upload/download failures
- Database validation errors

## Security Features

- **File Type Validation**: Only allows safe file types
- **File Size Limits**: Prevents large file uploads
- **Access Control**: Resume access limited to owners or public resumes
- **Secure File Storage**: Files stored with UUID names
- **Input Validation**: Comprehensive validation for all inputs

## Performance Optimizations

- **Caching**: Resume previews cached for 1 hour
- **Pagination**: All list endpoints support pagination
- **Indexes**: Optimized database indexes for search and filtering
- **File Compression**: Images automatically optimized
- **Lazy Loading**: PDF generation only when requested

## Future Enhancements

Phase 2 provides a solid foundation for:
- AI-powered resume matching
- Advanced analytics and reporting
- Email notifications for application updates
- Video interview integration
- Advanced assessment platforms
- Resume scoring and ranking
- Bulk operations for recruiters

## Deployment Notes

When deploying to production:
1. Set up proper AWS S3 bucket with appropriate permissions
2. Configure environment variables for production
3. Set up proper file cleanup routines
4. Configure Puppeteer for server environment
5. Set up proper logging and monitoring
6. Configure rate limiting for file uploads

This completes Phase 2 implementation with comprehensive application tracking and resume management capabilities!