const { pool } = require('./config/database');

async function setupDatabase() {
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

        // Create users table if it doesn't exist
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
                    phone VARCHAR(20),
                    avatar VARCHAR(500),
                    google_id VARCHAR(255) UNIQUE,
                    linkedin_id VARCHAR(255) UNIQUE,
                    is_profile_complete BOOLEAN DEFAULT FALSE,
                    is_email_verified BOOLEAN DEFAULT FALSE,
                    email_verification_token VARCHAR(500),
                    email_verification_expires TIMESTAMP,
                    password_reset_token VARCHAR(500),
                    password_reset_expires TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    last_login TIMESTAMP,
                    is_online BOOLEAN DEFAULT FALSE,
                    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    resume TEXT,
                    skills TEXT[],
                    experience INTEGER DEFAULT 0,
                    location_city VARCHAR(255),
                    location_state VARCHAR(255),
                    location_country VARCHAR(255),
                    company_name VARCHAR(255),
                    company_website VARCHAR(255),
                    company_size VARCHAR(50),
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

        console.log('🎉 Database setup completed successfully');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.error(error.stack);
    } finally {
        await pool.end();
    }
}

// Run setup if called directly
if (require.main === module) {
    setupDatabase();
}

module.exports = { setupDatabase };