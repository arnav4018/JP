-- ============================================================================
-- Job Portal Database - Realistic Mock Dataset
-- Comprehensive test data with logical consistency
-- ============================================================================

-- Clear existing data (optional - uncomment if needed for clean setup)
-- TRUNCATE TABLE applications, job_skills, resume_skills, referrals, payments, 
-- resumes, jobs, companies, skills, users, resume_templates, skill_categories, system_logs CASCADE;

-- ============================================================================
-- 1. INSERT 10 COMPANIES
-- ============================================================================

INSERT INTO companies (name, description, website, logo_url) VALUES
('TechCorp Solutions', 'Leading software development company specializing in enterprise solutions and cloud technologies. Serving clients across India with innovative digital transformation services.', 'https://techcorp.com', 'https://techcorp.com/assets/logo.png'),

('Indore InfoSystems', 'Premier IT services company based in Indore, MP. Expert in web development, mobile apps, and digital marketing solutions for local and international clients.', 'https://indoreinfo.com', 'https://indoreinfo.com/logo.png'),

('Bhopal Digital Hub', 'Madhya Pradesh leading digital agency providing comprehensive IT solutions, software development, and consultancy services to government and private sectors.', 'https://bhopaldigital.in', 'https://bhopaldigital.in/images/logo.png'),

('Bangalore Tech Innovations', 'Silicon Valley of India based startup specializing in AI, machine learning, and data analytics solutions. Rapidly growing team of 200+ engineers.', 'https://blrtech.com', 'https://blrtech.com/static/logo.svg'),

('Mumbai FinTech Labs', 'Financial technology company revolutionizing digital payments and banking solutions across India. Backed by leading VCs with strong market presence.', 'https://mumbaifintech.co.in', 'https://mumbaifintech.co.in/brand/logo.png'),

('Delhi StartupXYZ', 'Fast-growing e-commerce platform serving millions of customers across North India. Known for innovative logistics solutions and customer-first approach.', 'https://startupxyz.in', 'https://startupxyz.in/assets/brand-logo.png'),

('Hyderabad Cloud Systems', 'Cloud infrastructure and DevOps solutions provider with expertise in AWS, Azure, and Google Cloud. Trusted by 500+ enterprises nationwide.', 'https://hydcloud.com', 'https://hydcloud.com/images/company-logo.png'),

('Pune Design Studio', 'Award-winning UI/UX design agency creating beautiful digital experiences for brands across various industries. Team of creative professionals and design thinkers.', 'https://punedesign.co', 'https://punedesign.co/logo-main.png'),

('Chennai Data Analytics', 'Leading data science and analytics consultancy helping businesses make data-driven decisions. Expertise in big data, AI/ML, and business intelligence.', 'https://chennaidata.com', 'https://chennaidata.com/assets/logo-dark.png'),

('Gurgaon Global Systems', 'Multinational IT consulting firm with offices across India. Providing enterprise software solutions, system integration, and technology consulting services.', 'https://gurgaonglobal.com', 'https://gurgaonglobal.com/wp-content/uploads/logo.png');

-- ============================================================================
-- 2. INSERT 20 USERS (5 Admins, 5 Recruiters, 10 Candidates)
-- ============================================================================

-- Insert 5 Admins
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@jobportal.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsrBzng3W', 'Rajesh', 'Sharma', 'admin'),
('superadmin@jobportal.com', '$2b$12$8JkWtQJ5YKVwEFvGO2Y.AeBvbWjMK5cH5JxHXYg6s1VmnKj8YjY7O', 'Priya', 'Patel', 'admin'),
('systemadmin@jobportal.com', '$2b$12$VqJ5z8YKgR5qN9hL.VjQAeK7Q8hXh6YjgJ3YR2QVk5gY1PfTqJ4a6', 'Amit', 'Singh', 'admin'),
('dbadmin@jobportal.com', '$2b$12$KnQvBz8YjP5qN9hL.VjMNdK7Q9hXhTYjgJ3YRoQVk9gY6PfEqL4p3', 'Sunita', 'Gupta', 'admin'),
('techadmin@jobportal.com', '$2b$12$PnRvCx9YkQ6rO0iM.WkNObL8R0iYiUZkh4ZSoRXWl0hZ7QgFrM5q4', 'Vikram', 'Kumar', 'admin');

-- Insert 5 Recruiters (one for each of the first 5 companies)
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('hr@techcorp.com', '$2b$12$RgTvDz0YlR7sP1jN.XlNPcM9S1jZjValkI5aTpYXm1iA8RhGsN6r5', 'Neha', 'Agarwal', 'recruiter'),
('recruiter@indoreinfo.com', '$2b$12$ShUwEa1YmS8tQ2kO.YmOQdN0T2kaloWbmJ6bUqZYn2jB9SiHtO7s6', 'Rohit', 'Jain', 'recruiter'),
('talent@bhopaldigital.in', '$2b$12$TiVxFb2YnT9uR3lP.ZnPReO1U3lbmpXcnK7cVraaO3kC0TjIuP8t7', 'Kavita', 'Mehta', 'recruiter'),
('hiring@blrtech.com', '$2b$12$UjWyGc3YoU0vS4mQ.aoQSfP2V4mcnqYdoL8dWsbbP4lD1UkJvQ9u8', 'Arjun', 'Reddy', 'recruiter'),
('careers@mumbaifintech.co.in', '$2b$12$VkXzHd4YpV1wT5nR.bpRTgQ3W5ndorZepM9eXtccQ5mE2VlKwR0v9', 'Pooja', 'Shah', 'recruiter');

-- Insert 10 Candidates
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('aarav.sharma@gmail.com', '$2b$12$WlYyIe5YqW2xU6oS.cqSTiR4X6oepsafqN0fYudDR6nF3WmLxS1w0', 'Aarav', 'Sharma', 'candidate'),
('priya.patel@yahoo.com', '$2b$12$XmZzJf6YrX3yV7pT.drTUjS5Y7pfqtbgrO1gZveDSz7oG4XnMyS2x1', 'Priya', 'Patel', 'candidate'),
('rahul.kumar@outlook.com', '$2b$12$YnAaKg7YsY4zW8qU.esuVkT6Z8qgruchuP2hAwfETz8pH5YoNzS3y2', 'Rahul', 'Kumar', 'candidate'),
('sneha.singh@gmail.com', '$2b$12$ZoBbLh8YtZ5aX9rV.ftvWlU7a9rhsvdivQ3iBxgFUz9qI6ZpOaS4z3', 'Sneha', 'Singh', 'candidate'),
('vikash.gupta@gmail.com', '$2b$12$ApCcMi9YuA6bY0sW.guwXmV8b0sitwejwR4jCyhGVzAqJ7aqPbS5a4', 'Vikash', 'Gupta', 'candidate'),
('anita.verma@rediffmail.com', '$2b$12$BqDdNj0YvB7cZ1tX.hvxYnW9c1tjuxfkxS5kDziHWzBrK8brQcS6b5', 'Anita', 'Verma', 'candidate'),
('deepak.joshi@gmail.com', '$2b$12$CrEeOk1YwC8dA2uY.iwzZoX0d2ukvyglzT6lEajIXzCsL9csRdS7c6', 'Deepak', 'Joshi', 'candidate'),
('ritu.agarwal@yahoo.in', '$2b$12$DsGfPl2YxD9eB3vZ.jxAaqY1e3vlwzhmaU7mFbkJYzDtM0dtSeS8d7', 'Ritu', 'Agarwal', 'candidate'),
('manish.tiwari@gmail.com', '$2b$12$EtHgQm3YyE0fC4wa.kyBbrZ2f4wmxaihbV8nGclKZzEuN1euTfS9e8', 'Manish', 'Tiwari', 'candidate'),
('sonali.mishra@gmail.com', '$2b$12$FuIhRn4YzF1gD5xb.lzCcsA3g5xnybjidc9oHdmLaAFvO2fvUgS0f9', 'Sonali', 'Mishra', 'candidate');

-- ============================================================================
-- 3. INSERT 15 JOBS
-- ============================================================================

INSERT INTO jobs (company_id, posted_by_recruiter_id, title, description, location, salary_min, salary_max, experience_level, is_active) VALUES
-- Jobs for TechCorp Solutions (Company 1, Recruiter 6)
(1, 6, 'Senior Software Engineer', 'We are seeking an experienced software engineer to join our development team. You will be responsible for designing and implementing scalable web applications, working with modern technologies like React, Node.js, and PostgreSQL. The role involves collaborating with cross-functional teams and mentoring junior developers.', 'Bhopal, MP', 800000, 1200000, 'Senior-Level', TRUE),
(1, 6, 'Frontend Developer', 'Join our frontend team to create amazing user experiences. You will work with React, TypeScript, and modern CSS frameworks to build responsive web applications. Experience with state management libraries and testing frameworks is preferred.', 'Remote', 500000, 800000, 'Mid-Level', TRUE),
(1, 6, 'DevOps Engineer', 'Manage our cloud infrastructure and deployment pipelines. Experience with AWS, Docker, Kubernetes, and CI/CD tools is required. You will be responsible for ensuring high availability and scalability of our applications.', 'Bhopal, MP', 700000, 1100000, 'Mid-Level', TRUE),

-- Jobs for Indore InfoSystems (Company 2, Recruiter 7)
(2, 7, 'Full Stack Developer', 'Develop end-to-end web applications using modern JavaScript frameworks. Work with both frontend and backend technologies including React, Node.js, Express, and MongoDB. Strong problem-solving skills and attention to detail required.', 'Indore, MP', 600000, 900000, 'Mid-Level', TRUE),
(2, 7, 'UI/UX Designer', 'Create intuitive and visually appealing user interfaces for web and mobile applications. Experience with Figma, Adobe Creative Suite, and user research methodologies is essential. Join our creative team to design exceptional user experiences.', 'Indore, MP', 400000, 700000, 'Mid-Level', TRUE),

-- Jobs for Bhopal Digital Hub (Company 3, Recruiter 8)
(3, 8, 'Data Analyst', 'Analyze complex datasets to provide actionable business insights. Proficiency in SQL, Python, and data visualization tools like Tableau is required. Work closely with stakeholders to understand business requirements and deliver data-driven solutions.', 'Bhopal, MP', 500000, 800000, 'Mid-Level', TRUE),
(3, 8, 'Junior Developer', 'Start your career in software development with our supportive team environment. Learn modern web technologies while contributing to real-world projects. Fresh graduates with strong fundamentals in programming are encouraged to apply.', 'Bhopal, MP', 300000, 500000, 'Entry-Level', TRUE),
(3, 8, 'Project Manager', 'Lead software development projects from conception to delivery. Experience with Agile methodologies, team leadership, and stakeholder management is essential. Excellent communication and organizational skills required.', 'Bhopal, MP', 900000, 1400000, 'Senior-Level', TRUE),

-- Jobs for Bangalore Tech Innovations (Company 4, Recruiter 9)
(4, 9, 'Machine Learning Engineer', 'Develop and deploy ML models for our AI-powered products. Strong background in Python, TensorFlow/PyTorch, and cloud platforms is required. Work on cutting-edge projects in computer vision and natural language processing.', 'Bangalore, KA', 1000000, 1600000, 'Senior-Level', TRUE),
(4, 9, 'Data Scientist', 'Extract insights from large datasets using statistical analysis and machine learning techniques. PhD or Masters in Data Science, Statistics, or related field preferred. Experience with big data technologies is a plus.', 'Bangalore, KA', 1200000, 1800000, 'Senior-Level', TRUE),
(4, 9, 'Software Development Intern', 'Join our dynamic team as a software development intern. Gain hands-on experience with modern technologies and agile development practices. Currently pursuing Computer Science or related degree required.', 'Bangalore, KA', 200000, 300000, 'Entry-Level', TRUE),

-- Jobs for Mumbai FinTech Labs (Company 5, Recruiter 10)
(5, 10, 'Backend Developer', 'Build robust and scalable backend systems for our fintech platform. Expertise in Java/Python, microservices architecture, and database design is required. Knowledge of financial systems and security best practices preferred.', 'Mumbai, MH', 800000, 1300000, 'Mid-Level', TRUE),
(5, 10, 'Product Manager', 'Drive product strategy and roadmap for our digital payment solutions. Experience in fintech or related domain is highly valued. Strong analytical skills and ability to work with cross-functional teams essential.', 'Mumbai, MH', 1500000, 2200000, 'Senior-Level', TRUE),

-- Jobs for Delhi StartupXYZ (Company 6, Recruiter 6 - cross-company recruiter)
(6, 6, 'Growth Marketing Manager', 'Lead our growth marketing initiatives to drive user acquisition and retention. Experience with digital marketing, analytics, and growth hacking techniques required. Work in a fast-paced startup environment with significant impact.', 'Delhi, DL', 800000, 1200000, 'Mid-Level', TRUE),

-- Job for Hyderabad Cloud Systems (Company 7, Recruiter 7 - cross-company recruiter) 
(7, 7, 'Cloud Solutions Architect', 'Design and implement cloud infrastructure solutions for enterprise clients. Deep expertise in AWS/Azure, containerization, and infrastructure as code required. Lead technical discussions with clients and internal teams.', 'Hyderabad, TS', 1300000, 2000000, 'Senior-Level', TRUE);

-- ============================================================================
-- 4. INSERT 20 SKILLS
-- ============================================================================

INSERT INTO skills (name, category, description) VALUES
-- Technical Skills
('JavaScript', 'Technical', 'Modern JavaScript programming language for web development'),
('Python', 'Technical', 'Python programming language for web development, data science, and AI'),
('React', 'Technical', 'Popular JavaScript library for building user interfaces'),
('Node.js', 'Technical', 'JavaScript runtime for building server-side applications'),
('PostgreSQL', 'Technical', 'Advanced open-source relational database management system'),
('MongoDB', 'Technical', 'NoSQL document database for modern applications'),
('AWS', 'Technical', 'Amazon Web Services cloud computing platform'),
('Docker', 'Technical', 'Containerization platform for application deployment'),
('Java', 'Technical', 'Enterprise-grade programming language for backend development'),
('Machine Learning', 'Technical', 'Artificial intelligence and predictive modeling techniques'),
('Data Analysis', 'Technical', 'Statistical analysis and data interpretation skills'),
('UI/UX Design', 'Technical', 'User interface and user experience design principles'),
('TypeScript', 'Technical', 'Typed superset of JavaScript for large-scale applications'),
('Kubernetes', 'Technical', 'Container orchestration platform for scalable deployments'),
('SQL', 'Technical', 'Structured Query Language for database management'),

-- Soft Skills
('Team Leadership', 'Soft', 'Ability to lead and motivate teams effectively'),
('Communication', 'Soft', 'Excellent verbal and written communication skills'),
('Project Management', 'Soft', 'Planning, executing, and delivering projects successfully'),
('Problem Solving', 'Soft', 'Analytical thinking and creative solution finding'),
('Agile Methodology', 'Soft', 'Agile and Scrum project management methodologies');

-- ============================================================================
-- 5. ASSIGN SKILLS TO JOBS (job_skills)
-- ============================================================================

-- Job 1: Senior Software Engineer (3-6 skills)
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(1, 1, 'Advanced', TRUE, 9),  -- JavaScript
(1, 3, 'Advanced', TRUE, 10), -- React  
(1, 4, 'Advanced', TRUE, 9),  -- Node.js
(1, 5, 'Intermediate', TRUE, 7), -- PostgreSQL
(1, 16, 'Intermediate', FALSE, 6), -- Team Leadership
(1, 17, 'Advanced', TRUE, 8); -- Communication

-- Job 2: Frontend Developer  
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(2, 1, 'Advanced', TRUE, 10), -- JavaScript
(2, 3, 'Advanced', TRUE, 10), -- React
(2, 13, 'Intermediate', FALSE, 7), -- TypeScript
(2, 12, 'Advanced', TRUE, 9), -- UI/UX Design
(2, 17, 'Advanced', TRUE, 8); -- Communication

-- Job 3: DevOps Engineer
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(3, 7, 'Advanced', TRUE, 10), -- AWS
(3, 8, 'Advanced', TRUE, 9),  -- Docker
(3, 14, 'Advanced', TRUE, 9), -- Kubernetes
(3, 2, 'Intermediate', FALSE, 6), -- Python
(3, 19, 'Advanced', TRUE, 8); -- Problem Solving

-- Job 4: Full Stack Developer
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(4, 1, 'Advanced', TRUE, 9),  -- JavaScript
(4, 3, 'Advanced', TRUE, 8),  -- React
(4, 4, 'Advanced', TRUE, 9),  -- Node.js
(4, 6, 'Intermediate', TRUE, 7), -- MongoDB
(4, 17, 'Intermediate', TRUE, 7); -- Communication

-- Job 5: UI/UX Designer
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(5, 12, 'Expert', TRUE, 10),     -- UI/UX Design
(5, 17, 'Advanced', TRUE, 9),   -- Communication
(5, 19, 'Advanced', TRUE, 8),   -- Problem Solving
(5, 1, 'Beginner', FALSE, 4);   -- JavaScript

-- Job 6: Data Analyst
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(6, 11, 'Advanced', TRUE, 10),  -- Data Analysis
(6, 15, 'Advanced', TRUE, 9),   -- SQL
(6, 2, 'Intermediate', TRUE, 8), -- Python
(6, 17, 'Advanced', TRUE, 8),   -- Communication
(6, 19, 'Advanced', TRUE, 8);   -- Problem Solving

-- Job 7: Junior Developer
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(7, 1, 'Beginner', TRUE, 8),    -- JavaScript
(7, 3, 'Beginner', FALSE, 6),   -- React
(7, 15, 'Beginner', TRUE, 7),   -- SQL
(7, 17, 'Intermediate', TRUE, 8); -- Communication

-- Job 8: Project Manager
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(8, 18, 'Expert', TRUE, 10),     -- Project Management
(8, 16, 'Advanced', TRUE, 9),   -- Team Leadership
(8, 17, 'Expert', TRUE, 10),    -- Communication
(8, 20, 'Advanced', TRUE, 8);   -- Agile Methodology

-- Job 9: Machine Learning Engineer
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(9, 10, 'Expert', TRUE, 10),     -- Machine Learning
(9, 2, 'Advanced', TRUE, 9),    -- Python
(9, 11, 'Advanced', TRUE, 9),   -- Data Analysis
(9, 7, 'Intermediate', FALSE, 6), -- AWS
(9, 19, 'Advanced', TRUE, 8);   -- Problem Solving

-- Job 10: Data Scientist
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(10, 11, 'Expert', TRUE, 10),    -- Data Analysis
(10, 10, 'Advanced', TRUE, 9),  -- Machine Learning
(10, 2, 'Advanced', TRUE, 9),   -- Python
(10, 15, 'Advanced', TRUE, 8),  -- SQL
(10, 17, 'Advanced', TRUE, 7);  -- Communication

-- Job 11: Software Development Intern
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(11, 1, 'Beginner', TRUE, 7),   -- JavaScript
(11, 2, 'Beginner', FALSE, 6),  -- Python
(11, 17, 'Intermediate', TRUE, 8), -- Communication
(11, 19, 'Intermediate', TRUE, 7); -- Problem Solving

-- Job 12: Backend Developer
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(12, 9, 'Advanced', TRUE, 9),   -- Java
(12, 2, 'Advanced', FALSE, 8),  -- Python
(12, 5, 'Advanced', TRUE, 9),   -- PostgreSQL
(12, 4, 'Intermediate', FALSE, 6), -- Node.js
(12, 19, 'Advanced', TRUE, 8);  -- Problem Solving

-- Job 13: Product Manager
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(13, 18, 'Expert', TRUE, 10),    -- Project Management
(13, 16, 'Advanced', TRUE, 9),  -- Team Leadership
(13, 17, 'Expert', TRUE, 10),   -- Communication
(13, 11, 'Intermediate', TRUE, 7); -- Data Analysis

-- Job 14: Growth Marketing Manager
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(14, 11, 'Advanced', TRUE, 9),  -- Data Analysis
(14, 17, 'Expert', TRUE, 10),   -- Communication
(14, 19, 'Advanced', TRUE, 8),  -- Problem Solving
(14, 18, 'Intermediate', TRUE, 7); -- Project Management

-- Job 15: Cloud Solutions Architect
INSERT INTO job_skills (job_id, skill_id, required_level, is_mandatory, weight) VALUES
(15, 7, 'Expert', TRUE, 10),     -- AWS
(15, 8, 'Advanced', TRUE, 9),   -- Docker
(15, 14, 'Advanced', TRUE, 9),  -- Kubernetes
(15, 16, 'Advanced', TRUE, 8),  -- Team Leadership
(15, 17, 'Advanced', TRUE, 9);  -- Communication

-- ============================================================================
-- 6. INSERT 10 RESUMES (One for each candidate)
-- ============================================================================

-- Resume 1: Aarav Sharma (Software Engineer Profile)
INSERT INTO resumes (user_id, template_name, resume_data) VALUES
(11, 'Modern', '{
  "personal_info": {
    "firstName": "Aarav",
    "lastName": "Sharma", 
    "email": "aarav.sharma@gmail.com",
    "phone": "+91-9876543210",
    "location": "Bhopal, MP",
    "linkedin": "linkedin.com/in/aaravsharma",
    "github": "github.com/aaravsharma"
  },
  "summary": "Passionate software engineer with 3 years of experience in full-stack web development. Proficient in JavaScript, React, and Node.js with a strong foundation in database design and cloud technologies.",
  "experience": [
    {
      "company": "Local Tech Startup",
      "position": "Software Developer",
      "startDate": "2021-06",
      "endDate": "present",
      "location": "Bhopal, MP",
      "description": "Developed responsive web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions."
    },
    {
      "company": "Freelance Projects",
      "position": "Web Developer",
      "startDate": "2020-01", 
      "endDate": "2021-05",
      "location": "Remote",
      "description": "Built custom websites and web applications for small businesses using modern web technologies."
    }
  ],
  "education": [
    {
      "institution": "Rajiv Gandhi Proudyogiki Vishwavidyalaya",
      "degree": "Bachelor of Technology",
      "field": "Computer Science Engineering",
      "startDate": "2016-08",
      "endDate": "2020-06",
      "gpa": "7.8/10"
    }
  ],
  "skills": ["JavaScript", "React", "Node.js", "PostgreSQL", "MongoDB", "Git", "HTML/CSS"],
  "projects": [
    {
      "name": "E-commerce Web App",
      "description": "Full-stack e-commerce application with React frontend and Node.js backend",
      "technologies": ["React", "Node.js", "MongoDB", "Express"],
      "url": "github.com/aaravsharma/ecommerce-app"
    }
  ]
}');

-- Resume 2: Priya Patel (UI/UX Designer Profile)
INSERT INTO resumes (user_id, template_name, resume_data) VALUES
(12, 'Creative', '{
  "personal_info": {
    "firstName": "Priya",
    "lastName": "Patel",
    "email": "priya.patel@yahoo.com", 
    "phone": "+91-9876543211",
    "location": "Indore, MP",
    "linkedin": "linkedin.com/in/priyapatel",
    "portfolio": "priyapatel.design"
  },
  "summary": "Creative UI/UX designer with 4 years of experience in creating intuitive and visually appealing digital experiences. Skilled in user research, wireframing, prototyping, and visual design.",
  "experience": [
    {
      "company": "Design Agency Indore",
      "position": "Senior UI/UX Designer",
      "startDate": "2020-03",
      "endDate": "present", 
      "location": "Indore, MP",
      "description": "Led design projects for web and mobile applications. Conducted user research and created user-centered design solutions."
    },
    {
      "company": "Startup Inc",
      "position": "Junior Designer",
      "startDate": "2019-07",
      "endDate": "2020-02",
      "location": "Indore, MP", 
      "description": "Created wireframes, mockups, and prototypes for mobile applications. Collaborated with developers to implement designs."
    }
  ],
  "education": [
    {
      "institution": "Devi Ahilya Vishwavidyalaya",
      "degree": "Bachelor of Fine Arts",
      "field": "Applied Arts and Design",
      "startDate": "2015-07",
      "endDate": "2019-05",
      "gpa": "8.2/10"
    }
  ],
  "skills": ["UI/UX Design", "Figma", "Adobe Creative Suite", "Prototyping", "User Research", "Wireframing"],
  "projects": [
    {
      "name": "Mobile Banking App Redesign",
      "description": "Complete UX overhaul of mobile banking application improving user satisfaction by 40%",
      "technologies": ["Figma", "User Research", "Prototyping"],
      "url": "behance.net/priyapatel/banking-app"
    }
  ]
}');

-- Resume 3: Rahul Kumar (Data Analyst Profile) 
INSERT INTO resumes (user_id, template_name, resume_data) VALUES
(13, 'Professional', '{
  "personal_info": {
    "firstName": "Rahul",
    "lastName": "Kumar",
    "email": "rahul.kumar@outlook.com",
    "phone": "+91-9876543212", 
    "location": "Bhopal, MP",
    "linkedin": "linkedin.com/in/rahulkumar"
  },
  "summary": "Data analyst with 2 years of experience in extracting insights from complex datasets. Proficient in SQL, Python, and data visualization tools with strong analytical and problem-solving skills.",
  "experience": [
    {
      "company": "Regional Analytics Firm",
      "position": "Data Analyst",
      "startDate": "2022-01",
      "endDate": "present",
      "location": "Bhopal, MP",
      "description": "Analyzed business data to identify trends and provide actionable insights. Created dashboards and reports for stakeholders."
    },
    {
      "company": "Government Analytics Project", 
      "position": "Data Analyst Intern",
      "startDate": "2021-06",
      "endDate": "2021-12",
      "location": "Bhopal, MP",
      "description": "Worked on government data analysis projects. Cleaned and processed large datasets using Python and SQL."
    }
  ],
  "education": [
    {
      "institution": "Barkatullah University",
      "degree": "Master of Science",
      "field": "Statistics",
      "startDate": "2019-07",
      "endDate": "2021-05",
      "gpa": "8.5/10"
    }
  ],
  "skills": ["Data Analysis", "SQL", "Python", "Excel", "Tableau", "Statistics", "Data Visualization"],
  "certifications": [
    {
      "name": "Google Data Analytics Certificate",
      "issuer": "Google",
      "date": "2021-08"
    }
  ]
}');

-- Resume 4: Sneha Singh (Full Stack Developer Profile)
INSERT INTO resumes (user_id, template_name, resume_data) VALUES
(14, 'Modern', '{
  "personal_info": {
    "firstName": "Sneha", 
    "lastName": "Singh",
    "email": "sneha.singh@gmail.com",
    "phone": "+91-9876543213",
    "location": "Bangalore, KA",
    "linkedin": "linkedin.com/in/snehasingh",
    "github": "github.com/snehasingh"
  },
  "summary": "Full-stack developer with 3 years of experience building scalable web applications. Expert in JavaScript ecosystem with strong backend development skills and database design expertise.",
  "experience": [
    {
      "company": "Bangalore Tech Company",
      "position": "Full Stack Developer",
      "startDate": "2021-08", 
      "endDate": "present",
      "location": "Bangalore, KA",
      "description": "Developed end-to-end web applications using React, Node.js, and MongoDB. Optimized application performance and implemented security best practices."
    },
    {
      "company": "Startup Accelerator",
      "position": "Junior Developer",
      "startDate": "2020-06",
      "endDate": "2021-07",
      "location": "Bangalore, KA",
      "description": "Built responsive web interfaces and RESTful APIs. Participated in agile development process and code reviews."
    }
  ],
  "education": [
    {
      "institution": "Visvesvaraya Technological University",
      "degree": "Bachelor of Engineering", 
      "field": "Information Science Engineering",
      "startDate": "2016-08",
      "endDate": "2020-07",
      "gpa": "8.1/10"
    }
  ],
  "skills": ["JavaScript", "React", "Node.js", "MongoDB", "Express", "Git", "REST APIs", "Agile"]
}');

-- Resume 5: Vikash Gupta (DevOps Engineer Profile)
INSERT INTO resumes (user_id, template_name, resume_data) VALUES
(15, 'Professional', '{
  "personal_info": {
    "firstName": "Vikash",
    "lastName": "Gupta",
    "email": "vikash.gupta@gmail.com",
    "phone": "+91-9876543214",
    "location": "Mumbai, MH", 
    "linkedin": "linkedin.com/in/vikashgupta"
  },
  "summary": "DevOps engineer with 4 years of experience in cloud infrastructure, containerization, and CI/CD pipelines. Specialized in AWS services, Docker, and Kubernetes with strong automation skills.",
  "experience": [
    {
      "company": "Cloud Solutions Company",
      "position": "DevOps Engineer",
      "startDate": "2020-03",
      "endDate": "present",
      "location": "Mumbai, MH", 
      "description": "Managed AWS infrastructure and implemented CI/CD pipelines. Automated deployment processes and monitored system performance."
    },
    {
      "company": "IT Services Firm", 
      "position": "System Administrator",
      "startDate": "2019-01",
      "endDate": "2020-02",
      "location": "Mumbai, MH",
      "description": "Maintained server infrastructure and implemented backup strategies. Troubleshot system issues and optimized performance."
    }
  ],
  "education": [
    {
      "institution": "University of Mumbai",
      "degree": "Bachelor of Engineering",
      "field": "Computer Engineering", 
      "startDate": "2015-08",
      "endDate": "2019-05",
      "gpa": "7.9/10"
    }
  ],
  "skills": ["AWS", "Docker", "Kubernetes", "Jenkins", "Python", "Linux", "Terraform", "Monitoring"],
  "certifications": [
    {
      "name": "AWS Certified Solutions Architect",
      "issuer": "Amazon Web Services",
      "date": "2021-03"
    }
  ]
}');

-- Resume 6: Anita Verma (Project Manager Profile)
INSERT INTO resumes (user_id, template_name, resume_data) VALUES
(16, 'Classic', '{
  "personal_info": {
    "firstName": "Anita",
    "lastName": "Verma",
    "email": "anita.verma@rediffmail.com",
    "phone": "+91-9876543215",
    "location": "Delhi, DL",
    "linkedin": "linkedin.com/in/anitaverma"
  },
  "summary": "Experienced project manager with 6 years in leading software development projects. Expertise in Agile methodologies, team leadership, and stakeholder management with proven track record of successful project delivery.",
  "experience": [
    {
      "company": "Enterprise Software Company",
      "position": "Senior Project Manager",
      "startDate": "2019-01",
      "endDate": "present", 
      "location": "Delhi, DL",
      "description": "Led multiple software development projects with teams of 8-12 members. Implemented Agile practices and improved project delivery time by 25%."
    },
    {
      "company": "Consulting Firm",
      "position": "Project Coordinator", 
      "startDate": "2017-06",
      "endDate": "2018-12",
      "location": "Delhi, DL",
      "description": "Coordinated project activities and managed stakeholder communications. Assisted senior project managers in planning and execution."
    }
  ],
  "education": [
    {
      "institution": "Delhi Technological University",
      "degree": "Master of Business Administration",
      "field": "Project Management",
      "startDate": "2015-07",
      "endDate": "2017-05",
      "gpa": "8.7/10" 
    }
  ],
  "skills": ["Project Management", "Agile Methodology", "Team Leadership", "Stakeholder Management", "Risk Management"],
  "certifications": [
    {
      "name": "PMP Certification",
      "issuer": "Project Management Institute",
      "date": "2019-09"
    }
  ]
}');

-- Resume 7: Deepak Joshi (Machine Learning Engineer Profile)
INSERT INTO resumes (user_id, template_name, resume_data) VALUES
(17, 'Modern', '{
  "personal_info": {
    "firstName": "Deepak",
    "lastName": "Joshi", 
    "email": "deepak.joshi@gmail.com",
    "phone": "+91-9876543216",
    "location": "Bangalore, KA",
    "linkedin": "linkedin.com/in/deepakjoshi",
    "github": "github.com/deepakjoshi"
  },
  "summary": "Machine Learning engineer with 3 years of experience in developing and deploying ML models. Specialized in computer vision and natural language processing with strong programming and mathematical background.",
  "experience": [
    {
      "company": "AI Research Lab",
      "position": "ML Engineer",
      "startDate": "2021-09",
      "endDate": "present",
      "location": "Bangalore, KA",
      "description": "Developed ML models for computer vision applications. Implemented deep learning algorithms and optimized model performance for production deployment."
    },
    {
      "company": "Data Science Startup",
      "position": "Data Scientist",
      "startDate": "2020-07",
      "endDate": "2021-08", 
      "location": "Bangalore, KA",
      "description": "Built predictive models for business analytics. Worked on data preprocessing, feature engineering, and model evaluation."
    }
  ],
  "education": [
    {
      "institution": "Indian Institute of Science",
      "degree": "Master of Technology",
      "field": "Computational and Data Sciences",
      "startDate": "2018-08",
      "endDate": "2020-06", 
      "gpa": "9.1/10"
    }
  ],
  "skills": ["Machine Learning", "Python", "TensorFlow", "PyTorch", "Computer Vision", "NLP", "Deep Learning", "Data Analysis"],
  "publications": [
    {
      "title": "Automated Image Classification for Medical Diagnostics",
      "journal": "International Conference on AI in Healthcare",
      "date": "2021-11"
    }
  ]
}');

-- Resume 8: Ritu Agarwal (Marketing Manager Profile)
INSERT INTO resumes (user_id, template_name, resume_data) VALUES
(18, 'Professional', '{
  "personal_info": {
    "firstName": "Ritu",
    "lastName": "Agarwal",
    "email": "ritu.agarwal@yahoo.in",
    "phone": "+91-9876543217",
    "location": "Mumbai, MH",
    "linkedin": "linkedin.com/in/rituagarwal"
  },
  "summary": "Digital marketing professional with 5 years of experience in growth marketing, campaign management, and data-driven marketing strategies. Proven track record of increasing user acquisition and engagement.",
  "experience": [
    {
      "company": "Digital Marketing Agency",
      "position": "Senior Marketing Manager", 
      "startDate": "2020-02",
      "endDate": "present",
      "location": "Mumbai, MH",
      "description": "Led digital marketing campaigns for 15+ clients. Increased client ROI by average of 35% through data-driven optimization strategies."
    },
    {
      "company": "E-commerce Startup",
      "position": "Marketing Specialist",
      "startDate": "2018-08",
      "endDate": "2020-01",
      "location": "Mumbai, MH",
      "description": "Managed social media marketing and paid advertising campaigns. Grew user base by 200% in 18 months."
    }
  ],
  "education": [
    {
      "institution": "Mumbai University", 
      "degree": "Master of Business Administration",
      "field": "Marketing",
      "startDate": "2016-07",
      "endDate": "2018-05",
      "gpa": "8.4/10"
    }
  ],
  "skills": ["Digital Marketing", "Growth Marketing", "Data Analysis", "Social Media Marketing", "Campaign Management", "Google Analytics"],
  "certifications": [
    {
      "name": "Google Ads Certification",
      "issuer": "Google",
      "date": "2020-06"
    }
  ]
}');

-- Resume 9: Manish Tiwari (Junior Developer Profile)
INSERT INTO resumes (user_id, template_name, resume_data) VALUES
(19, 'Modern', '{
  "personal_info": {
    "firstName": "Manish",
    "lastName": "Tiwari",
    "email": "manish.tiwari@gmail.com", 
    "phone": "+91-9876543218",
    "location": "Indore, MP",
    "linkedin": "linkedin.com/in/manishtiwari",
    "github": "github.com/manishtiwari"
  },
  "summary": "Enthusiastic junior developer with 1 year of experience in web development. Strong foundation in JavaScript and eager to learn new technologies. Recently graduated with excellent academic performance.",
  "experience": [
    {
      "company": "Local Software Company",
      "position": "Trainee Developer",
      "startDate": "2023-01",
      "endDate": "present",
      "location": "Indore, MP", 
      "description": "Learning web development technologies and contributing to small projects. Working with HTML, CSS, JavaScript, and basic React components."
    },
    {
      "company": "College Projects",
      "position": "Student Developer",
      "startDate": "2021-01",
      "endDate": "2022-12",
      "location": "Indore, MP",
      "description": "Developed academic projects and participated in hackathons. Built simple web applications and mobile apps."
    }
  ],
  "education": [
    {
      "institution": "Madhav Institute of Technology and Science",
      "degree": "Bachelor of Technology",
      "field": "Computer Science Engineering", 
      "startDate": "2019-08",
      "endDate": "2023-06",
      "gpa": "8.6/10"
    }
  ],
  "skills": ["JavaScript", "HTML/CSS", "React", "Git", "SQL", "Problem Solving", "Quick Learning"],
  "projects": [
    {
      "name": "Student Management System",
      "description": "Web-based system for managing student records using HTML, CSS, and JavaScript",
      "technologies": ["HTML", "CSS", "JavaScript", "LocalStorage"]
    }
  ]
}');

-- Resume 10: Sonali Mishra (Backend Developer Profile)
INSERT INTO resumes (user_id, template_name, resume_data) VALUES
(20, 'Professional', '{
  "personal_info": {
    "firstName": "Sonali",
    "lastName": "Mishra",
    "email": "sonali.mishra@gmail.com",
    "phone": "+91-9876543219",
    "location": "Hyderabad, TS",
    "linkedin": "linkedin.com/in/sonalimishra",
    "github": "github.com/sonalimishra"
  },
  "summary": "Backend developer with 2 years of experience in building scalable server-side applications. Proficient in Java, Python, and database technologies with strong problem-solving abilities.", 
  "experience": [
    {
      "company": "Software Services Company",
      "position": "Backend Developer",
      "startDate": "2022-03",
      "endDate": "present",
      "location": "Hyderabad, TS",
      "description": "Developed RESTful APIs and microservices using Java and Spring Boot. Optimized database queries and implemented caching strategies."
    },
    {
      "company": "Startup Tech Solutions", 
      "position": "Junior Backend Developer",
      "startDate": "2021-06",
      "endDate": "2022-02",
      "location": "Hyderabad, TS",
      "description": "Built backend services for web applications. Worked with databases and implemented business logic in Python and Java."
    }
  ],
  "education": [
    {
      "institution": "Jawaharlal Nehru Technological University",
      "degree": "Bachelor of Technology",
      "field": "Information Technology",
      "startDate": "2017-08", 
      "endDate": "2021-05",
      "gpa": "8.3/10"
    }
  ],
  "skills": ["Java", "Python", "Spring Boot", "PostgreSQL", "REST APIs", "Microservices", "Problem Solving"],
  "projects": [
    {
      "name": "Inventory Management API",
      "description": "RESTful API for inventory management system built with Spring Boot and PostgreSQL",
      "technologies": ["Java", "Spring Boot", "PostgreSQL", "REST API"]
    }
  ]
}');

-- ============================================================================
-- 7. INSERT 30 APPLICATIONS (Each candidate applies to 3 jobs)
-- ============================================================================

-- Candidate 1 (Aarav Sharma) - Software Engineer Profile - applies to relevant jobs
INSERT INTO applications (job_id, candidate_id, status, submitted_at) VALUES
(1, 11, 'Applied', CURRENT_TIMESTAMP - INTERVAL '5 days'),        -- Senior Software Engineer
(2, 11, 'Shortlisted', CURRENT_TIMESTAMP - INTERVAL '3 days'),   -- Frontend Developer  
(3, 11, 'Applied', CURRENT_TIMESTAMP - INTERVAL '1 day');        -- DevOps Engineer

-- Candidate 2 (Priya Patel) - UI/UX Designer - applies to design roles
INSERT INTO applications (job_id, candidate_id, status, submitted_at) VALUES
(5, 12, 'Interviewed', CURRENT_TIMESTAMP - INTERVAL '7 days'),   -- UI/UX Designer
(2, 12, 'Applied', CURRENT_TIMESTAMP - INTERVAL '4 days'),       -- Frontend Developer (UI focus)
(14, 12, 'Applied', CURRENT_TIMESTAMP - INTERVAL '2 days');      -- Growth Marketing Manager

-- Candidate 3 (Rahul Kumar) - Data Analyst - applies to data roles
INSERT INTO applications (job_id, candidate_id, status, submitted_at) VALUES  
(6, 13, 'Hired', CURRENT_TIMESTAMP - INTERVAL '10 days'),        -- Data Analyst
(10, 13, 'Applied', CURRENT_TIMESTAMP - INTERVAL '6 days'),      -- Data Scientist  
(9, 13, 'Rejected', CURRENT_TIMESTAMP - INTERVAL '8 days');      -- Machine Learning Engineer

-- Candidate 4 (Sneha Singh) - Full Stack Developer - applies to development roles
INSERT INTO applications (job_id, candidate_id, status, submitted_at) VALUES
(4, 14, 'Applied', CURRENT_TIMESTAMP - INTERVAL '3 days'),       -- Full Stack Developer
(1, 14, 'Shortlisted', CURRENT_TIMESTAMP - INTERVAL '5 days'),   -- Senior Software Engineer
(12, 14, 'Applied', CURRENT_TIMESTAMP - INTERVAL '1 day');       -- Backend Developer

-- Candidate 5 (Vikash Gupta) - DevOps Engineer - applies to infrastructure roles  
INSERT INTO applications (job_id, candidate_id, status, submitted_at) VALUES
(3, 15, 'Interviewed', CURRENT_TIMESTAMP - INTERVAL '4 days'),   -- DevOps Engineer
(15, 15, 'Applied', CURRENT_TIMESTAMP - INTERVAL '2 days'),      -- Cloud Solutions Architect
(1, 15, 'Applied', CURRENT_TIMESTAMP - INTERVAL '6 days');       -- Senior Software Engineer

-- Candidate 6 (Anita Verma) - Project Manager - applies to management roles
INSERT INTO applications (job_id, candidate_id, status, submitted_at) VALUES
(8, 16, 'Applied', CURRENT_TIMESTAMP - INTERVAL '3 days'),       -- Project Manager
(13, 16, 'Shortlisted', CURRENT_TIMESTAMP - INTERVAL '5 days'),  -- Product Manager  
(14, 16, 'Applied', CURRENT_TIMESTAMP - INTERVAL '1 day');       -- Growth Marketing Manager

-- Candidate 7 (Deepak Joshi) - ML Engineer - applies to ML/AI roles
INSERT INTO applications (job_id, candidate_id, status, submitted_at) VALUES
(9, 17, 'Applied', CURRENT_TIMESTAMP - INTERVAL '2 days'),       -- Machine Learning Engineer
(10, 17, 'Interviewed', CURRENT_TIMESTAMP - INTERVAL '4 days'),  -- Data Scientist
(11, 17, 'Applied', CURRENT_TIMESTAMP - INTERVAL '1 day');       -- Software Development Intern

-- Candidate 8 (Ritu Agarwal) - Marketing Manager - applies to marketing/business roles  
INSERT INTO applications (job_id, candidate_id, status, submitted_at) VALUES
(14, 18, 'Shortlisted', CURRENT_TIMESTAMP - INTERVAL '6 days'),  -- Growth Marketing Manager
(13, 18, 'Applied', CURRENT_TIMESTAMP - INTERVAL '3 days'),      -- Product Manager
(8, 18, 'Applied', CURRENT_TIMESTAMP - INTERVAL '1 day');        -- Project Manager

-- Candidate 9 (Manish Tiwari) - Junior Developer - applies to entry-level roles
INSERT INTO applications (job_id, candidate_id, status, submitted_at) VALUES
(7, 19, 'Applied', CURRENT_TIMESTAMP - INTERVAL '4 days'),       -- Junior Developer  
(11, 19, 'Interviewed', CURRENT_TIMESTAMP - INTERVAL '2 days'),  -- Software Development Intern
(2, 19, 'Applied', CURRENT_TIMESTAMP - INTERVAL '1 day');        -- Frontend Developer

-- Candidate 10 (Sonali Mishra) - Backend Developer - applies to backend roles
INSERT INTO applications (job_id, candidate_id, status, submitted_at) VALUES
(12, 20, 'Applied', CURRENT_TIMESTAMP - INTERVAL '5 days'),      -- Backend Developer
(1, 20, 'Applied', CURRENT_TIMESTAMP - INTERVAL '3 days'),       -- Senior Software Engineer  
(4, 20, 'Shortlisted', CURRENT_TIMESTAMP - INTERVAL '1 day');    -- Full Stack Developer

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify data consistency
SELECT 'Data Summary' as info;

SELECT 'Companies' as table_name, COUNT(*) as count FROM companies
UNION ALL
SELECT 'Users', COUNT(*) FROM users  
UNION ALL
SELECT 'Jobs', COUNT(*) FROM jobs
UNION ALL  
SELECT 'Skills', COUNT(*) FROM skills
UNION ALL
SELECT 'Job Skills', COUNT(*) FROM job_skills
UNION ALL
SELECT 'Resumes', COUNT(*) FROM resumes
UNION ALL
SELECT 'Applications', COUNT(*) FROM applications;

-- Verify logical consistency
SELECT 'Consistency Checks' as info;

-- Check all recruiters work for companies
SELECT 'Recruiters without company assignments' as check, COUNT(*) as issues
FROM users u 
WHERE u.role = 'recruiter' 
  AND NOT EXISTS (SELECT 1 FROM jobs j WHERE j.posted_by_recruiter_id = u.id);

-- Check all candidates have resumes  
SELECT 'Candidates without resumes' as check, COUNT(*) as issues
FROM users u
WHERE u.role = 'candidate'
  AND NOT EXISTS (SELECT 1 FROM resumes r WHERE r.user_id = u.id);

-- Check application consistency
SELECT 'Invalid applications' as check, COUNT(*) as issues  
FROM applications a
WHERE NOT EXISTS (SELECT 1 FROM jobs j WHERE j.id = a.job_id)
   OR NOT EXISTS (SELECT 1 FROM users u WHERE u.id = a.candidate_id AND u.role = 'candidate');

SELECT 'Mock dataset created successfully!' as message;