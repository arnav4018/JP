# ============================================================================
# Job Portal Database Setup Script (PowerShell)
# ============================================================================

Write-Host "============================================================================" -ForegroundColor Green
Write-Host "                      JOB PORTAL DATABASE SETUP" -ForegroundColor Green  
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""

# Step 1: Create database and user
Write-Host "Step 1: Creating database and user (requires postgres superuser password)" -ForegroundColor Cyan
Write-Host "Command: psql -U postgres -h localhost -f 00_setup_database.sql" -ForegroundColor Yellow
Write-Host ""

try {
    $result = psql -U postgres -h localhost -f 00_setup_database.sql
    if ($LASTEXITCODE -ne 0) {
        throw "Database creation failed"
    }
    Write-Host "✓ Database and user created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Failed to create database." -ForegroundColor Red
    Write-Host "Please check your postgres password or try:" -ForegroundColor Yellow
    Write-Host "psql -U postgres -h localhost -p 5432 -f 00_setup_database.sql" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "Step 2: Setting up complete database schema (all 3 phases)" -ForegroundColor Cyan
Write-Host "Command: psql -U job_portal_user -d job_portal_db -h localhost -f init_database.sql" -ForegroundColor Yellow
Write-Host "Password: job_portal_2024" -ForegroundColor Magenta
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""

try {
    $result = psql -U job_portal_user -d job_portal_db -h localhost -f init_database.sql
    if ($LASTEXITCODE -ne 0) {
        throw "Schema creation failed"
    }
    Write-Host "✓ Complete 3-phase schema created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Failed to create schema." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "Step 3: Loading realistic mock data (10 companies, 20 users, 15 jobs, etc.)" -ForegroundColor Cyan
Write-Host "Command: psql -U job_portal_user -d job_portal_db -h localhost -f 09_realistic_mock_data.sql" -ForegroundColor Yellow
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""

try {
    $result = psql -U job_portal_user -d job_portal_db -h localhost -f 09_realistic_mock_data.sql
    if ($LASTEXITCODE -ne 0) {
        throw "Mock data loading failed"
    }
    Write-Host "✓ Realistic mock data loaded successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Failed to load mock data." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Success message
Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "                          🎉 SUCCESS!" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your Job Portal database is now ready with:" -ForegroundColor White
Write-Host "  ✓ Complete 3-phase schema (Core + Advanced + Optimized)" -ForegroundColor Green
Write-Host "  ✓ 10 Companies across Indian cities" -ForegroundColor Green
Write-Host "  ✓ 20 Users (5 admins, 5 recruiters, 10 candidates)" -ForegroundColor Green
Write-Host "  ✓ 15 Jobs with realistic descriptions and requirements" -ForegroundColor Green
Write-Host "  ✓ 20 Skills (technical and soft skills)" -ForegroundColor Green
Write-Host "  ✓ 10 Detailed resumes with JSONB data" -ForegroundColor Green
Write-Host "  ✓ 30 Job applications with various statuses" -ForegroundColor Green
Write-Host "  ✓ Performance indexes, materialized views, security policies" -ForegroundColor Green
Write-Host "  ✓ Monitoring and maintenance procedures" -ForegroundColor Green
Write-Host ""
Write-Host "Database Connection Info:" -ForegroundColor Yellow
Write-Host "  Database: job_portal_db" -ForegroundColor White
Write-Host "  Username: job_portal_user" -ForegroundColor White
Write-Host "  Password: job_portal_2024" -ForegroundColor White
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host ""
Write-Host "Connect using:" -ForegroundColor Cyan
Write-Host "psql -U job_portal_user -d job_portal_db -h localhost" -ForegroundColor Yellow
Write-Host ""
Write-Host "Test queries to try:" -ForegroundColor Cyan
Write-Host "SELECT COUNT(*) FROM companies;" -ForegroundColor Yellow
Write-Host "SELECT COUNT(*) FROM users;" -ForegroundColor Yellow  
Write-Host "SELECT COUNT(*) FROM jobs WHERE is_active = TRUE;" -ForegroundColor Yellow
Write-Host "SELECT * FROM mv_applicant_skill_match LIMIT 5;" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to continue"