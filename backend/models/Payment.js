const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    // Payer Information
    payer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Payer is required']
    },
    
    // Recipient Information (for payouts)
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Payment Type
    type: {
        type: String,
        enum: [
            'job_posting',      // Payment for job posting
            'featured_job',     // Payment for featuring a job
            'subscription',     // Subscription payment
            'referral_payout',  // Payout to referrer
            'premium_resume',   // Premium resume features
            'bulk_credits',     // Bulk job posting credits
            'other'
        ],
        required: [true, 'Payment type is required']
    },
    
    // Payment Status
    status: {
        type: String,
        enum: [
            'pending',          // Payment initiated but not completed
            'processing',       // Payment being processed by gateway
            'completed',        // Payment successful
            'failed',           // Payment failed
            'cancelled',        // Payment cancelled by user
            'refunded',         // Payment refunded
            'partially_refunded' // Payment partially refunded
        ],
        default: 'pending'
    },
    
    // Amount Information
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [0, 'Payment amount cannot be negative']
    },
    
    currency: {
        type: String,
        enum: ['INR', 'USD', 'EUR', 'GBP'],
        default: 'INR',
        required: true
    },
    
    // Gateway Information
    paymentGateway: {
        type: String,
        enum: ['stripe', 'razorpay', 'paypal', 'bank_transfer', 'upi', 'wallet'],
        required: [true, 'Payment gateway is required']
    },
    
    // External Transaction IDs
    gatewayTransactionId: {
        type: String,
        index: true
    },
    
    gatewayPaymentId: {
        type: String,
        index: true
    },
    
    gatewayOrderId: {
        type: String
    },
    
    // Related Entities
    relatedJob: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    
    relatedReferral: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Referral'
    },
    
    relatedSubscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription'
    },
    
    // Payment Method Details
    paymentMethod: {
        type: {
            type: String,
            enum: ['card', 'bank_account', 'upi', 'wallet', 'net_banking']
        },
        details: {
            // For cards
            last4: String,
            brand: String, // visa, mastercard, etc.
            
            // For bank transfers
            bankName: String,
            accountLast4: String,
            
            // For UPI
            upiId: String,
            
            // For wallets
            walletName: String
        }
    },
    
    // Billing Information
    billingDetails: {
        name: String,
        email: String,
        phone: String,
        address: {
            line1: String,
            line2: String,
            city: String,
            state: String,
            country: String,
            postalCode: String
        },
        gst: {
            number: String,
            companyName: String
        }
    },
    
    // Tax and Fee Information
    taxDetails: {
        taxAmount: {
            type: Number,
            default: 0
        },
        taxRate: {
            type: Number,
            default: 0
        },
        taxType: {
            type: String,
            enum: ['GST', 'VAT', 'Sales Tax', 'None'],
            default: 'None'
        }
    },
    
    gatewayFee: {
        type: Number,
        default: 0
    },
    
    netAmount: {
        type: Number,
        required: true
    },
    
    // Payment Metadata
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    
    // Timestamps
    initiatedAt: {
        type: Date,
        default: Date.now
    },
    
    processedAt: Date,
    
    completedAt: Date,
    
    failedAt: Date,
    
    // Failure Information
    failureReason: String,
    
    failureCode: String,
    
    // Refund Information
    refunds: [{
        amount: {
            type: Number,
            required: true
        },
        reason: String,
        refundId: String,
        refundedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        }
    }],
    
    // Webhook Information
    webhookData: [{
        event: String,
        data: mongoose.Schema.Types.Mixed,
        receivedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Receipt Information
    receipt: {
        receiptNumber: {
            type: String,
            unique: true,
            sparse: true
        },
        receiptUrl: String,
        invoiceNumber: String,
        invoiceUrl: String
    },
    
    // Subscription Details (for subscription payments)
    subscriptionDetails: {
        plan: String,
        billingCycle: {
            type: String,
            enum: ['monthly', 'quarterly', 'yearly']
        },
        nextBillingDate: Date,
        subscriptionId: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for total refunded amount
paymentSchema.virtual('totalRefunded').get(function() {
    if (!this.refunds || this.refunds.length === 0) return 0;
    
    return this.refunds
        .filter(refund => refund.status === 'completed')
        .reduce((total, refund) => total + refund.amount, 0);
});

// Virtual for remaining refundable amount
paymentSchema.virtual('refundableAmount').get(function() {
    return this.amount - this.totalRefunded;
});

// Virtual for processing time
paymentSchema.virtual('processingTime').get(function() {
    if (!this.completedAt || !this.initiatedAt) return null;
    
    const diffMs = new Date(this.completedAt) - new Date(this.initiatedAt);
    return Math.round(diffMs / 1000); // Return in seconds
});

// Indexes
paymentSchema.index({ payer: 1, status: 1 });
paymentSchema.index({ recipient: 1, type: 1 });
paymentSchema.index({ gatewayTransactionId: 1 });
paymentSchema.index({ gatewayPaymentId: 1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ type: 1, status: 1, createdAt: -1 });

// Compound indexes for analytics
paymentSchema.index({ paymentGateway: 1, status: 1, createdAt: -1 });
paymentSchema.index({ payer: 1, type: 1, createdAt: -1 });

// Pre-save middleware
paymentSchema.pre('save', async function(next) {
    // Generate receipt number if payment is completed
    if (this.status === 'completed' && !this.receipt.receiptNumber) {
        this.receipt.receiptNumber = await this.constructor.generateReceiptNumber();
    }
    
    // Set timestamp based on status
    if (this.isModified('status')) {
        switch (this.status) {
            case 'processing':
                if (!this.processedAt) this.processedAt = new Date();
                break;
            case 'completed':
                if (!this.completedAt) this.completedAt = new Date();
                break;
            case 'failed':
                if (!this.failedAt) this.failedAt = new Date();
                break;
        }
    }
    
    // Calculate net amount
    this.netAmount = this.amount - (this.gatewayFee || 0) - (this.taxDetails?.taxAmount || 0);
    
    next();
});

// Static method to generate unique receipt number
paymentSchema.statics.generateReceiptNumber = async function() {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Find the latest receipt number for this month
    const latestPayment = await this.findOne({
        'receipt.receiptNumber': { $regex: `^JP${year}${month}` }
    }).sort({ 'receipt.receiptNumber': -1 });
    
    let sequence = 1;
    if (latestPayment && latestPayment.receipt.receiptNumber) {
        const lastSequence = parseInt(latestPayment.receipt.receiptNumber.slice(-4));
        sequence = lastSequence + 1;
    }
    
    return `JP${year}${month}${String(sequence).padStart(4, '0')}`;
};

// Method to add refund
paymentSchema.methods.addRefund = function(refundData) {
    if (this.status !== 'completed') {
        throw new Error('Can only refund completed payments');
    }
    
    const totalRefundRequested = this.totalRefunded + refundData.amount;
    if (totalRefundRequested > this.amount) {
        throw new Error('Refund amount exceeds original payment amount');
    }
    
    this.refunds.push({
        amount: refundData.amount,
        reason: refundData.reason,
        refundId: refundData.refundId,
        status: 'pending'
    });
    
    // Update payment status if fully refunded
    if (totalRefundRequested === this.amount) {
        this.status = 'refunded';
    } else if (this.refunds.length > 0) {
        this.status = 'partially_refunded';
    }
    
    return this.save();
};

// Method to complete refund
paymentSchema.methods.completeRefund = function(refundId) {
    const refund = this.refunds.find(r => r.refundId === refundId);
    if (!refund) {
        throw new Error('Refund not found');
    }
    
    refund.status = 'completed';
    
    return this.save();
};

// Method to add webhook data
paymentSchema.methods.addWebhookData = function(webhookData) {
    this.webhookData.push({
        event: webhookData.event,
        data: webhookData.data,
        receivedAt: new Date()
    });
    
    return this.save();
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStats = async function(filters = {}) {
    const {
        dateFrom,
        dateTo,
        payer,
        type,
        gateway
    } = filters;
    
    const matchQuery = {};
    
    if (dateFrom) matchQuery.createdAt = { $gte: new Date(dateFrom) };
    if (dateTo) {
        matchQuery.createdAt = { ...matchQuery.createdAt, $lte: new Date(dateTo) };
    }
    if (payer) matchQuery.payer = mongoose.Types.ObjectId(payer);
    if (type) matchQuery.type = type;
    if (gateway) matchQuery.paymentGateway = gateway;
    
    const pipeline = [
        { $match: matchQuery },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                averageAmount: { $avg: '$amount' }
            }
        }
    ];
    
    const statusStats = await this.aggregate(pipeline);
    
    // Get overall totals
    const totals = await this.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: null,
                totalPayments: { $sum: 1 },
                totalAmount: { $sum: '$amount' },
                totalCompleted: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                totalFailed: {
                    $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
                },
                averageAmount: { $avg: '$amount' },
                totalGatewayFees: { $sum: '$gatewayFee' }
            }
        }
    ]);
    
    return {
        statusBreakdown: statusStats,
        totals: totals[0] || {
            totalPayments: 0,
            totalAmount: 0,
            totalCompleted: 0,
            totalFailed: 0,
            averageAmount: 0,
            totalGatewayFees: 0
        }
    };
};

// Static method to find payments by gateway transaction ID
paymentSchema.statics.findByGatewayId = function(transactionId, paymentId) {
    const query = {};
    if (transactionId) query.gatewayTransactionId = transactionId;
    if (paymentId) query.gatewayPaymentId = paymentId;
    
    return this.findOne(query);
};

// Static method to get revenue analytics
paymentSchema.statics.getRevenueAnalytics = async function(period = 'month') {
    const now = new Date();
    let startDate;
    let groupBy;
    
    switch (period) {
        case 'day':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
            groupBy = { 
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
            };
            break;
        case 'month':
            startDate = new Date(now.getFullYear() - 1, now.getMonth());
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            };
            break;
        case 'year':
            startDate = new Date(now.getFullYear() - 5, 0);
            groupBy = { year: { $year: '$createdAt' } };
            break;
    }
    
    const pipeline = [
        {
            $match: {
                status: 'completed',
                createdAt: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: groupBy,
                revenue: { $sum: '$amount' },
                count: { $sum: 1 },
                averageAmount: { $avg: '$amount' }
            }
        },
        { $sort: { '_id': 1 } }
    ];
    
    return await this.aggregate(pipeline);
};

module.exports = mongoose.model('Payment', paymentSchema);