const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    // Conversation participants
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sender is required']
    },
    
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Recipient is required']
    },
    
    // Message content
    content: {
        type: String,
        required: [true, 'Message content is required'],
        maxlength: [2000, 'Message content cannot exceed 2000 characters'],
        trim: true
    },
    
    // Message type
    messageType: {
        type: String,
        enum: ['text', 'file', 'image', 'system', 'interview_invite', 'job_alert'],
        default: 'text'
    },
    
    // File attachment (for file/image messages)
    attachment: {
        filename: String,
        originalName: String,
        mimeType: String,
        size: Number,
        url: String,
        thumbnailUrl: String // For images
    },
    
    // Related entities (for context-specific messages)
    relatedJob: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    
    relatedApplication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    },
    
    // Message status
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent'
    },
    
    // Read tracking
    readAt: Date,
    
    deliveredAt: {
        type: Date,
        default: Date.now
    },
    
    // Message priority (for system messages)
    priority: {
        type: String,
        enum: ['low', 'normal', 'high', 'urgent'],
        default: 'normal'
    },
    
    // Threading (for replies)
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    
    // Conversation thread ID (for grouping messages)
    conversationId: {
        type: String,
        required: true,
        index: true
    },
    
    // Message metadata
    metadata: {
        deviceType: String,
        ipAddress: String,
        userAgent: String,
        location: {
            city: String,
            country: String
        }
    },
    
    // Soft delete
    isDeleted: {
        type: Boolean,
        default: false
    },
    
    deletedAt: Date,
    
    // Editing history
    isEdited: {
        type: Boolean,
        default: false
    },
    
    editHistory: [{
        previousContent: String,
        editedAt: {
            type: Date,
            default: Date.now
        },
        reason: String
    }],
    
    // Reaction/emoji support
    reactions: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        emoji: {
            type: String,
            maxlength: 10
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // System message specific fields
    systemMessageData: {
        action: String, // 'application_status_changed', 'interview_scheduled', etc.
        oldValue: String,
        newValue: String,
        actionBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for time since message was sent
messageSchema.virtual('timeAgo').get(function() {
    const now = new Date();
    const diffMs = now - this.createdAt;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} days ago`;
    
    return this.createdAt.toLocaleDateString();
});

// Virtual for conversation partner (from recipient's perspective)
messageSchema.virtual('conversationPartner').get(function() {
    // This will be populated based on context in the controller
    return null;
});

// Indexes for optimal performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, status: 1, createdAt: -1 });
messageSchema.index({ relatedJob: 1, messageType: 1 });
messageSchema.index({ relatedApplication: 1, messageType: 1 });
messageSchema.index({ status: 1, priority: 1, createdAt: -1 });

// Compound index for conversation queries
messageSchema.index({ 
    conversationId: 1, 
    isDeleted: 1, 
    createdAt: -1 
});

// Pre-save middleware
messageSchema.pre('save', function(next) {
    // Generate conversation ID if not exists
    if (!this.conversationId && this.sender && this.recipient) {
        this.conversationId = this.generateConversationId(this.sender, this.recipient);
    }
    
    // Set delivered timestamp
    if (this.isModified('status') && this.status === 'delivered' && !this.deliveredAt) {
        this.deliveredAt = new Date();
    }
    
    // Set read timestamp
    if (this.isModified('status') && this.status === 'read' && !this.readAt) {
        this.readAt = new Date();
    }
    
    next();
});

// Method to generate conversation ID
messageSchema.methods.generateConversationId = function(senderId, recipientId) {
    // Create a deterministic conversation ID by sorting participant IDs
    const participants = [senderId.toString(), recipientId.toString()].sort();
    return `conv_${participants[0]}_${participants[1]}`;
};

// Method to mark message as read
messageSchema.methods.markAsRead = function() {
    this.status = 'read';
    this.readAt = new Date();
    return this.save();
};

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
    // Remove existing reaction from this user
    this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
    
    // Add new reaction
    this.reactions.push({
        user: userId,
        emoji: emoji,
        addedAt: new Date()
    });
    
    return this.save();
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId) {
    this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
    return this.save();
};

// Method to edit message content
messageSchema.methods.editContent = function(newContent, reason = null) {
    // Save current content to history
    this.editHistory.push({
        previousContent: this.content,
        editedAt: new Date(),
        reason: reason
    });
    
    // Update content
    this.content = newContent;
    this.isEdited = true;
    
    return this.save();
};

// Method to soft delete message
messageSchema.methods.softDelete = function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
};

// Static method to get conversation between two users
messageSchema.statics.getConversation = async function(user1Id, user2Id, options = {}) {
    const {
        page = 1,
        limit = 50,
        messageType = null,
        fromDate = null,
        toDate = null
    } = options;
    
    // Generate conversation ID
    const participants = [user1Id.toString(), user2Id.toString()].sort();
    const conversationId = `conv_${participants[0]}_${participants[1]}`;
    
    // Build query
    const query = {
        conversationId,
        isDeleted: false
    };
    
    if (messageType) query.messageType = messageType;
    if (fromDate) query.createdAt = { $gte: new Date(fromDate) };
    if (toDate) {
        query.createdAt = { ...query.createdAt, $lte: new Date(toDate) };
    }
    
    // Execute query with pagination
    const messages = await this.find(query)
        .populate('sender', 'firstName lastName avatar role')
        .populate('recipient', 'firstName lastName avatar role')
        .populate('relatedJob', 'title company')
        .populate('relatedApplication', 'status')
        .populate('replyTo', 'content sender createdAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    
    const totalMessages = await this.countDocuments(query);
    
    return {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalMessages,
            pages: Math.ceil(totalMessages / limit)
        },
        conversationId
    };
};

// Static method to get user's conversations list
messageSchema.statics.getUserConversations = async function(userId, options = {}) {
    const {
        page = 1,
        limit = 20,
        unreadOnly = false
    } = options;
    
    const matchQuery = {
        $or: [{ sender: userId }, { recipient: userId }],
        isDeleted: false
    };
    
    if (unreadOnly) {
        matchQuery.$and = [
            { recipient: userId },
            { status: { $ne: 'read' } }
        ];
    }
    
    const pipeline = [
        { $match: matchQuery },
        {
            $addFields: {
                otherParticipant: {
                    $cond: {
                        if: { $eq: ['$sender', mongoose.Types.ObjectId(userId)] },
                        then: '$recipient',
                        else: '$sender'
                    }
                }
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: '$conversationId',
                lastMessage: { $first: '$$ROOT' },
                unreadCount: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ['$recipient', mongoose.Types.ObjectId(userId)] },
                                    { $ne: ['$status', 'read'] }
                                ]
                            },
                            1,
                            0
                        ]
                    }
                },
                messageCount: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'lastMessage.otherParticipant',
                foreignField: '_id',
                as: 'otherUser'
            }
        },
        { $unwind: '$otherUser' },
        {
            $project: {
                conversationId: '$_id',
                lastMessage: {
                    content: '$lastMessage.content',
                    messageType: '$lastMessage.messageType',
                    createdAt: '$lastMessage.createdAt',
                    status: '$lastMessage.status',
                    sender: '$lastMessage.sender'
                },
                otherUser: {
                    _id: '$otherUser._id',
                    firstName: '$otherUser.firstName',
                    lastName: '$otherUser.lastName',
                    avatar: '$otherUser.avatar',
                    role: '$otherUser.role',
                    isOnline: '$otherUser.isOnline',
                    lastSeen: '$otherUser.lastSeen'
                },
                unreadCount: 1,
                messageCount: 1
            }
        },
        { $sort: { 'lastMessage.createdAt': -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
    ];
    
    const conversations = await this.aggregate(pipeline);
    
    // Get total count
    const totalPipeline = [
        { $match: matchQuery },
        {
            $group: {
                _id: '$conversationId'
            }
        },
        {
            $count: 'total'
        }
    ];
    
    const totalResult = await this.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;
    
    return {
        conversations,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

// Static method to mark all messages in conversation as read
messageSchema.statics.markConversationAsRead = async function(conversationId, userId) {
    const result = await this.updateMany(
        {
            conversationId,
            recipient: userId,
            status: { $ne: 'read' }
        },
        {
            $set: {
                status: 'read',
                readAt: new Date()
            }
        }
    );
    
    return result.modifiedCount;
};

// Static method to get unread message count for user
messageSchema.statics.getUnreadCount = async function(userId) {
    return await this.countDocuments({
        recipient: userId,
        status: { $ne: 'read' },
        isDeleted: false
    });
};

// Static method to search messages
messageSchema.statics.searchMessages = async function(userId, searchQuery, options = {}) {
    const {
        conversationId = null,
        messageType = null,
        limit = 50
    } = options;
    
    const query = {
        $or: [{ sender: userId }, { recipient: userId }],
        content: { $regex: searchQuery, $options: 'i' },
        isDeleted: false
    };
    
    if (conversationId) query.conversationId = conversationId;
    if (messageType) query.messageType = messageType;
    
    const messages = await this.find(query)
        .populate('sender', 'firstName lastName avatar')
        .populate('recipient', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .limit(limit);
    
    return messages;
};

module.exports = mongoose.model('Message', messageSchema);