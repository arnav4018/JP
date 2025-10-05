const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
        }));

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorMessages
        });
    }

    next();
};

// User registration validation
const validateUserRegistration = [
    body('firstName')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    
    body('lastName')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    
    body('role')
        .optional()
        .isIn(['candidate', 'recruiter'])
        .withMessage('Role must be either candidate or recruiter'),
    
    body('phone')
        .optional()
        .matches(/^\+?[\d\s\-\(\)]+$/)
        .withMessage('Please enter a valid phone number'),
    
    body('companyName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Company name must be between 2 and 100 characters')
        .custom((value, { req }) => {
            if (req.body.role === 'recruiter' && !value) {
                throw new Error('Company name is required for recruiters');
            }
            return true;
        }),
    
    handleValidationErrors
];

// User login validation
const validateUserLogin = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

// Job creation validation
const validateJobCreation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Job title is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Job title must be between 3 and 100 characters'),
    
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Job description is required')
        .isLength({ min: 50, max: 2000 })
        .withMessage('Job description must be between 50 and 2000 characters'),
    
    body('company.name')
        .trim()
        .notEmpty()
        .withMessage('Company name is required')
        .isLength({ max: 100 })
        .withMessage('Company name cannot exceed 100 characters'),
    
    body('company.website')
        .optional()
        .isURL()
        .withMessage('Please enter a valid website URL'),
    
    body('company.size')
        .optional()
        .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
        .withMessage('Invalid company size'),
    
    body('location.city')
        .trim()
        .notEmpty()
        .withMessage('City is required'),
    
    body('location.state')
        .trim()
        .notEmpty()
        .withMessage('State is required'),
    
    body('location.country')
        .trim()
        .notEmpty()
        .withMessage('Country is required'),
    
    body('location.isRemote')
        .optional()
        .isBoolean()
        .withMessage('isRemote must be a boolean'),
    
    body('location.remoteType')
        .optional()
        .isIn(['fully-remote', 'hybrid', 'on-site'])
        .withMessage('Invalid remote type'),
    
    body('employment.type')
        .notEmpty()
        .withMessage('Employment type is required')
        .isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance'])
        .withMessage('Invalid employment type'),
    
    body('employment.experience.min')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Minimum experience must be a non-negative number'),
    
    body('employment.experience.max')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Maximum experience must be a non-negative number'),
    
    body('salary.min')
        .optional()
        .isNumeric()
        .withMessage('Minimum salary must be a number'),
    
    body('salary.max')
        .optional()
        .isNumeric()
        .withMessage('Maximum salary must be a number'),
    
    body('salary.currency')
        .optional()
        .isIn(['INR', 'USD', 'EUR', 'GBP'])
        .withMessage('Invalid currency'),
    
    body('salary.period')
        .optional()
        .isIn(['hourly', 'monthly', 'yearly'])
        .withMessage('Invalid salary period'),
    
    body('requirements.skills')
        .isArray({ min: 1 })
        .withMessage('At least one skill is required'),
    
    body('requirements.skills.*')
        .trim()
        .notEmpty()
        .withMessage('Skill cannot be empty'),
    
    body('requirements.education')
        .optional()
        .isIn(['high-school', 'diploma', 'bachelor', 'master', 'phd', 'any'])
        .withMessage('Invalid education level'),
    
    body('category')
        .notEmpty()
        .withMessage('Job category is required')
        .isIn([
            'software-development', 'data-science', 'design', 'marketing',
            'sales', 'finance', 'hr', 'operations', 'customer-service',
            'healthcare', 'education', 'other'
        ])
        .withMessage('Invalid job category'),
    
    body('applicationDeadline')
        .optional()
        .isISO8601()
        .withMessage('Invalid deadline date format')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Application deadline must be in the future');
            }
            return true;
        }),
    
    handleValidationErrors
];

// Job update validation
const validateJobUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Job title must be between 3 and 100 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ min: 50, max: 2000 })
        .withMessage('Job description must be between 50 and 2000 characters'),
    
    body('company.name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name cannot exceed 100 characters'),
    
    body('status')
        .optional()
        .isIn(['draft', 'active', 'paused', 'closed'])
        .withMessage('Invalid job status'),
    
    handleValidationErrors
];

// MongoDB ObjectId validation
const validateObjectId = (field) => [
    param(field)
        .isMongoId()
        .withMessage(`Invalid ${field} format`),
    
    handleValidationErrors
];

// Query parameters validation for job search
const validateJobSearch = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    
    query('salaryMin')
        .optional()
        .isNumeric()
        .withMessage('Minimum salary must be a number'),
    
    query('salaryMax')
        .optional()
        .isNumeric()
        .withMessage('Maximum salary must be a number'),
    
    query('experienceMin')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Minimum experience must be a non-negative number'),
    
    query('experienceMax')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Maximum experience must be a non-negative number'),
    
    query('category')
        .optional()
        .isIn([
            'software-development', 'data-science', 'design', 'marketing',
            'sales', 'finance', 'hr', 'operations', 'customer-service',
            'healthcare', 'education', 'other'
        ])
        .withMessage('Invalid job category'),
    
    query('employmentType')
        .optional()
        .isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance'])
        .withMessage('Invalid employment type'),
    
    query('isRemote')
        .optional()
        .isBoolean()
        .withMessage('isRemote must be a boolean'),
    
    query('sortBy')
        .optional()
        .isIn(['createdAt', 'title', 'salary.min', 'views'])
        .withMessage('Invalid sort field'),
    
    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc'),
    
    handleValidationErrors
];

// Password validation
const validatePassword = [
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    
    handleValidationErrors
];

// Email validation
const validateEmail = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please enter a valid email')
        .normalizeEmail(),
    
    handleValidationErrors
];

module.exports = {
    validateUserRegistration,
    validateUserLogin,
    validateJobCreation,
    validateJobUpdate,
    validateObjectId,
    validateJobSearch,
    validatePassword,
    validateEmail,
    handleValidationErrors
};