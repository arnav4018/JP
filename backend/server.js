const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const resumeRoutes = require('./routes/resumes');
const paymentRoutes = require('./routes/paymentRoutes');
const systemSettingsRoutes = require('./routes/systemSettingsRoutes');
const referralRoutes = require('./routes/referralRoutes');
const aiScoringRoutes = require('./routes/aiScoringRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const exportRoutes = require('./routes/exportRoutes');
const socketService = require('./services/socketService');
const notificationService = require('./services/notificationService');
const analyticsService = require('./services/analyticsService');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

// Async function to initialize server
async function initializeServer() {
    try {
        // Connect to database
        await connectDB();
        
        // Initialize Socket.IO service
        const io = socketService.initialize(server);

        // Security middleware
        app.use(helmet());
        app.use(cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
        app.use('/api/resumes', resumeRoutes);
        app.use('/api/payments', paymentRoutes);
        app.use('/api/settings', systemSettingsRoutes);
        app.use('/api/referrals', referralRoutes);
        app.use('/api/ai-scoring', aiScoringRoutes);
        app.use('/api/messages', messageRoutes);
        app.use('/api/notifications', notificationRoutes);
        app.use('/api/admin', adminRoutes);
        app.use('/api/admin/export', exportRoutes);

        // Health check route
        app.get('/api/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                message: 'Job Portal API is running',
                timestamp: new Date().toISOString()
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
            console.log(`💬 Socket.IO enabled for real-time communication`);
            console.log(`🔔 Notification service initialized`);
            console.log(`📊 Analytics service initialized`);
            console.log(`💼 Admin dashboard available`);
            console.log(`📁 File uploads available at /uploads`);
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