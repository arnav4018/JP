const express = require('express');
const { body } = require('express-validator');
const {
    getNotifications,
    getNotification,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    dismissNotification,
    deleteNotification,
    trackClick,
    trackOpen,
    createNotification,
    getAnalytics,
    sendBulkNotifications,
    getNotificationTemplates
} = require('../controllers/notificationController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// @route   GET /api/notifications
// @desc    Get notifications for current user
// @access  Private
router.get('/', getNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Get unread notifications count
// @access  Private
router.get('/unread-count', getUnreadCount);

// @route   GET /api/notifications/analytics
// @desc    Get notification analytics (Admin only)
// @access  Private (Admin)
router.get('/analytics', getAnalytics);

// @route   GET /api/notifications/templates
// @desc    Get notification templates (Admin only)
// @access  Private (Admin)
router.get('/templates', getNotificationTemplates);

// @route   POST /api/notifications
// @desc    Create notification (Admin only)
// @access  Private (Admin)
router.post(
    '/',
    [
        body('recipientId')
            .isMongoId()
            .withMessage('Valid recipient ID is required'),
        body('type')
            .isIn([
                'application_status',
                'new_job_match',
                'interview_scheduled',
                'message_received',
                'payment_success',
                'payment_failed',
                'profile_incomplete',
                'resume_viewed',
                'job_expiring',
                'referral_bonus',
                'system_update',
                'security_alert',
                'welcome',
                'email_verification',
                'password_reset'
            ])
            .withMessage('Invalid notification type'),
        body('title')
            .trim()
            .isLength({ min: 1, max: 200 })
            .withMessage('Title is required and must be between 1 and 200 characters'),
        body('message')
            .trim()
            .isLength({ min: 1, max: 1000 })
            .withMessage('Message is required and must be between 1 and 1000 characters'),
        body('category')
            .optional()
            .isIn(['info', 'success', 'warning', 'error', 'alert'])
            .withMessage('Invalid notification category'),
        body('priority')
            .optional()
            .isIn(['low', 'normal', 'high', 'urgent'])
            .withMessage('Invalid notification priority'),
        body('channels')
            .optional()
            .isArray()
            .withMessage('Channels must be an array'),
        body('channels.*')
            .optional()
            .isIn(['push', 'email', 'sms', 'in_app'])
            .withMessage('Invalid notification channel'),
        body('scheduledFor')
            .optional()
            .isISO8601()
            .withMessage('Scheduled date must be a valid ISO 8601 date'),
        body('expiresAt')
            .optional()
            .isISO8601()
            .withMessage('Expiry date must be a valid ISO 8601 date'),
        body('relatedJob')
            .optional()
            .isMongoId()
            .withMessage('Invalid job ID'),
        body('relatedApplication')
            .optional()
            .isMongoId()
            .withMessage('Invalid application ID'),
        body('relatedUser')
            .optional()
            .isMongoId()
            .withMessage('Invalid user ID'),
        body('relatedPayment')
            .optional()
            .isMongoId()
            .withMessage('Invalid payment ID')
    ],
    createNotification
);

// @route   POST /api/notifications/bulk
// @desc    Send bulk notifications (Admin only)
// @access  Private (Admin)
router.post(
    '/bulk',
    [
        body('notifications')
            .isArray({ min: 1 })
            .withMessage('Notifications array is required and cannot be empty'),
        body('notifications.*.recipientId')
            .isMongoId()
            .withMessage('Valid recipient ID is required for each notification'),
        body('notifications.*.type')
            .isIn([
                'application_status',
                'new_job_match',
                'interview_scheduled',
                'message_received',
                'payment_success',
                'payment_failed',
                'profile_incomplete',
                'resume_viewed',
                'job_expiring',
                'referral_bonus',
                'system_update',
                'security_alert',
                'welcome',
                'email_verification',
                'password_reset'
            ])
            .withMessage('Invalid notification type'),
        body('notifications.*.title')
            .trim()
            .isLength({ min: 1, max: 200 })
            .withMessage('Title is required and must be between 1 and 200 characters'),
        body('notifications.*.message')
            .trim()
            .isLength({ min: 1, max: 1000 })
            .withMessage('Message is required and must be between 1 and 1000 characters')
    ],
    sendBulkNotifications
);

// @route   PATCH /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.patch(
    '/mark-all-read',
    [
        body('types')
            .optional()
            .isArray()
            .withMessage('Types must be an array'),
        body('types.*')
            .optional()
            .isIn([
                'application_status',
                'new_job_match',
                'interview_scheduled',
                'message_received',
                'payment_success',
                'payment_failed',
                'profile_incomplete',
                'resume_viewed',
                'job_expiring',
                'referral_bonus',
                'system_update',
                'security_alert',
                'welcome',
                'email_verification',
                'password_reset'
            ])
            .withMessage('Invalid notification type in types array')
    ],
    markAllAsRead
);

// @route   GET /api/notifications/:id
// @desc    Get single notification by ID
// @access  Private
router.get('/:id', getNotification);

// @route   PATCH /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.patch('/:id/read', markAsRead);

// @route   PATCH /api/notifications/:id/archive
// @desc    Archive notification
// @access  Private
router.patch('/:id/archive', archiveNotification);

// @route   PATCH /api/notifications/:id/dismiss
// @desc    Dismiss notification
// @access  Private
router.patch('/:id/dismiss', dismissNotification);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification (soft delete)
// @access  Private
router.delete('/:id', deleteNotification);

// @route   POST /api/notifications/:id/track-click
// @desc    Track notification click
// @access  Private
router.post(
    '/:id/track-click',
    [
        body('url')
            .isURL()
            .withMessage('Valid URL is required')
    ],
    trackClick
);

// @route   POST /api/notifications/:id/track-open
// @desc    Track notification open
// @access  Private
router.post('/:id/track-open', trackOpen);

module.exports = router;