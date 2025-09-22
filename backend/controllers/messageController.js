const Message = require('../models/Message');
const User = require('../models/User');
const socketService = require('../services/socketService');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/messages');
        await fs.mkdir(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images, documents, and audio files
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp3|wav|ogg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, documents, and audio files are allowed.'));
        }
    }
});

/**
 * @desc    Send a new message
 * @route   POST /api/messages
 * @access  Private
 */
const sendMessage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const {
            recipientId,
            content,
            messageType = 'text',
            relatedJob = null,
            relatedApplication = null,
            replyTo = null
        } = req.body;

        // Check if recipient exists
        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Recipient not found'
            });
        }

        // Create message
        const messageData = {
            sender: req.user.id,
            recipient: recipientId,
            content: content.trim(),
            messageType,
            relatedJob,
            relatedApplication,
            replyTo,
            metadata: {
                deviceType: req.headers['user-agent'],
                ipAddress: req.ip
            }
        };

        // Handle file attachment if present
        if (req.file) {
            messageData.messageType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
            messageData.attachment = {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                url: `/uploads/messages/${req.file.filename}`
            };

            // Generate thumbnail for images
            if (req.file.mimetype.startsWith('image/')) {
                messageData.attachment.thumbnailUrl = `/uploads/messages/thumbs/${req.file.filename}`;
                // TODO: Implement thumbnail generation
            }
        }

        const message = new Message(messageData);
        await message.save();

        // Populate message for response
        await message.populate([
            { path: 'sender', select: 'firstName lastName avatar role' },
            { path: 'recipient', select: 'firstName lastName avatar role' },
            { path: 'relatedJob', select: 'title company' },
            { path: 'relatedApplication', select: 'status' },
            { path: 'replyTo', select: 'content sender createdAt' }
        ]);

        // Send real-time notification via Socket.IO if recipient is online
        if (socketService.isUserOnline(recipientId)) {
            socketService.sendMessageToUser(recipientId, 'new_message', {
                message: message.toJSON(),
                conversationId: message.conversationId
            });

            // Mark as delivered
            message.status = 'delivered';
            await message.save();
        }

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message.toJSON()
        });

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get conversation between two users
 * @route   GET /api/messages/conversation/:userId
 * @access  Private
 */
const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 50, messageType, fromDate, toDate } = req.query;

        // Validate that the other user exists
        const otherUser = await User.findById(userId);
        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const options = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 100), // Max 100 messages per request
            messageType,
            fromDate,
            toDate
        };

        const conversation = await Message.getConversation(req.user.id, userId, options);

        res.status(200).json({
            success: true,
            message: 'Conversation retrieved successfully',
            data: {
                ...conversation,
                otherUser: {
                    _id: otherUser._id,
                    firstName: otherUser.firstName,
                    lastName: otherUser.lastName,
                    avatar: otherUser.avatar,
                    role: otherUser.role,
                    isOnline: otherUser.isOnline,
                    lastSeen: otherUser.lastSeen
                }
            }
        });

    } catch (error) {
        console.error('Error getting conversation:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve conversation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get user's conversations list
 * @route   GET /api/messages/conversations
 * @access  Private
 */
const getConversations = async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;

        const options = {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 50), // Max 50 conversations per request
            unreadOnly: unreadOnly === 'true'
        };

        const result = await Message.getUserConversations(req.user.id, options);

        res.status(200).json({
            success: true,
            message: 'Conversations retrieved successfully',
            data: result
        });

    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve conversations',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Mark message as read
 * @route   PATCH /api/messages/:messageId/read
 * @access  Private
 */
const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only recipient can mark message as read
        if (message.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only mark messages addressed to you as read'
            });
        }

        if (message.status !== 'read') {
            await message.markAsRead();

            // Notify sender via Socket.IO
            if (socketService.isUserOnline(message.sender.toString())) {
                socketService.sendMessageToUser(message.sender.toString(), 'message_read', {
                    messageId: messageId,
                    readAt: message.readAt,
                    conversationId: message.conversationId
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Message marked as read',
            data: {
                messageId: message._id,
                status: message.status,
                readAt: message.readAt
            }
        });

    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark message as read',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Mark conversation as read
 * @route   PATCH /api/messages/conversation/:conversationId/read
 * @access  Private
 */
const markConversationAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const modifiedCount = await Message.markConversationAsRead(conversationId, req.user.id);

        // Notify other participant via Socket.IO
        const conversation = await Message.findOne({ conversationId }).populate('sender recipient');
        if (conversation) {
            const otherUserId = conversation.sender._id.toString() === req.user.id 
                ? conversation.recipient._id.toString() 
                : conversation.sender._id.toString();

            if (socketService.isUserOnline(otherUserId)) {
                socketService.sendMessageToUser(otherUserId, 'conversation_read_by_other', {
                    conversationId,
                    readBy: req.user.id,
                    readAt: new Date()
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Conversation marked as read',
            data: {
                conversationId,
                markedCount: modifiedCount
            }
        });

    } catch (error) {
        console.error('Error marking conversation as read:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark conversation as read',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get unread message count
 * @route   GET /api/messages/unread-count
 * @access  Private
 */
const getUnreadCount = async (req, res) => {
    try {
        const unreadCount = await Message.getUnreadCount(req.user.id);

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
 * @desc    Search messages
 * @route   GET /api/messages/search
 * @access  Private
 */
const searchMessages = async (req, res) => {
    try {
        const { q: searchQuery, conversationId, messageType, limit = 50 } = req.query;

        if (!searchQuery || searchQuery.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters long'
            });
        }

        const options = {
            conversationId,
            messageType,
            limit: Math.min(parseInt(limit), 100)
        };

        const messages = await Message.searchMessages(req.user.id, searchQuery.trim(), options);

        res.status(200).json({
            success: true,
            message: 'Messages found',
            data: {
                messages,
                searchQuery: searchQuery.trim(),
                total: messages.length
            }
        });

    } catch (error) {
        console.error('Error searching messages:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search messages',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Edit message
 * @route   PATCH /api/messages/:messageId
 * @access  Private
 */
const editMessage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { messageId } = req.params;
        const { content, reason } = req.body;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only sender can edit message
        if (message.sender.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own messages'
            });
        }

        // Don't allow editing messages older than 15 minutes
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        if (message.createdAt < fifteenMinutesAgo) {
            return res.status(400).json({
                success: false,
                message: 'Message is too old to edit (15 minute limit)'
            });
        }

        // Don't allow editing file/image messages
        if (message.messageType !== 'text') {
            return res.status(400).json({
                success: false,
                message: 'Only text messages can be edited'
            });
        }

        await message.editContent(content.trim(), reason);

        // Notify recipient via Socket.IO
        if (socketService.isUserOnline(message.recipient.toString())) {
            socketService.sendMessageToUser(message.recipient.toString(), 'message_edited', {
                messageId,
                newContent: content.trim(),
                isEdited: true,
                editedAt: new Date(),
                editedBy: req.user.id
            });
        }

        res.status(200).json({
            success: true,
            message: 'Message edited successfully',
            data: {
                messageId: message._id,
                content: message.content,
                isEdited: message.isEdited,
                editHistory: message.editHistory
            }
        });

    } catch (error) {
        console.error('Error editing message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to edit message',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Delete message (soft delete)
 * @route   DELETE /api/messages/:messageId
 * @access  Private
 */
const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Only sender can delete message
        if (message.sender.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own messages'
            });
        }

        await message.softDelete();

        // Notify recipient via Socket.IO
        if (socketService.isUserOnline(message.recipient.toString())) {
            socketService.sendMessageToUser(message.recipient.toString(), 'message_deleted', {
                messageId,
                deletedBy: req.user.id,
                deletedAt: new Date()
            });
        }

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully',
            data: {
                messageId: message._id,
                isDeleted: message.isDeleted,
                deletedAt: message.deletedAt
            }
        });

    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Add reaction to message
 * @route   POST /api/messages/:messageId/reactions
 * @access  Private
 */
const addReaction = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;

        if (!emoji || emoji.length > 10) {
            return res.status(400).json({
                success: false,
                message: 'Valid emoji is required (max 10 characters)'
            });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Check if user is participant in conversation
        if (message.sender.toString() !== req.user.id && message.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only react to messages in your conversations'
            });
        }

        await message.addReaction(req.user.id, emoji);

        // Notify other participant via Socket.IO
        const otherUserId = message.sender.toString() === req.user.id 
            ? message.recipient.toString() 
            : message.sender.toString();

        if (socketService.isUserOnline(otherUserId)) {
            socketService.sendMessageToUser(otherUserId, 'message_reaction_updated', {
                messageId,
                reactions: message.reactions,
                updatedBy: req.user.id
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reaction added successfully',
            data: {
                messageId: message._id,
                reactions: message.reactions
            }
        });

    } catch (error) {
        console.error('Error adding reaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add reaction',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Remove reaction from message
 * @route   DELETE /api/messages/:messageId/reactions
 * @access  Private
 */
const removeReaction = async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        // Check if user is participant in conversation
        if (message.sender.toString() !== req.user.id && message.recipient.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only react to messages in your conversations'
            });
        }

        await message.removeReaction(req.user.id);

        // Notify other participant via Socket.IO
        const otherUserId = message.sender.toString() === req.user.id 
            ? message.recipient.toString() 
            : message.sender.toString();

        if (socketService.isUserOnline(otherUserId)) {
            socketService.sendMessageToUser(otherUserId, 'message_reaction_updated', {
                messageId,
                reactions: message.reactions,
                updatedBy: req.user.id
            });
        }

        res.status(200).json({
            success: true,
            message: 'Reaction removed successfully',
            data: {
                messageId: message._id,
                reactions: message.reactions
            }
        });

    } catch (error) {
        console.error('Error removing reaction:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to remove reaction',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
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
};