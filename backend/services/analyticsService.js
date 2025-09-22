const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const Referral = require('../models/Referral');

class AnalyticsService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Cache management
    setCacheItem(key, data, timeout = this.cacheTimeout) {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            timeout
        });
    }

    getCacheItem(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() - item.timestamp > item.timeout) {
            this.cache.delete(key);
            return null;
        }
        
        return item.data;
    }

    // User Analytics
    async getUserMetrics(timeframe = '30d') {
        const cacheKey = `user_metrics_${timeframe}`;
        const cached = this.getCacheItem(cacheKey);
        if (cached) return cached;

        const { startDate, endDate } = this.getDateRange(timeframe);

        try {
            const [
                totalUsers,
                activeUsers,
                newUsers,
                userGrowth,
                usersByRole,
                usersByLocation,
                userEngagement,
                retentionData
            ] = await Promise.all([
                // Total users
                User.countDocuments({ isActive: true }),

                // Active users (logged in within last 30 days)
                User.countDocuments({
                    isActive: true,
                    lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                }),

                // New users in timeframe
                User.countDocuments({
                    createdAt: { $gte: startDate, $lte: endDate }
                }),

                // User growth over time
                User.aggregate([
                    {
                        $match: {
                            createdAt: { $gte: startDate, $lte: endDate }
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
                    { $sort: { '_id': 1 } }
                ]),

                // Users by role
                User.aggregate([
                    { $match: { isActive: true } },
                    {
                        $group: {
                            _id: '$role',
                            count: { $sum: 1 },
                            avgExperience: { $avg: '$experience' }
                        }
                    }
                ]),

                // Users by location
                User.aggregate([
                    {
                        $match: {
                            isActive: true,
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
                    { $sort: { totalUsers: -1 } },
                    { $limit: 10 }
                ]),

                // User engagement metrics
                this.getUserEngagementMetrics(startDate, endDate),

                // User retention data
                this.getUserRetentionData()
            ]);

            const metrics = {
                overview: {
                    totalUsers,
                    activeUsers,
                    newUsers,
                    inactiveUsers: totalUsers - activeUsers,
                    activationRate: totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(2) : 0
                },
                growth: userGrowth,
                demographics: {
                    byRole: usersByRole,
                    byLocation: usersByLocation
                },
                engagement: userEngagement,
                retention: retentionData,
                generatedAt: new Date(),
                timeframe: {
                    period: timeframe,
                    startDate,
                    endDate
                }
            };

            this.setCacheItem(cacheKey, metrics);
            return metrics;

        } catch (error) {
            console.error('Error getting user metrics:', error);
            throw error;
        }
    }

    async getUserEngagementMetrics(startDate, endDate) {
        const [
            loginFrequency,
            profileCompleteness,
            activityLevels
        ] = await Promise.all([
            // Login frequency analysis
            User.aggregate([
                {
                    $match: {
                        lastLogin: { $gte: startDate, $lte: endDate },
                        isActive: true
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
                        uniqueLogins: { $sum: 1 }
                    }
                },
                { $sort: { '_id': 1 } }
            ]),

            // Profile completeness distribution
            User.aggregate([
                { $match: { isActive: true } },
                {
                    $group: {
                        _id: '$isProfileComplete',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // User activity levels (based on applications, messages, etc.)
            User.aggregate([
                { $match: { isActive: true } },
                {
                    $lookup: {
                        from: 'applications',
                        localField: '_id',
                        foreignField: 'candidate',
                        as: 'applications'
                    }
                },
                {
                    $lookup: {
                        from: 'messages',
                        localField: '_id',
                        foreignField: 'sender',
                        as: 'sentMessages'
                    }
                },
                {
                    $addFields: {
                        activityScore: {
                            $add: [
                                { $size: '$applications' },
                                { $multiply: [{ $size: '$sentMessages' }, 0.5] }
                            ]
                        }
                    }
                },
                {
                    $bucket: {
                        groupBy: '$activityScore',
                        boundaries: [0, 1, 5, 10, 25, 100],
                        default: 'high',
                        output: {
                            count: { $sum: 1 },
                            avgScore: { $avg: '$activityScore' }
                        }
                    }
                }
            ])
        ]);

        return {
            loginFrequency,
            profileCompleteness,
            activityLevels
        };
    }

    async getUserRetentionData() {
        const cohorts = await User.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m',
                            date: '$createdAt'
                        }
                    },
                    totalUsers: { $sum: 1 },
                    users: { $push: '$_id' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    let: { userIds: '$users' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$_id', '$$userIds'] },
                                lastLogin: {
                                    $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                                }
                            }
                        }
                    ],
                    as: 'activeUsers'
                }
            },
            {
                $addFields: {
                    retainedUsers: { $size: '$activeUsers' },
                    retentionRate: {
                        $multiply: [
                            { $divide: [{ $size: '$activeUsers' }, '$totalUsers'] },
                            100
                        ]
                    }
                }
            },
            {
                $project: {
                    users: 0,
                    activeUsers: 0
                }
            },
            { $sort: { '_id': -1 } },
            { $limit: 12 }
        ]);

        return cohorts;
    }

    // Job Analytics
    async getJobMetrics(timeframe = '30d') {
        const cacheKey = `job_metrics_${timeframe}`;
        const cached = this.getCacheItem(cacheKey);
        if (cached) return cached;

        const { startDate, endDate } = this.getDateRange(timeframe);

        try {
            const [
                totalJobs,
                activeJobs,
                newJobs,
                jobsByCategory,
                jobsByType,
                jobsByLocation,
                salaryAnalysis,
                performanceMetrics
            ] = await Promise.all([
                // Total jobs
                Job.countDocuments(),

                // Active jobs
                Job.countDocuments({
                    status: 'active',
                    deadline: { $gte: new Date() }
                }),

                // New jobs in timeframe
                Job.countDocuments({
                    createdAt: { $gte: startDate, $lte: endDate }
                }),

                // Jobs by category
                Job.aggregate([
                    {
                        $group: {
                            _id: '$category',
                            count: { $sum: 1 },
                            avgSalary: { $avg: { $avg: ['$salary.min', '$salary.max'] } }
                        }
                    },
                    { $sort: { count: -1 } }
                ]),

                // Jobs by type
                Job.aggregate([
                    {
                        $group: {
                            _id: '$type',
                            count: { $sum: 1 }
                        }
                    }
                ]),

                // Jobs by location
                Job.aggregate([
                    {
                        $group: {
                            _id: {
                                country: '$location.country',
                                state: '$location.state',
                                city: '$location.city'
                            },
                            count: { $sum: 1 }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id.country',
                            totalJobs: { $sum: '$count' },
                            cities: {
                                $push: {
                                    city: '$_id.city',
                                    state: '$_id.state',
                                    count: '$count'
                                }
                            }
                        }
                    },
                    { $sort: { totalJobs: -1 } },
                    { $limit: 10 }
                ]),

                // Salary analysis
                Job.aggregate([
                    {
                        $match: {
                            'salary.min': { $exists: true },
                            'salary.max': { $exists: true }
                        }
                    },
                    {
                        $group: {
                            _id: '$category',
                            avgMinSalary: { $avg: '$salary.min' },
                            avgMaxSalary: { $avg: '$salary.max' },
                            minSalary: { $min: '$salary.min' },
                            maxSalary: { $max: '$salary.max' },
                            jobCount: { $sum: 1 }
                        }
                    },
                    { $sort: { avgMaxSalary: -1 } }
                ]),

                // Job performance metrics
                this.getJobPerformanceMetrics(startDate, endDate)
            ]);

            const metrics = {
                overview: {
                    totalJobs,
                    activeJobs,
                    newJobs,
                    expiredJobs: totalJobs - activeJobs,
                    activeRate: totalJobs > 0 ? (activeJobs / totalJobs * 100).toFixed(2) : 0
                },
                distribution: {
                    byCategory: jobsByCategory,
                    byType: jobsByType,
                    byLocation: jobsByLocation
                },
                salary: salaryAnalysis,
                performance: performanceMetrics,
                generatedAt: new Date(),
                timeframe: {
                    period: timeframe,
                    startDate,
                    endDate
                }
            };

            this.setCacheItem(cacheKey, metrics);
            return metrics;

        } catch (error) {
            console.error('Error getting job metrics:', error);
            throw error;
        }
    }

    async getJobPerformanceMetrics(startDate, endDate) {
        return await Job.aggregate([
            {
                $lookup: {
                    from: 'applications',
                    localField: '_id',
                    foreignField: 'job',
                    as: 'applications'
                }
            },
            {
                $addFields: {
                    applicationCount: { $size: '$applications' },
                    qualifiedApplications: {
                        $size: {
                            $filter: {
                                input: '$applications',
                                cond: { $in: ['$$this.status', ['shortlisted', 'interview', 'accepted']] }
                            }
                        }
                    }
                }
            },
            {
                $bucket: {
                    groupBy: '$applicationCount',
                    boundaries: [0, 5, 15, 30, 100],
                    default: 'high-demand',
                    output: {
                        jobCount: { $sum: 1 },
                        avgApplications: { $avg: '$applicationCount' },
                        avgQualified: { $avg: '$qualifiedApplications' }
                    }
                }
            }
        ]);
    }

    // Application Analytics
    async getApplicationMetrics(timeframe = '30d') {
        const cacheKey = `application_metrics_${timeframe}`;
        const cached = this.getCacheItem(cacheKey);
        if (cached) return cached;

        const { startDate, endDate } = this.getDateRange(timeframe);

        try {
            const [
                totalApplications,
                newApplications,
                statusDistribution,
                conversionFunnel,
                responseTime,
                applicationTrends,
                categoryPerformance
            ] = await Promise.all([
                // Total applications
                Application.countDocuments(),

                // New applications in timeframe
                Application.countDocuments({
                    createdAt: { $gte: startDate, $lte: endDate }
                }),

                // Status distribution
                Application.aggregate([
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 },
                            percentage: { $sum: 1 }
                        }
                    }
                ]),

                // Conversion funnel
                this.getApplicationConversionFunnel(),

                // Average response time
                Application.aggregate([
                    {
                        $match: {
                            status: { $ne: 'pending' }
                        }
                    },
                    {
                        $addFields: {
                            responseTime: {
                                $subtract: ['$updatedAt', '$createdAt']
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$status',
                            avgResponseTime: { $avg: '$responseTime' },
                            count: { $sum: 1 }
                        }
                    }
                ]),

                // Application trends over time
                Application.aggregate([
                    {
                        $match: {
                            createdAt: { $gte: startDate, $lte: endDate }
                        }
                    },
                    {
                        $group: {
                            _id: {
                                date: {
                                    $dateToString: {
                                        format: '%Y-%m-%d',
                                        date: '$createdAt'
                                    }
                                },
                                status: '$status'
                            },
                            count: { $sum: 1 }
                        }
                    },
                    { $sort: { '_id.date': 1 } }
                ]),

                // Performance by job category
                Application.aggregate([
                    {
                        $lookup: {
                            from: 'jobs',
                            localField: 'job',
                            foreignField: '_id',
                            as: 'jobInfo'
                        }
                    },
                    { $unwind: '$jobInfo' },
                    {
                        $group: {
                            _id: '$jobInfo.category',
                            totalApplications: { $sum: 1 },
                            acceptedApplications: {
                                $sum: {
                                    $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0]
                                }
                            },
                            avgResponseTime: {
                                $avg: {
                                    $subtract: ['$updatedAt', '$createdAt']
                                }
                            }
                        }
                    },
                    {
                        $addFields: {
                            acceptanceRate: {
                                $multiply: [
                                    { $divide: ['$acceptedApplications', '$totalApplications'] },
                                    100
                                ]
                            }
                        }
                    },
                    { $sort: { totalApplications: -1 } }
                ])
            ]);

            const metrics = {
                overview: {
                    totalApplications,
                    newApplications,
                    statusBreakdown: statusDistribution
                },
                funnel: conversionFunnel,
                timing: responseTime,
                trends: applicationTrends,
                performance: categoryPerformance,
                generatedAt: new Date(),
                timeframe: {
                    period: timeframe,
                    startDate,
                    endDate
                }
            };

            this.setCacheItem(cacheKey, metrics);
            return metrics;

        } catch (error) {
            console.error('Error getting application metrics:', error);
            throw error;
        }
    }

    async getApplicationConversionFunnel() {
        const funnel = await Application.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    pending: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    reviewed: {
                        $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] }
                    },
                    shortlisted: {
                        $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] }
                    },
                    interview: {
                        $sum: { $cond: [{ $eq: ['$status', 'interview'] }, 1, 0] }
                    },
                    accepted: {
                        $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
                    },
                    rejected: {
                        $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
                    }
                }
            }
        ]);

        return funnel[0] || {};
    }

    // Revenue and Payment Analytics
    async getRevenueMetrics(timeframe = '30d') {
        const cacheKey = `revenue_metrics_${timeframe}`;
        const cached = this.getCacheItem(cacheKey);
        if (cached) return cached;

        const { startDate, endDate } = this.getDateRange(timeframe);

        try {
            const [
                totalRevenue,
                revenueByPeriod,
                paymentMethods,
                revenueBySource,
                subscriptionMetrics
            ] = await Promise.all([
                // Total revenue
                Payment.aggregate([
                    { $match: { status: 'completed' } },
                    {
                        $group: {
                            _id: null,
                            totalRevenue: { $sum: '$amount' },
                            count: { $sum: 1 }
                        }
                    }
                ]),

                // Revenue by time period
                Payment.aggregate([
                    {
                        $match: {
                            status: 'completed',
                            createdAt: { $gte: startDate, $lte: endDate }
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
                            transactions: { $sum: 1 }
                        }
                    },
                    { $sort: { '_id': 1 } }
                ]),

                // Payment methods analysis
                Payment.aggregate([
                    { $match: { status: 'completed' } },
                    {
                        $group: {
                            _id: '$paymentMethod',
                            revenue: { $sum: '$amount' },
                            count: { $sum: 1 },
                            avgAmount: { $avg: '$amount' }
                        }
                    },
                    { $sort: { revenue: -1 } }
                ]),

                // Revenue by source/type
                Payment.aggregate([
                    { $match: { status: 'completed' } },
                    {
                        $group: {
                            _id: '$type',
                            revenue: { $sum: '$amount' },
                            count: { $sum: 1 }
                        }
                    }
                ]),

                // Subscription metrics (if applicable)
                this.getSubscriptionMetrics(startDate, endDate)
            ]);

            const metrics = {
                overview: {
                    totalRevenue: totalRevenue[0]?.totalRevenue || 0,
                    totalTransactions: totalRevenue[0]?.count || 0,
                    averageTransaction: totalRevenue[0]?.count > 0 
                        ? (totalRevenue[0].totalRevenue / totalRevenue[0].count).toFixed(2) 
                        : 0
                },
                trends: revenueByPeriod,
                paymentMethods,
                sources: revenueBySource,
                subscriptions: subscriptionMetrics,
                generatedAt: new Date(),
                timeframe: {
                    period: timeframe,
                    startDate,
                    endDate
                }
            };

            this.setCacheItem(cacheKey, metrics);
            return metrics;

        } catch (error) {
            console.error('Error getting revenue metrics:', error);
            throw error;
        }
    }

    async getSubscriptionMetrics(startDate, endDate) {
        // This would be implemented based on your subscription model
        return {
            mrr: 0, // Monthly Recurring Revenue
            churnRate: 0,
            newSubscribers: 0,
            cancelledSubscribers: 0
        };
    }

    // System Performance Analytics
    async getSystemMetrics() {
        const cacheKey = 'system_metrics';
        const cached = this.getCacheItem(cacheKey);
        if (cached) return cached;

        try {
            const [
                notificationStats,
                messageStats,
                errorRates,
                responseTime
            ] = await Promise.all([
                // Notification delivery stats
                Notification.aggregate([
                    {
                        $unwind: '$channels'
                    },
                    {
                        $group: {
                            _id: {
                                type: '$channels.type',
                                status: '$channels.status'
                            },
                            count: { $sum: 1 }
                        }
                    }
                ]),

                // Message statistics
                Message.aggregate([
                    {
                        $group: {
                            _id: null,
                            totalMessages: { $sum: 1 },
                            readMessages: {
                                $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] }
                            }
                        }
                    }
                ]),

                // Error rates (simplified)
                Payment.aggregate([
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ]),

                // Average response time (simplified metric)
                Promise.resolve({ avgResponseTime: 150 }) // ms
            ]);

            const metrics = {
                notifications: notificationStats,
                messaging: messageStats[0] || { totalMessages: 0, readMessages: 0 },
                errors: errorRates,
                performance: responseTime,
                generatedAt: new Date()
            };

            this.setCacheItem(cacheKey, metrics, 2 * 60 * 1000); // 2 minutes cache
            return metrics;

        } catch (error) {
            console.error('Error getting system metrics:', error);
            throw error;
        }
    }

    // Utility methods
    getDateRange(timeframe) {
        const endDate = new Date();
        let startDate;

        switch (timeframe) {
            case '7d':
                startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }

        return { startDate, endDate };
    }

    // Generate comprehensive dashboard data
    async getDashboardMetrics(timeframe = '30d') {
        try {
            const [
                userMetrics,
                jobMetrics,
                applicationMetrics,
                revenueMetrics,
                systemMetrics
            ] = await Promise.all([
                this.getUserMetrics(timeframe),
                this.getJobMetrics(timeframe),
                this.getApplicationMetrics(timeframe),
                this.getRevenueMetrics(timeframe),
                this.getSystemMetrics()
            ]);

            return {
                users: userMetrics,
                jobs: jobMetrics,
                applications: applicationMetrics,
                revenue: revenueMetrics,
                system: systemMetrics,
                generatedAt: new Date(),
                timeframe
            };

        } catch (error) {
            console.error('Error generating dashboard metrics:', error);
            throw error;
        }
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }

    // Get cache statistics
    getCacheStats() {
        const stats = {
            totalItems: this.cache.size,
            items: []
        };

        for (const [key, value] of this.cache.entries()) {
            stats.items.push({
                key,
                timestamp: value.timestamp,
                age: Date.now() - value.timestamp,
                timeout: value.timeout
            });
        }

        return stats;
    }
}

module.exports = new AnalyticsService();