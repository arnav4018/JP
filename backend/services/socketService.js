const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

class SocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map(); // userId -> socketId
        this.socketUsers = new Map(); // socketId -> userId
        this.roomUsers = new Map(); // roomId -> Set of userIds
        this.userRooms = new Map(); // userId -> Set of roomIds
    }

    initialize(server) {
        const { Server } = require('socket.io');
        
        this.io = new Server(server, {
            cors: {
                origin: process.env.CLIENT_URL || "http://localhost:3000",
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type", "Authorization"],
                credentials: true
            },
            transports: ['websocket', 'polling']
        });

        // Middleware for authentication
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
                
                if (!token) {
                    return next(new Error('Authentication token required'));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).select('-password');
                
                if (!user) {
                    return next(new Error('User not found'));
                }

                socket.userId = user._id.toString();
                socket.userRole = user.role;
                socket.userInfo = {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    avatar: user.avatar,
                    role: user.role
                };

                next();
            } catch (error) {
                next(new Error('Invalid authentication token'));
            }
        });

        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });

        console.log('Socket.IO service initialized');
        return this.io;
    }

    handleConnection(socket) {
        const userId = socket.userId;
        console.log(`User ${userId} connected with socket ${socket.id}`);

        // Store user connection
        this.connectedUsers.set(userId, socket.id);
        this.socketUsers.set(socket.id, userId);

        // Update user online status
        this.updateUserOnlineStatus(userId, true);

        // Join user to their personal room
        socket.join(`user:${userId}`);

        // Emit user online status to relevant users
        this.broadcastUserStatusChange(userId, true);

        // Send pending notifications
        this.sendPendingNotifications(userId);

        // Event handlers
        this.registerEventHandlers(socket);

        // Handle disconnection
        socket.on('disconnect', () => {
            this.handleDisconnection(socket);
        });
    }

    registerEventHandlers(socket) {
        const userId = socket.userId;

        // Message events
        socket.on('send_message', (data) => this.handleSendMessage(socket, data));
        socket.on('mark_message_read', (data) => this.handleMarkMessageRead(socket, data));
        socket.on('mark_conversation_read', (data) => this.handleMarkConversationRead(socket, data));
        socket.on('typing_start', (data) => this.handleTypingStart(socket, data));
        socket.on('typing_stop', (data) => this.handleTypingStop(socket, data));
        socket.on('message_reaction', (data) => this.handleMessageReaction(socket, data));
        socket.on('edit_message', (data) => this.handleEditMessage(socket, data));
        socket.on('delete_message', (data) => this.handleDeleteMessage(socket, data));

        // Conversation events
        socket.on('join_conversation', (data) => this.handleJoinConversation(socket, data));
        socket.on('leave_conversation', (data) => this.handleLeaveConversation(socket, data));
        socket.on('get_conversation_history', (data) => this.handleGetConversationHistory(socket, data));

        // Presence events
        socket.on('user_active', () => this.handleUserActive(socket));
        socket.on('user_away', () => this.handleUserAway(socket));

        // File sharing events
        socket.on('file_upload_start', (data) => this.handleFileUploadStart(socket, data));
        socket.on('file_upload_complete', (data) => this.handleFileUploadComplete(socket, data));

        // Video call events (for future implementation)
        socket.on('call_initiate', (data) => this.handleCallInitiate(socket, data));
        socket.on('call_accept', (data) => this.handleCallAccept(socket, data));
        socket.on('call_decline', (data) => this.handleCallDecline(socket, data));
        socket.on('call_end', (data) => this.handleCallEnd(socket, data));

        // Application status updates
        socket.on('subscribe_to_application', (data) => this.handleSubscribeToApplication(socket, data));
        socket.on('unsubscribe_from_application', (data) => this.handleUnsubscribeFromApplication(socket, data));
    }

    async handleSendMessage(socket, data) {
        try {
            const { recipientId, content, messageType = 'text', attachment = null, relatedJob = null, relatedApplication = null, replyTo = null } = data;

            // Validation
            if (!recipientId || !content) {
                socket.emit('message_error', { error: 'Recipient ID and content are required' });
                return;
            }

            // Check if recipient exists
            const recipient = await User.findById(recipientId);
            if (!recipient) {
                socket.emit('message_error', { error: 'Recipient not found' });
                return;
            }

            // Create message
            const message = new Message({
                sender: socket.userId,
                recipient: recipientId,
                content: content.trim(),
                messageType,
                attachment,
                relatedJob,
                relatedApplication,
                replyTo,
                metadata: {
                    deviceType: socket.handshake.headers['user-agent'],
                    ipAddress: socket.handshake.address
                }
            });

            await message.save();

            // Populate message for response
            await message.populate([
                { path: 'sender', select: 'firstName lastName avatar role' },
                { path: 'recipient', select: 'firstName lastName avatar role' },
                { path: 'relatedJob', select: 'title company' },
                { path: 'relatedApplication', select: 'status' },
                { path: 'replyTo', select: 'content sender createdAt' }
            ]);

            // Emit to sender (confirmation)
            socket.emit('message_sent', {
                message: message.toJSON(),
                conversationId: message.conversationId
            });

            // Emit to recipient if online
            const recipientSocketId = this.connectedUsers.get(recipientId);
            if (recipientSocketId) {
                this.io.to(recipientSocketId).emit('new_message', {
                    message: message.toJSON(),
                    conversationId: message.conversationId
                });

                // Auto-mark as delivered if recipient is online
                message.status = 'delivered';
                await message.save();
            }

            // Send push notification if recipient is offline
            if (!recipientSocketId) {
                await this.sendPushNotification(recipientId, {
                    type: 'new_message',
                    title: `New message from ${socket.userInfo.firstName} ${socket.userInfo.lastName}`,
                    body: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                    data: {
                        messageId: message._id,
                        senderId: socket.userId,
                        conversationId: message.conversationId
                    }
                });
            }

        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('message_error', { error: 'Failed to send message' });
        }
    }

    async handleMarkMessageRead(socket, data) {
        try {
            const { messageId } = data;

            const message = await Message.findById(messageId);
            if (!message) {
                socket.emit('message_error', { error: 'Message not found' });
                return;
            }

            // Only recipient can mark message as read
            if (message.recipient.toString() !== socket.userId) {
                socket.emit('message_error', { error: 'Unauthorized' });
                return;
            }

            await message.markAsRead();

            // Notify sender that message was read
            const senderSocketId = this.connectedUsers.get(message.sender.toString());
            if (senderSocketId) {
                this.io.to(senderSocketId).emit('message_read', {
                    messageId: messageId,
                    readAt: message.readAt,
                    conversationId: message.conversationId
                });
            }

            socket.emit('message_marked_read', {
                messageId: messageId,
                readAt: message.readAt
            });

        } catch (error) {
            console.error('Error marking message as read:', error);
            socket.emit('message_error', { error: 'Failed to mark message as read' });
        }
    }

    async handleMarkConversationRead(socket, data) {
        try {
            const { conversationId } = data;

            const modifiedCount = await Message.markConversationAsRead(conversationId, socket.userId);

            socket.emit('conversation_marked_read', {
                conversationId,
                markedCount: modifiedCount
            });

            // Notify other participant
            const conversation = await Message.findOne({ conversationId }).populate('sender recipient');
            if (conversation) {
                const otherUserId = conversation.sender._id.toString() === socket.userId 
                    ? conversation.recipient._id.toString() 
                    : conversation.sender._id.toString();

                const otherSocketId = this.connectedUsers.get(otherUserId);
                if (otherSocketId) {
                    this.io.to(otherSocketId).emit('conversation_read_by_other', {
                        conversationId,
                        readBy: socket.userId,
                        readAt: new Date()
                    });
                }
            }

        } catch (error) {
            console.error('Error marking conversation as read:', error);
            socket.emit('message_error', { error: 'Failed to mark conversation as read' });
        }
    }

    async handleTypingStart(socket, data) {
        const { recipientId, conversationId } = data;
        const recipientSocketId = this.connectedUsers.get(recipientId);

        if (recipientSocketId) {
            this.io.to(recipientSocketId).emit('typing_start', {
                userId: socket.userId,
                userName: `${socket.userInfo.firstName} ${socket.userInfo.lastName}`,
                conversationId
            });
        }
    }

    async handleTypingStop(socket, data) {
        const { recipientId, conversationId } = data;
        const recipientSocketId = this.connectedUsers.get(recipientId);

        if (recipientSocketId) {
            this.io.to(recipientSocketId).emit('typing_stop', {
                userId: socket.userId,
                conversationId
            });
        }
    }

    async handleMessageReaction(socket, data) {
        try {
            const { messageId, emoji, action } = data; // action: 'add' or 'remove'

            const message = await Message.findById(messageId);
            if (!message) {
                socket.emit('message_error', { error: 'Message not found' });
                return;
            }

            // Check if user is participant in conversation
            if (message.sender.toString() !== socket.userId && message.recipient.toString() !== socket.userId) {
                socket.emit('message_error', { error: 'Unauthorized' });
                return;
            }

            if (action === 'add') {
                await message.addReaction(socket.userId, emoji);
            } else {
                await message.removeReaction(socket.userId);
            }

            // Notify both participants
            const participants = [message.sender.toString(), message.recipient.toString()];
            participants.forEach(participantId => {
                const socketId = this.connectedUsers.get(participantId);
                if (socketId) {
                    this.io.to(socketId).emit('message_reaction_updated', {
                        messageId,
                        reactions: message.reactions,
                        updatedBy: socket.userId
                    });
                }
            });

        } catch (error) {
            console.error('Error handling message reaction:', error);
            socket.emit('message_error', { error: 'Failed to update reaction' });
        }
    }

    async handleEditMessage(socket, data) {
        try {
            const { messageId, newContent, reason } = data;

            const message = await Message.findById(messageId);
            if (!message) {
                socket.emit('message_error', { error: 'Message not found' });
                return;
            }

            // Only sender can edit message
            if (message.sender.toString() !== socket.userId) {
                socket.emit('message_error', { error: 'Unauthorized' });
                return;
            }

            // Don't allow editing messages older than 15 minutes
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
            if (message.createdAt < fifteenMinutesAgo) {
                socket.emit('message_error', { error: 'Message too old to edit' });
                return;
            }

            await message.editContent(newContent, reason);

            // Notify both participants
            const participants = [message.sender.toString(), message.recipient.toString()];
            participants.forEach(participantId => {
                const socketId = this.connectedUsers.get(participantId);
                if (socketId) {
                    this.io.to(socketId).emit('message_edited', {
                        messageId,
                        newContent,
                        isEdited: true,
                        editedAt: new Date(),
                        editedBy: socket.userId
                    });
                }
            });

        } catch (error) {
            console.error('Error editing message:', error);
            socket.emit('message_error', { error: 'Failed to edit message' });
        }
    }

    async handleDeleteMessage(socket, data) {
        try {
            const { messageId } = data;

            const message = await Message.findById(messageId);
            if (!message) {
                socket.emit('message_error', { error: 'Message not found' });
                return;
            }

            // Only sender can delete message
            if (message.sender.toString() !== socket.userId) {
                socket.emit('message_error', { error: 'Unauthorized' });
                return;
            }

            await message.softDelete();

            // Notify both participants
            const participants = [message.sender.toString(), message.recipient.toString()];
            participants.forEach(participantId => {
                const socketId = this.connectedUsers.get(participantId);
                if (socketId) {
                    this.io.to(socketId).emit('message_deleted', {
                        messageId,
                        deletedBy: socket.userId,
                        deletedAt: new Date()
                    });
                }
            });

        } catch (error) {
            console.error('Error deleting message:', error);
            socket.emit('message_error', { error: 'Failed to delete message' });
        }
    }

    async handleJoinConversation(socket, data) {
        const { conversationId } = data;
        socket.join(`conversation:${conversationId}`);
        
        socket.emit('joined_conversation', { conversationId });
    }

    async handleLeaveConversation(socket, data) {
        const { conversationId } = data;
        socket.leave(`conversation:${conversationId}`);
        
        socket.emit('left_conversation', { conversationId });
    }

    async handleGetConversationHistory(socket, data) {
        try {
            const { otherUserId, page = 1, limit = 50 } = data;

            const conversation = await Message.getConversation(socket.userId, otherUserId, { page, limit });
            
            socket.emit('conversation_history', conversation);
        } catch (error) {
            console.error('Error getting conversation history:', error);
            socket.emit('message_error', { error: 'Failed to load conversation history' });
        }
    }

    async handleUserActive(socket) {
        await this.updateUserOnlineStatus(socket.userId, true);
        this.broadcastUserStatusChange(socket.userId, true);
    }

    async handleUserAway(socket) {
        await this.updateUserOnlineStatus(socket.userId, false);
        this.broadcastUserStatusChange(socket.userId, false);
    }

    async handleSubscribeToApplication(socket, data) {
        const { applicationId } = data;
        socket.join(`application:${applicationId}`);
    }

    async handleUnsubscribeFromApplication(socket, data) {
        const { applicationId } = data;
        socket.leave(`application:${applicationId}`);
    }

    async handleDisconnection(socket) {
        const userId = socket.userId;
        console.log(`User ${userId} disconnected`);

        // Clean up user tracking
        this.connectedUsers.delete(userId);
        this.socketUsers.delete(socket.id);

        // Update user offline status
        await this.updateUserOnlineStatus(userId, false);

        // Broadcast user offline status
        this.broadcastUserStatusChange(userId, false);

        // Clean up rooms
        const userRooms = this.userRooms.get(userId);
        if (userRooms) {
            userRooms.forEach(roomId => {
                const roomUsers = this.roomUsers.get(roomId);
                if (roomUsers) {
                    roomUsers.delete(userId);
                    if (roomUsers.size === 0) {
                        this.roomUsers.delete(roomId);
                    }
                }
            });
            this.userRooms.delete(userId);
        }
    }

    async updateUserOnlineStatus(userId, isOnline) {
        try {
            await User.findByIdAndUpdate(userId, {
                isOnline,
                lastSeen: new Date()
            });
        } catch (error) {
            console.error('Error updating user online status:', error);
        }
    }

    broadcastUserStatusChange(userId, isOnline) {
        // Broadcast to all connected users who have conversations with this user
        this.io.emit('user_status_changed', {
            userId,
            isOnline,
            lastSeen: new Date()
        });
    }

    async sendPendingNotifications(userId) {
        try {
            const pendingNotifications = await Notification.find({
                recipient: userId,
                status: 'unread',
                'channels.type': 'in_app',
                'channels.status': 'pending',
                isDeleted: false,
                $or: [
                    { expiresAt: { $gt: new Date() } },
                    { expiresAt: null }
                ]
            }).limit(10); // Send max 10 pending notifications

            for (const notification of pendingNotifications) {
                this.sendNotificationToUser(userId, {
                    id: notification._id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    category: notification.category,
                    priority: notification.priority,
                    data: notification.data,
                    actions: notification.actions,
                    createdAt: notification.createdAt,
                    timeAgo: notification.timeAgo
                });

                // Mark as delivered
                await notification.markChannelDelivered('in_app', {
                    provider: 'socket.io',
                    messageId: notification._id.toString()
                });
            }
        } catch (error) {
            console.error('Error sending pending notifications:', error);
        }
    }

    async sendPushNotification(userId, notificationData) {
        // This will be integrated with the notification service
        console.log('Sending push notification to user:', userId, notificationData);
    }

    // Public methods for other parts of the application to use

    sendNotificationToUser(userId, notification) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(socketId).emit('notification', notification);
        }
    }

    sendMessageToUser(userId, event, data) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(socketId).emit(event, data);
        }
    }

    broadcastToRoom(roomId, event, data) {
        this.io.to(roomId).emit(event, data);
    }

    broadcastApplicationUpdate(applicationId, updateData) {
        this.io.to(`application:${applicationId}`).emit('application_updated', updateData);
    }

    broadcastJobUpdate(jobId, updateData) {
        this.io.to(`job:${jobId}`).emit('job_updated', updateData);
    }

    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }

    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }

    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());
    }
}

module.exports = new SocketService();