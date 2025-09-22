-- ============================================================================
-- Job Portal Database - Common Queries
-- Useful queries for development and testing
-- ============================================================================

-- ============================================================================
-- User Management Queries
-- ============================================================================

-- Get all users by role
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
WHERE role = 'candidate'
ORDER BY created_at DESC;

-- Find user by email
SELECT id, email, first_name, last_name, role, created_at 
FROM users 
WHERE email = 'john.doe@email.com';

-- Count users by role
SELECT role, COUNT(*) as user_count 
FROM users 
GROUP BY role 
ORDER BY user_count DESC;

-- ============================================================================
-- Company Queries
-- ============================================================================

-- Get all companies with their job counts
SELECT 
    c.id,
    c.name,
    c.description,
    c.website,
    COUNT(j.id) as active_jobs
FROM companies c
LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = TRUE
GROUP BY c.id, c.name, c.description, c.website
ORDER BY active_jobs DESC, c.name;

-- ============================================================================
-- Job Listings Queries
-- ============================================================================

-- Get all active jobs with company and recruiter info
SELECT 
    j.id,
    j.title,
    j.location,
    j.salary_min,
    j.salary_max,
    j.experience_level,
    c.name as company_name,
    u.first_name || ' ' || u.last_name as posted_by,
    j.created_at
FROM jobs j
JOIN companies c ON j.company_id = c.id
JOIN users u ON j.posted_by_recruiter_id = u.id
WHERE j.is_active = TRUE
ORDER BY j.created_at DESC;

-- Search jobs by location
SELECT 
    j.id,
    j.title,
    j.location,
    j.salary_min,
    j.salary_max,
    c.name as company_name
FROM jobs j
JOIN companies c ON j.company_id = c.id
WHERE j.is_active = TRUE 
  AND j.location ILIKE '%bhopal%'
ORDER BY j.created_at DESC;

-- Search jobs by salary range
SELECT 
    j.id,
    j.title,
    j.location,
    j.salary_min,
    j.salary_max,
    c.name as company_name
FROM jobs j
JOIN companies c ON j.company_id = c.id
WHERE j.is_active = TRUE 
  AND j.salary_max >= 800000  -- Minimum desired salary
ORDER BY j.salary_max DESC;

-- Search jobs by experience level
SELECT 
    j.id,
    j.title,
    j.location,
    j.experience_level,
    c.name as company_name
FROM jobs j
JOIN companies c ON j.company_id = c.id
WHERE j.is_active = TRUE 
  AND j.experience_level = 'Mid-Level'
ORDER BY j.created_at DESC;

-- ============================================================================
-- Application Tracking Queries
-- ============================================================================

-- Get all applications for a specific job
SELECT 
    a.id,
    u.first_name || ' ' || u.last_name as candidate_name,
    u.email,
    a.status,
    a.submitted_at,
    j.title as job_title
FROM applications a
JOIN users u ON a.candidate_id = u.id
JOIN jobs j ON a.job_id = j.id
WHERE a.job_id = 1
ORDER BY a.submitted_at DESC;

-- Get all applications by a specific candidate
SELECT 
    a.id,
    j.title,
    c.name as company_name,
    a.status,
    a.submitted_at
FROM applications a
JOIN jobs j ON a.job_id = j.id
JOIN companies c ON j.company_id = c.id
WHERE a.candidate_id = 1
ORDER BY a.submitted_at DESC;

-- Application statistics by status
SELECT 
    status,
    COUNT(*) as application_count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM applications
GROUP BY status
ORDER BY application_count DESC;

-- Recent applications (last 7 days)
SELECT 
    u.first_name || ' ' || u.last_name as candidate_name,
    j.title as job_title,
    c.name as company_name,
    a.status,
    a.submitted_at
FROM applications a
JOIN users u ON a.candidate_id = u.id
JOIN jobs j ON a.job_id = j.id
JOIN companies c ON j.company_id = c.id
WHERE a.submitted_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY a.submitted_at DESC;

-- ============================================================================
-- Analytics Queries
-- ============================================================================

-- Most popular companies (by application count)
SELECT 
    c.name,
    COUNT(a.id) as total_applications
FROM companies c
JOIN jobs j ON c.id = j.company_id
JOIN applications a ON j.id = a.job_id
GROUP BY c.id, c.name
ORDER BY total_applications DESC
LIMIT 10;

-- Job posting trends (by month)
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as jobs_posted
FROM jobs
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Application success rate by experience level
SELECT 
    j.experience_level,
    COUNT(a.id) as total_applications,
    COUNT(CASE WHEN a.status = 'Hired' THEN 1 END) as hired_count,
    ROUND(
        COUNT(CASE WHEN a.status = 'Hired' THEN 1 END) * 100.0 / COUNT(a.id), 
        2
    ) as success_rate_percentage
FROM jobs j
JOIN applications a ON j.id = a.job_id
GROUP BY j.experience_level
ORDER BY success_rate_percentage DESC;

-- ============================================================================
-- Data Validation Queries
-- ============================================================================

-- Check for orphaned records
SELECT 'Orphaned Applications (no job)' as issue, COUNT(*) as count
FROM applications a
LEFT JOIN jobs j ON a.job_id = j.id
WHERE j.id IS NULL

UNION ALL

SELECT 'Orphaned Applications (no candidate)', COUNT(*)
FROM applications a
LEFT JOIN users u ON a.candidate_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 'Orphaned Jobs (no company)', COUNT(*)
FROM jobs j
LEFT JOIN companies c ON j.company_id = c.id
WHERE c.id IS NULL

UNION ALL

SELECT 'Jobs without recruiter', COUNT(*)
FROM jobs j
LEFT JOIN users u ON j.posted_by_recruiter_id = u.id
WHERE u.id IS NULL OR u.role != 'recruiter';

-- ============================================================================
-- Performance Testing Queries
-- ============================================================================

-- Query execution time test
EXPLAIN ANALYZE
SELECT 
    j.id,
    j.title,
    c.name as company_name,
    COUNT(a.id) as application_count
FROM jobs j
JOIN companies c ON j.company_id = c.id
LEFT JOIN applications a ON j.id = a.job_id
WHERE j.is_active = TRUE
GROUP BY j.id, j.title, c.name
ORDER BY application_count DESC;