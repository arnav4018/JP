const express = require('express');
const systemSettingsController = require('../controllers/systemSettingsController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { body, param, query } = require('express-validator');

const router = express.Router();

// Protection middleware - all routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

/**
 * System Settings Management Routes
 */

// Initialize default system settings
router.post('/initialize',
    systemSettingsController.initializeSettings
);

// Get all setting categories
router.get('/categories',
    systemSettingsController.getCategories
);

// Validate setting value without saving
router.post('/validate',
    body('category').isIn([
        'payment', 'referral', 'subscription', 'notification', 
        'security', 'general', 'analytics', 'api', 'email'
    ]).withMessage('Invalid category'),
    body('key').isString().isLength({ min: 1, max: 100 })
        .withMessage('Key must be a string between 1-100 characters'),
    body('value').notEmpty()
        .withMessage('Value is required'),
    body('valueType').isIn(['string', 'number', 'boolean', 'array', 'object', 'date'])
        .withMessage('Invalid value type'),
    body('validation').optional().isObject()
        .withMessage('Validation must be an object'),
    validateRequest,
    systemSettingsController.validateSetting
);

// Export settings configuration
router.get('/export',
    query('category').optional().isIn([
        'payment', 'referral', 'subscription', 'notification', 
        'security', 'general', 'analytics', 'api', 'email'
    ]).withMessage('Invalid category'),
    query('environment').optional().isIn(['development', 'staging', 'production'])
        .withMessage('Invalid environment'),
    validateRequest,
    systemSettingsController.exportSettings
);

// Import settings configuration
router.post('/import',
    body('settings').isArray()
        .withMessage('Settings must be an array'),
    body('overwrite').optional().isBoolean()
        .withMessage('Overwrite must be a boolean'),
    validateRequest,
    systemSettingsController.importSettings
);

// Bulk update settings
router.put('/bulk',
    body('updates').isArray()
        .withMessage('Updates must be an array'),
    body('updates.*.category').isIn([
        'payment', 'referral', 'subscription', 'notification', 
        'security', 'general', 'analytics', 'api', 'email'
    ]).withMessage('Invalid category in updates'),
    body('updates.*.key').isString().isLength({ min: 1, max: 100 })
        .withMessage('Key must be a string between 1-100 characters'),
    body('updates.*.value').notEmpty()
        .withMessage('Value is required in updates'),
    body('updates.*.reason').optional().isString()
        .withMessage('Reason must be a string'),
    validateRequest,
    systemSettingsController.bulkUpdateSettings
);

// Get all system settings
router.get('/',
    query('category').optional().isIn([
        'payment', 'referral', 'subscription', 'notification', 
        'security', 'general', 'analytics', 'api', 'email'
    ]).withMessage('Invalid category'),
    query('environment').optional().isIn(['development', 'staging', 'production'])
        .withMessage('Invalid environment'),
    query('visible').optional().isBoolean()
        .withMessage('Visible must be a boolean'),
    validateRequest,
    systemSettingsController.getAllSettings
);

// Create a new setting
router.post('/',
    body('category').isIn([
        'payment', 'referral', 'subscription', 'notification', 
        'security', 'general', 'analytics', 'api', 'email'
    ]).withMessage('Invalid category'),
    body('key').isString().isLength({ min: 1, max: 100 })
        .withMessage('Key must be a string between 1-100 characters'),
    body('value').notEmpty()
        .withMessage('Value is required'),
    body('valueType').isIn(['string', 'number', 'boolean', 'array', 'object', 'date'])
        .withMessage('Invalid value type'),
    body('name').isString().isLength({ min: 1, max: 100 })
        .withMessage('Name must be a string between 1-100 characters'),
    body('description').optional().isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('defaultValue').optional()
        .custom((value, { req }) => {
            // Optional validation for default value type consistency
            return true;
        }),
    body('validation').optional().isObject()
        .withMessage('Validation must be an object'),
    body('isEditable').optional().isBoolean()
        .withMessage('isEditable must be a boolean'),
    body('isVisible').optional().isBoolean()
        .withMessage('isVisible must be a boolean'),
    body('isEncrypted').optional().isBoolean()
        .withMessage('isEncrypted must be a boolean'),
    body('requiresRestart').optional().isBoolean()
        .withMessage('requiresRestart must be a boolean'),
    body('accessLevel').optional().isIn(['super_admin', 'admin', 'moderator', 'system'])
        .withMessage('Invalid access level'),
    body('environment').optional().isIn(['development', 'staging', 'production'])
        .withMessage('Invalid environment'),
    validateRequest,
    systemSettingsController.createSetting
);

/**
 * Category-specific routes
 */

// Get settings by category
router.get('/category/:category',
    param('category').isIn([
        'payment', 'referral', 'subscription', 'notification', 
        'security', 'general', 'analytics', 'api', 'email'
    ]).withMessage('Invalid category'),
    query('environment').optional().isIn(['development', 'staging', 'production'])
        .withMessage('Invalid environment'),
    validateRequest,
    systemSettingsController.getSettingsByCategory
);

/**
 * Individual setting routes
 * Note: These parameterized routes must come after specific routes
 */

// Get setting history
router.get('/:category/:key/history',
    param('category').isIn([
        'payment', 'referral', 'subscription', 'notification', 
        'security', 'general', 'analytics', 'api', 'email'
    ]).withMessage('Invalid category'),
    param('key').isString().isLength({ min: 1, max: 100 })
        .withMessage('Key must be a string between 1-100 characters'),
    validateRequest,
    systemSettingsController.getSettingHistory
);

// Get setting value
router.get('/:category/:key/value',
    param('category').isIn([
        'payment', 'referral', 'subscription', 'notification', 
        'security', 'general', 'analytics', 'api', 'email'
    ]).withMessage('Invalid category'),
    param('key').isString().isLength({ min: 1, max: 100 })
        .withMessage('Key must be a string between 1-100 characters'),
    query('environment').optional().isIn(['development', 'staging', 'production'])
        .withMessage('Invalid environment'),
    validateRequest,
    systemSettingsController.getSettingValue
);

// Reset setting to default
router.post('/:category/:key/reset',
    param('category').isIn([
        'payment', 'referral', 'subscription', 'notification', 
        'security', 'general', 'analytics', 'api', 'email'
    ]).withMessage('Invalid category'),
    param('key').isString().isLength({ min: 1, max: 100 })
        .withMessage('Key must be a string between 1-100 characters'),
    body('reason').optional().isString().isLength({ max: 500 })
        .withMessage('Reason cannot exceed 500 characters'),
    validateRequest,
    systemSettingsController.resetSetting
);

// Get a specific setting
router.get('/:category/:key',
    param('category').isIn([
        'payment', 'referral', 'subscription', 'notification', 
        'security', 'general', 'analytics', 'api', 'email'
    ]).withMessage('Invalid category'),
    param('key').isString().isLength({ min: 1, max: 100 })
        .withMessage('Key must be a string between 1-100 characters'),
    query('environment').optional().isIn(['development', 'staging', 'production'])
        .withMessage('Invalid environment'),
    validateRequest,
    systemSettingsController.getSetting
);

// Update a setting value
router.put('/:category/:key',
    param('category').isIn([
        'payment', 'referral', 'subscription', 'notification', 
        'security', 'general', 'analytics', 'api', 'email'
    ]).withMessage('Invalid category'),
    param('key').isString().isLength({ min: 1, max: 100 })
        .withMessage('Key must be a string between 1-100 characters'),
    body('value').notEmpty()
        .withMessage('Value is required'),
    body('reason').optional().isString().isLength({ max: 500 })
        .withMessage('Reason cannot exceed 500 characters'),
    validateRequest,
    systemSettingsController.updateSetting
);

// Delete a setting (soft delete)
router.delete('/:category/:key',
    param('category').isIn([
        'payment', 'referral', 'subscription', 'notification', 
        'security', 'general', 'analytics', 'api', 'email'
    ]).withMessage('Invalid category'),
    param('key').isString().isLength({ min: 1, max: 100 })
        .withMessage('Key must be a string between 1-100 characters'),
    validateRequest,
    systemSettingsController.deleteSetting
);

module.exports = router;