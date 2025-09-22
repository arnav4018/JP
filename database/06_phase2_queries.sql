-- ============================================================================
-- Job Portal Database - Phase 2 Common Queries
-- Queries for Resume Builder, Skills, Referrals, and Payments functionality
-- ============================================================================

-- ============================================================================
-- Resume Builder Queries
-- ============================================================================

-- Get user's resumes with basic info
SELECT 
    r.id,
    r.template_name,
    r.resume_data->>'personal'->>'firstName' || ' ' || r.resume_data->>'personal'->>'lastName' as full_name,
    r.created_at,
    r.updated_at
FROM resumes r
WHERE r.user_id = 1
ORDER BY r.updated_at DESC;

-- Get full resume data for editing
SELECT 
    id,
    template_name,
    resume_data,
    created_at,
    updated_at
FROM resumes 
WHERE id = 1 AND user_id = 1;

-- Search resumes by experience in specific company
SELECT 
    r.id,
    r.user_id,
    u.email,
    r.resume_data->>'personal'->>'firstName' || ' ' || r.resume_data->>'personal'->>'lastName' as full_name
FROM resumes r
JOIN users u ON r.user_id = u.id
WHERE r.resume_data->'experience' @> '[{"company": "StartupXYZ"}]';

-- Get resumes with specific skills
SELECT DISTINCT
    r.id,
    r.user_id,
    r.resume_data->>'personal'->>'firstName' || ' ' || r.resume_data->>'personal'->>'lastName' as full_name,
    s.name as skill_name,
    rs.proficiency_level,
    rs.years_of_experience
FROM resumes r
JOIN resume_skills rs ON r.id = rs.resume_id
JOIN skills s ON rs.skill_id = s.id
WHERE s.name = 'React'
ORDER BY rs.proficiency_level DESC, rs.years_of_experience DESC;

-- ============================================================================
-- Skills Management Queries
-- ============================================================================

-- Get all skills by category
SELECT 
    s.id,
    s.name,
    s.category,
    s.description,
    COUNT(rs.resume_id) as used_in_resumes,
    COUNT(js.job_id) as required_in_jobs
FROM skills s
LEFT JOIN resume_skills rs ON s.id = rs.skill_id
LEFT JOIN job_skills js ON s.id = js.skill_id
GROUP BY s.id, s.name, s.category, s.description
ORDER BY s.category, used_in_resumes DESC;

-- Search skills by name (fuzzy search using trigram)
SELECT 
    id,
    name,
    category,
    similarity(name, 'javascript') as similarity_score
FROM skills
WHERE name % 'javascript'
ORDER BY similarity_score DESC;

-- Get skill categories with hierarchy
WITH RECURSIVE skill_tree AS (
    -- Base case: root categories
    SELECT id, name, parent_category_id, 0 as level, name as path
    FROM skill_categories 
    WHERE parent_category_id IS NULL
    
    UNION ALL
    
    -- Recursive case: child categories
    SELECT sc.id, sc.name, sc.parent_category_id, st.level + 1, st.path || ' > ' || sc.name
    FROM skill_categories sc
    JOIN skill_tree st ON sc.parent_category_id = st.id
)
SELECT * FROM skill_tree ORDER BY path;

-- Most in-demand skills (based on job requirements)
SELECT 
    s.name,
    s.category,
    COUNT(js.job_id) as job_demand,
    COUNT(CASE WHEN js.is_mandatory THEN 1 END) as mandatory_count,
    AVG(js.weight) as avg_importance
FROM skills s
JOIN job_skills js ON s.id = js.skill_id
JOIN jobs j ON js.job_id = j.id
WHERE j.is_active = TRUE
GROUP BY s.id, s.name, s.category
ORDER BY job_demand DESC, avg_importance DESC
LIMIT 20;

-- ============================================================================
-- Skill Matching Queries
-- ============================================================================

-- Find candidates matching job requirements
WITH job_requirements AS (
    SELECT 
        js.skill_id,
        js.required_level,
        js.is_mandatory,
        js.weight
    FROM job_skills js
    WHERE js.job_id = 1
),
candidate_skills AS (
    SELECT 
        r.user_id,
        rs.skill_id,
        rs.proficiency_level,
        rs.years_of_experience,
        CASE rs.proficiency_level
            WHEN 'Beginner' THEN 1
            WHEN 'Intermediate' THEN 2
            WHEN 'Advanced' THEN 3
            WHEN 'Expert' THEN 4
        END as skill_level
    FROM resumes r
    JOIN resume_skills rs ON r.id = rs.resume_id
),
skill_match AS (
    SELECT 
        cs.user_id,
        COUNT(CASE WHEN jr.is_mandatory AND cs.skill_level >= 
            CASE jr.required_level
                WHEN 'Beginner' THEN 1
                WHEN 'Intermediate' THEN 2
                WHEN 'Advanced' THEN 3
                WHEN 'Expert' THEN 4
            END THEN 1 END) as mandatory_matches,
        COUNT(CASE WHEN jr.is_mandatory THEN 1 END) as total_mandatory,
        SUM(jr.weight * LEAST(cs.skill_level, 4)) as weighted_score
    FROM candidate_skills cs
    JOIN job_requirements jr ON cs.skill_id = jr.skill_id
    GROUP BY cs.user_id
)
SELECT 
    u.id,
    u.first_name || ' ' || u.last_name as candidate_name,
    u.email,
    sm.mandatory_matches,
    sm.total_mandatory,
    sm.weighted_score,
    ROUND(sm.mandatory_matches * 100.0 / NULLIF(sm.total_mandatory, 0), 2) as mandatory_match_percentage
FROM skill_match sm
JOIN users u ON sm.user_id = u.id
WHERE u.role = 'candidate'
  AND sm.mandatory_matches = sm.total_mandatory -- Must have all mandatory skills
ORDER BY sm.weighted_score DESC, sm.mandatory_match_percentage DESC;

-- Job recommendations for a candidate
WITH candidate_skills AS (
    SELECT 
        rs.skill_id,
        rs.proficiency_level,
        CASE rs.proficiency_level
            WHEN 'Beginner' THEN 1
            WHEN 'Intermediate' THEN 2
            WHEN 'Advanced' THEN 3
            WHEN 'Expert' THEN 4
        END as skill_level
    FROM resumes r
    JOIN resume_skills rs ON r.id = rs.resume_id
    WHERE r.user_id = 1
),
job_matches AS (
    SELECT 
        j.id,
        j.title,
        c.name as company_name,
        j.location,
        j.salary_min,
        j.salary_max,
        COUNT(CASE WHEN js.is_mandatory AND cs.skill_level >= 
            CASE js.required_level
                WHEN 'Beginner' THEN 1
                WHEN 'Intermediate' THEN 2
                WHEN 'Advanced' THEN 3
                WHEN 'Expert' THEN 4
            END THEN 1 END) as mandatory_matches,
        COUNT(CASE WHEN js.is_mandatory THEN 1 END) as total_mandatory,
        SUM(js.weight) as total_weight,
        SUM(CASE WHEN cs.skill_id IS NOT NULL THEN js.weight ELSE 0 END) as matched_weight
    FROM jobs j
    JOIN companies c ON j.company_id = c.id
    LEFT JOIN job_skills js ON j.id = js.job_id
    LEFT JOIN candidate_skills cs ON js.skill_id = cs.skill_id
    WHERE j.is_active = TRUE
    GROUP BY j.id, j.title, c.name, j.location, j.salary_min, j.salary_max
)
SELECT 
    id,
    title,
    company_name,
    location,
    salary_min,
    salary_max,
    mandatory_matches,
    total_mandatory,
    ROUND(mandatory_matches * 100.0 / NULLIF(total_mandatory, 0), 2) as mandatory_match_percentage,
    ROUND(matched_weight * 100.0 / NULLIF(total_weight, 0), 2) as skill_match_percentage
FROM job_matches
WHERE mandatory_matches = total_mandatory OR total_mandatory = 0
ORDER BY skill_match_percentage DESC, mandatory_match_percentage DESC
LIMIT 10;

-- ============================================================================
-- Referrals Management Queries
-- ============================================================================

-- Get all referrals by a user
SELECT 
    r.id,
    r.referred_candidate_email,
    j.title as job_title,
    c.name as company_name,
    r.status,
    r.reward_amount,
    r.reward_status,
    r.referral_code,
    r.created_at,
    r.expires_at
FROM referrals r
LEFT JOIN jobs j ON r.job_id = j.id
LEFT JOIN companies c ON j.company_id = c.id
WHERE r.referrer_id = 3
ORDER BY r.created_at DESC;

-- Track referral conversion funnel
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM referrals
GROUP BY status
ORDER BY 
    CASE status
        WHEN 'Pending' THEN 1
        WHEN 'Interview' THEN 2
        WHEN 'Placed' THEN 3
        WHEN 'Expired' THEN 4
        WHEN 'Declined' THEN 5
    END;

-- Referral rewards summary
SELECT 
    u.first_name || ' ' || u.last_name as referrer_name,
    u.email,
    COUNT(r.id) as total_referrals,
    COUNT(CASE WHEN r.status = 'Placed' THEN 1 END) as successful_referrals,
    SUM(CASE WHEN r.reward_status = 'Paid' THEN r.reward_amount ELSE 0 END) as total_rewards_paid,
    SUM(CASE WHEN r.reward_status = 'Eligible' THEN r.reward_amount ELSE 0 END) as pending_rewards
FROM users u
LEFT JOIN referrals r ON u.id = r.referrer_id
WHERE u.role IN ('recruiter', 'candidate')
GROUP BY u.id, u.first_name, u.last_name, u.email
HAVING COUNT(r.id) > 0
ORDER BY total_rewards_paid DESC;

-- Expired referrals that need cleanup
SELECT 
    r.id,
    r.referral_code,
    r.referred_candidate_email,
    j.title as job_title,
    r.expires_at,
    r.status
FROM referrals r
LEFT JOIN jobs j ON r.job_id = j.id
WHERE r.expires_at < CURRENT_TIMESTAMP 
  AND r.status = 'Pending'
ORDER BY r.expires_at;

-- ============================================================================
-- Payments and Financial Queries
-- ============================================================================

-- Payment summary by user
SELECT 
    u.first_name || ' ' || u.last_name as user_name,
    u.email,
    COUNT(p.id) as total_transactions,
    SUM(CASE WHEN p.status = 'succeeded' THEN p.amount ELSE 0 END) as total_successful_payments,
    SUM(CASE WHEN p.purpose = 'referral_payout' AND p.status = 'succeeded' THEN p.amount ELSE 0 END) as referral_earnings,
    AVG(CASE WHEN p.status = 'succeeded' THEN p.amount END) as avg_payment_amount
FROM users u
LEFT JOIN payments p ON u.id = p.user_id
GROUP BY u.id, u.first_name, u.last_name, u.email
HAVING COUNT(p.id) > 0
ORDER BY total_successful_payments DESC;

-- Revenue analysis by purpose
SELECT 
    purpose,
    COUNT(*) as transaction_count,
    SUM(amount) as total_revenue,
    AVG(amount) as avg_transaction_value,
    COUNT(CASE WHEN status = 'succeeded' THEN 1 END) as successful_count,
    ROUND(COUNT(CASE WHEN status = 'succeeded' THEN 1 END) * 100.0 / COUNT(*), 2) as success_rate
FROM payments
GROUP BY purpose
ORDER BY total_revenue DESC;

-- Failed payments analysis
SELECT 
    DATE_TRUNC('day', created_at) as payment_date,
    COUNT(*) as total_attempts,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
    ROUND(COUNT(CASE WHEN status = 'failed' THEN 1 END) * 100.0 / COUNT(*), 2) as failure_rate,
    SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END) as lost_revenue
FROM payments
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY payment_date DESC;

-- Pending payments requiring action
SELECT 
    p.id,
    u.first_name || ' ' || u.last_name as user_name,
    p.amount,
    p.purpose,
    p.transaction_id,
    p.created_at,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - p.created_at))/3600 as hours_pending
FROM payments p
JOIN users u ON p.user_id = u.id
WHERE p.status = 'pending' 
  AND p.created_at < CURRENT_TIMESTAMP - INTERVAL '1 hour'
ORDER BY p.created_at;

-- ============================================================================
-- Resume Templates and Analytics
-- ============================================================================

-- Template usage statistics
SELECT 
    rt.name,
    rt.display_name,
    rt.is_premium,
    COUNT(r.id) as usage_count,
    ROUND(COUNT(r.id) * 100.0 / SUM(COUNT(r.id)) OVER (), 2) as usage_percentage
FROM resume_templates rt
LEFT JOIN resumes r ON rt.name = r.template_name
WHERE rt.is_active = TRUE
GROUP BY rt.id, rt.name, rt.display_name, rt.is_premium
ORDER BY usage_count DESC;

-- Premium vs Free template adoption
SELECT 
    CASE WHEN rt.is_premium THEN 'Premium' ELSE 'Free' END as template_type,
    COUNT(r.id) as resumes_created,
    COUNT(DISTINCT r.user_id) as unique_users
FROM resume_templates rt
LEFT JOIN resumes r ON rt.name = r.template_name
WHERE rt.is_active = TRUE
GROUP BY rt.is_premium
ORDER BY resumes_created DESC;

-- ============================================================================
-- Advanced Analytics Queries
-- ============================================================================

-- Skill demand vs supply analysis
WITH skill_demand AS (
    SELECT 
        s.name,
        COUNT(js.job_id) as jobs_requiring,
        SUM(js.weight) as total_demand_weight
    FROM skills s
    JOIN job_skills js ON s.id = js.skill_id
    JOIN jobs j ON js.job_id = j.id
    WHERE j.is_active = TRUE
    GROUP BY s.id, s.name
),
skill_supply AS (
    SELECT 
        s.name,
        COUNT(rs.resume_id) as candidates_with_skill,
        AVG(CASE rs.proficiency_level
            WHEN 'Beginner' THEN 1
            WHEN 'Intermediate' THEN 2
            WHEN 'Advanced' THEN 3
            WHEN 'Expert' THEN 4
        END) as avg_proficiency
    FROM skills s
    JOIN resume_skills rs ON s.id = rs.skill_id
    GROUP BY s.id, s.name
)
SELECT 
    sd.name as skill_name,
    sd.jobs_requiring,
    COALESCE(ss.candidates_with_skill, 0) as candidates_available,
    ROUND(sd.jobs_requiring::decimal / NULLIF(ss.candidates_with_skill, 0), 2) as demand_supply_ratio,
    ROUND(ss.avg_proficiency, 2) as avg_candidate_proficiency
FROM skill_demand sd
LEFT JOIN skill_supply ss ON sd.name = ss.name
ORDER BY demand_supply_ratio DESC NULLS FIRST;

-- User engagement analytics
SELECT 
    u.id,
    u.first_name || ' ' || u.last_name as user_name,
    u.role,
    COUNT(DISTINCT r.id) as resumes_created,
    COUNT(DISTINCT a.id) as applications_submitted,
    COUNT(DISTINCT ref.id) as referrals_made,
    COUNT(DISTINCT p.id) as payments_made,
    u.created_at as registration_date,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - u.created_at))/86400 as days_since_registration
FROM users u
LEFT JOIN resumes r ON u.id = r.user_id
LEFT JOIN applications a ON u.id = a.candidate_id
LEFT JOIN referrals ref ON u.id = ref.referrer_id
LEFT JOIN payments p ON u.id = p.user_id
GROUP BY u.id, u.first_name, u.last_name, u.role, u.created_at
ORDER BY 
    (COALESCE(resumes_created, 0) + COALESCE(applications_submitted, 0) + 
     COALESCE(referrals_made, 0) + COALESCE(payments_made, 0)) DESC;