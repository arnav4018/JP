const express = require('express');
const { body } = require('express-validator');
const {
    sendMessage,
    getConversation,
    getConversations,
    markMessageAsRead,
    markConversationAsRead,
    getUnreadCount,
    searchMessages,
    editMessage,
    deleteMessage,
    addReaction,
    removeReaction,
    upload
} = require('../controllers/messageController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// All message routes require authentication
router.use(protect);

// @route   POST /api/messages
// @desc    Send a new message
// @access  Private
router.post(
    '/',
    upload.single('attachment'),
    [
        body('recipientId')
            .isMongoId()
            .withMessage('Valid recipient ID is required'),
        body('content')
            .trim()
            .isLength({ min: 1, max: 2000 })
            .withMessage('Message content is required and must be between 1 and 2000 characters'),
        body('messageType')
            .optional()
            .isIn(['text', 'file', 'image', 'system', 'interview_invite', 'job_alert'])
            .withMessage('Invalid message type'),
        body('relatedJob')
            .optional()
            .isMongoId()
            .withMessage('Invalid job ID'),
        body('relatedApplication')
            .optional()
            .isMongoId()
            .withMessage('Invalid application ID'),
        body('replyTo')
            .optional()
            .isMongoId()
            .withMessage('Invalid message ID for reply')
    ],
    sendMessage
);

// @route   GET /api/messages/conversations
// @desc    Get user's conversations list
// @access  Private
router.get('/conversations', getConversations);

// @route   GET /api/messages/conversation/:userId
// @desc    Get conversation between two users
// @access  Private
router.get('/conversation/:userId', [
    body('userId')
        .isMongoId()
        .withMessage('Valid user ID is required')
], getConversation);

// @route   GET /api/messages/unread-count
// @desc    Get unread message count for current user
// @access  Private
router.get('/unread-count', getUnreadCount);

// @route   GET /api/messages/search
// @desc    Search messages
// @access  Private
router.get('/search', searchMessages);

// @route   PATCH /api/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.patch('/:messageId/read', markMessageAsRead);

// @route   PATCH /api/messages/conversation/:conversationId/read
// @desc    Mark all messages in conversation as read
// @access  Private
router.patch('/conversation/:conversationId/read', markConversationAsRead);

// @route   PATCH /api/messages/:messageId
// @desc    Edit message content
// @access  Private
router.patch(
    '/:messageId',
    [
        body('content')
            .trim()
            .isLength({ min: 1, max: 2000 })
            .withMessage('Message content is required and must be between 1 and 2000 characters'),
        body('reason')
            .optional()
            .trim()
            .isLength({ max: 200 })
            .withMessage('Edit reason must not exceed 200 characters')
    ],
    editMessage
);

// @route   DELETE /api/messages/:messageId
// @desc    Delete message (soft delete)
// @access  Private
router.delete('/:messageId', deleteMessage);

// @route   POST /api/messages/:messageId/reactions
// @desc    Add reaction to message
// @access  Private
router.post(
    '/:messageId/reactions',
    [
        body('emoji')
            .trim()
            .isLength({ min: 1, max: 10 })
            .withMessage('Emoji is required and must not exceed 10 characters')
    ],
    addReaction
);

// @route   DELETE /api/messages/:messageId/reactions
// @desc    Remove reaction from message
// @access  Private
router.delete('/:messageId/reactions', removeReaction);

module.exports = router;