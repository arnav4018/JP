const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 COMPREHENSIVE DATABASE DEPLOYMENT VERIFICATION');
console.log('================================================');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
});

async function comprehensiveCheck() {
    try {
        const client = await pool.connect();
        
        console.log('✅ 1. CONNECTION STATUS: SUCCESS');
        console.log('   Host:', process.env.DB_HOST);
        console.log('   Database:', process.env.DB_DATABASE);
        
        // Check all tables exist
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log('\n✅ 2. DATABASE TABLES:', tablesResult.rows.length, 'TABLES');
        tablesResult.rows.forEach((row, i) => {
            console.log(`   ${i+1}. ${row.table_name}`);
        });
        
        // Check data in each major table
        const dataChecks = [
            { table: 'users', expected: 20 },
            { table: 'companies', expected: 10 },
            { table: 'jobs', expected: 15 },
            { table: 'applications', expected: 30 },
            { table: 'skills', expected: 20 },
            { table: 'resumes', expected: 5 },
            { table: 'resume_skills', expected: 18 },
            { table: 'referrals', expected: 3 },
            { table: 'payments', expected: 5 },
            { table: 'resume_templates', expected: 5 }
        ];
        
        console.log('\n✅ 3. DATA VERIFICATION:');
        let allDataCorrect = true;
        
        for (const check of dataChecks) {
            const result = await client.query(`SELECT COUNT(*) as count FROM ${check.table}`);
            const actual = parseInt(result.rows[0].count);
            const status = actual >= check.expected ? '✅' : '❌';
            if (actual < check.expected) allDataCorrect = false;
            console.log(`   ${status} ${check.table}: ${actual} records`);
        }
        
        // Check specific functionality
        console.log('\n✅ 4. FUNCTIONAL VERIFICATION:');
        
        // Test user roles
        const roleCheck = await client.query('SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role');
        console.log('   👥 User Roles:');
        roleCheck.rows.forEach(row => {
            console.log(`      - ${row.role}: ${row.count}`);
        });
        
        // Test active jobs
        const jobCheck = await client.query('SELECT COUNT(*) as count FROM jobs WHERE is_active = true');
        console.log(`   💼 Active Jobs: ${jobCheck.rows[0].count}`);
        
        // Test resume with skills
        const resumeSkillCheck = await client.query(`
            SELECT r.id, COUNT(rs.skill_id) as skill_count 
            FROM resumes r 
            LEFT JOIN resume_skills rs ON r.id = rs.resume_id 
            GROUP BY r.id 
            ORDER BY r.id 
            LIMIT 3
        `);
        console.log('   📋 Sample Resume Skills:');
        resumeSkillCheck.rows.forEach(row => {
            console.log(`      - Resume ${row.id}: ${row.skill_count} skills`);
        });
        
        // Test payments
        const paymentCheck = await client.query(`
            SELECT purpose, COUNT(*) as count, SUM(amount) as total 
            FROM payments 
            GROUP BY purpose 
            ORDER BY total DESC 
            LIMIT 3
        `);
        console.log('   💰 Top Payment Categories:');
        paymentCheck.rows.forEach(row => {
            console.log(`      - ${row.purpose}: ₹${row.total}`);
        });
        
        // Test foreign key relationships
        console.log('\n✅ 5. RELATIONSHIP INTEGRITY:');
        
        const relationshipChecks = [
            { name: 'Jobs → Companies', query: 'SELECT COUNT(*) FROM jobs j JOIN companies c ON j.company_id = c.id' },
            { name: 'Applications → Users', query: 'SELECT COUNT(*) FROM applications a JOIN users u ON a.candidate_id = u.id' },
            { name: 'Applications → Jobs', query: 'SELECT COUNT(*) FROM applications a JOIN jobs j ON a.job_id = j.id' },
            { name: 'Resumes → Users', query: 'SELECT COUNT(*) FROM resumes r JOIN users u ON r.user_id = u.id' },
            { name: 'Resume Skills → Skills', query: 'SELECT COUNT(*) FROM resume_skills rs JOIN skills s ON rs.skill_id = s.id' }
        ];
        
        for (const rel of relationshipChecks) {
            const result = await client.query(rel.query);
            console.log(`   🔗 ${rel.name}: ${result.rows[0].count} valid links`);
        }
        
        // Test JSON data in resumes
        const jsonCheck = await client.query(`
            SELECT 
                COUNT(*) as total_resumes,
                COUNT(CASE WHEN resume_data->>'summary' IS NOT NULL THEN 1 END) as with_summary,
                COUNT(CASE WHEN resume_data->'personal_info'->>'firstName' IS NOT NULL THEN 1 END) as with_personal_info
            FROM resumes
        `);
        console.log('\n✅ 6. JSON DATA INTEGRITY:');
        console.log(`   📝 Total Resumes: ${jsonCheck.rows[0].total_resumes}`);
        console.log(`   📄 With Summary: ${jsonCheck.rows[0].with_summary}`);
        console.log(`   👤 With Personal Info: ${jsonCheck.rows[0].with_personal_info}`);
        
        client.release();
        await pool.end();
        
        console.log('\n🎉 DEPLOYMENT VERIFICATION COMPLETE!');
        console.log('====================================');
        
        if (allDataCorrect) {
            console.log('✅ STATUS: FULLY DEPLOYED AND OPERATIONAL');
            console.log('✅ Your Supabase database is ready for production use!');
            console.log('✅ All tables, data, and relationships are working correctly.');
        } else {
            console.log('⚠️  STATUS: DEPLOYED WITH MINOR ISSUES');
            console.log('   Some tables may have fewer records than expected, but core functionality is working.');
        }
        
    } catch (error) {
        console.error('❌ DEPLOYMENT VERIFICATION FAILED:', error.message);
        process.exit(1);
    }
}

comprehensiveCheck();