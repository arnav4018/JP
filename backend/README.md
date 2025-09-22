# Job Portal Backend API

A comprehensive RESTful API for a job portal application built with Node.js, Express, and MongoDB.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Candidate, Recruiter, Admin)
  - Password hashing with bcrypt
  - OAuth integration (Google, LinkedIn) - ready for implementation
  - Password reset functionality

- **Job Management**
  - CRUD operations for job postings
  - Advanced filtering and search
  - Pagination and sorting
  - Job application management
  - View tracking

- **User Management**
  - User profiles with role-specific fields
  - Profile completion tracking
  - Account status management

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Passport.js
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Password Hashing**: bcrypt

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/job-portal

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-here
JWT_REFRESH_EXPIRE=30d

# OAuth Configuration (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

4. Start the server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "Password123",
    "role": "candidate", // or "recruiter"
    "phone": "+1234567890"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "Password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <jwt-token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1234567890",
    "skills": ["JavaScript", "React", "Node.js"],
    "experience": 3,
    "location": {
        "city": "New York",
        "state": "NY",
        "country": "USA"
    }
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
    "currentPassword": "OldPassword123",
    "newPassword": "NewPassword123"
}
```

### Job Endpoints

#### Get All Jobs (Public)
```http
GET /api/jobs?page=1&limit=10&search=developer&location=New York&category=software-development&employmentType=full-time&salaryMin=50000&salaryMax=100000&isRemote=true&sortBy=createdAt&sortOrder=desc
```

#### Get Single Job (Public)
```http
GET /api/jobs/:jobId
```

#### Create Job (Recruiters Only)
```http
POST /api/jobs
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
    "title": "Senior Software Developer",
    "description": "We are looking for an experienced software developer...",
    "company": {
        "name": "Tech Corp",
        "website": "https://techcorp.com",
        "size": "51-200"
    },
    "location": {
        "city": "New York",
        "state": "NY",
        "country": "USA",
        "isRemote": false,
        "remoteType": "on-site"
    },
    "employment": {
        "type": "full-time",
        "experience": {
            "min": 3,
            "max": 7
        }
    },
    "salary": {
        "min": 80000,
        "max": 120000,
        "currency": "USD",
        "period": "yearly",
        "isNegotiable": true
    },
    "requirements": {
        "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
        "education": "bachelor",
        "certifications": []
    },
    "benefits": ["Health Insurance", "401k", "Flexible Hours"],
    "category": "software-development",
    "applicationDeadline": "2024-12-31T23:59:59.999Z",
    "tags": ["javascript", "react", "remote-friendly"]
}
```

#### Update Job (Job Owner/Admin Only)
```http
PUT /api/jobs/:jobId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
    "title": "Updated Job Title",
    "status": "active"
}
```

#### Delete Job (Job Owner/Admin Only)
```http
DELETE /api/jobs/:jobId
Authorization: Bearer <jwt-token>
```

#### Apply to Job (Candidates Only)
```http
POST /api/jobs/:jobId/apply
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
    "resume": "https://example.com/resume.pdf",
    "coverLetter": "I am very interested in this position..."
}
```

#### Get Job Applications (Job Owner/Admin Only)
```http
GET /api/jobs/:jobId/applications?status=pending&page=1&limit=10
Authorization: Bearer <jwt-token>
```

#### Update Application Status (Job Owner/Admin Only)
```http
PUT /api/jobs/:jobId/applications/:applicationId
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
    "status": "reviewed" // pending, reviewed, shortlisted, interviewed, rejected, hired
}
```

#### Get My Applications (Candidates Only)
```http
GET /api/jobs/user/my-applications?status=pending&page=1&limit=10
Authorization: Bearer <jwt-token>
```

#### Get My Jobs (Recruiters Only)
```http
GET /api/jobs/user/my-jobs?status=active&page=1&limit=10
Authorization: Bearer <jwt-token>
```

### Response Format

All API responses follow this consistent format:

#### Success Response
```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": {
        // Response data here
    },
    "pagination": { // Only for paginated endpoints
        "page": 1,
        "pages": 10,
        "limit": 10,
        "total": 95
    }
}
```

#### Error Response
```json
{
    "success": false,
    "error": "Error message",
    "errors": [ // Only for validation errors
        {
            "field": "email",
            "message": "Valid email is required",
            "value": "invalid-email"
        }
    ]
}
```

## Database Models

### User Model
- Personal information (name, email, phone)
- Authentication fields (password, OAuth IDs)
- Role-based fields (candidate: skills, experience; recruiter: company info)
- Profile completion tracking
- Account status management

### Job Model
- Job details (title, description, requirements)
- Company information
- Location and remote work options
- Employment details (type, experience, salary)
- Applications tracking
- Status management and view counting

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- Role-based access control

## Error Handling

The API includes comprehensive error handling:
- Validation errors with detailed field information
- Authentication and authorization errors
- Database operation errors
- Custom business logic errors
- Global error handler with environment-specific responses

## Development

### Folder Structure
```
backend/
├── config/          # Database configuration
├── controllers/     # Route handlers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── server.js        # Main server file
└── package.json     # Dependencies
```

### Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

## Future Enhancements

Phase 1 provides the core functionality. Future phases can include:
- File upload for resumes and company logos
- Email notifications
- Advanced search with Elasticsearch
- Job recommendations
- Real-time notifications
- Analytics and reporting
- API rate limiting per user
- Caching with Redis

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.