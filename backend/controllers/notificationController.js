const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');

/**
 * @desc    Get notifications for current user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status,
            type,
            priority,
            unreadOnly = false
        } = req.query;

        const options = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50), // Max 50 notifications per request
            status,
            type,
            priority,
            unreadOnly: unreadOnly === 'true'
        };

        const result = await Notification.getNotificationsForUser(req.user.id, options);

        res.status(200).json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: result
        });

    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve notifications',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get single notification by ID
 * @route   GET /api/notifications/:id
 * @access  Private
 */
const getNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            _id: id,
            recipient: req.user.id,
            isDeleted: false
        }).populate([
            { path: 'relatedJob', select: 'title company' },
            { path: 'relatedApplication', select: 'status' },
            { path: 'relatedUser', select: 'firstName lastName avatar' },
            { path: 'createdBy', select: 'firstName lastName' }
        ]);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notification retrieved successfully',
            data: notification.toJSON()
        });

    } catch (error) {
        console.error('Error getting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve notification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get unread notifications count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Notification.getUnreadCount(req.user.id);

        res.status(200).json({
            success: true,
            message: 'Unread count retrieved successfully',
            data: {
                unreadCount
            }
        });

    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get unread count',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Mark notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            _id: id,
            recipient: req.user.id,
            isDeleted: false
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        if (notification.status !== 'read') {
            await notification.markAsRead();
        }

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: {
                id: notification._id,
                status: notification.status,
                readAt: notification.readAt
            }
        });

    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Mark all notifications as read
 * @route   PATCH /api/notifications/mark-all-read
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
    try {
        const { types } = req.body; // Optional array of notification types to mark as read

        const markedCount = await Notification.markAllAsRead(req.user.id, types || []);

        res.status(200).json({
            success: true,
            message: 'Notifications marked as read',
            data: {
                markedCount
            }
        });

    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notifications as read',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Archive notification
 * @route   PATCH /api/notifications/:id/archive
 * @access  Private
 */
const archiveNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            _id: id,
            recipient: req.user.id,
            isDeleted: false
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        await notification.archive();

        res.status(200).json({
            success: true,
            message: 'Notification archived successfully',
            data: {
                id: notification._id,
                status: notification.status
            }
        });

    } catch (error) {
        console.error('Error archiving notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to archive notification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Dismiss notification
 * @route   PATCH /api/notifications/:id/dismiss
 * @access  Private
 */
const dismissNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            _id: id,
            recipient: req.user.id,
            isDeleted: false
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        await notification.dismiss();

        res.status(200).json({
            success: true,
            message: 'Notification dismissed successfully',
            data: {
                id: notification._id,
                status: notification.status
            }
        });

    } catch (error) {
        console.error('Error dismissing notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to dismiss notification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Delete notification (soft delete)
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            _id: id,
            recipient: req.user.id,
            isDeleted: false
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        notification.isDeleted = true;
        notification.deletedAt = new Date();
        await notification.save();

        res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
            data: {
                id: notification._id,
                isDeleted: notification.isDeleted,
                deletedAt: notification.deletedAt
            }
        });

    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete notification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Track notification click
 * @route   POST /api/notifications/:id/track-click
 * @access  Private
 */
const trackClick = async (req, res) => {
    try {
        const { id } = req.params;
        const { url } = req.body;

        const notification = await Notification.findOne({
            _id: id,
            recipient: req.user.id,
            isDeleted: false
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        const deviceInfo = {
            userAgent: req.headers['user-agent'],
            platform: req.headers['sec-ch-ua-platform'],
            browser: req.headers['sec-ch-ua']
        };

        await notification.trackClick(url, deviceInfo);

        res.status(200).json({
            success: true,
            message: 'Click tracked successfully',
            data: {
                id: notification._id,
                clicked: true
            }
        });

    } catch (error) {
        console.error('Error tracking notification click:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track click',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Track notification open
 * @route   POST /api/notifications/:id/track-open
 * @access  Private
 */
const trackOpen = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await Notification.findOne({
            _id: id,
            recipient: req.user.id,
            isDeleted: false
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        const deviceInfo = {
            userAgent: req.headers['user-agent'],
            platform: req.headers['sec-ch-ua-platform'],
            browser: req.headers['sec-ch-ua']
        };

        await notification.trackOpen(deviceInfo);

        res.status(200).json({
            success: true,
            message: 'Open tracked successfully',
            data: {
                id: notification._id,
                opened: true
            }
        });

    } catch (error) {
        console.error('Error tracking notification open:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track open',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Create notification (Admin only)
 * @route   POST /api/notifications
 * @access  Private (Admin)
 */
const createNotification = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        const notificationData = {
            ...req.body,
            createdBy: req.user.id,
            isAutoGenerated: false
        };

        const notification = await notificationService.createNotification(notificationData);

        res.status(201).json({
            success: true,
            message: 'Notification created successfully',
            data: notification.toJSON()
        });

    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create notification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get notification analytics (Admin only)
 * @route   GET /api/notifications/analytics
 * @access  Private (Admin)
 */
const getAnalytics = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        const {
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default: 30 days ago
            endDate = new Date(),
            groupBy = 'day'
        } = req.query;

        const analytics = await notificationService.getNotificationAnalytics(
            startDate,
            endDate,
            groupBy
        );

        const deliveryStats = await notificationService.getDeliveryStats(
            startDate,
            endDate
        );

        res.status(200).json({
            success: true,
            message: 'Analytics retrieved successfully',
            data: {
                analytics,
                deliveryStats,
                period: {
                    startDate,
                    endDate,
                    groupBy
                }
            }
        });

    } catch (error) {
        console.error('Error getting notification analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Send bulk notifications (Admin only)
 * @route   POST /api/notifications/bulk
 * @access  Private (Admin)
 */
const sendBulkNotifications = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        const { notifications } = req.body;

        if (!Array.isArray(notifications) || notifications.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Notifications array is required and cannot be empty'
            });
        }

        // Add common fields to all notifications
        const enhancedNotifications = notifications.map(notification => ({
            ...notification,
            createdBy: req.user.id,
            isAutoGenerated: false
        }));

        const createdNotifications = await notificationService.sendBulkNotifications(enhancedNotifications);

        res.status(201).json({
            success: true,
            message: 'Bulk notifications sent successfully',
            data: {
                totalSent: createdNotifications.length,
                notifications: createdNotifications
            }
        });

    } catch (error) {
        console.error('Error sending bulk notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk notifications',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get notification templates (Admin only)
 * @route   GET /api/notifications/templates
 * @access  Private (Admin)
 */
const getNotificationTemplates = async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        const templates = [
            {
                name: 'welcome',
                title: 'Welcome to {{appName}}!',
                message: 'Hi {{firstName}}, welcome to our platform! Complete your profile to get started.',
                variables: ['appName', 'firstName'],
                channels: ['in_app', 'email']
            },
            {
                name: 'application_status',
                title: 'Application Status Updated',
                message: 'Your application for {{jobTitle}} at {{company}} has been {{status}}.',
                variables: ['jobTitle', 'company', 'status'],
                channels: ['in_app', 'email', 'sms']
            },
            {
                name: 'job_match',
                title: 'New Job Match: {{jobTitle}}',
                message: 'We found a job that matches your profile! {{company}} is looking for a {{jobTitle}}.',
                variables: ['jobTitle', 'company'],
                channels: ['in_app', 'email']
            },
            {
                name: 'interview_scheduled',
                title: 'Interview Scheduled',
                message: 'Your interview for {{jobTitle}} at {{company}} has been scheduled for {{date}}.',
                variables: ['jobTitle', 'company', 'date'],
                channels: ['in_app', 'email', 'sms']
            },
            {
                name: 'payment_success',
                title: 'Payment Successful',
                message: 'Your payment of ${{amount}} has been processed successfully.',
                variables: ['amount'],
                channels: ['in_app', 'email']
            }
        ];

        res.status(200).json({
            success: true,
            message: 'Notification templates retrieved successfully',
            data: {
                templates
            }
        });

    } catch (error) {
        console.error('Error getting notification templates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve templates',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
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
};