-- ============================================================================
-- Job Portal Database - Phase 2 Sample Data
-- Sample data for Resume Builder, Skills, Referrals, and Payments
-- ============================================================================

-- ============================================================================
-- Insert Sample Resume Templates
-- ============================================================================
INSERT INTO resume_templates (name, display_name, description, preview_image_url, template_config, is_premium, is_active) VALUES
('modern', 'Modern Professional', 'Clean, contemporary design with bold headers and modern typography', '/templates/modern-preview.jpg', 
 '{"colors": {"primary": "#2563eb", "secondary": "#64748b"}, "fonts": {"header": "Inter", "body": "Inter"}, "layout": "single-column"}', FALSE, TRUE),
('classic', 'Classic Traditional', 'Traditional professional layout with serif fonts and conservative styling', '/templates/classic-preview.jpg', 
 '{"colors": {"primary": "#1f2937", "secondary": "#6b7280"}, "fonts": {"header": "Times New Roman", "body": "Times New Roman"}, "layout": "single-column"}', FALSE, TRUE),
('creative', 'Creative Designer', 'Eye-catching design with creative elements, perfect for design roles', '/templates/creative-preview.jpg', 
 '{"colors": {"primary": "#7c3aed", "secondary": "#a855f7"}, "fonts": {"header": "Poppins", "body": "Poppins"}, "layout": "two-column"}', TRUE, TRUE),
('minimalist', 'Clean Minimalist', 'Simple, clean design focusing on content with minimal styling', '/templates/minimalist-preview.jpg', 
 '{"colors": {"primary": "#000000", "secondary": "#6b7280"}, "fonts": {"header": "Helvetica", "body": "Helvetica"}, "layout": "single-column"}', FALSE, TRUE),
('professional', 'Executive Professional', 'Premium design for senior roles with sophisticated styling', '/templates/professional-preview.jpg', 
 '{"colors": {"primary": "#1e40af", "secondary": "#475569"}, "fonts": {"header": "Merriweather", "body": "Open Sans"}, "layout": "two-column"}', TRUE, TRUE);

-- ============================================================================
-- Insert Sample Skill Categories
-- ============================================================================
INSERT INTO skill_categories (name, parent_category_id, description, icon) VALUES
('Programming Languages', NULL, 'Programming and scripting languages', 'code'),
('Web Development', NULL, 'Frontend and backend web technologies', 'globe'),
('Database Technologies', NULL, 'Database management and query languages', 'database'),
('Cloud & DevOps', NULL, 'Cloud platforms and DevOps tools', 'cloud'),
('Project Management', NULL, 'Project management methodologies and tools', 'tasks'),
('Communication', NULL, 'Verbal and written communication skills', 'message-circle'),
('Leadership', NULL, 'Leadership and management capabilities', 'users'),
('Design', NULL, 'UI/UX and graphic design skills', 'palette');

-- Insert sub-categories
INSERT INTO skill_categories (name, parent_category_id, description, icon) VALUES
('JavaScript Frameworks', 2, 'JavaScript libraries and frameworks', 'code'),
('Backend Frameworks', 2, 'Server-side frameworks and technologies', 'server'),
('SQL Databases', 3, 'Relational database systems', 'database'),
('NoSQL Databases', 3, 'Non-relational database systems', 'layers'),
('AWS Services', 4, 'Amazon Web Services', 'cloud'),
('Agile Methodologies', 5, 'Agile and Scrum practices', 'repeat');

-- ============================================================================
-- Insert Sample Skills
-- ============================================================================
INSERT INTO skills (name, category, description) VALUES
-- Programming Languages
('JavaScript', 'Technical', 'Modern JavaScript programming language'),
('Python', 'Technical', 'Python programming language for web development and data science'),
('Java', 'Technical', 'Enterprise Java development'),
('TypeScript', 'Technical', 'Typed superset of JavaScript'),
('Go', 'Technical', 'Google Go programming language'),
('C#', 'Technical', 'Microsoft C# programming language'),

-- Web Development
('React', 'Technical', 'React JavaScript library for building user interfaces'),
('Vue.js', 'Technical', 'Progressive JavaScript framework'),
('Angular', 'Technical', 'TypeScript-based web application framework'),
('Node.js', 'Technical', 'JavaScript runtime built on Chrome V8 engine'),
('Express.js', 'Technical', 'Fast, unopinionated web framework for Node.js'),
('Django', 'Technical', 'High-level Python web framework'),
('Spring Boot', 'Technical', 'Java-based framework for building microservices'),

-- Database Technologies
('PostgreSQL', 'Technical', 'Advanced open-source relational database'),
('MySQL', 'Technical', 'Popular open-source relational database'),
('MongoDB', 'Technical', 'NoSQL document database'),
('Redis', 'Technical', 'In-memory data structure store'),

-- Cloud & DevOps
('AWS', 'Technical', 'Amazon Web Services cloud platform'),
('Docker', 'Technical', 'Containerization platform'),
('Kubernetes', 'Technical', 'Container orchestration platform'),
('Jenkins', 'Technical', 'Automation server for CI/CD'),
('Git', 'Technical', 'Distributed version control system'),

-- Soft Skills
('Project Management', 'Soft', 'Planning and executing projects effectively'),
('Team Leadership', 'Soft', 'Leading and motivating teams'),
('Communication', 'Soft', 'Effective verbal and written communication'),
('Problem Solving', 'Soft', 'Analytical thinking and solution finding'),
('Time Management', 'Soft', 'Efficiently managing time and priorities'),

-- Languages
('English', 'Language', 'English language proficiency'),
('Hindi', 'Language', 'Hindi language proficiency'),
('Spanish', 'Language', 'Spanish language proficiency'),

-- Industry Knowledge
('Agile/Scrum', 'Industry', 'Agile software development methodologies'),
('DevOps', 'Industry', 'Development and operations integration'),
('Machine Learning', 'Industry', 'ML algorithms and model development'),
('Data Analysis', 'Industry', 'Data analysis and interpretation');

-- ============================================================================
-- Insert Sample Resumes
-- ============================================================================
INSERT INTO resumes (user_id, template_name, resume_data) VALUES
(1, 'Modern', '{
  "personal": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "phone": "+91-9876543210",
    "location": "Bhopal, MP",
    "linkedin": "linkedin.com/in/johndoe",
    "portfolio": "johndoe.dev"
  },
  "summary": "Experienced software engineer with 5+ years in full-stack development. Passionate about creating scalable web applications using modern technologies.",
  "experience": [
    {
      "company": "Tech Solutions Inc",
      "position": "Senior Software Engineer",
      "startDate": "2021-06",
      "endDate": "present",
      "location": "Mumbai, MH",
      "description": "Led development of microservices architecture serving 100k+ users. Implemented CI/CD pipelines reducing deployment time by 60%."
    },
    {
      "company": "StartupXYZ",
      "position": "Full Stack Developer",
      "startDate": "2019-03",
      "endDate": "2021-05",
      "location": "Bangalore, KA",
      "description": "Developed customer-facing web applications using React and Node.js. Collaborated with product team to deliver features on schedule."
    }
  ],
  "education": [
    {
      "institution": "Indian Institute of Technology",
      "degree": "Bachelor of Technology",
      "field": "Computer Science Engineering",
      "startDate": "2015-08",
      "endDate": "2019-05",
      "gpa": "8.5/10"
    }
  ],
  "projects": [
    {
      "name": "E-commerce Platform",
      "description": "Built a full-stack e-commerce platform with React, Node.js, and PostgreSQL",
      "technologies": ["React", "Node.js", "PostgreSQL", "AWS"],
      "url": "github.com/johndoe/ecommerce"
    }
  ],
  "certifications": [
    {
      "name": "AWS Certified Developer",
      "issuer": "Amazon Web Services",
      "date": "2022-08",
      "url": "aws.amazon.com/verification"
    }
  ]
}'),

(2, 'Classic', '{
  "personal": {
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@email.com",
    "phone": "+91-9876543211",
    "location": "Delhi, DL",
    "linkedin": "linkedin.com/in/janesmith"
  },
  "summary": "Results-driven marketing professional with 7+ years of experience in digital marketing and brand management. Proven track record of increasing brand awareness and driving revenue growth.",
  "experience": [
    {
      "company": "Global Marketing Corp",
      "position": "Senior Marketing Manager",
      "startDate": "2020-01",
      "endDate": "present",
      "location": "Delhi, DL",
      "description": "Managed marketing campaigns with budgets exceeding ₹50L. Increased brand engagement by 150% through strategic social media initiatives."
    },
    {
      "company": "Digital Agency Pro",
      "position": "Marketing Specialist",
      "startDate": "2017-06",
      "endDate": "2019-12",
      "location": "Gurgaon, HR",
      "description": "Executed digital marketing campaigns for 20+ clients. Specialized in SEO, SEM, and social media marketing."
    }
  ],
  "education": [
    {
      "institution": "Delhi University",
      "degree": "Master of Business Administration",
      "field": "Marketing",
      "startDate": "2015-07",
      "endDate": "2017-05",
      "gpa": "3.8/4.0"
    }
  ]
}');

-- ============================================================================
-- Link Skills to Resumes
-- ============================================================================
INSERT INTO resume_skills (resume_id, skill_id, proficiency_level, years_of_experience) VALUES
-- John's skills
(1, 1, 'Advanced', 5),    -- JavaScript
(1, 4, 'Advanced', 4),    -- TypeScript
(1, 7, 'Expert', 5),      -- React
(1, 10, 'Advanced', 4),   -- Node.js
(1, 11, 'Intermediate', 3), -- Express.js
(1, 14, 'Advanced', 4),   -- PostgreSQL
(1, 17, 'Intermediate', 2), -- AWS
(1, 18, 'Advanced', 3),   -- Docker
(1, 21, 'Advanced', 5),   -- Git
(1, 22, 'Advanced', 5),   -- Project Management
(1, 24, 'Expert', 5),     -- Communication
(1, 30, 'Advanced', 4),   -- Agile/Scrum

-- Jane's skills
(2, 22, 'Expert', 7),     -- Project Management
(2, 23, 'Advanced', 5),   -- Team Leadership
(2, 24, 'Expert', 7),     -- Communication
(2, 25, 'Advanced', 6),   -- Problem Solving
(2, 26, 'Advanced', 7),   -- Time Management
(2, 27, 'Expert', 10),    -- English
(2, 28, 'Expert', 10);    -- Hindi

-- ============================================================================
-- Link Skills to Jobs (from Phase 1 sample data)
-- ============================================================================
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
-- Senior Software Engineer job (job_id = 1)
(1, 1, 'Advanced', TRUE, 9),      -- JavaScript
(1, 7, 'Advanced', TRUE, 10),     -- React
(1, 10, 'Advanced', TRUE, 9),     -- Node.js
(1, 14, 'Intermediate', TRUE, 7), -- PostgreSQL
(1, 17, 'Intermediate', FALSE, 5), -- AWS
(1, 30, 'Intermediate', TRUE, 6),  -- Agile/Scrum

-- Frontend Developer job (job_id = 2)
(2, 1, 'Advanced', TRUE, 10),     -- JavaScript
(2, 4, 'Intermediate', FALSE, 7), -- TypeScript
(2, 7, 'Advanced', TRUE, 10),     -- React
(2, 24, 'Advanced', TRUE, 8),     -- Communication

-- Data Scientist job (job_id = 3)
(3, 2, 'Advanced', TRUE, 10),     -- Python
(3, 32, 'Advanced', TRUE, 9),     -- Machine Learning
(3, 33, 'Advanced', TRUE, 8),     -- Data Analysis
(3, 16, 'Intermediate', FALSE, 6), -- MongoDB

-- Junior Developer job (job_id = 4)
(4, 1, 'Beginner', TRUE, 8),      -- JavaScript
(4, 7, 'Beginner', TRUE, 7),      -- React
(4, 21, 'Beginner', TRUE, 6),     -- Git
(4, 24, 'Intermediate', TRUE, 7);  -- Communication

-- ============================================================================
-- Insert Sample Referrals
-- ============================================================================
INSERT INTO referrals (referrer_id, referred_candidate_email, job_id, referral_code, reward_amount, status, reward_status, expires_at, notes) VALUES
(3, 'referred.candidate1@email.com', 1, 'REF-001-2024', 10000.00, 'Pending', 'Pending', CURRENT_TIMESTAMP + INTERVAL '30 days', 'Strong candidate with React experience'),
(4, 'referred.candidate2@email.com', 2, 'REF-002-2024', 8000.00, 'Interview', 'Eligible', CURRENT_TIMESTAMP + INTERVAL '25 days', 'Former colleague, excellent frontend skills'),
(3, 'referred.candidate3@email.com', 3, 'REF-003-2024', 12000.00, 'Placed', 'Paid', CURRENT_TIMESTAMP + INTERVAL '20 days', 'Successfully placed, payment processed'),
(4, 'referred.candidate4@email.com', 1, 'REF-004-2024', 10000.00, 'Expired', 'Forfeited', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Referral expired, candidate did not apply');

-- ============================================================================
-- Insert Sample Payments
-- ============================================================================
INSERT INTO payments (user_id, amount, currency, purpose, status, transaction_id, payment_method, reference_id, reference_type, processed_at) VALUES
-- Job feature payments
(3, 2999.00, 'INR', 'job_boost', 'succeeded', 'txn_job_boost_001', 'razorpay', 1, 'job', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(4, 4999.00, 'INR', 'featured_listing', 'succeeded', 'txn_featured_002', 'stripe', 2, 'job', CURRENT_TIMESTAMP - INTERVAL '1 day'),

-- Subscription payments
(1, 999.00, 'INR', 'premium_profile', 'succeeded', 'txn_premium_001', 'razorpay', 1, 'user', CURRENT_TIMESTAMP - INTERVAL '15 days'),
(2, 1999.00, 'INR', 'subscription', 'succeeded', 'txn_sub_001', 'stripe', 2, 'user', CURRENT_TIMESTAMP - INTERVAL '10 days'),

-- Referral payouts
(3, 12000.00, 'INR', 'referral_payout', 'succeeded', 'txn_ref_payout_001', 'bank_transfer', 3, 'referral', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(4, 5000.00, 'INR', 'referral_payout', 'processing', 'txn_ref_payout_002', 'bank_transfer', 2, 'referral', NULL),

-- Failed payment example
(1, 1999.00, 'INR', 'subscription', 'failed', 'txn_failed_001', 'razorpay', 1, 'user', NULL);

-- ============================================================================
-- Update existing applications with referral connections
-- ============================================================================
-- Link some applications to referrals (update existing sample applications)
UPDATE referrals SET application_id = 1 WHERE referral_code = 'REF-001-2024';
UPDATE referrals SET application_id = 2 WHERE referral_code = 'REF-002-2024';

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Show resume count by template
SELECT template_name, COUNT(*) as resume_count 
FROM resumes 
GROUP BY template_name;

-- Show skill distribution by category
SELECT category, COUNT(*) as skill_count 
FROM skills 
GROUP BY category 
ORDER BY skill_count DESC;

-- Show referral status distribution
SELECT status, COUNT(*) as referral_count 
FROM referrals 
GROUP BY status;

-- Show payment summary by purpose
SELECT purpose, COUNT(*) as payment_count, SUM(amount) as total_amount 
FROM payments 
WHERE status = 'succeeded'
GROUP BY purpose 
ORDER BY total_amount DESC;