const { pool } = require('./config/database');

async function setupDatabase(closePool = false) {
    try {
        console.log('🔍 Checking database tables...');

        // Check if users table exists
        const tablesQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        const tablesResult = await pool.query(tablesQuery);
        const tables = tablesResult.rows.map(row => row.table_name);
        
        console.log('📋 Existing tables:', tables);

        // Create users table if it doesn't exist, or update it if it does
        if (!tables.includes('users')) {
            console.log('🔧 Creating users table...');
            const createUsersTable = `
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    first_name VARCHAR(255) NOT NULL,
                    last_name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'candidate' CHECK (role IN ('candidate', 'recruiter', 'admin')),
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX idx_users_email ON users(email);
                CREATE INDEX idx_users_role ON users(role);
                CREATE INDEX idx_users_is_active ON users(is_active);
            `;
            
            await pool.query(createUsersTable);
            console.log('✅ Users table created successfully');
        } else {
            console.log('✅ Users table already exists');
            
            // Check and add missing columns if table exists but is incomplete
            console.log('🔧 Checking for missing columns in users table...');
            const columnsQuery = `
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' AND table_schema = 'public'
            `;
            const columnsResult = await pool.query(columnsQuery);
            const columns = columnsResult.rows.map(row => row.column_name);
            
            const requiredColumns = [
                { name: 'phone', type: 'VARCHAR(20)' },
                { name: 'avatar', type: 'VARCHAR(500)' },
                { name: 'is_profile_complete', type: 'BOOLEAN DEFAULT FALSE' },
                { name: 'is_email_verified', type: 'BOOLEAN DEFAULT FALSE' },
                { name: 'last_login', type: 'TIMESTAMP' },
                { name: 'company_name', type: 'VARCHAR(255)' },
                { name: 'company_website', type: 'VARCHAR(500)' },
                { name: 'company_size', type: 'VARCHAR(100)' },
                { name: 'location', type: 'VARCHAR(255)' },
                { name: 'bio', type: 'TEXT' },
                { name: 'title', type: 'VARCHAR(255)' },
                { name: 'website', type: 'VARCHAR(500)' },
                { name: 'skills', type: 'TEXT' },
                { name: 'experience', type: 'TEXT' }
            ];
            
            for (const col of requiredColumns) {
                if (!columns.includes(col.name)) {
                    try {
                        await pool.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
                        console.log(`✅ Added column '${col.name}' to users table`);
                    } catch (err) {
                        console.log(`⚠️  Could not add column '${col.name}': ${err.message}`);
                    }
                }
            }
        }

        // Check if companies table exists and create if needed
        if (!tables.includes('companies')) {
            console.log('🔧 Creating companies table...');
            const createCompaniesTable = `
                CREATE TABLE companies (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    website VARCHAR(255),
                    logo_url VARCHAR(500),
                    size VARCHAR(50),
                    industry VARCHAR(255),
                    founded_year INTEGER,
                    location_city VARCHAR(255),
                    location_state VARCHAR(255),
                    location_country VARCHAR(255),
                    is_active BOOLEAN DEFAULT TRUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX idx_companies_name ON companies(name);
                CREATE INDEX idx_companies_is_active ON companies(is_active);
            `;
            
            await pool.query(createCompaniesTable);
            console.log('✅ Companies table created successfully');

            // Insert some sample companies
            const insertCompanies = `
                INSERT INTO companies (name, description, website, size, industry) VALUES
                ('TechCorp Solutions', 'Leading technology solutions provider', 'https://techcorp.com', '1000-5000', 'Technology'),
                ('Innovate Labs', 'Innovation-driven software development', 'https://innovatelabs.com', '200-500', 'Technology'),
                ('StartupXYZ', 'Fintech startup revolutionizing payments', 'https://startupxyz.com', '50-200', 'Financial Technology')
                ON CONFLICT DO NOTHING;
            `;
            await pool.query(insertCompanies);
            console.log('✅ Sample companies inserted');
        }

        // Check if jobs table exists and create if needed
        if (!tables.includes('jobs')) {
            console.log('🔧 Creating jobs table...');
            const createJobsTable = `
                CREATE TABLE jobs (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(255) NOT NULL,
                    description TEXT NOT NULL,
                    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
                    location VARCHAR(255),
                    salary_min INTEGER,
                    salary_max INTEGER,
                    experience_level VARCHAR(100),
                    employment_type VARCHAR(50) DEFAULT 'full-time',
                    is_remote BOOLEAN DEFAULT FALSE,
                    posted_by_recruiter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed', 'draft')),
                    requirements TEXT,
                    benefits TEXT,
                    skills_required TEXT,
                    application_deadline TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    views INTEGER DEFAULT 0,
                    is_urgent BOOLEAN DEFAULT FALSE,
                    is_featured BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE INDEX idx_jobs_title ON jobs(title);
                CREATE INDEX idx_jobs_company ON jobs(company_id);
                CREATE INDEX idx_jobs_location ON jobs(location);
                CREATE INDEX idx_jobs_status ON jobs(status);
                CREATE INDEX idx_jobs_is_active ON jobs(is_active);
                CREATE INDEX idx_jobs_posted_by ON jobs(posted_by_recruiter_id);
            `;
            
            await pool.query(createJobsTable);
            console.log('✅ Jobs table created successfully');
        } else {
            console.log('✅ Jobs table already exists');
            
            // Check and add missing columns if table exists but is incomplete
            console.log('🔧 Checking for missing columns in jobs table...');
            const jobColumnsQuery = `
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'jobs' AND table_schema = 'public'
            `;
            const jobColumnsResult = await pool.query(jobColumnsQuery);
            const jobColumns = jobColumnsResult.rows.map(row => row.column_name);
            
            const requiredJobColumns = [
                { name: 'employment_type', type: 'VARCHAR(50) DEFAULT \'full-time\'' },
                { name: 'experience_level', type: 'VARCHAR(100)' },
                { name: 'is_remote', type: 'BOOLEAN DEFAULT FALSE' },
                { name: 'requirements', type: 'TEXT' },
                { name: 'benefits', type: 'TEXT' },
                { name: 'skills_required', type: 'TEXT' },
                { name: 'application_deadline', type: 'TIMESTAMP' },
                { name: 'views', type: 'INTEGER DEFAULT 0' },
                { name: 'is_urgent', type: 'BOOLEAN DEFAULT FALSE' },
                { name: 'is_featured', type: 'BOOLEAN DEFAULT FALSE' },
                { name: 'status', type: 'VARCHAR(50) DEFAULT \'active\'' },
                { name: 'posted_at', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
            ];
            
            for (const col of requiredJobColumns) {
                if (!jobColumns.includes(col.name)) {
                    try {
                        await pool.query(`ALTER TABLE jobs ADD COLUMN ${col.name} ${col.type}`);
                        console.log(`✅ Added column '${col.name}' to jobs table`);
                    } catch (err) {
                        console.log(`⚠️  Could not add column '${col.name}': ${err.message}`);
                    }
                }
            }
        }

        // Check if applications table exists and create if needed
        if (!tables.includes('applications')) {
            console.log('🔧 Creating applications table...');
            const createApplicationsTable = `
                CREATE TABLE applications (
                    id SERIAL PRIMARY KEY,
                    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
                    candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    status VARCHAR(50) DEFAULT 'Applied' CHECK (status IN ('Applied', 'Reviewed', 'Shortlisted', 'Interview Scheduled', 'Interview Completed', 'Offer Extended', 'Offer Accepted', 'Rejected', 'Withdrawn')),
                    resume_filename VARCHAR(255),
                    resume_original_name VARCHAR(255),
                    resume_file_size INTEGER,
                    resume_mime_type VARCHAR(100),
                    cover_letter TEXT,
                    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    reviewed_at TIMESTAMP,
                    reviewed_by INTEGER REFERENCES users(id),
                    status_reason TEXT,
                    source VARCHAR(50) DEFAULT 'direct',
                    referred_by INTEGER REFERENCES users(id),
                    expected_salary_amount INTEGER,
                    expected_salary_currency VARCHAR(10) DEFAULT 'INR',
                    availability_date DATE,
                    notice_period VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(job_id, candidate_id)
                );

                CREATE INDEX idx_applications_job ON applications(job_id);
                CREATE INDEX idx_applications_candidate ON applications(candidate_id);
                CREATE INDEX idx_applications_status ON applications(status);
                CREATE INDEX idx_applications_submitted ON applications(submitted_at);
            `;
            
            await pool.query(createApplicationsTable);
            console.log('✅ Applications table created successfully');
        }

        console.log('🎉 Database setup completed successfully');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.error(error.stack);
        throw error; // Re-throw so server initialization fails if DB setup fails
    } finally {
        if (closePool) {
            await pool.end();
        }
    }
}

// Run setup if called directly
if (require.main === module) {
    setupDatabase(true); // Close pool when running standalone
}

module.exports = { setupDatabase };