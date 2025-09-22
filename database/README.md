# Job Portal Database - Complete Implementation (Phase 1, 2 & 3)

This directory contains the complete PostgreSQL database schema and related files for the Job Portal project. All three phases are implemented: Core functionality, Advanced features, and Production optimization with security, performance tuning, and monitoring.

## 📁 Files Overview

| File | Description |
|------|-------------|
| `01_core_schema.sql` | Phase 1 database schema with core tables |
| `02_sample_data.sql` | Phase 1 sample data for testing |
| `03_common_queries.sql` | Phase 1 useful queries for development |
| `04_phase2_schema.sql` | Phase 2 advanced features schema |
| `05_phase2_sample_data.sql` | Phase 2 sample data for testing |
| `06_phase2_queries.sql` | Phase 2 queries for advanced features |
| `07_phase3_optimization.sql` | Phase 3 performance optimization and security |
| `08_monitoring_maintenance.sql` | Performance monitoring and maintenance procedures |
| `init_database.sql` | Complete database initialization script (all phases) |
| `README.md` | This comprehensive documentation |

## 🗂️ Database Schema (Phase 1)

### Core Tables

#### 1. **users**
- Stores all user accounts (candidates, recruiters, admins)
- Key fields: `email`, `password_hash`, `first_name`, `last_name`, `role`
- Role validation: `candidate`, `recruiter`, `admin`

#### 2. **companies** 
- Company profiles and information
- Key fields: `name`, `description`, `website`, `logo_url`

#### 3. **jobs**
- Job postings with company and recruiter relationships
- Key fields: `title`, `description`, `location`, `salary_min/max`, `experience_level`
- Foreign keys: `company_id`, `posted_by_recruiter_id`

#### 4. **applications**
- Job applications with status tracking
- Key fields: `job_id`, `candidate_id`, `status`, `submitted_at`
- Status values: `Applied`, `Shortlisted`, `Interviewed`, `Hired`, `Rejected`

### Phase 2 Advanced Tables

#### 5. **resumes**
- Resume builder data with flexible JSONB storage
- Key fields: `user_id`, `template_name`, `resume_data`, `created_at`, `updated_at`
- Supports multiple resume templates and structured data

#### 6. **skills**
- Central repository of all skills in the system
- Key fields: `name`, `category`, `description`
- Categories: `Technical`, `Soft`, `Language`, `Certification`, `Industry`

#### 7. **resume_skills** & **job_skills**
- Many-to-many relationships for skill matching
- Links skills to resumes and job requirements
- Includes proficiency levels and weighting for matching algorithms

#### 8. **referrals**
- Employee referral system with reward tracking
- Key fields: `referrer_id`, `referred_candidate_email`, `status`, `reward_amount`
- Tracks complete referral lifecycle from pending to placement

#### 9. **payments**
- Financial transaction logging for all payments
- Key fields: `user_id`, `amount`, `purpose`, `status`, `transaction_id`
- Supports multiple payment purposes and gateways

#### 10. **resume_templates** & **skill_categories**
- Supporting tables for resume templates and skill organization
- Hierarchical skill categories and configurable resume templates

### Phase 3 Optimization Features

#### 11. **Materialized Views**
- `mv_applicant_skill_match`: Pre-calculated skill matching scores
- `mv_company_analytics`: Company performance metrics
- `mv_skills_analytics`: Skills demand and supply analysis

#### 12. **System Infrastructure**
- `system_logs`: Comprehensive audit trail and system monitoring
- Performance indexes: 25+ optimized indexes for fast queries
- Row-level security policies for data protection
- Database functions for common operations and maintenance

## 🚀 Quick Setup

### Prerequisites
- PostgreSQL 12+ installed
- Database user with CREATE DATABASE privileges

### Setup Steps

1. **Create Database and User** (as PostgreSQL superuser):
   ```sql
   CREATE DATABASE job_portal_db;
   CREATE USER job_portal_user WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE job_portal_db TO job_portal_user;
   ```

2. **Connect to Database**:
   ```bash
   psql -h localhost -U job_portal_user -d job_portal_db
   ```

3. **Initialize Schema**:
   ```sql
   \i init_database.sql
   ```

### Alternative: Individual File Setup

If you prefer to run files individually:

```sql
-- 1. Create core schema
\i 01_core_schema.sql

-- 2. Load sample data (optional)
\i 02_sample_data.sql
```

## 📊 Sample Data

The `02_sample_data.sql` file includes:
- 5 sample users (2 candidates, 2 recruiters, 1 admin)
- 4 sample companies
- 6 sample job postings
- 8 sample applications with various statuses

## 🔍 Common Operations

### User Management
```sql
-- Create a new candidate
INSERT INTO users (email, password_hash, first_name, last_name, role) 
VALUES ('newuser@email.com', '$2b$10$hashed_password', 'John', 'Doe', 'candidate');

-- Find user by email
SELECT * FROM users WHERE email = 'user@email.com';
```

### Job Listings
```sql
-- Get all active jobs
SELECT j.*, c.name as company_name 
FROM jobs j 
JOIN companies c ON j.company_id = c.id 
WHERE j.is_active = TRUE;

-- Search jobs by location
SELECT * FROM jobs 
WHERE is_active = TRUE AND location ILIKE '%bhopal%';
```

### Application Tracking
```sql
-- Submit new application
INSERT INTO applications (job_id, candidate_id, status) 
VALUES (1, 2, 'Applied');

-- Get candidate's applications
SELECT a.*, j.title, c.name as company_name 
FROM applications a 
JOIN jobs j ON a.job_id = j.id 
JOIN companies c ON j.company_id = c.id 
WHERE a.candidate_id = 1;
```

## 🔧 Performance Features

### Indexes
The schema includes optimized indexes for:
- User email lookups
- Job searching by location, title, and experience level
- Application tracking by job and candidate
- Company name searches

### Constraints
- Email uniqueness for users
- Salary range validation (min ≤ max)
- Role and status validation using CHECK constraints
- Foreign key relationships with appropriate CASCADE rules

## 🧪 Testing Queries

Use the queries in `03_common_queries.sql` for:
- User management operations
- Job search functionality
- Application tracking
- Analytics and reporting
- Data validation
- Performance testing

## 📈 Next Steps (Future Phases)

This Phase 1 schema provides the foundation for:
- **Phase 2**: Enhanced profiles, skills, and matching
- **Phase 3**: Advanced features like messaging, reviews, etc.
- **Phase 4**: Analytics and reporting dashboards

## 🔒 Security Considerations

1. **Password Storage**: Always hash passwords using bcrypt or similar
2. **Database User**: Use a dedicated database user with minimal required privileges
3. **Connection Security**: Use SSL/TLS for database connections in production
4. **Input Validation**: Validate all inputs at the application level

## 📝 Development Notes

- All timestamps use `TIMESTAMP WITH TIME ZONE` for timezone awareness
- Serial IDs are used for primary keys (consider UUIDs for distributed systems)
- Check constraints ensure data integrity
- Foreign key relationships maintain referential integrity

## 🆘 Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure database user has proper privileges
2. **Connection Failed**: Check PostgreSQL service and connection parameters
3. **Constraint Violations**: Review data being inserted against schema constraints

### Useful Commands

```sql
-- Check table structure
\d table_name

-- View all tables
\dt

-- Check indexes
\di

-- View constraints
\d+ table_name
```

---

**Created for Job Portal Project - Phase 1**  
*Database schema designed for scalability and performance*