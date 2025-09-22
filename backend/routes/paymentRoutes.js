const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { body, param, query } = require('express-validator');

const router = express.Router();

// Protection middleware - all routes require authentication
router.use(protect);

/**
 * Payment Fee Routes (Public-ish)
 */
// Get service fees (public information)
router.get('/fees/:service',
    param('service').isIn(['job_posting', 'featured_job', 'subscription'])
        .withMessage('Invalid service type'),
    validateRequest,
    paymentController.getServiceFees
);

/**
 * Payment Initiation Routes
 */
// Initiate a payment
router.post('/initiate/:type',
    param('type').isIn(['job_posting', 'featured_job', 'subscription'])
        .withMessage('Invalid payment type'),
    body('gateway').isIn(['razorpay', 'stripe', 'paypal', 'upi'])
        .withMessage('Invalid payment gateway'),
    body('jobId').optional().isMongoId()
        .withMessage('Job ID must be a valid MongoDB ObjectId'),
    body('planId').optional().isString()
        .withMessage('Plan ID must be a string'),
    body('metadata').optional().isObject()
        .withMessage('Metadata must be an object'),
    validateRequest,
    paymentController.initiatePayment
);

/**
 * User Payment Routes
 */
// Get current user's payments
router.get('/my-payments',
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])
        .withMessage('Invalid status filter'),
    query('type').optional().isIn(['job_posting', 'featured_job', 'subscription', 'referral_payout', 'premium_resume', 'bulk_credits'])
        .withMessage('Invalid type filter'),
    query('from').optional().isISO8601()
        .withMessage('From date must be in ISO 8601 format'),
    query('to').optional().isISO8601()
        .withMessage('To date must be in ISO 8601 format'),
    query('page').optional().isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    validateRequest,
    paymentController.getMyPayments
);

/**
 * Analytics and Statistics Routes (Admin only)
 * Note: These specific routes must come BEFORE parameterized routes
 */
// Get payment statistics
router.get('/stats',
    restrictTo('admin'),
    query('from').optional().isISO8601()
        .withMessage('From date must be in ISO 8601 format'),
    query('to').optional().isISO8601()
        .withMessage('To date must be in ISO 8601 format'),
    query('payer').optional().isMongoId()
        .withMessage('Payer ID must be a valid MongoDB ObjectId'),
    query('type').optional().isIn(['job_posting', 'featured_job', 'subscription', 'referral_payout', 'premium_resume', 'bulk_credits', 'other'])
        .withMessage('Invalid type filter'),
    query('gateway').optional().isIn(['stripe', 'razorpay', 'paypal', 'bank_transfer', 'upi', 'wallet'])
        .withMessage('Invalid gateway filter'),
    validateRequest,
    paymentController.getPaymentStats
);

// Get revenue analytics
router.get('/revenue-analytics',
    restrictTo('admin'),
    query('period').optional().isIn(['day', 'month', 'year'])
        .withMessage('Period must be one of: day, month, year'),
    validateRequest,
    paymentController.getRevenueAnalytics
);

/**
 * Individual Payment Routes
 */
// Get payment details
router.get('/:id',
    param('id').isMongoId()
        .withMessage('Payment ID must be a valid MongoDB ObjectId'),
    validateRequest,
    paymentController.getPayment
);

// Complete a payment (for demonstration/testing purposes)
router.post('/:id/complete',
    param('id').isMongoId()
        .withMessage('Payment ID must be a valid MongoDB ObjectId'),
    body('gatewayTransactionId').optional().isString()
        .withMessage('Gateway transaction ID must be a string'),
    body('gatewayPaymentId').optional().isString()
        .withMessage('Gateway payment ID must be a string'),
    body('status').optional().isIn(['completed', 'failed'])
        .withMessage('Status must be either completed or failed'),
    validateRequest,
    paymentController.completePayment
);

// Generate receipt for a payment
router.get('/:id/receipt',
    param('id').isMongoId()
        .withMessage('Payment ID must be a valid MongoDB ObjectId'),
    validateRequest,
    paymentController.generateReceipt
);

/**
 * Admin-only Payment Routes
 */
// Create a payment (admin only)
router.post('/',
    restrictTo('admin'),
    body('payer').optional().isMongoId()
        .withMessage('Payer must be a valid user ID'),
    body('recipient').optional().isMongoId()
        .withMessage('Recipient must be a valid user ID'),
    body('type').isIn(['job_posting', 'featured_job', 'subscription', 'referral_payout', 'premium_resume', 'bulk_credits', 'other'])
        .withMessage('Invalid payment type'),
    body('amount').isFloat({ min: 0 })
        .withMessage('Amount must be a positive number'),
    body('currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP'])
        .withMessage('Invalid currency'),
    body('paymentGateway').isIn(['stripe', 'razorpay', 'paypal', 'bank_transfer', 'upi', 'wallet'])
        .withMessage('Invalid payment gateway'),
    body('description').optional().isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    validateRequest,
    paymentController.createPayment
);

// Get all payments (admin only)
router.get('/',
    restrictTo('admin'),
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'])
        .withMessage('Invalid status filter'),
    query('type').optional().isIn(['job_posting', 'featured_job', 'subscription', 'referral_payout', 'premium_resume', 'bulk_credits', 'other'])
        .withMessage('Invalid type filter'),
    query('gateway').optional().isIn(['stripe', 'razorpay', 'paypal', 'bank_transfer', 'upi', 'wallet'])
        .withMessage('Invalid gateway filter'),
    query('from').optional().isISO8601()
        .withMessage('From date must be in ISO 8601 format'),
    query('to').optional().isISO8601()
        .withMessage('To date must be in ISO 8601 format'),
    query('minAmount').optional().isFloat({ min: 0 })
        .withMessage('Minimum amount must be a positive number'),
    query('maxAmount').optional().isFloat({ min: 0 })
        .withMessage('Maximum amount must be a positive number'),
    query('payer').optional().isMongoId()
        .withMessage('Payer ID must be a valid MongoDB ObjectId'),
    query('page').optional().isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    validateRequest,
    paymentController.getAllPayments
);

// Update payment status (admin only)
router.patch('/:id/status',
    restrictTo('admin'),
    param('id').isMongoId()
        .withMessage('Payment ID must be a valid MongoDB ObjectId'),
    body('status').isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'])
        .withMessage('Invalid payment status'),
    body('failureReason').optional().isString()
        .withMessage('Failure reason must be a string'),
    validateRequest,
    paymentController.updatePaymentStatus
);

// Create a refund (admin only)
router.post('/:id/refund',
    restrictTo('admin'),
    param('id').isMongoId()
        .withMessage('Payment ID must be a valid MongoDB ObjectId'),
    body('amount').isFloat({ min: 0.01 })
        .withMessage('Refund amount must be greater than 0'),
    body('reason').isString().isLength({ min: 1, max: 500 })
        .withMessage('Refund reason is required and cannot exceed 500 characters'),
    validateRequest,
    paymentController.createRefund
);


/**
 * Webhook Routes (Public - called by payment gateways)
 */
// Process payment gateway webhooks
router.post('/webhook/:gateway',
    param('gateway').isIn(['razorpay', 'stripe', 'paypal'])
        .withMessage('Invalid payment gateway'),
    // Note: Webhook routes typically don't use standard auth middleware
    // as they come from external services with their own validation
    paymentController.processWebhook
);

/**
 * Route ordering note:
 * Specific routes (like /stats, /revenue-analytics) should be placed BEFORE
 * parameterized routes (like /:id) to avoid conflicts
 */

module.exports = router;