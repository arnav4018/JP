const Payment = require('../models/Payment');
const SystemSettings = require('../models/SystemSettings');
const User = require('../models/User');
const Job = require('../models/Job');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Create a new payment
 * @route   POST /api/payments
 * @access  Private (Employers, Admin)
 */
exports.createPayment = catchAsync(async (req, res, next) => {
    // Set payer to current user if not explicitly provided
    if (!req.body.payer) {
        req.body.payer = req.user.id;
    }
    
    // Validate that the current user is the payer or an admin
    if (req.body.payer !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('You can only create payments for yourself', 403));
    }
    
    // Check if the payment system is enabled
    const paymentEnabled = await SystemSettings.getValue('payment', 'payment_enabled');
    if (!paymentEnabled) {
        return next(new AppError('Payment system is currently disabled', 400));
    }
    
    // Check if the selected payment gateway is supported
    const supportedGateways = await SystemSettings.getValue('payment', 'supported_gateways');
    if (!supportedGateways.includes(req.body.paymentGateway)) {
        return next(new AppError(`Payment gateway ${req.body.paymentGateway} is not supported`, 400));
    }
    
    // Create the payment
    const payment = await Payment.create(req.body);
    
    res.status(201).json({
        status: 'success',
        data: {
            payment
        }
    });
});

/**
 * @desc    Get all payments
 * @route   GET /api/payments
 * @access  Private (Admin)
 */
exports.getAllPayments = catchAsync(async (req, res, next) => {
    // Build filter object
    const filter = {};
    
    // Apply filters based on query parameters
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.gateway) filter.paymentGateway = req.query.gateway;
    if (req.query.from && req.query.to) {
        filter.createdAt = {
            $gte: new Date(req.query.from),
            $lte: new Date(req.query.to)
        };
    }
    
    // Apply date range if only one date provided
    if (req.query.from && !req.query.to) {
        filter.createdAt = { $gte: new Date(req.query.from) };
    }
    if (!req.query.from && req.query.to) {
        filter.createdAt = { $lte: new Date(req.query.to) };
    }
    
    // Amount range filtering
    if (req.query.minAmount || req.query.maxAmount) {
        filter.amount = {};
        if (req.query.minAmount) filter.amount.$gte = Number(req.query.minAmount);
        if (req.query.maxAmount) filter.amount.$lte = Number(req.query.maxAmount);
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const payments = await Payment.find(filter)
        .populate('payer', 'name email')
        .populate('recipient', 'name email')
        .populate('relatedJob', 'title company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    
    // Get total count for pagination
    const total = await Payment.countDocuments(filter);
    
    res.status(200).json({
        status: 'success',
        results: payments.length,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        },
        data: {
            payments
        }
    });
});

/**
 * @desc    Get a single payment
 * @route   GET /api/payments/:id
 * @access  Private (Owner, Admin)
 */
exports.getPayment = catchAsync(async (req, res, next) => {
    const payment = await Payment.findById(req.params.id)
        .populate('payer', 'name email')
        .populate('recipient', 'name email')
        .populate('relatedJob', 'title company')
        .populate('relatedReferral', 'referralCode')
        .populate('relatedSubscription', 'plan');
    
    if (!payment) {
        return next(new AppError('No payment found with that ID', 404));
    }
    
    // Check authorization - only allow access to the payer, recipient, or admin
    if (
        req.user.role !== 'admin' &&
        payment.payer?.toString() !== req.user.id &&
        payment.recipient?.toString() !== req.user.id
    ) {
        return next(new AppError('You do not have permission to access this payment', 403));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            payment
        }
    });
});

/**
 * @desc    Get payments for the current user
 * @route   GET /api/payments/my-payments
 * @access  Private (Any authenticated user)
 */
exports.getMyPayments = catchAsync(async (req, res, next) => {
    // Build filter object
    const filter = {
        $or: [
            { payer: req.user.id },
            { recipient: req.user.id }
        ]
    };
    
    // Apply filters based on query parameters
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.from && req.query.to) {
        filter.createdAt = {
            $gte: new Date(req.query.from),
            $lte: new Date(req.query.to)
        };
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Execute query with pagination
    const payments = await Payment.find(filter)
        .populate('payer', 'name email')
        .populate('recipient', 'name email')
        .populate('relatedJob', 'title company')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    
    // Get total count for pagination
    const total = await Payment.countDocuments(filter);
    
    res.status(200).json({
        status: 'success',
        results: payments.length,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit),
            limit
        },
        data: {
            payments
        }
    });
});

/**
 * @desc    Update payment status
 * @route   PATCH /api/payments/:id/status
 * @access  Private (Admin)
 */
exports.updatePaymentStatus = catchAsync(async (req, res, next) => {
    const { status, failureReason } = req.body;
    
    if (!status) {
        return next(new AppError('Payment status is required', 400));
    }
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
        return next(new AppError('No payment found with that ID', 404));
    }
    
    // Update payment status
    payment.status = status;
    
    // If the status is 'failed', update the failure reason
    if (status === 'failed' && failureReason) {
        payment.failureReason = failureReason;
    }
    
    await payment.save();
    
    res.status(200).json({
        status: 'success',
        data: {
            payment
        }
    });
});

/**
 * @desc    Process payment webhook
 * @route   POST /api/payments/webhook/:gateway
 * @access  Public (Webhook called by payment gateways)
 */
exports.processWebhook = catchAsync(async (req, res, next) => {
    const { gateway } = req.params;
    
    // Verify webhook signature or authenticity based on gateway
    let webhookData;
    let payment;
    
    switch (gateway) {
        case 'razorpay':
            // Process Razorpay webhook
            webhookData = {
                event: req.body.event,
                data: req.body.payload.payment.entity
            };
            
            // Find the payment by gateway payment ID
            payment = await Payment.findByGatewayId(
                null, 
                webhookData.data.id
            );
            break;
            
        case 'stripe':
            // Process Stripe webhook
            webhookData = {
                event: req.body.type,
                data: req.body.data.object
            };
            
            // Find the payment by gateway payment ID
            payment = await Payment.findByGatewayId(
                null,
                webhookData.data.id
            );
            break;
            
        default:
            return next(new AppError(`Unsupported payment gateway: ${gateway}`, 400));
    }
    
    if (!payment) {
        return next(new AppError('Payment not found for this webhook event', 404));
    }
    
    // Update payment based on webhook event
    try {
        // Add webhook data to payment
        await payment.addWebhookData(webhookData);
        
        // Update payment status based on the event
        if (webhookData.event.includes('success') || webhookData.event.includes('completed')) {
            payment.status = 'completed';
        } else if (webhookData.event.includes('fail') || webhookData.event.includes('failed')) {
            payment.status = 'failed';
            payment.failureReason = 'Payment failed according to gateway webhook';
        }
        
        await payment.save();
        
        // Respond to the webhook
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(400).json({ received: false, error: error.message });
    }
});

/**
 * @desc    Create a refund for a payment
 * @route   POST /api/payments/:id/refund
 * @access  Private (Admin)
 */
exports.createRefund = catchAsync(async (req, res, next) => {
    const { amount, reason } = req.body;
    
    if (!amount) {
        return next(new AppError('Refund amount is required', 400));
    }
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
        return next(new AppError('No payment found with that ID', 404));
    }
    
    if (payment.status !== 'completed') {
        return next(new AppError('Only completed payments can be refunded', 400));
    }
    
    // Generate a unique refund ID
    const refundId = `ref_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Create refund in our system
    try {
        await payment.addRefund({
            amount,
            reason,
            refundId
        });
        
        res.status(200).json({
            status: 'success',
            data: {
                payment,
                refund: {
                    id: refundId,
                    amount,
                    reason,
                    status: 'pending'
                }
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 400));
    }
});

/**
 * @desc    Get payment statistics
 * @route   GET /api/payments/stats
 * @access  Private (Admin)
 */
exports.getPaymentStats = catchAsync(async (req, res, next) => {
    const filters = {
        dateFrom: req.query.from,
        dateTo: req.query.to,
        payer: req.query.payer,
        type: req.query.type,
        gateway: req.query.gateway
    };
    
    const stats = await Payment.getPaymentStats(filters);
    
    res.status(200).json({
        status: 'success',
        data: stats
    });
});

/**
 * @desc    Get revenue analytics
 * @route   GET /api/payments/revenue-analytics
 * @access  Private (Admin)
 */
exports.getRevenueAnalytics = catchAsync(async (req, res, next) => {
    const { period } = req.query;
    
    const analytics = await Payment.getRevenueAnalytics(period);
    
    res.status(200).json({
        status: 'success',
        data: {
            analytics
        }
    });
});

/**
 * @desc    Get payment fees for a specific service
 * @route   GET /api/payments/fees/:service
 * @access  Public
 */
exports.getServiceFees = catchAsync(async (req, res, next) => {
    const { service } = req.params;
    
    let fee = 0;
    let currency = 'INR';
    
    switch (service) {
        case 'job_posting':
            fee = await SystemSettings.getValue('payment', 'job_posting_fee');
            break;
        case 'featured_job':
            fee = await SystemSettings.getValue('payment', 'featured_job_fee');
            break;
        case 'subscription':
            // Could return subscription tiers here
            break;
        default:
            return next(new AppError(`Unknown service type: ${service}`, 400));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            service,
            fee,
            currency
        }
    });
});

/**
 * @desc    Generate a payment receipt
 * @route   GET /api/payments/:id/receipt
 * @access  Private (Owner, Admin)
 */
exports.generateReceipt = catchAsync(async (req, res, next) => {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
        return next(new AppError('No payment found with that ID', 404));
    }
    
    // Check authorization - only allow access to the payer, recipient, or admin
    if (
        req.user.role !== 'admin' &&
        payment.payer?.toString() !== req.user.id &&
        payment.recipient?.toString() !== req.user.id
    ) {
        return next(new AppError('You do not have permission to access this receipt', 403));
    }
    
    // Check if payment is completed
    if (payment.status !== 'completed') {
        return next(new AppError('Receipt is only available for completed payments', 400));
    }
    
    // Generate receipt URL if it doesn't exist
    if (!payment.receipt.receiptUrl) {
        const receiptNumber = payment.receipt.receiptNumber || await Payment.generateReceiptNumber();
        
        // In a real implementation, this would generate a PDF receipt
        // For now, we'll just update the receipt information
        payment.receipt.receiptNumber = receiptNumber;
        payment.receipt.receiptUrl = `/receipts/${receiptNumber}.pdf`;
        
        await payment.save();
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            receiptUrl: payment.receipt.receiptUrl,
            receiptNumber: payment.receipt.receiptNumber,
            payment: {
                id: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                date: payment.completedAt,
                type: payment.type,
                paymentGateway: payment.paymentGateway,
                gatewayTransactionId: payment.gatewayTransactionId
            }
        }
    });
});

/**
 * @desc    Initiate a payment
 * @route   POST /api/payments/initiate/:type
 * @access  Private (Any authenticated user)
 */
exports.initiatePayment = catchAsync(async (req, res, next) => {
    const { type } = req.params;
    const { gateway, jobId, planId, metadata } = req.body;
    
    // Check if payment system is enabled
    const paymentEnabled = await SystemSettings.getValue('payment', 'payment_enabled');
    if (!paymentEnabled) {
        return next(new AppError('Payment system is currently disabled', 400));
    }
    
    // Check if the selected payment gateway is supported
    const supportedGateways = await SystemSettings.getValue('payment', 'supported_gateways');
    if (!supportedGateways.includes(gateway)) {
        return next(new AppError(`Payment gateway ${gateway} is not supported`, 400));
    }
    
    let amount = 0;
    let currency = 'INR';
    let description = '';
    let relatedJob = null;
    let relatedSubscription = null;
    
    // Calculate amount based on payment type
    switch (type) {
        case 'job_posting':
            if (!jobId) {
                return next(new AppError('Job ID is required for job posting payment', 400));
            }
            
            const job = await Job.findById(jobId);
            if (!job) {
                return next(new AppError('Job not found', 404));
            }
            
            // Check if user is the job owner or admin
            if (job.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new AppError('You can only make payments for your own jobs', 403));
            }
            
            amount = await SystemSettings.getValue('payment', 'job_posting_fee');
            description = `Job Posting Fee for: ${job.title}`;
            relatedJob = job._id;
            break;
            
        case 'featured_job':
            if (!jobId) {
                return next(new AppError('Job ID is required for featured job payment', 400));
            }
            
            const featuredJob = await Job.findById(jobId);
            if (!featuredJob) {
                return next(new AppError('Job not found', 404));
            }
            
            // Check if user is the job owner or admin
            if (featuredJob.user.toString() !== req.user.id && req.user.role !== 'admin') {
                return next(new AppError('You can only make payments for your own jobs', 403));
            }
            
            amount = await SystemSettings.getValue('payment', 'featured_job_fee');
            description = `Featured Job Fee for: ${featuredJob.title}`;
            relatedJob = featuredJob._id;
            break;
            
        case 'subscription':
            // In a real implementation, you would look up the subscription plan details
            // For now, we'll use a placeholder amount
            amount = 999;
            description = `Subscription Plan: ${planId || 'Basic'}`;
            break;
            
        default:
            return next(new AppError(`Unsupported payment type: ${type}`, 400));
    }
    
    // Create a payment record
    const payment = await Payment.create({
        payer: req.user.id,
        type,
        amount,
        currency,
        paymentGateway: gateway,
        description,
        relatedJob,
        relatedSubscription,
        status: 'pending',
        metadata: metadata || {}
    });
    
    // In a real implementation, you would integrate with the actual payment gateway
    // For now, return the payment details for demonstration purposes
    res.status(201).json({
        status: 'success',
        data: {
            payment,
            paymentDetails: {
                amount,
                currency,
                gateway,
                paymentId: payment._id,
                // This would typically include gateway-specific details
                // For example, a checkout URL or payment token
                checkoutUrl: `/api/payments/checkout/${payment._id}`
            }
        }
    });
});

/**
 * @desc    Complete a payment (demonstration purposes)
 * @route   POST /api/payments/:id/complete
 * @access  Private (Owner, Admin)
 */
exports.completePayment = catchAsync(async (req, res, next) => {
    const { gatewayTransactionId, gatewayPaymentId, status } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
        return next(new AppError('No payment found with that ID', 404));
    }
    
    // Check authorization - only allow access to the payer or admin
    if (payment.payer.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to complete this payment', 403));
    }
    
    // Update payment details
    payment.gatewayTransactionId = gatewayTransactionId;
    payment.gatewayPaymentId = gatewayPaymentId;
    payment.status = status || 'completed';
    payment.completedAt = new Date();
    
    await payment.save();
    
    // Perform actions based on payment type
    if (payment.status === 'completed') {
        switch (payment.type) {
            case 'job_posting':
                // Update job status to active or paid
                if (payment.relatedJob) {
                    await Job.findByIdAndUpdate(
                        payment.relatedJob,
                        { 
                            status: 'active',
                            isPaid: true,
                            activatedAt: new Date()
                        }
                    );
                }
                break;
                
            case 'featured_job':
                // Update job to featured
                if (payment.relatedJob) {
                    await Job.findByIdAndUpdate(
                        payment.relatedJob,
                        { 
                            isFeatured: true,
                            featuredUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
                        }
                    );
                }
                break;
                
            case 'subscription':
                // Update user subscription status
                await User.findByIdAndUpdate(
                    payment.payer,
                    {
                        'subscription.isActive': true,
                        'subscription.plan': payment.metadata.plan || 'basic',
                        'subscription.startDate': new Date(),
                        'subscription.expiryDate': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                        'subscription.paymentId': payment._id
                    }
                );
                break;
        }
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            payment
        }
    });
});