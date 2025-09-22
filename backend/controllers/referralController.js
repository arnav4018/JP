const Referral = require('../models/Referral');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const SystemSettings = require('../models/SystemSettings');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Create a new referral
 * @route   POST /api/referrals
 * @access  Private
 */
exports.createReferral = catchAsync(async (req, res, next) => {
    // Check if referral system is enabled
    const referralEnabled = await SystemSettings.getValue('referral', 'referral_enabled');
    if (!referralEnabled) {
        return next(new AppError('Referral system is currently disabled', 400));
    }

    const { referredEmail, job, personalMessage, campaign } = req.body;

    // Check if referral already exists for this email and job combination
    const existingReferral = await Referral.findOne({
        referrer: req.user.id,
        referredEmail,
        job: job || null
    });

    if (existingReferral) {
        return next(new AppError('A referral for this email already exists', 400));
    }

    // Check if the referred email belongs to an existing user
    let referredCandidate = await User.findOne({ email: referredEmail });

    const referralData = {
        referrer: req.user.id,
        referredEmail,
        personalMessage,
        campaign: campaign || {}
    };

    if (referredCandidate) {
        referralData.referredCandidate = referredCandidate._id;
        referralData.candidateRegistered = true;
        referralData.registrationDate = referredCandidate.createdAt;
    }

    if (job) {
        const jobDoc = await Job.findById(job);
        if (!jobDoc) {
            return next(new AppError('Job not found', 404));
        }
        referralData.job = job;
    }

    const referral = await Referral.create(referralData);

    // Populate the created referral
    await referral.populate([
        { path: 'referrer', select: 'firstName lastName email' },
        { path: 'referredCandidate', select: 'firstName lastName email' },
        { path: 'job', select: 'title company' }
    ]);

    res.status(201).json({
        status: 'success',
        data: {
            referral
        }
    });
});

/**
 * @desc    Get all referrals for the current user
 * @route   GET /api/referrals/my-referrals
 * @access  Private
 */
exports.getMyReferrals = catchAsync(async (req, res, next) => {
    const { status, page = 1, limit = 10 } = req.query;

    // Build filter
    const filter = { referrer: req.user.id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const referrals = await Referral.find(filter)
        .populate('referrer', 'firstName lastName email')
        .populate('referredCandidate', 'firstName lastName email')
        .populate('job', 'title company')
        .populate('application', 'status appliedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Referral.countDocuments(filter);

    res.status(200).json({
        status: 'success',
        results: referrals.length,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            limit: parseInt(limit)
        },
        data: {
            referrals
        }
    });
});

/**
 * @desc    Get all referrals (Admin only)
 * @route   GET /api/referrals
 * @access  Private (Admin)
 */
exports.getAllReferrals = catchAsync(async (req, res, next) => {
    const { 
        status, 
        referrer, 
        dateFrom, 
        dateTo, 
        page = 1, 
        limit = 10 
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (referrer) filter.referrer = referrer;
    if (dateFrom && dateTo) {
        filter.createdAt = {
            $gte: new Date(dateFrom),
            $lte: new Date(dateTo)
        };
    }

    const skip = (page - 1) * limit;

    const referrals = await Referral.find(filter)
        .populate('referrer', 'firstName lastName email')
        .populate('referredCandidate', 'firstName lastName email')
        .populate('job', 'title company')
        .populate('application', 'status appliedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Referral.countDocuments(filter);

    res.status(200).json({
        status: 'success',
        results: referrals.length,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
            limit: parseInt(limit)
        },
        data: {
            referrals
        }
    });
});

/**
 * @desc    Get a single referral
 * @route   GET /api/referrals/:id
 * @access  Private (Owner or Admin)
 */
exports.getReferral = catchAsync(async (req, res, next) => {
    const referral = await Referral.findById(req.params.id)
        .populate('referrer', 'firstName lastName email')
        .populate('referredCandidate', 'firstName lastName email')
        .populate('job', 'title company description requirements')
        .populate('application', 'status appliedAt');

    if (!referral) {
        return next(new AppError('Referral not found', 404));
    }

    // Check authorization
    if (
        req.user.role !== 'admin' &&
        referral.referrer.toString() !== req.user.id
    ) {
        return next(new AppError('You do not have permission to access this referral', 403));
    }

    res.status(200).json({
        status: 'success',
        data: {
            referral
        }
    });
});

/**
 * @desc    Track referral link click
 * @route   POST /api/referrals/:code/click
 * @access  Public
 */
exports.trackClick = catchAsync(async (req, res, next) => {
    const { code } = req.params;
    const { source } = req.body;

    const referral = await Referral.findByCode(code);

    if (!referral) {
        return next(new AppError('Invalid or expired referral code', 404));
    }

    // Track the click
    await referral.trackClick({
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        source: source || 'direct'
    });

    res.status(200).json({
        status: 'success',
        data: {
            referralCode: referral.referralCode,
            jobId: referral.job || null,
            referrerName: referral.referrer?.firstName || 'Anonymous',
            personalMessage: referral.personalMessage
        }
    });
});

/**
 * @desc    Process referral signup
 * @route   POST /api/referrals/:code/signup
 * @access  Public
 */
exports.processSignup = catchAsync(async (req, res, next) => {
    const { code } = req.params;
    const { userId } = req.body;

    const referral = await Referral.findByCode(code);

    if (!referral) {
        return next(new AppError('Invalid or expired referral code', 404));
    }

    // Check if the user matches the referred email
    const user = await User.findById(userId);
    if (!user || user.email !== referral.referredEmail) {
        return next(new AppError('User email does not match the referral', 400));
    }

    // Update referral with candidate information
    referral.referredCandidate = userId;
    referral.candidateRegistered = true;
    referral.registrationDate = new Date();

    // If this is a job-specific referral, update status
    if (referral.job) {
        referral.status = 'applied'; // They can now apply to the job
    }

    await referral.save();

    res.status(200).json({
        status: 'success',
        message: 'Referral signup processed successfully'
    });
});

/**
 * @desc    Update referral status
 * @route   PATCH /api/referrals/:id/status
 * @access  Private (Admin or Referrer)
 */
exports.updateReferralStatus = catchAsync(async (req, res, next) => {
    const { status, metadata } = req.body;

    const referral = await Referral.findById(req.params.id);

    if (!referral) {
        return next(new AppError('Referral not found', 404));
    }

    // Check authorization
    if (
        req.user.role !== 'admin' &&
        referral.referrer.toString() !== req.user.id
    ) {
        return next(new AppError('You do not have permission to update this referral', 403));
    }

    await referral.updateStatus(status, metadata);

    res.status(200).json({
        status: 'success',
        data: {
            referral
        }
    });
});

/**
 * @desc    Process referral payout
 * @route   POST /api/referrals/:id/payout
 * @access  Private (Admin)
 */
exports.processReferralPayout = catchAsync(async (req, res, next) => {
    const { paymentMethod, transactionId } = req.body;

    const referral = await Referral.findById(req.params.id)
        .populate('referrer', 'firstName lastName email');

    if (!referral) {
        return next(new AppError('Referral not found', 404));
    }

    if (referral.status !== 'hired') {
        return next(new AppError('Only hired referrals are eligible for payout', 400));
    }

    if (referral.payout.amount <= 0) {
        return next(new AppError('No payout amount calculated for this referral', 400));
    }

    // Create payment record
    const payment = await Payment.create({
        recipient: referral.referrer._id,
        type: 'referral_payout',
        amount: referral.payout.amount,
        currency: referral.payout.currency,
        paymentGateway: paymentMethod,
        gatewayTransactionId: transactionId,
        status: 'completed',
        description: `Referral payout for ${referral.referredCandidate?.firstName || 'candidate'}`,
        relatedReferral: referral._id
    });

    // Process the payout
    await referral.processPayout({
        method: paymentMethod,
        transactionId
    });

    res.status(200).json({
        status: 'success',
        data: {
            referral,
            payment
        }
    });
});

/**
 * @desc    Get referral statistics
 * @route   GET /api/referrals/stats
 * @access  Private
 */
exports.getReferralStats = catchAsync(async (req, res, next) => {
    const { dateFrom, dateTo } = req.query;

    // For regular users, show only their stats
    const referrerId = req.user.role === 'admin' ? req.query.referrer : req.user.id;

    const stats = await Referral.getReferralStats(referrerId, dateFrom, dateTo);

    res.status(200).json({
        status: 'success',
        data: stats
    });
});

/**
 * @desc    Get active referrals with filters
 * @route   GET /api/referrals/active
 * @access  Private (Admin)
 */
exports.getActiveReferrals = catchAsync(async (req, res, next) => {
    const filters = {};

    if (req.query.referrer) filters.referrer = req.query.referrer;
    if (req.query.job) filters.job = req.query.job;
    if (req.query.status) filters.status = req.query.status;

    const referrals = await Referral.findActiveReferrals(filters);

    res.status(200).json({
        status: 'success',
        results: referrals.length,
        data: {
            referrals
        }
    });
});

/**
 * @desc    Link referral to application
 * @route   POST /api/referrals/:id/link-application
 * @access  Private (Admin)
 */
exports.linkToApplication = catchAsync(async (req, res, next) => {
    const { applicationId } = req.body;

    const referral = await Referral.findById(req.params.id);
    const application = await Application.findById(applicationId);

    if (!referral) {
        return next(new AppError('Referral not found', 404));
    }

    if (!application) {
        return next(new AppError('Application not found', 404));
    }

    // Verify the application matches the referral
    if (
        application.candidate.toString() !== referral.referredCandidate?.toString() ||
        (referral.job && application.job.toString() !== referral.job.toString())
    ) {
        return next(new AppError('Application does not match the referral criteria', 400));
    }

    referral.application = applicationId;
    referral.candidateApplied = true;
    referral.applicationDate = new Date();
    referral.status = 'applied';

    await referral.save();

    res.status(200).json({
        status: 'success',
        data: {
            referral
        }
    });
});

/**
 * @desc    Get referral analytics dashboard
 * @route   GET /api/referrals/analytics
 * @access  Private (Admin)
 */
exports.getReferralAnalytics = catchAsync(async (req, res, next) => {
    const { period = 'month' } = req.query;

    const analytics = {
        // Overall metrics
        totalReferrals: await Referral.countDocuments(),
        activeReferrals: await Referral.countDocuments({
            status: { $nin: ['expired', 'payout_completed'] }
        }),
        completedPayouts: await Referral.countDocuments({
            status: 'payout_completed'
        }),
        
        // Status breakdown
        statusBreakdown: await Referral.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]),

        // Top referrers
        topReferrers: await Referral.aggregate([
            {
                $match: {
                    status: { $in: ['hired', 'payout_completed', 'payout_pending'] }
                }
            },
            {
                $group: {
                    _id: '$referrer',
                    totalReferrals: { $sum: 1 },
                    totalEarnings: { $sum: '$payout.amount' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'referrerInfo'
                }
            },
            { $unwind: '$referrerInfo' },
            {
                $project: {
                    referrerName: {
                        $concat: ['$referrerInfo.firstName', ' ', '$referrerInfo.lastName']
                    },
                    referrerEmail: '$referrerInfo.email',
                    totalReferrals: 1,
                    totalEarnings: 1
                }
            },
            { $sort: { totalReferrals: -1 } },
            { $limit: 10 }
        ]),

        // Monthly trends
        monthlyTrends: await Referral.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(new Date().getFullYear(), 0, 1) // Start of current year
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    referrals: { $sum: 1 },
                    successful: {
                        $sum: {
                            $cond: [
                                { $in: ['$status', ['hired', 'payout_completed']] },
                                1,
                                0
                            ]
                        }
                    },
                    totalPayouts: {
                        $sum: {
                            $cond: [
                                { $eq: ['$status', 'payout_completed'] },
                                '$payout.amount',
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ])
    };

    res.status(200).json({
        status: 'success',
        data: analytics
    });
});

/**
 * @desc    Calculate pending payouts
 * @route   GET /api/referrals/pending-payouts
 * @access  Private (Admin)
 */
exports.getPendingPayouts = catchAsync(async (req, res, next) => {
    const pendingPayouts = await Referral.find({
        status: 'payout_pending'
    })
    .populate('referrer', 'firstName lastName email bankDetails')
    .populate('referredCandidate', 'firstName lastName email')
    .populate('job', 'title company')
    .sort({ 'metadata.hiringDate': -1 });

    const totalPendingAmount = pendingPayouts.reduce(
        (total, referral) => total + (referral.payout.amount || 0),
        0
    );

    res.status(200).json({
        status: 'success',
        results: pendingPayouts.length,
        data: {
            pendingPayouts,
            totalPendingAmount,
            currency: 'INR'
        }
    });
});

/**
 * @desc    Bulk process payouts
 * @route   POST /api/referrals/bulk-payout
 * @access  Private (Admin)
 */
exports.bulkProcessPayouts = catchAsync(async (req, res, next) => {
    const { referralIds, paymentMethod } = req.body;

    if (!referralIds || !Array.isArray(referralIds)) {
        return next(new AppError('Referral IDs array is required', 400));
    }

    const results = [];
    const totalAmount = 0;

    for (const referralId of referralIds) {
        try {
            const referral = await Referral.findById(referralId)
                .populate('referrer', 'firstName lastName email');

            if (!referral) {
                results.push({
                    referralId,
                    success: false,
                    error: 'Referral not found'
                });
                continue;
            }

            if (referral.status !== 'hired') {
                results.push({
                    referralId,
                    success: false,
                    error: 'Only hired referrals are eligible for payout'
                });
                continue;
            }

            // Create payment record
            const payment = await Payment.create({
                recipient: referral.referrer._id,
                type: 'referral_payout',
                amount: referral.payout.amount,
                currency: referral.payout.currency,
                paymentGateway: paymentMethod,
                status: 'completed',
                description: `Bulk referral payout`,
                relatedReferral: referral._id
            });

            // Process the payout
            await referral.processPayout({
                method: paymentMethod,
                transactionId: `bulk_${Date.now()}_${Math.floor(Math.random() * 1000)}`
            });

            totalAmount += referral.payout.amount;

            results.push({
                referralId,
                success: true,
                amount: referral.payout.amount,
                paymentId: payment._id
            });

        } catch (error) {
            results.push({
                referralId,
                success: false,
                error: error.message
            });
        }
    }

    res.status(200).json({
        status: 'success',
        data: {
            results,
            totalProcessed: results.filter(r => r.success).length,
            totalFailed: results.filter(r => !r.success).length,
            totalAmount
        }
    });
});