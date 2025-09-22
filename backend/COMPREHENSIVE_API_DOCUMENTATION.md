# Job Portal API - Comprehensive Documentation

## Overview

This is a comprehensive job portal backend API built with Node.js, Express, and MongoDB. It includes user authentication, job management, application tracking, resume handling, payment processing, referral system, and admin settings management.

## New Features (Phase 3)

### 🔄 Enhanced Application Lifecycle
- Complete application tracking from submission to hire
- Interview scheduling and management
- Assessment tracking
- Communication logs
- Application analytics

### 💰 Payment System
- Multiple payment gateways (Razorpay, Stripe, PayPal)
- Job posting fees and featured job upgrades
- Subscription management
- Automated receipt generation
- Refund processing
- Revenue analytics

### 👥 Referral System
- User-to-user referral tracking
- Automatic payout calculation
- Referral link generation and tracking
- Click analytics
- Multi-level referral support
- Bulk payout processing

### ⚙️ System Settings
- Admin-configurable platform settings
- Environment-specific configurations
- Setting validation and type checking
- Change history tracking
- Bulk settings import/export
- Encrypted sensitive values

### 📄 Resume Management
- Multiple resume formats support
- Resume parsing from PDFs
- Online resume builder
- Version control for resumes
- Resume analytics and optimization

### 📊 Analytics & Reporting
- Payment and revenue analytics
- Referral performance tracking
- Application conversion metrics
- User engagement analytics

## API Endpoints

### Authentication & User Management
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - User login
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password
GET    /api/auth/profile           - Get user profile
PUT    /api/auth/profile           - Update user profile
```

### Job Management
```
GET    /api/jobs                   - Get all jobs (with filtering)
POST   /api/jobs                   - Create new job (Employer/Admin)
GET    /api/jobs/:id               - Get single job details
PUT    /api/jobs/:id               - Update job (Owner/Admin)
DELETE /api/jobs/:id               - Delete job (Owner/Admin)
GET    /api/jobs/my-jobs           - Get current user's jobs
GET    /api/jobs/featured          - Get featured jobs
POST   /api/jobs/:id/feature       - Feature a job (requires payment)
```

### Application Management
```
GET    /api/applications           - Get all applications (Admin)
POST   /api/applications           - Apply for a job
GET    /api/applications/:id       - Get application details
PUT    /api/applications/:id       - Update application
DELETE /api/applications/:id       - Withdraw application
GET    /api/applications/my-applications - Get user's applications
GET    /api/applications/job/:jobId - Get applications for a job
PATCH  /api/applications/:id/status - Update application status
POST   /api/applications/:id/interview - Schedule interview
POST   /api/applications/:id/assessment - Add assessment
POST   /api/applications/:id/star - Star/unstar application
GET    /api/applications/analytics - Get application analytics
```

### Resume Management
```
GET    /api/resumes                - Get all resumes (Admin)
POST   /api/resumes                - Create/upload resume
GET    /api/resumes/:id            - Get resume details
PUT    /api/resumes/:id            - Update resume
DELETE /api/resumes/:id            - Delete resume
GET    /api/resumes/my-resumes     - Get user's resumes
POST   /api/resumes/parse          - Parse resume from file
POST   /api/resumes/:id/generate-pdf - Generate PDF resume
GET    /api/resumes/templates      - Get resume templates
```

### Payment System
```
GET    /api/payments/fees/:service - Get service fees (public)
POST   /api/payments/initiate/:type - Initiate payment
GET    /api/payments/my-payments   - Get user's payments
GET    /api/payments/:id           - Get payment details
POST   /api/payments/:id/complete  - Complete payment
GET    /api/payments/:id/receipt   - Generate receipt
POST   /api/payments               - Create payment (Admin)
GET    /api/payments               - Get all payments (Admin)
PATCH  /api/payments/:id/status    - Update payment status (Admin)
POST   /api/payments/:id/refund    - Process refund (Admin)
GET    /api/payments/stats         - Payment statistics (Admin)
GET    /api/payments/revenue-analytics - Revenue analytics (Admin)
POST   /api/payments/webhook/:gateway - Payment gateway webhooks
```

### Referral System
```
POST   /api/referrals/:code/click  - Track referral click (Public)
POST   /api/referrals/:code/signup - Process referral signup (Public)
GET    /api/referrals/stats        - Get referral statistics
GET    /api/referrals/my-referrals - Get user's referrals
POST   /api/referrals              - Create new referral
GET    /api/referrals/:id          - Get referral details
PATCH  /api/referrals/:id/status   - Update referral status
GET    /api/referrals              - Get all referrals (Admin)
GET    /api/referrals/active       - Get active referrals (Admin)
GET    /api/referrals/analytics    - Referral analytics (Admin)
GET    /api/referrals/pending-payouts - Pending payouts (Admin)
POST   /api/referrals/:id/link-application - Link to application (Admin)
POST   /api/referrals/:id/payout   - Process payout (Admin)
POST   /api/referrals/bulk-payout  - Bulk process payouts (Admin)
```

### System Settings
```
POST   /api/settings/initialize    - Initialize default settings (Admin)
GET    /api/settings/categories    - Get setting categories (Admin)
POST   /api/settings/validate      - Validate setting value (Admin)
GET    /api/settings/export        - Export settings (Admin)
POST   /api/settings/import        - Import settings (Admin)
PUT    /api/settings/bulk          - Bulk update settings (Admin)
GET    /api/settings               - Get all settings (Admin)
POST   /api/settings               - Create setting (Admin)
GET    /api/settings/category/:category - Get settings by category (Admin)
GET    /api/settings/:category/:key - Get specific setting (Admin)
PUT    /api/settings/:category/:key - Update setting (Admin)
DELETE /api/settings/:category/:key - Delete setting (Admin)
GET    /api/settings/:category/:key/history - Get setting history (Admin)
POST   /api/settings/:category/:key/reset - Reset to default (Admin)
```

## Data Models

### User Model
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  role: String (candidate/employer/admin),
  profilePicture: String,
  phone: String,
  location: Object,
  skills: [String],
  experience: Object,
  education: [Object],
  portfolio: Object,
  preferences: Object,
  subscription: Object,
  isActive: Boolean,
  isVerified: Boolean,
  lastLogin: Date
}
```

### Job Model
```javascript
{
  title: String,
  description: String,
  company: String,
  user: ObjectId (employer),
  location: Object,
  employmentType: String,
  experience: Object,
  salary: Object,
  skills: [String],
  requirements: [String],
  benefits: [String],
  category: String,
  status: String,
  applicationDeadline: Date,
  startDate: Date,
  isRemote: Boolean,
  isFeatured: Boolean,
  isPaid: Boolean,
  applicationCount: Number,
  viewCount: Number
}
```

### Application Model (Enhanced)
```javascript
{
  candidate: ObjectId,
  job: ObjectId,
  resume: ObjectId,
  status: String,
  appliedAt: Date,
  coverLetter: String,
  customFields: Object,
  timeline: [Object],
  interviews: [Object],
  assessments: [Object],
  communications: [Object],
  documents: [Object],
  ratings: Object,
  notes: [Object],
  analytics: Object,
  isStarred: Boolean
}
```

### Payment Model
```javascript
{
  payer: ObjectId,
  recipient: ObjectId,
  type: String,
  status: String,
  amount: Number,
  currency: String,
  paymentGateway: String,
  gatewayTransactionId: String,
  relatedJob: ObjectId,
  relatedReferral: ObjectId,
  billingDetails: Object,
  taxDetails: Object,
  receipt: Object,
  refunds: [Object],
  webhookData: [Object]
}
```

### Referral Model
```javascript
{
  referrer: ObjectId,
  referredCandidate: ObjectId,
  job: ObjectId,
  application: ObjectId,
  status: String,
  referralCode: String,
  referralLink: String,
  referredEmail: String,
  personalMessage: String,
  payout: Object,
  clicks: Number,
  clickHistory: [Object],
  candidateRegistered: Boolean,
  expiresAt: Date,
  campaign: Object,
  metadata: Object
}
```

### SystemSettings Model
```javascript
{
  category: String,
  key: String,
  value: Mixed,
  valueType: String,
  name: String,
  description: String,
  defaultValue: Mixed,
  validation: Object,
  isEditable: Boolean,
  isVisible: Boolean,
  isEncrypted: Boolean,
  changeHistory: [Object],
  lastUpdatedBy: ObjectId,
  environment: String
}
```

### Resume Model
```javascript
{
  user: ObjectId,
  title: String,
  type: String,
  personalInfo: Object,
  summary: String,
  experience: [Object],
  education: [Object],
  skills: [Object],
  projects: [Object],
  certifications: [Object],
  languages: [Object],
  achievements: [Object],
  fileInfo: Object,
  parsedData: Object,
  isActive: Boolean,
  isPublic: Boolean,
  template: String,
  analytics: Object
}
```

## Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow this standard format:
```javascript
{
  "status": "success" | "fail" | "error",
  "data": {
    // Response data
  },
  "message": "Optional message",
  "pagination": { // For paginated responses
    "total": 100,
    "page": 1,
    "pages": 10,
    "limit": 10
  }
}
```

## Error Handling

Errors are returned with appropriate HTTP status codes and error messages:
```javascript
{
  "status": "error",
  "error": {
    "statusCode": 400,
    "status": "fail",
    "message": "Validation error message"
  }
}
```

## Payment Integration

### Supported Gateways
- **Razorpay** (Primary for Indian market)
- **Stripe** (International)
- **PayPal** (Global)
- **UPI** (India)
- **Bank Transfer** (Manual)

### Payment Flow
1. Initiate payment with service type
2. Receive payment details from gateway
3. Complete payment via webhook
4. Update related entities (jobs, subscriptions)
5. Generate receipt automatically

### Webhook Security
All webhooks are validated using gateway-specific signatures and authenticity checks.

## Referral System

### Features
- Unique referral codes generation
- Click tracking with analytics
- Automatic payout calculation
- Multi-tier referral support
- Campaign tracking
- Bulk payout processing

### Payout Rules
- Configurable via system settings
- Based on salary percentage or fixed amount
- Tier-based payouts by job category
- Minimum/maximum amount limits
- Only paid after successful hire

## System Settings

### Categories
- `payment` - Payment system configuration
- `referral` - Referral system settings
- `subscription` - Subscription plans and pricing
- `notification` - Email/SMS notification settings
- `security` - Security policies and limits
- `general` - General platform settings
- `analytics` - Analytics and tracking settings
- `api` - API configuration
- `email` - Email service configuration

### Setting Types
- `string` - Text values
- `number` - Numeric values
- `boolean` - True/false values
- `array` - List of values
- `object` - Complex objects
- `date` - Date values

### Environment Support
Settings can be configured per environment:
- `development`
- `staging`
- `production`

## File Upload Support

### Supported File Types
- **Resumes**: PDF, DOC, DOCX (max 5MB)
- **Profile Pictures**: JPG, PNG, GIF (max 2MB)
- **Documents**: PDF, DOC, DOCX, TXT (max 10MB)

### Storage Options
- Local file system (development)
- AWS S3 (production)
- Google Cloud Storage (alternative)

## Security Features

- JWT-based authentication
- Role-based access control
- Rate limiting (100 requests/15 minutes)
- Input validation and sanitization
- Encrypted sensitive settings
- Secure file upload validation
- Payment webhook verification

## Performance Features

- Database indexing for optimal queries
- Pagination for large datasets
- Caching for frequently accessed data
- Optimized aggregation pipelines
- File compression and optimization

## Monitoring & Analytics

### Built-in Analytics
- User engagement metrics
- Job application conversion rates
- Payment success/failure rates
- Referral performance tracking
- Revenue analytics by time period
- Popular job categories and locations

### Health Monitoring
```
GET /api/health - System health check
```

Returns:
```javascript
{
  "status": "OK",
  "message": "Job Portal API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/jobportal
MONGODB_URI_TEST=mongodb://localhost:27017/jobportal_test

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Email
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# AWS S3 (Production)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-west-2
AWS_BUCKET_NAME=your_bucket_name

# Payment Gateways
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Redis (for caching)
REDIS_URL=redis://localhost:6379
```

## Getting Started

1. **Clone the repository**
```bash
git clone <repository-url>
cd job-portal-project/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo

# Or install locally
```

5. **Initialize system settings**
```bash
# Start the server first
npm start

# Then call the initialization endpoint
POST /api/settings/initialize
```

6. **Run the application**
```bash
# Development
npm run dev

# Production
npm start
```

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/auth.test.js
```

## API Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 10 requests per 15 minutes per IP
- **Payment**: 20 requests per 15 minutes per user
- **File Upload**: 10 requests per 15 minutes per user

## Pagination

Most list endpoints support pagination:
```javascript
// Request
GET /api/jobs?page=2&limit=20

// Response includes pagination info
{
  "pagination": {
    "total": 150,
    "page": 2,
    "pages": 8,
    "limit": 20
  }
}
```

## Filtering & Sorting

Many endpoints support filtering and sorting:
```javascript
// Filter jobs by location and category
GET /api/jobs?location=New York&category=Technology&sort=-createdAt

// Filter applications by status and date range
GET /api/applications?status=applied&dateFrom=2024-01-01&dateTo=2024-01-31
```

## Webhooks

### Payment Webhooks
```
POST /api/payments/webhook/razorpay
POST /api/payments/webhook/stripe
POST /api/payments/webhook/paypal
```

### Custom Webhooks (for integrations)
Configure webhook URLs in system settings to receive notifications for:
- New user registrations
- Job applications
- Payment completions
- Referral conversions

## Support & Maintenance

### Database Maintenance
- Regular backup procedures
- Index optimization
- Data cleanup scripts
- Performance monitoring

### Log Management
- Structured logging with Winston
- Log rotation and archival
- Error tracking and alerting
- Performance metrics collection

### Updates & Migrations
- Database migration scripts
- Backward compatibility
- Staged deployment process
- Rollback procedures

## API Versioning

The API uses URL versioning:
- Current version: `v1` (implied in `/api/` routes)
- Future versions: `/api/v2/`, `/api/v3/`, etc.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License.

---

For detailed information about specific endpoints, request/response formats, and integration examples, please refer to the individual controller and route files in the codebase.