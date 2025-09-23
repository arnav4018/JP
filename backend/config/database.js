const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // SSL configuration for Supabase (required for hosted PostgreSQL)
    ssl: process.env.DB_HOST && process.env.DB_HOST.includes('supabase.co') 
        ? { rejectUnauthorized: false } 
        : process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    // Connection pool settings
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 5000, // Increased timeout for remote connections
});

const connectDB = async () => {
    try {
        // Test the connection
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        
        console.log(`📦 PostgreSQL Connected: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
        console.log(`⏰ Database time: ${result.rows[0].now}`);
        
        // Handle pool events
        pool.on('error', (err) => {
            console.error('❌ PostgreSQL pool error:', err.message);
        });

        pool.on('connect', (client) => {
            console.log('🔗 New PostgreSQL client connected');
        });

        pool.on('remove', (client) => {
            console.log('🔌 PostgreSQL client removed from pool');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            console.log('🔄 Shutting down PostgreSQL pool...');
            await pool.end();
            console.log('🔌 PostgreSQL pool closed through app termination');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('🔄 Shutting down PostgreSQL pool...');
            await pool.end();
            console.log('🔌 PostgreSQL pool closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error.message);
        process.exit(1);
    }
};

// Export both the connection function and the pool for use in controllers
module.exports = {
    connectDB,
    pool
};
