-- Fix user permissions and password
ALTER USER job_portal_user WITH PASSWORD 'job_portal_2024';
GRANT ALL PRIVILEGES ON DATABASE job_portal_db TO job_portal_user;

-- Connect to the job_portal_db
\c job_portal_db;

-- Grant all necessary permissions
GRANT ALL ON SCHEMA public TO job_portal_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO job_portal_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO job_portal_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO job_portal_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO job_portal_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO job_portal_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO job_portal_user;

SELECT 'User permissions fixed!' as message;