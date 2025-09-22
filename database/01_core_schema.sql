-- ============================================================================
-- Job Portal Database Schema - Phase 1: Core Schema Design
-- PostgreSQL Database Schema
-- ============================================================================

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table: users
-- Purpose: Stores information for every individual user in the system
-- ============================================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'candidate' 
        CHECK (role IN ('candidate', 'recruiter', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Table: companies
-- Purpose: Stores information about organizations posting jobs
-- ============================================================================
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Table: jobs
-- Purpose: Central table for all job postings
-- ============================================================================
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    posted_by_recruiter_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255),
    salary_min INTEGER CHECK (salary_min >= 0),
    salary_max INTEGER CHECK (salary_max >= salary_min),
    experience_level VARCHAR(50) 
        CHECK (experience_level IN ('Entry-Level', 'Mid-Level', 'Senior-Level', 'Executive')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Table: applications
-- Purpose: Tracks every application submitted by candidates
-- ============================================================================
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Applied' 
        CHECK (status IN ('Applied', 'Shortlisted', 'Interviewed', 'Hired', 'Rejected')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Ensure a candidate can only apply once per job
    UNIQUE(job_id, candidate_id)
);

-- ============================================================================
-- Performance Indexes
-- ============================================================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Companies table indexes
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_created_at ON companies(created_at);

-- Jobs table indexes
CREATE INDEX idx_jobs_company_id ON jobs(company_id);
CREATE INDEX idx_jobs_posted_by_recruiter_id ON jobs(posted_by_recruiter_id);
CREATE INDEX idx_jobs_title ON jobs(title);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX idx_jobs_is_active ON jobs(is_active);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_jobs_salary_range ON jobs(salary_min, salary_max);

-- Applications table indexes
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_candidate_id ON applications(candidate_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_submitted_at ON applications(submitted_at);

-- ============================================================================
-- Data Integrity Comments
-- ============================================================================

COMMENT ON TABLE users IS 'Stores user accounts for candidates, recruiters, and admins';
COMMENT ON TABLE companies IS 'Company profiles and information';
COMMENT ON TABLE jobs IS 'Job postings with company and recruiter relationships';
COMMENT ON TABLE applications IS 'Job applications with status tracking';

COMMENT ON COLUMN users.role IS 'User role: candidate, recruiter, or admin';
COMMENT ON COLUMN jobs.posted_by_recruiter_id IS 'References the recruiter who created this job posting';
COMMENT ON COLUMN applications.status IS 'Application status: Applied, Shortlisted, Interviewed, Hired, Rejected';