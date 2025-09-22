-- ============================================================================
-- Job Portal Database - Sample Data for Testing
-- PostgreSQL Sample Data
-- ============================================================================

-- Insert sample users
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('john.doe@email.com', '$2b$10$example_hash_for_password123', 'John', 'Doe', 'candidate'),
('jane.smith@email.com', '$2b$10$example_hash_for_password456', 'Jane', 'Smith', 'candidate'),
('recruiter@techcorp.com', '$2b$10$example_hash_for_password789', 'Sarah', 'Johnson', 'recruiter'),
('hr@innovate.com', '$2b$10$example_hash_for_password101', 'Mike', 'Wilson', 'recruiter'),
('admin@jobportal.com', '$2b$10$example_hash_for_password202', 'Admin', 'User', 'admin');

-- Insert sample companies
INSERT INTO companies (name, description, website, logo_url) VALUES
('TechCorp Solutions', 'Leading technology company specializing in software development and digital transformation.', 'https://techcorp.com', 'https://techcorp.com/logo.png'),
('Innovate Labs', 'Cutting-edge research and development company focused on AI and machine learning.', 'https://innovatelabs.com', 'https://innovatelabs.com/logo.png'),
('StartupXYZ', 'Fast-growing startup in the fintech space, revolutionizing digital payments.', 'https://startupxyz.com', 'https://startupxyz.com/logo.png'),
('Global Enterprises', 'Multinational corporation with diverse business interests across industries.', 'https://globalent.com', 'https://globalent.com/logo.png');

-- Insert sample jobs
INSERT INTO jobs (company_id, posted_by_recruiter_id, title, description, location, salary_min, salary_max, experience_level, is_active) VALUES
(1, 3, 'Senior Software Engineer', 'We are looking for an experienced software engineer to join our development team. Responsibilities include designing and implementing scalable web applications, collaborating with cross-functional teams, and mentoring junior developers.', 'Bhopal, MP', 800000, 1200000, 'Senior-Level', TRUE),
(1, 3, 'Frontend Developer', 'Join our frontend team to create amazing user experiences. You will work with React, TypeScript, and modern CSS frameworks to build responsive web applications.', 'Remote', 500000, 800000, 'Mid-Level', TRUE),
(2, 4, 'Data Scientist', 'Exciting opportunity to work on machine learning projects. You will analyze large datasets, build predictive models, and work closely with our AI research team.', 'Mumbai, MH', 900000, 1500000, 'Mid-Level', TRUE),
(2, 4, 'Junior Developer', 'Great entry-level position for new graduates. You will learn from experienced developers while contributing to real-world projects.', 'Bangalore, KA', 300000, 500000, 'Entry-Level', TRUE),
(3, 4, 'Product Manager', 'Lead product development initiatives in our fintech platform. Requires strong analytical skills and experience with agile methodologies.', 'Delhi, DL', 1000000, 1600000, 'Senior-Level', TRUE),
(4, 3, 'DevOps Engineer', 'Manage our cloud infrastructure and deployment pipelines. Experience with AWS, Docker, and Kubernetes required.', 'Pune, MH', 700000, 1100000, 'Mid-Level', FALSE);

-- Insert sample applications
INSERT INTO applications (job_id, candidate_id, status, submitted_at) VALUES
(1, 1, 'Applied', CURRENT_TIMESTAMP - INTERVAL '5 days'),
(1, 2, 'Shortlisted', CURRENT_TIMESTAMP - INTERVAL '4 days'),
(2, 1, 'Interviewed', CURRENT_TIMESTAMP - INTERVAL '3 days'),
(2, 2, 'Applied', CURRENT_TIMESTAMP - INTERVAL '2 days'),
(3, 1, 'Rejected', CURRENT_TIMESTAMP - INTERVAL '7 days'),
(3, 2, 'Applied', CURRENT_TIMESTAMP - INTERVAL '1 day'),
(4, 1, 'Hired', CURRENT_TIMESTAMP - INTERVAL '10 days'),
(5, 2, 'Applied', CURRENT_TIMESTAMP - INTERVAL '6 hours');