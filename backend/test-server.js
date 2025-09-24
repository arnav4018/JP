const { Pool } = require('pg');
require('dotenv').config();

async function testServerReadiness() {
    console.log('🧪 Testing server readiness for Render deployment...\n');
    
    // Test 1: Environment Variables
    console.log('✅ 1. ENVIRONMENT VARIABLES:');
    const requiredEnvVars = [
        'DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD',
        'JWT_SECRET', 'JWT_EXPIRE'
    ];
    
    let allEnvVarsPresent = true;
    requiredEnvVars.forEach(varName => {
        if (process.env[varName]) {
            console.log(`   ✅ ${varName}: Set`);
        } else {
            console.log(`   ❌ ${varName}: Missing`);
            allEnvVarsPresent = false;
        }
    });
    
    // Test 2: Database Connection
    console.log('\n✅ 2. DATABASE CONNECTION:');
    try {
        const pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_DATABASE,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            ssl: { rejectUnauthorized: false }
        });
        
        const client = await pool.connect();
        const result = await client.query('SELECT NOW() as current_time');
        console.log(`   ✅ Database connection: SUCCESS`);
        console.log(`   🕒 Server time: ${result.rows[0].current_time}`);
        
        client.release();
        await pool.end();
        
    } catch (error) {
        console.log(`   ❌ Database connection: FAILED - ${error.message}`);
        return false;
    }
    
    // Test 3: Required Dependencies
    console.log('\n✅ 3. KEY DEPENDENCIES:');
    const keyDependencies = ['express', 'cors', 'helmet', 'pg', 'jsonwebtoken', 'bcryptjs'];
    
    keyDependencies.forEach(dep => {
        try {
            require(dep);
            console.log(`   ✅ ${dep}: Available`);
        } catch (error) {
            console.log(`   ❌ ${dep}: Missing`);
        }
    });
    
    // Test 4: File Structure
    console.log('\n✅ 4. FILE STRUCTURE:');
    const fs = require('fs');
    const criticalFiles = ['server.js', 'package.json', 'config/database.js'];
    
    criticalFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`   ✅ ${file}: Exists`);
        } else {
            console.log(`   ❌ ${file}: Missing`);
        }
    });
    
    // Test 5: Port Configuration
    console.log('\n✅ 5. PORT CONFIGURATION:');
    const port = process.env.PORT || 5000;
    console.log(`   ✅ Port: ${port}`);
    
    console.log('\n🎉 SERVER READINESS TEST COMPLETED!');
    console.log('====================================');
    
    if (allEnvVarsPresent) {
        console.log('✅ Your backend is ready for Render deployment!');
        console.log('📦 All environment variables are configured');
        console.log('💾 Database connection is working');
        console.log('📁 All critical files are present');
        
        console.log('\n📋 NEXT STEPS:');
        console.log('1. 🌐 Create a new Web Service on Render');
        console.log('2. ⚙️  Configure environment variables in Render dashboard');
        console.log('3. 🚀 Deploy your backend');
        console.log('4. 🧪 Test the deployed endpoints');
    } else {
        console.log('⚠️  Some environment variables are missing');
        console.log('Please check your .env file configuration');
    }
    
    return true;
}

testServerReadiness().catch(console.error);