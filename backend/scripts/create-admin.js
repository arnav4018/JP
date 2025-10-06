require('dotenv').config();
const { connectDB } = require('../config/database');
const UserModel = require('../models/User');

async function createAdminUser() {
    try {
        console.log('Connecting to database...');
        await connectDB();
        console.log('Connected to database successfully');

        const userModel = new UserModel();
        
        // Check if admin already exists
        const existingAdmin = await userModel.findByEmail('admin@jobportal.com');
        if (existingAdmin) {
            console.log('Admin user already exists:');
            console.log('Email: admin@jobportal.com');
            console.log('Password: admin123');
            console.log('Role: admin');
            process.exit(0);
        }

        // Create admin user
        const adminData = {
            firstName: 'Super',
            lastName: 'Admin',
            email: 'admin@jobportal.com',
            password: 'admin123',
            role: 'admin',
            phone: '+1234567890'
        };

        const admin = await userModel.createUser(adminData);
        console.log('✅ Admin user created successfully!');
        console.log('\n📋 Admin Credentials:');
        console.log('Email: admin@jobportal.com');
        console.log('Password: admin123');
        console.log('Role: admin');
        console.log(`User ID: ${admin.id}`);
        
        console.log('\n🔐 Please change the default password after first login!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        process.exit(1);
    }
}

// Run the script
createAdminUser();