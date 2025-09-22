const express = require('express');
const referralController = require('../controllers/referralController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { body, param, query } = require('express-validator');

const router = express.Router();

/**
 * Public Routes (no authentication required)
 */

// Track referral link click
router.post('/:code/click',
    param('code').isString().isLength({ min: 6, max: 10 })
        .withMessage('Invalid referral code format'),
    body('source').optional().isString()
        .withMessage('Source must be a string'),
    validateRequest,
    referralController.trackClick
);

// Process referral signup
router.post('/:code/signup',
    param('code').isString().isLength({ min: 6, max: 10 })
        .withMessage('Invalid referral code format'),
    body('userId').isMongoId()
        .withMessage('User ID must be a valid MongoDB ObjectId'),
    validateRequest,
    referralController.processSignup
);

/**
 * Protected Routes (authentication required)
 */
router.use(protect);

// Get referral statistics for current user or admin
router.get('/stats',
    query('dateFrom').optional().isISO8601()
        .withMessage('From date must be in ISO 8601 format'),
    query('dateTo').optional().isISO8601()
        .withMessage('To date must be in ISO 8601 format'),
    query('referrer').optional().isMongoId()
        .withMessage('Referrer ID must be a valid MongoDB ObjectId'),
    validateRequest,
    referralController.getReferralStats
);

// Get current user's referrals
router.get('/my-referrals',
    query('status').optional().isIn([
        'pending', 'applied', 'under_review', 'shortlisted', 
        'interviewed', 'rejected', 'hired', 'payout_pending', 
        'payout_completed', 'expired'
    ]).withMessage('Invalid status filter'),
    query('page').optional().isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    validateRequest,
    referralController.getMyReferrals
);

// Create a new referral
router.post('/',
    body('referredEmail').isEmail()
        .withMessage('Valid email is required'),
    body('job').optional().isMongoId()
        .withMessage('Job ID must be a valid MongoDB ObjectId'),
    body('personalMessage').optional().isLength({ max: 500 })
        .withMessage('Personal message cannot exceed 500 characters'),
    body('campaign.name').optional().isString()
        .withMessage('Campaign name must be a string'),
    body('campaign.source').optional().isString()
        .withMessage('Campaign source must be a string'),
    validateRequest,
    referralController.createReferral
);

// Get a single referral (owner or admin)
router.get('/:id',
    param('id').isMongoId()
        .withMessage('Referral ID must be a valid MongoDB ObjectId'),
    validateRequest,
    referralController.getReferral
);

// Update referral status (owner or admin)
router.patch('/:id/status',
    param('id').isMongoId()
        .withMessage('Referral ID must be a valid MongoDB ObjectId'),
    body('status').isIn([
        'pending', 'applied', 'under_review', 'shortlisted', 
        'interviewed', 'rejected', 'hired', 'payout_pending', 
        'payout_completed', 'expired'
    ]).withMessage('Invalid status'),
    body('metadata').optional().isObject()
        .withMessage('Metadata must be an object'),
    validateRequest,
    referralController.updateReferralStatus
);

/**
 * Admin-only Routes - Specific routes first
 */

// Bulk process payouts (admin only) - must come before /:id routes
router.post('/bulk-payout',
    restrictTo('admin'),
    body('referralIds').isArray({ min: 1 })
        .withMessage('Referral IDs array is required with at least one ID'),
    body('referralIds.*').isMongoId()
        .withMessage('Each referral ID must be a valid MongoDB ObjectId'),
    body('paymentMethod').isIn(['razorpay', 'stripe', 'paypal', 'bank_transfer', 'upi'])
        .withMessage('Invalid payment method'),
    validateRequest,
    referralController.bulkProcessPayouts
);

// Get active referrals with filters (admin only)
router.get('/active',
    restrictTo('admin'),
    query('referrer').optional().isMongoId()
        .withMessage('Referrer ID must be a valid MongoDB ObjectId'),
    query('job').optional().isMongoId()
        .withMessage('Job ID must be a valid MongoDB ObjectId'),
    query('status').optional().isIn([
        'pending', 'applied', 'under_review', 'shortlisted', 
        'interviewed', 'rejected', 'hired', 'payout_pending', 
        'payout_completed', 'expired'
    ]).withMessage('Invalid status filter'),
    validateRequest,
    referralController.getActiveReferrals
);

// Get referral analytics dashboard (admin only)
router.get('/analytics',
    restrictTo('admin'),
    query('period').optional().isIn(['day', 'month', 'year'])
        .withMessage('Period must be one of: day, month, year'),
    validateRequest,
    referralController.getReferralAnalytics
);

// Get pending payouts (admin only)
router.get('/pending-payouts',
    restrictTo('admin'),
    referralController.getPendingPayouts
);

// Link referral to application (admin only)
router.post('/:id/link-application',
    restrictTo('admin'),
    param('id').isMongoId()
        .withMessage('Referral ID must be a valid MongoDB ObjectId'),
    body('applicationId').isMongoId()
        .withMessage('Application ID must be a valid MongoDB ObjectId'),
    validateRequest,
    referralController.linkToApplication
);

// Process individual referral payout (admin only)
router.post('/:id/payout',
    restrictTo('admin'),
    param('id').isMongoId()
        .withMessage('Referral ID must be a valid MongoDB ObjectId'),
    body('paymentMethod').isIn(['razorpay', 'stripe', 'paypal', 'bank_transfer', 'upi'])
        .withMessage('Invalid payment method'),
    body('transactionId').optional().isString()
        .withMessage('Transaction ID must be a string'),
    validateRequest,
    referralController.processReferralPayout
);

// Get all referrals (admin only)
router.get('/',
    restrictTo('admin'),
    query('status').optional().isIn([
        'pending', 'applied', 'under_review', 'shortlisted', 
        'interviewed', 'rejected', 'hired', 'payout_pending', 
        'payout_completed', 'expired'
    ]).withMessage('Invalid status filter'),
    query('referrer').optional().isMongoId()
        .withMessage('Referrer ID must be a valid MongoDB ObjectId'),
    query('dateFrom').optional().isISO8601()
        .withMessage('From date must be in ISO 8601 format'),
    query('dateTo').optional().isISO8601()
        .withMessage('To date must be in ISO 8601 format'),
    query('page').optional().isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    validateRequest,
    referralController.getAllReferrals
);

module.exports = router;