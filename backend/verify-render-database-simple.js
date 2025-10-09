const { Pool } = require('pg');
require('dotenv').config();

console.log('🔍 Quick Database Connection Test for Render');
console.log('===========================================');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000, // 5 second timeout
    idleTimeoutMillis: 10000, // 10 second idle timeout
});

async function quickVerification() {
    let client;
    try {
        console.log('📡 Connecting to database...');
        client = await pool.connect();
        
        console.log('✅ Database connection: SUCCESS');
        console.log('   Host:', process.env.DB_HOST?.substring(0, 20) + '...');
        console.log('   Database:', process.env.DB_DATABASE);
        
        // Quick test query
        const result = await client.query('SELECT NOW() as current_time');
        console.log('✅ Database query test: SUCCESS');
        console.log('   Server time:', result.rows[0].current_time);
        
        // Quick table count
        const tablesResult = await client.query(`
            SELECT COUNT(*) as table_count 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
        `);
        console.log('✅ Database tables:', tablesResult.rows[0].table_count);
        
        console.log('\n🎉 Database verification completed successfully!');
        
    } catch (error) {
        console.error('❌ Database verification failed:', error.message);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
        await pool.end();
    }
}

// Set a hard timeout
const timeoutId = setTimeout(() => {
    console.error('⏰ Verification timed out after 15 seconds');
    process.exit(1);
}, 15000);

quickVerification()
    .then(() => {
        clearTimeout(timeoutId);
        process.exit(0);
    })
    .catch((error) => {
        clearTimeout(timeoutId);
        console.error('❌ Failed:', error.message);
        process.exit(1);
    });