const express = require('express');
const aiScoringController = require('../controllers/aiScoringController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { body, param, query } = require('express-validator');

const router = express.Router();

// Protection middleware - all routes require authentication
router.use(protect);

/**
 * AI Scoring Routes for Applications
 */

// Score a specific application
router.post('/score-application',
    body('applicationId').isMongoId()
        .withMessage('Application ID must be a valid MongoDB ObjectId'),
    validateRequest,
    aiScoringController.scoreApplication
);

// Score all applications for a job
router.post('/score-job-applications',
    body('jobId').isMongoId()
        .withMessage('Job ID must be a valid MongoDB ObjectId'),
    validateRequest,
    aiScoringController.scoreJobApplications
);

/**
 * AI Scoring Analysis Routes
 */

// Get AI scoring dashboard (Admin only)
router.get('/dashboard',
    restrictTo('admin'),
    aiScoringController.getAIScoringDashboard
);

// Get AI scoring analysis for a job
router.get('/job/:jobId/analysis',
    param('jobId').isMongoId()
        .withMessage('Job ID must be a valid MongoDB ObjectId'),
    validateRequest,
    aiScoringController.getJobScoringAnalysis
);

/**
 * Candidate Analysis Routes
 */

// Get skill match analysis for a candidate
router.get('/candidate/:candidateId/skills',
    param('candidateId').isMongoId()
        .withMessage('Candidate ID must be a valid MongoDB ObjectId'),
    validateRequest,
    aiScoringController.getCandidateSkillAnalysis
);

// Get job recommendations for a candidate using AI
router.get('/candidate/:candidateId/recommendations',
    param('candidateId').isMongoId()
        .withMessage('Candidate ID must be a valid MongoDB ObjectId'),
    query('limit').optional().isInt({ min: 1, max: 50 })
        .withMessage('Limit must be between 1 and 50'),
    validateRequest,
    aiScoringController.getCandidateJobRecommendations
);

module.exports = router;