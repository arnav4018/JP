const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard and Statistics Routes
// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard overview statistics
// @access  Private (Admin)
router.get('/dashboard/stats', getDashboardStats);

// Analytics Routes
// @route   GET /api/admin/analytics/users
// @desc    Get user analytics and registration trends
// @access  Private (Admin)
router.get('/analytics/users', getUserAnalytics);

// @route   GET /api/admin/analytics/jobs
// @desc    Get job posting analytics and trends
// @access  Private (Admin)
router.get('/analytics/jobs', getJobAnalytics);

// @route   GET /api/admin/analytics/applications
// @desc    Get application analytics and conversion rates
// @access  Private (Admin)
router.get('/analytics/applications', getApplicationAnalytics);

// @route   GET /api/admin/analytics/payments
// @desc    Get payment and revenue analytics
// @access  Private (Admin)
router.get('/analytics/payments', getPaymentAnalytics);

// @route   GET /api/admin/analytics/comprehensive
// @desc    Get comprehensive analytics with caching
// @access  Private (Admin)
router.get('/analytics/comprehensive', getComprehensiveAnalytics);

// @route   DELETE /api/admin/analytics/cache
// @desc    Clear analytics cache
// @access  Private (Admin)
router.delete('/analytics/cache', clearAnalyticsCache);

// System Management Routes
// @route   GET /api/admin/system/health
// @desc    Get system health status and metrics
// @access  Private (Admin)
router.get('/system/health', getSystemHealth);

// @route   GET /api/admin/system/logs
// @desc    Get system logs with filtering
// @access  Private (Admin)
router.get('/system/logs', getSystemLogs);

// User Management Routes
// @route   PATCH /api/admin/users/:userId/manage
// @desc    Manage user (activate/deactivate/delete)
// @access  Private (Admin)
router.patch(
    '/users/:userId/manage',
    [
        body('action')
            .isIn(['activate', 'deactivate', 'delete'])
            .withMessage('Action must be one of: activate, deactivate, delete'),
        body('reason')
            .optional()
            .trim()
            .isLength({ min: 1, max: 500 })
            .withMessage('Reason must be between 1 and 500 characters if provided')
    ],
    manageUser
);

module.exports = router;