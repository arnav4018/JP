-- ============================================================================
-- Job Portal Database Setup Script
-- Run this as PostgreSQL superuser (postgres) to create database and user
-- ============================================================================

-- Create the database
CREATE DATABASE job_portal_db;

-- Create a user for the job portal application
CREATE USER job_portal_user WITH ENCRYPTED PASSWORD 'job_portal_2024';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE job_portal_db TO job_portal_user;

-- Connect to the new database
\c job_portal_db;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO job_portal_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO job_portal_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO job_portal_user;

-- Show confirmation
SELECT 'Database job_portal_db created successfully!' as message;
SELECT 'User job_portal_user created with full access' as message;