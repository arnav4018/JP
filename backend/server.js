const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { setupDatabase } = require('./setup-database');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
// const resumeRoutes = require('./routes/resumes');
// const paymentRoutes = require('./routes/paymentRoutes');
// const systemSettingsRoutes = require('./routes/systemSettingsRoutes');
// const referralRoutes = require('./routes/referralRoutes');
// const aiScoringRoutes = require('./routes/aiScoringRoutes');
// const messageRoutes = require('./routes/messageRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// const exportRoutes = require('./routes/exportRoutes');
// Temporarily commented out MongoDB-dependent services
// const socketService = require('./services/socketService');
// const notificationService = require('./services/notificationService');
// const analyticsService = require('./services/analyticsService');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Async function to initialize server
async function initializeServer() {
    try {
        console.log('🚀 Starting server initialization...');
        console.log('📊 Environment check:', {
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
            DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
            JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
        });
        
        // Connect to database
        console.log('🔗 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected successfully');
        
        // Setup database tables if needed
        console.log('📋 Setting up database tables...');
        await setupDatabase();
        console.log('✅ Database setup completed');
        
        // Initialize Socket.IO service - temporarily disabled
        // const io = socketService.initialize(server);

        // Trust proxy for Render deployment
        app.set('trust proxy', 1);

        // Security middleware
        app.use(helmet());
        app.use(cors({
            origin: [
                process.env.FRONTEND_URL || 'http://localhost:3000',
                'http://localhost:3000',
                /^https:\/\/jp-frontend.*\.vercel\.app$/,
                'https://jp-frontend-stg.vercel.app' // staging if you have one
            ],
            credentials: true
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        });
        app.use('/api', limiter);

        // Body parsing middleware
        app.use(express.json({ limit: '10mb' }));
        app.use(express.urlencoded({ extended: true }));

        // Serve static files for uploads
        app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

        // Logging
        app.use(morgan('combined'));

        // Routes
        app.use('/api/auth', authRoutes);
        app.use('/api/jobs', jobRoutes);
        app.use('/api/applications', applicationRoutes);
        // app.use('/api/resumes', resumeRoutes);
        // app.use('/api/payments', paymentRoutes);
        // app.use('/api/settings', systemSettingsRoutes);
        // app.use('/api/referrals', referralRoutes);
        // app.use('/api/ai-scoring', aiScoringRoutes);
        // app.use('/api/messages', messageRoutes);
        // app.use('/api/notifications', notificationRoutes);
        // app.use('/api/admin', adminRoutes);
        // app.use('/api/admin/export', exportRoutes);

        // Root endpoint for testing
        app.get('/', (req, res) => {
            res.status(200).json({
                message: 'Job Portal API Server',
                status: 'running',
                version: '1.0.0',
                endpoints: {
                    health: '/api/health',
                    auth: '/api/auth',
                    jobs: '/api/jobs',
                    applications: '/api/applications'
                }
            });
        });

        // Health check route
        app.get('/api/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                message: 'Job Portal API is running',
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            });
        });

        // Error handling middleware (should be last)
        app.use(errorHandler);

        // Handle 404 routes
        app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found'
            });
        });

        const PORT = process.env.PORT || 5000;

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📦 PostgreSQL database connected`);
            console.log(`🔗 Basic job API endpoints available`);
            console.log(`📁 File uploads available at /uploads`);
            console.log(`⚠️  Advanced features temporarily disabled`);
        });
        
    } catch (error) {
        console.error('❌ Server initialization failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Start the server
initializeServer();

module.exports = app;