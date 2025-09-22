require('dotenv').config();
const { connectDB } = require('./config/database');

async function testConnection() {
    console.log('🔍 Testing PostgreSQL connection...');
    
    try {
        await connectDB();
        console.log('✅ PostgreSQL connection test successful!');
        process.exit(0);
    } catch (error) {
        console.error('❌ PostgreSQL connection test failed:', error.message);
        process.exit(1);
    }
}

testConnection();