const mongoose = require('mongoose');
const crypto = require('crypto');

const referralSchema = new mongoose.Schema({
    // Referrer Information
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Referrer is required']
    },
    
    // Referred Candidate Information
    referredCandidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Referred candidate is required']
    },
    
    // Job Information
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    },
    
    // Application linked to this referral
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    },
    
    // Referral Status
    status: {
        type: String,
        enum: [
            'pending',        // Referral created but candidate hasn't applied
            'applied',        // Candidate has applied through referral
            'under_review',   // Application is being reviewed
            'shortlisted',    // Candidate was shortlisted
            'interviewed',    // Candidate was interviewed
            'rejected',       // Candidate was rejected
            'hired',          // Candidate was hired
            'payout_pending', // Payout is pending
            'payout_completed', // Payout has been made
            'expired'         // Referral has expired
        ],
        default: 'pending'
    },
    
    // Referral Code and Link
    referralCode: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    
    referralLink: {
        type: String,
        required: true
    },
    
    // Email of referred candidate (for tracking before registration)
    referredEmail: {
        type: String,
        required: [true, 'Referred candidate email is required'],
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    
    // Referral Details
    personalMessage: {
        type: String,
        maxlength: [500, 'Personal message cannot exceed 500 characters'],
        trim: true
    },
    
    // Payout Information
    payout: {
        amount: {
            type: Number,
            min: [0, 'Payout amount cannot be negative']
        },
        currency: {
            type: String,
            enum: ['INR', 'USD', 'EUR', 'GBP'],
            default: 'INR'
        },
        percentage: {
            type: Number,
            min: [0, 'Payout percentage cannot be negative'],
            max: [100, 'Payout percentage cannot exceed 100']
        },
        payoutDate: Date,
        paymentMethod: {
            type: String,
            enum: ['bank_transfer', 'paypal', 'stripe', 'razorpay', 'upi']
        },
        transactionId: String,
        paymentStatus: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
            default: 'pending'
        }
    },
    
    // Tracking Information
    clicks: {
        type: Number,
        default: 0
    },
    
    clickHistory: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        ipAddress: String,
        userAgent: String,
        source: String // email, social, direct, etc.
    }],
    
    // Conversion Tracking
    candidateRegistered: {
        type: Boolean,
        default: false
    },
    
    registrationDate: Date,
    
    candidateApplied: {
        type: Boolean,
        default: false
    },
    
    applicationDate: Date,
    
    // Expiration
    expiresAt: {
        type: Date,
        required: true,
        index: { expireAfterSeconds: 0 }
    },
    
    // Campaign Information (for tracking referral sources)
    campaign: {
        name: String,
        source: String, // email, social_media, website, etc.
        medium: String, // referral, organic, paid
        content: String
    },
    
    // Terms and Conditions
    termsAccepted: {
        type: Boolean,
        default: true
    },
    
    termsVersion: {
        type: String,
        default: '1.0'
    },
    
    // Metadata
    metadata: {
        referrerBonus: Number,
        candidateBonus: Number,
        jobSalary: Number,
        hiringDate: Date,
        notes: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for days since creation
referralSchema.virtual('daysSinceCreated').get(function() {
    const now = new Date();
    const created = new Date(this.createdAt);
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Virtual for days until expiration
referralSchema.virtual('daysUntilExpiration').get(function() {
    const now = new Date();
    const expires = new Date(this.expiresAt);
    const diffTime = expires - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
});

// Virtual for conversion rate
referralSchema.virtual('conversionRate').get(function() {
    if (this.clicks === 0) return 0;
    let conversions = 0;
    if (this.candidateRegistered) conversions++;
    if (this.candidateApplied) conversions++;
    return (conversions / this.clicks * 100).toFixed(2);
});

// Indexes
referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referredCandidate: 1 });
referralSchema.index({ referralCode: 1 }, { unique: true });
referralSchema.index({ referredEmail: 1, job: 1 });
referralSchema.index({ status: 1, createdAt: -1 });
referralSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound indexes for analytics
referralSchema.index({ referrer: 1, createdAt: -1 });
referralSchema.index({ status: 1, payout: 1 });

// Pre-save middleware
referralSchema.pre('save', async function(next) {
    // Generate referral code if not exists
    if (!this.referralCode) {
        this.referralCode = await this.constructor.generateUniqueReferralCode();
    }
    
    // Generate referral link
    if (!this.referralLink) {
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        this.referralLink = `${baseUrl}/referral/${this.referralCode}`;
    }
    
    // Set default expiration (90 days from creation)
    if (!this.expiresAt) {
        this.expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
    }
    
    // Update tracking flags based on status changes
    if (this.isModified('status')) {
        switch (this.status) {
            case 'applied':
                if (!this.candidateApplied) {
                    this.candidateApplied = true;
                    this.applicationDate = new Date();
                }
                break;
            case 'hired':
                if (!this.metadata.hiringDate) {
                    this.metadata = {
                        ...this.metadata,
                        hiringDate: new Date()
                    };
                }
                break;
            case 'payout_completed':
                if (!this.payout.payoutDate) {
                    this.payout.payoutDate = new Date();
                    this.payout.paymentStatus = 'completed';
                }
                break;
        }
    }
    
    next();
});

// Static method to generate unique referral code
referralSchema.statics.generateUniqueReferralCode = async function() {
    let code;
    let isUnique = false;
    
    while (!isUnique) {
        // Generate 8-character alphanumeric code
        code = crypto.randomBytes(4).toString('hex').toUpperCase();
        
        // Check if code already exists
        const existingReferral = await this.findOne({ referralCode: code });
        if (!existingReferral) {
            isUnique = true;
        }
    }
    
    return code;
};

// Method to track click
referralSchema.methods.trackClick = function(clickData = {}) {
    this.clicks += 1;
    this.clickHistory.push({
        timestamp: new Date(),
        ipAddress: clickData.ipAddress,
        userAgent: clickData.userAgent,
        source: clickData.source
    });
    
    return this.save();
};

// Method to update status with automatic payout calculation
referralSchema.methods.updateStatus = async function(newStatus, metadata = {}) {
    const oldStatus = this.status;
    this.status = newStatus;
    
    // Update metadata
    if (metadata) {
        this.metadata = {
            ...this.metadata,
            ...metadata
        };
    }
    
    // Handle automatic payout calculation when hired
    if (newStatus === 'hired' && oldStatus !== 'hired') {
        await this.calculatePayout();
    }
    
    // Trigger payout process if configured
    if (newStatus === 'hired' && this.payout.amount > 0) {
        this.status = 'payout_pending';
    }
    
    return this.save();
};

// Method to calculate payout amount
referralSchema.methods.calculatePayout = async function() {
    try {
        // Get system payout settings
        const SystemSettings = require('./SystemSettings');
        const settings = await SystemSettings.findOne({ type: 'referral_payouts' });
        
        if (!settings || !settings.settings.enabled) {
            this.payout.amount = 0;
            return;
        }
        
        const payoutSettings = settings.settings;
        
        // Calculate based on job salary if available
        if (this.metadata.jobSalary && payoutSettings.salaryBasedPayout) {
            const salaryAmount = this.metadata.jobSalary;
            const percentage = payoutSettings.salaryPercentage || 5; // Default 5%
            this.payout.amount = (salaryAmount * percentage) / 100;
        } 
        // Use fixed amount
        else if (payoutSettings.fixedAmount) {
            this.payout.amount = payoutSettings.fixedAmount;
        }
        // Use tier-based payout
        else if (payoutSettings.tierBased && this.job) {
            const Job = require('./Job');
            const job = await Job.findById(this.job);
            
            if (job && job.category) {
                const tier = payoutSettings.tiers[job.category];
                this.payout.amount = tier?.amount || payoutSettings.defaultAmount || 1000;
            }
        }
        
        // Apply maximum cap
        if (payoutSettings.maxAmount && this.payout.amount > payoutSettings.maxAmount) {
            this.payout.amount = payoutSettings.maxAmount;
        }
        
        // Apply minimum amount
        if (payoutSettings.minAmount && this.payout.amount < payoutSettings.minAmount) {
            this.payout.amount = payoutSettings.minAmount;
        }
        
        this.payout.currency = payoutSettings.currency || 'INR';
        this.payout.percentage = payoutSettings.salaryPercentage;
        
    } catch (error) {
        console.error('Error calculating payout:', error);
        this.payout.amount = 0;
    }
};

// Method to process payout
referralSchema.methods.processPayout = async function(paymentData) {
    this.payout = {
        ...this.payout,
        payoutDate: new Date(),
        paymentMethod: paymentData.method,
        transactionId: paymentData.transactionId,
        paymentStatus: 'processing'
    };
    
    this.status = 'payout_completed';
    
    return this.save();
};

// Static method to get referral statistics
referralSchema.statics.getReferralStats = async function(referrerId, dateFrom, dateTo) {
    const pipeline = [
        {
            $match: {
                referrer: mongoose.Types.ObjectId(referrerId),
                ...(dateFrom && { createdAt: { $gte: new Date(dateFrom) } }),
                ...(dateTo && { createdAt: { $lte: new Date(dateTo) } })
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalClicks: { $sum: '$clicks' },
                totalPayout: { $sum: '$payout.amount' }
            }
        }
    ];
    
    const stats = await this.aggregate(pipeline);
    
    // Calculate totals
    const totals = await this.aggregate([
        {
            $match: {
                referrer: mongoose.Types.ObjectId(referrerId),
                ...(dateFrom && { createdAt: { $gte: new Date(dateFrom) } }),
                ...(dateTo && { createdAt: { $lte: new Date(dateTo) } })
            }
        },
        {
            $group: {
                _id: null,
                totalReferrals: { $sum: 1 },
                totalClicks: { $sum: '$clicks' },
                totalRegistrations: {
                    $sum: { $cond: ['$candidateRegistered', 1, 0] }
                },
                totalApplications: {
                    $sum: { $cond: ['$candidateApplied', 1, 0] }
                },
                totalHires: {
                    $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] }
                },
                totalEarnings: { $sum: '$payout.amount' },
                pendingPayouts: {
                    $sum: {
                        $cond: [
                            { $eq: ['$status', 'payout_pending'] },
                            '$payout.amount',
                            0
                        ]
                    }
                }
            }
        }
    ]);
    
    return {
        statusBreakdown: stats,
        totals: totals[0] || {
            totalReferrals: 0,
            totalClicks: 0,
            totalRegistrations: 0,
            totalApplications: 0,
            totalHires: 0,
            totalEarnings: 0,
            pendingPayouts: 0
        }
    };
};

// Static method to find referral by code
referralSchema.statics.findByCode = function(code) {
    return this.findOne({ referralCode: code, expiresAt: { $gt: new Date() } });
};

// Static method to find active referrals
referralSchema.statics.findActiveReferrals = function(filters = {}) {
    const query = {
        status: { $nin: ['expired', 'payout_completed'] },
        expiresAt: { $gt: new Date() },
        ...filters
    };
    
    return this.find(query)
        .populate('referrer', 'firstName lastName email')
        .populate('referredCandidate', 'firstName lastName email')
        .populate('job', 'title company')
        .populate('application', 'status appliedAt');
};

module.exports = mongoose.model('Referral', referralSchema);