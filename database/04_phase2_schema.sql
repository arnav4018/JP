-- ============================================================================
-- Job Portal Database Schema - Phase 2: Advanced Features
-- PostgreSQL Database Schema - Extension for Resume Builder, Skills, Referrals, Payments
-- ============================================================================

-- ============================================================================
-- Table: resumes
-- Purpose: Stores data from the online resume builder with flexible JSONB structure
-- ============================================================================
CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_name VARCHAR(50) CHECK (template_name IN ('Modern', 'Classic', 'Professional', 'Creative', 'Minimalist')),
    resume_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    -- Ensure one user can have multiple resumes but limit reasonable number
    CONSTRAINT reasonable_resume_limit CHECK (
        (SELECT COUNT(*) FROM resumes r WHERE r.user_id = resumes.user_id) <= 10
    )
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on resumes
CREATE TRIGGER update_resumes_updated_at 
    BEFORE UPDATE ON resumes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: skills
-- Purpose: Central repository of all unique skills in the system
-- ============================================================================
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) CHECK (category IN ('Technical', 'Soft', 'Language', 'Certification', 'Industry')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Junction Table: resume_skills
-- Purpose: Many-to-many relationship between resumes and skills
-- ============================================================================
CREATE TABLE resume_skills (
    resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level VARCHAR(20) DEFAULT 'Intermediate' 
        CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    years_of_experience INTEGER CHECK (years_of_experience >= 0 AND years_of_experience <= 50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (resume_id, skill_id)
);

-- ============================================================================
-- Junction Table: job_skills
-- Purpose: Many-to-many relationship between jobs and required skills
-- ============================================================================
CREATE TABLE job_skills (
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    required_level VARCHAR(20) DEFAULT 'Intermediate' 
        CHECK (required_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    is_mandatory BOOLEAN DEFAULT FALSE,
    weight INTEGER DEFAULT 1 CHECK (weight >= 1 AND weight <= 10), -- For skill matching algorithms
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (job_id, skill_id)
);

-- ============================================================================
-- Table: referrals
-- Purpose: Tracks the entire referral lifecycle and rewards
-- ============================================================================
CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_candidate_email VARCHAR(255) NOT NULL,
    job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
    application_id INTEGER UNIQUE REFERENCES applications(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Pending' 
        CHECK (status IN ('Pending', 'Interview', 'Placed', 'Expired', 'Declined')),
    referral_code VARCHAR(50) UNIQUE, -- Unique code for tracking
    reward_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (reward_amount >= 0),
    reward_status VARCHAR(30) DEFAULT 'Pending' 
        CHECK (reward_status IN ('Pending', 'Eligible', 'Paid', 'Forfeited')),
    expires_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to auto-update updated_at on referrals
CREATE TRIGGER update_referrals_updated_at 
    BEFORE UPDATE ON referrals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Table: payments
-- Purpose: Logs all financial transactions in the system
-- ============================================================================
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'INR' CHECK (currency IN ('INR', 'USD', 'EUR', 'GBP')),
    purpose VARCHAR(100) NOT NULL 
        CHECK (purpose IN ('job_feature', 'subscription', 'referral_payout', 'premium_profile', 'job_boost', 'featured_listing')),
    status VARCHAR(50) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
    transaction_id VARCHAR(255) UNIQUE,
    payment_method VARCHAR(50), -- e.g., 'stripe', 'razorpay', 'paypal'
    gateway_response JSONB, -- Store full gateway response for debugging
    reference_id INTEGER, -- Can reference job_id, referral_id, etc.
    reference_type VARCHAR(50), -- 'job', 'referral', 'subscription', etc.
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Additional Utility Tables for Phase 2
-- ============================================================================

-- Table: resume_templates
-- Purpose: Store available resume templates and their configurations
CREATE TABLE resume_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    preview_image_url VARCHAR(500),
    template_config JSONB, -- Store template-specific configuration
    is_premium BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: skill_categories
-- Purpose: Organize skills into hierarchical categories
CREATE TABLE skill_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    parent_category_id INTEGER REFERENCES skill_categories(id),
    description TEXT,
    icon VARCHAR(100), -- Icon name or URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Performance Indexes for Phase 2
-- ============================================================================

-- Resumes table indexes
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_resumes_template_name ON resumes(template_name);
CREATE INDEX idx_resumes_updated_at ON resumes(updated_at);
CREATE INDEX idx_resumes_created_at ON resumes(created_at);
-- JSONB indexes for resume_data searches
CREATE INDEX idx_resumes_data_gin ON resumes USING GIN (resume_data);

-- Skills table indexes
CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_name_trgm ON skills USING GIN (name gin_trgm_ops); -- Requires pg_trgm extension

-- Resume_skills junction table indexes
CREATE INDEX idx_resume_skills_resume_id ON resume_skills(resume_id);
CREATE INDEX idx_resume_skills_skill_id ON resume_skills(skill_id);
CREATE INDEX idx_resume_skills_proficiency ON resume_skills(proficiency_level);

-- Job_skills junction table indexes
CREATE INDEX idx_job_skills_job_id ON job_skills(job_id);
CREATE INDEX idx_job_skills_skill_id ON job_skills(skill_id);
CREATE INDEX idx_job_skills_mandatory ON job_skills(is_mandatory);
CREATE INDEX idx_job_skills_weight ON job_skills(weight);

-- Referrals table indexes
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_email ON referrals(referred_candidate_email);
CREATE INDEX idx_referrals_job_id ON referrals(job_id);
CREATE INDEX idx_referrals_application_id ON referrals(application_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_reward_status ON referrals(reward_status);
CREATE INDEX idx_referrals_expires_at ON referrals(expires_at);

-- Payments table indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_purpose ON payments(purpose);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX idx_payments_reference ON payments(reference_type, reference_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);
CREATE INDEX idx_payments_amount ON payments(amount);

-- Resume_templates indexes
CREATE INDEX idx_resume_templates_active ON resume_templates(is_active);
CREATE INDEX idx_resume_templates_premium ON resume_templates(is_premium);

-- Skill_categories indexes
CREATE INDEX idx_skill_categories_parent ON skill_categories(parent_category_id);
CREATE INDEX idx_skill_categories_name ON skill_categories(name);

-- ============================================================================
-- Data Integrity Comments for Phase 2
-- ============================================================================

COMMENT ON TABLE resumes IS 'Resume builder data with flexible JSONB storage';
COMMENT ON TABLE skills IS 'Central repository of all skills in the system';
COMMENT ON TABLE resume_skills IS 'Many-to-many relationship between resumes and skills';
COMMENT ON TABLE job_skills IS 'Many-to-many relationship between jobs and required skills';
COMMENT ON TABLE referrals IS 'Employee referral system with reward tracking';
COMMENT ON TABLE payments IS 'Financial transaction logging for all payments';
COMMENT ON TABLE resume_templates IS 'Available resume templates and configurations';
COMMENT ON TABLE skill_categories IS 'Hierarchical organization of skills';

COMMENT ON COLUMN resumes.resume_data IS 'JSONB containing structured resume content';
COMMENT ON COLUMN resumes.template_name IS 'Template used: Modern, Classic, Professional, Creative, Minimalist';
COMMENT ON COLUMN job_skills.weight IS 'Skill importance weight (1-10) for matching algorithms';
COMMENT ON COLUMN referrals.referral_code IS 'Unique tracking code for the referral';
COMMENT ON COLUMN payments.gateway_response IS 'Full payment gateway response for debugging';
COMMENT ON COLUMN payments.reference_type IS 'Type of entity this payment relates to';

-- ============================================================================
-- Enable Required Extensions
-- ============================================================================

-- Enable trigram extension for fuzzy text search (skill name matching)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable additional JSONB operators
CREATE EXTENSION IF NOT EXISTS btree_gin;