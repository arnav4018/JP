-- ============================================================================
-- Job Portal Database - Complete Initialization Script
-- This script sets up the entire database from scratch
-- ============================================================================

-- Connect to PostgreSQL as superuser and create database
-- Run these commands separately as they require superuser privileges:
-- 
-- CREATE DATABASE job_portal_db;
-- CREATE USER job_portal_user WITH ENCRYPTED PASSWORD 'your_secure_password';
-- GRANT ALL PRIVILEGES ON DATABASE job_portal_db TO job_portal_user;
-- \c job_portal_db;

-- ============================================================================
-- Phase 1: Core Schema Setup
-- ============================================================================

\echo 'Setting up core database schema (Phase 1)...'

-- Execute the core schema
\i 01_core_schema.sql

\echo 'Phase 1 schema created successfully!'

-- ============================================================================
-- Phase 2: Advanced Features Setup
-- ============================================================================

\echo 'Setting up advanced features schema (Phase 2)...'

-- Execute Phase 2 schema
\i 04_phase2_schema.sql

\echo 'Phase 2 schema created successfully!'

-- ============================================================================
-- Phase 3: Optimization & Finalization
-- ============================================================================

\echo 'Applying Phase 3 optimizations...'

-- Execute Phase 3 optimizations
\i 07_phase3_optimization.sql

\echo 'Loading monitoring and maintenance procedures...'

-- Execute monitoring and maintenance setup
\i 08_monitoring_maintenance.sql

\echo 'Phase 3 optimizations completed successfully!'

-- ============================================================================
-- Load Sample Data for All Phases
-- ============================================================================

\echo 'Loading Phase 1 sample data...'

-- Execute Phase 1 sample data
\i 02_sample_data.sql

\echo 'Loading Phase 2 sample data...'

-- Execute Phase 2 sample data
\i 05_phase2_sample_data.sql

\echo 'All sample data loaded successfully!'

-- ============================================================================
-- Verification Queries
-- ============================================================================

\echo 'Verifying database setup...'

-- Count records in each table (Phase 1 & 2)
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'companies', COUNT(*) FROM companies  
UNION ALL
SELECT 'jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'applications', COUNT(*) FROM applications
UNION ALL
SELECT 'resumes', COUNT(*) FROM resumes
UNION ALL
SELECT 'skills', COUNT(*) FROM skills
UNION ALL
SELECT 'resume_skills', COUNT(*) FROM resume_skills
UNION ALL
SELECT 'job_skills', COUNT(*) FROM job_skills
UNION ALL
SELECT 'referrals', COUNT(*) FROM referrals
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'resume_templates', COUNT(*) FROM resume_templates
UNION ALL
SELECT 'skill_categories', COUNT(*) FROM skill_categories;

-- Show table sizes and indexes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

\echo 'Database initialization completed successfully!'
\echo 'Your Job Portal database (All 3 Phases) is ready for production!'
\echo 'Core Features: Users, Companies, Jobs, Applications'
\echo 'Advanced Features: Resume Builder, Skill Matching, Referral System, Payment Processing'
\echo 'Optimization Features: Performance Indexes, Materialized Views, Security Policies, Monitoring'
\echo ''
\echo 'Database is optimized for scale with 25+ performance indexes, automated maintenance,'  
\echo 'materialized views for fast skill matching, and comprehensive monitoring tools.'
