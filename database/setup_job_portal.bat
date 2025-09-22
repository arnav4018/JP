@echo off
echo ============================================================================
echo                      JOB PORTAL DATABASE SETUP
echo ============================================================================
echo.

echo Step 1: Creating database and user (requires postgres superuser password)
echo Command: psql -U postgres -h localhost -f 00_setup_database.sql
echo.
psql -U postgres -h localhost -f 00_setup_database.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create database. Please check your postgres password.
    echo.
    echo Alternative: Try with different connection parameters:
    echo psql -U postgres -h localhost -p 5432 -f 00_setup_database.sql
    pause
    exit /b 1
)

echo.
echo ============================================================================
echo Step 2: Setting up complete database schema (all 3 phases)
echo Command: psql -U job_portal_user -d job_portal_db -h localhost -f init_database.sql
echo Password: job_portal_2024
echo ============================================================================
echo.
psql -U job_portal_user -d job_portal_db -h localhost -f init_database.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create schema.
    pause
    exit /b 1
)

echo.
echo ============================================================================
echo Step 3: Loading realistic mock data (10 companies, 20 users, 15 jobs, etc.)
echo Command: psql -U job_portal_user -d job_portal_db -h localhost -f 09_realistic_mock_data.sql  
echo ============================================================================
echo.
psql -U job_portal_user -d job_portal_db -h localhost -f 09_realistic_mock_data.sql
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to load mock data.
    pause
    exit /b 1
)

echo.
echo ============================================================================
echo                          SUCCESS! 
echo ============================================================================
echo.
echo Your Job Portal database is now ready with:
echo   ✓ Complete 3-phase schema (Core + Advanced + Optimized)
echo   ✓ 10 Companies across Indian cities
echo   ✓ 20 Users (5 admins, 5 recruiters, 10 candidates)  
echo   ✓ 15 Jobs with realistic descriptions and requirements
echo   ✓ 20 Skills (technical and soft skills)
echo   ✓ 10 Detailed resumes with JSONB data
echo   ✓ 30 Job applications with various statuses
echo   ✓ Performance indexes, materialized views, security policies
echo   ✓ Monitoring and maintenance procedures
echo.
echo Database: job_portal_db
echo Username: job_portal_user  
echo Password: job_portal_2024
echo Host: localhost
echo.
echo You can now connect with:
echo psql -U job_portal_user -d job_portal_db -h localhost
echo.
pause