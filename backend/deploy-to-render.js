const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('🚀 Deploying Job Portal Database to Render...');
console.log('===============================================');

// Render database configuration
const renderPool = new Pool({
    host: 'dpg-d3a2c8p5pdvs73e26hbg-a.singapore-postgres.render.com',
    port: 5432,
    database: 'job_portal_db_yrp0',
    user: 'job_portal_db_yrp0_user',
    password: 'L8kuPX4p7cr9Tzt7qcotIvXqdCuSWYP6',
    ssl: { rejectUnauthorized: false }
});

async function deployDatabase() {
    try {
        const client = await renderPool.connect();
        console.log('✅ Connected to Render database');

        // Read and execute SQL files in order
        const sqlFiles = [
            '../database/01_core_schema.sql',
            '../database/02_sample_data.sql',
            '../database/04_phase2_schema.sql',
            '../database/05_phase2_sample_data.sql',
            '../database/07_phase3_optimization.sql',
            '../database/08_monitoring_maintenance.sql'
        ];

        console.log('\n📋 Deploying database schema and data...');

        for (const sqlFile of sqlFiles) {
            const filePath = path.join(__dirname, sqlFile);
            if (fs.existsSync(filePath)) {
                console.log(`\n🔄 Executing: ${path.basename(sqlFile)}`);
                
                const sqlContent = fs.readFileSync(filePath, 'utf8');
                
                // Split SQL content by statements (basic split on semicolon)
                const statements = sqlContent
                    .split(';')
                    .map(stmt => stmt.trim())
                    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

                for (let i = 0; i < statements.length; i++) {
                    const statement = statements[i];
                    if (statement && statement.length > 5) {
                        try {
                            await client.query(statement + ';');
                        } catch (error) {
                            // Log error but continue (some statements might fail due to existing data)
                            console.log(`   ⚠️  Warning in statement ${i + 1}: ${error.message.substring(0, 100)}...`);
                        }
                    }
                }
                
                console.log(`   ✅ Completed: ${path.basename(sqlFile)}`);
            } else {
                console.log(`   ⚠️  File not found: ${sqlFile}`);
            }
        }

        // Verify deployment
        console.log('\n🔍 Verifying deployment...');
        
        // Check tables
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        console.log(`✅ Tables created: ${tablesResult.rows.length}`);
        tablesResult.rows.forEach((row, i) => {
            console.log(`   ${i+1}. ${row.table_name}`);
        });

        // Check data in main tables
        const dataTables = ['users', 'companies', 'jobs', 'applications', 'skills', 'resumes'];
        console.log('\n📊 Data verification:');
        
        for (const table of dataTables) {
            try {
                const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
                console.log(`   ${table}: ${result.rows[0].count} records`);
            } catch (error) {
                console.log(`   ${table}: Table not found or error`);
            }
        }

        client.release();
        await renderPool.end();
        
        console.log('\n🎉 DATABASE DEPLOYMENT COMPLETED!');
        console.log('✅ Your Job Portal database is now live on Render!');
        console.log('🔗 Connection details:');
        console.log('   Host: dpg-d3a2c8p5pdvs73e26hbg-a.singapore-postgres.render.com');
        console.log('   Database: job_portal_db_yrp0');
        console.log('   User: job_portal_db_yrp0_user');
        
    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

deployDatabase();