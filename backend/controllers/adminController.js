const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Referral = require('../models/Referral');
const analyticsService = require('../services/analyticsService');
const { validationResult } = require('express-validator');

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/dashboard/stats
 * @access  Private (Admin)
 */
const getDashboardStats = async (req, res) => {
    try {
        const { timeframe = '30' } = req.query; // Default to 30 days
        const days = parseInt(timeframe);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get current date for comparison
        const now = new Date();

        // Parallel queries for better performance
        const [
            totalUsers,
            newUsersCount,
            totalJobs,
            activeJobs,
            totalApplications,
            newApplicationsCount,
            totalPayments,
            totalRevenue,
            newPayments,
            pendingApplications,
            usersByRole,
            topCompanies,
            recentActivities
        ] = await Promise.all([
            // Total users
            User.countDocuments({ isActive: true }),
            
            // New users in timeframe
            User.countDocuments({
                isActive: true,
                createdAt: { $gte: startDate }
            }),

            // Total jobs
            Job.countDocuments(),

            // Active jobs
            Job.countDocuments({
                status: 'active',
                deadline: { $gte: now }
            }),

            // Total applications
            Application.countDocuments(),

            // New applications in timeframe
            Application.countDocuments({
                createdAt: { $gte: startDate }
            }),

            // Total payments
            Payment.countDocuments(),

            // Total revenue
            Payment.aggregate([
                {
                    $match: {
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$amount' }
                    }
                }
            ]),

            // New payments in timeframe
            Payment.countDocuments({
                status: 'completed',
                createdAt: { $gte: startDate }
            }),

            // Pending applications
            Application.countDocuments({
                status: 'pending'
            }),

            // Users by role
            User.aggregate([
                {
                    $match: { isActive: true }
                },
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // Top companies by job postings
            Job.aggregate([
                {
                    $group: {
                        _id: '$company',
                        jobCount: { $sum: 1 },
                        activeJobs: {
                            $sum: {
                                $cond: [
                                    { 
                                        $and: [
                                            { $eq: ['$status', 'active'] },
                                            { $gte: ['$deadline', now] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $sort: { jobCount: -1 }
                },
                {
                    $limit: 10
                }
            ]),

            // Recent activities (applications, job posts)
            Application.find()
                .populate('candidate', 'firstName lastName')
                .populate('job', 'title company')
                .sort({ createdAt: -1 })
                .limit(10)
        ]);

        const revenue = totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0;

        res.status(200).json({
            success: true,
            message: 'Dashboard statistics retrieved successfully',
            data: {
                overview: {
                    totalUsers,
                    newUsers: newUsersCount,
                    totalJobs,
                    activeJobs,
                    totalApplications,
                    newApplications: newApplicationsCount,
                    totalPayments,
                    newPayments,
                    totalRevenue: revenue,
                    pendingApplications
                },
                usersByRole,
                topCompanies,
                recentActivities: recentActivities.map(app => ({
                    id: app._id,
                    type: 'application',
                    candidate: app.candidate ? `${app.candidate.firstName} ${app.candidate.lastName}` : 'Unknown',
                    job: app.job ? app.job.title : 'Unknown Job',
                    company: app.job ? app.job.company : 'Unknown Company',
                    status: app.status,
                    createdAt: app.createdAt
                })),
                timeframe: {
                    days,
                    startDate,
                    endDate: now
                }
            }
        });

    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get user analytics
 * @route   GET /api/admin/analytics/users
 * @access  Private (Admin)
 */
const getUserAnalytics = async (req, res) => {
    try {
        const { 
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate = new Date(),
            groupBy = 'day'
        } = req.query;

        // User registrations over time
        const userRegistrations = await User.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: groupBy === 'day' ? '%Y-%m-%d' : '%Y-%m',
                                date: '$createdAt'
                            }
                        },
                        role: '$role'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.date',
                    registrations: {
                        $push: {
                            role: '$_id.role',
                            count: '$count'
                        }
                    },
                    total: { $sum: '$count' }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        // User activity (last login)
        const userActivity = await User.aggregate([
            {
                $match: {
                    lastLogin: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$lastLogin'
                        }
                    },
                    activeUsers: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': -1 }
            },
            {
                $limit: 30
            }
        ]);

        // Geographic distribution
        const geographicData = await User.aggregate([
            {
                $match: {
                    'location.country': { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: {
                        country: '$location.country',
                        state: '$location.state'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: '$_id.country',
                    totalUsers: { $sum: '$count' },
                    states: {
                        $push: {
                            state: '$_id.state',
                            count: '$count'
                        }
                    }
                }
            },
            {
                $sort: { totalUsers: -1 }
            },
            {
                $limit: 20
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'User analytics retrieved successfully',
            data: {
                userRegistrations,
                userActivity,
                geographicData,
                period: {
                    startDate,
                    endDate,
                    groupBy
                }
            }
        });

    } catch (error) {
        console.error('Error getting user analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get job analytics
 * @route   GET /api/admin/analytics/jobs
 * @access  Private (Admin)
 */
const getJobAnalytics = async (req, res) => {
    try {
        const { 
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate = new Date()
        } = req.query;

        // Jobs posted over time
        const jobPostings = await Job.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        // Jobs by category
        const jobsByCategory = await Job.aggregate([
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgSalary: { $avg: '$salary.max' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Jobs by employment type
        const jobsByType = await Job.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Jobs by experience level
        const jobsByExperience = await Job.aggregate([
            {
                $group: {
                    _id: '$experienceLevel',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Application to job ratio
        const applicationStats = await Job.aggregate([
            {
                $lookup: {
                    from: 'applications',
                    localField: '_id',
                    foreignField: 'job',
                    as: 'applications'
                }
            },
            {
                $project: {
                    title: 1,
                    company: 1,
                    applicationsCount: { $size: '$applications' },
                    createdAt: 1
                }
            },
            {
                $group: {
                    _id: null,
                    totalJobs: { $sum: 1 },
                    totalApplications: { $sum: '$applicationsCount' },
                    avgApplicationsPerJob: { $avg: '$applicationsCount' },
                    mostAppliedJobs: {
                        $push: {
                            title: '$title',
                            company: '$company',
                            applications: '$applicationsCount'
                        }
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Job analytics retrieved successfully',
            data: {
                jobPostings,
                jobsByCategory,
                jobsByType,
                jobsByExperience,
                applicationStats: applicationStats[0] || {
                    totalJobs: 0,
                    totalApplications: 0,
                    avgApplicationsPerJob: 0,
                    mostAppliedJobs: []
                },
                period: {
                    startDate,
                    endDate
                }
            }
        });

    } catch (error) {
        console.error('Error getting job analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve job analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get application analytics
 * @route   GET /api/admin/analytics/applications
 * @access  Private (Admin)
 */
const getApplicationAnalytics = async (req, res) => {
    try {
        const { 
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate = new Date()
        } = req.query;

        // Applications over time
        const applicationsOverTime = await Application.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        // Application status distribution
        const statusDistribution = await Application.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Applications by job category
        const applicationsByCategory = await Application.aggregate([
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job',
                    foreignField: '_id',
                    as: 'jobInfo'
                }
            },
            {
                $unwind: '$jobInfo'
            },
            {
                $group: {
                    _id: '$jobInfo.category',
                    applications: { $sum: 1 },
                    avgResponseTime: {
                        $avg: {
                            $subtract: [
                                { $ifNull: ['$updatedAt', new Date()] },
                                '$createdAt'
                            ]
                        }
                    }
                }
            },
            {
                $sort: { applications: -1 }
            }
        ]);

        // Conversion rates (application stages)
        const conversionRates = await Application.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$count' },
                    statuses: {
                        $push: {
                            status: '$_id',
                            count: '$count'
                        }
                    }
                }
            },
            {
                $unwind: '$statuses'
            },
            {
                $project: {
                    status: '$statuses.status',
                    count: '$statuses.count',
                    percentage: {
                        $multiply: [
                            { $divide: ['$statuses.count', '$total'] },
                            100
                        ]
                    }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Application analytics retrieved successfully',
            data: {
                applicationsOverTime,
                statusDistribution,
                applicationsByCategory,
                conversionRates,
                period: {
                    startDate,
                    endDate
                }
            }
        });

    } catch (error) {
        console.error('Error getting application analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve application analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get payment analytics
 * @route   GET /api/admin/analytics/payments
 * @access  Private (Admin)
 */
const getPaymentAnalytics = async (req, res) => {
    try {
        const { 
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate = new Date()
        } = req.query;

        // Revenue over time
        const revenueOverTime = await Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$createdAt'
                        }
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        // Payment methods distribution
        const paymentMethods = await Payment.aggregate([
            {
                $match: {
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$paymentMethod',
                    count: { $sum: 1 },
                    revenue: { $sum: '$amount' }
                }
            }
        ]);

        // Payment status distribution
        const paymentStatuses = await Payment.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);

        // Monthly recurring revenue (if applicable)
        const mrr = await Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    type: 'subscription' // Assuming subscription payments
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    mrr: { $sum: '$amount' },
                    subscribers: { $addToSet: '$userId' }
                }
            },
            {
                $project: {
                    mrr: 1,
                    subscriberCount: { $size: '$subscribers' }
                }
            },
            {
                $sort: { '_id.year': -1, '_id.month': -1 }
            },
            {
                $limit: 12
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Payment analytics retrieved successfully',
            data: {
                revenueOverTime,
                paymentMethods,
                paymentStatuses,
                mrr,
                period: {
                    startDate,
                    endDate
                }
            }
        });

    } catch (error) {
        console.error('Error getting payment analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve payment analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get system health status
 * @route   GET /api/admin/system/health
 * @access  Private (Admin)
 */
const getSystemHealth = async (req, res) => {
    try {
        const startTime = Date.now();
        
        // Database connection test
        const dbTest = await User.findOne().select('_id').lean();
        const dbLatency = Date.now() - startTime;

        // Get system metrics
        const [
            totalUsers,
            totalJobs,
            totalApplications,
            failedPayments,
            errorNotifications,
            diskUsage
        ] = await Promise.all([
            User.countDocuments(),
            Job.countDocuments(),
            Application.countDocuments(),
            Payment.countDocuments({ status: 'failed' }),
            Notification.countDocuments({ 'channels.status': 'failed' }),
            // Simplified disk usage (in a real app, you'd use a proper system metric)
            Promise.resolve({ used: 0, total: 0, percentage: 0 })
        ]);

        const health = {
            status: 'healthy',
            timestamp: new Date(),
            database: {
                status: dbTest ? 'connected' : 'disconnected',
                latency: dbLatency
            },
            metrics: {
                totalUsers,
                totalJobs,
                totalApplications,
                failedPayments,
                errorNotifications
            },
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                diskUsage
            }
        };

        // Determine overall health status
        if (dbLatency > 1000 || failedPayments > 100 || errorNotifications > 50) {
            health.status = 'warning';
        }
        
        if (!dbTest || dbLatency > 5000) {
            health.status = 'critical';
        }

        res.status(200).json({
            success: true,
            message: 'System health retrieved successfully',
            data: health
        });

    } catch (error) {
        console.error('Error getting system health:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve system health',
            data: {
                status: 'critical',
                timestamp: new Date(),
                error: error.message
            }
        });
    }
};

/**
 * @desc    Manage user (activate/deactivate/delete)
 * @route   PATCH /api/admin/users/:userId/manage
 * @access  Private (Admin)
 */
const manageUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { userId } = req.params;
        const { action, reason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent admin from modifying other admins
        if (user.role === 'admin' && req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Cannot modify other admin users'
            });
        }

        let message = '';
        
        switch (action) {
            case 'activate':
                user.isActive = true;
                message = 'User activated successfully';
                break;
            
            case 'deactivate':
                user.isActive = false;
                message = 'User deactivated successfully';
                break;
            
            case 'delete':
                // Soft delete - mark as inactive and add deletion timestamp
                user.isActive = false;
                user.deletedAt = new Date();
                user.deleteReason = reason;
                message = 'User deleted successfully';
                break;
            
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid action. Use: activate, deactivate, or delete'
                });
        }

        await user.save();

        // Log admin action (in a real app, you'd have an audit log)
        console.log(`Admin ${req.user.id} performed action '${action}' on user ${userId}. Reason: ${reason || 'No reason provided'}`);

        res.status(200).json({
            success: true,
            message,
            data: {
                userId: user._id,
                isActive: user.isActive,
                action,
                performedBy: req.user.id,
                reason,
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Error managing user:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to manage user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get system logs (simplified)
 * @route   GET /api/admin/system/logs
 * @access  Private (Admin)
 */
const getSystemLogs = async (req, res) => {
    try {
        const { 
            level = 'all',
            limit = 100,
            page = 1
        } = req.query;

        // This is a simplified log system
        // In production, you'd integrate with proper logging services like Winston, ELK stack, etc.
        
        const logs = [
            {
                id: 1,
                timestamp: new Date(),
                level: 'info',
                message: 'User authentication successful',
                service: 'auth',
                userId: req.user.id
            },
            {
                id: 2,
                timestamp: new Date(Date.now() - 60000),
                level: 'error',
                message: 'Payment processing failed',
                service: 'payment',
                error: 'Card declined'
            },
            {
                id: 3,
                timestamp: new Date(Date.now() - 120000),
                level: 'warning',
                message: 'High database latency detected',
                service: 'database',
                latency: '1200ms'
            }
        ];

        const filteredLogs = level === 'all' 
            ? logs 
            : logs.filter(log => log.level === level);

        const paginatedLogs = filteredLogs.slice(
            (page - 1) * limit,
            page * limit
        );

        res.status(200).json({
            success: true,
            message: 'System logs retrieved successfully',
            data: {
                logs: paginatedLogs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: filteredLogs.length,
                    pages: Math.ceil(filteredLogs.length / limit)
                },
                filters: {
                    level,
                    availableLevels: ['info', 'warning', 'error', 'debug']
                }
            }
        });

    } catch (error) {
        console.error('Error getting system logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve system logs',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get comprehensive analytics using analytics service
 * @route   GET /api/admin/analytics/comprehensive
 * @access  Private (Admin)
 */
const getComprehensiveAnalytics = async (req, res) => {
    try {
        const { timeframe = '30d' } = req.query;
        
        const analytics = await analyticsService.getDashboardMetrics(timeframe);
        
        res.status(200).json({
            success: true,
            message: 'Comprehensive analytics retrieved successfully',
            data: analytics
        });
        
    } catch (error) {
        console.error('Error getting comprehensive analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve comprehensive analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Clear analytics cache
 * @route   DELETE /api/admin/analytics/cache
 * @access  Private (Admin)
 */
const clearAnalyticsCache = async (req, res) => {
    try {
        analyticsService.clearCache();
        
        res.status(200).json({
            success: true,
            message: 'Analytics cache cleared successfully'
        });
        
    } catch (error) {
        console.error('Error clearing analytics cache:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear analytics cache',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    getDashboardStats,
    getUserAnalytics,
    getJobAnalytics,
    getApplicationAnalytics,
    getPaymentAnalytics,
    getSystemHealth,
    manageUser,
    getSystemLogs,
    getComprehensiveAnalytics,
    clearAnalyticsCache
};
