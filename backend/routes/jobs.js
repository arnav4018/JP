const express = require('express');
const {
    getJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    applyToJob,
    getJobApplications,
    updateApplicationStatus,
    getMyApplications,
    getMyJobs
} = require('../controllers/jobController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
    validateJobCreation,
    validateJobUpdate,
    validateObjectId,
    validateJobSearch
} = require('../middleware/validation');

const router = express.Router();

// Public routes with optional authentication
router.get('/', validateJobSearch, optionalAuth, getJobs);
router.get('/:id', validateObjectId('id'), optionalAuth, getJob);

// Protected routes - authentication required
router.use(protect);

// Routes for candidates and recruiters
router.get('/user/my-applications', authorize('candidate'), getMyApplications);
router.get('/user/my-jobs', authorize('recruiter', 'admin'), getMyJobs);

// Job management routes - recruiters and admins only
router.post('/', 
    authorize('recruiter', 'admin'), 
    validateJobCreation, 
    createJob
);

router.put('/:id', 
    validateObjectId('id'), 
    validateJobUpdate, 
    updateJob
);

router.delete('/:id', 
    validateObjectId('id'), 
    deleteJob
);

// Job application routes
router.post('/:id/apply', 
    validateObjectId('id'),
    authorize('candidate'),
    (req, res, next) => {
        // Custom validation for resume
        if (!req.body.resume) {
            return res.status(400).json({
                success: false,
                message: 'Resume is required'
            });
        }
        next();
    },
    applyToJob
);

// Application management routes - job owners and admins only
router.get('/:id/applications', 
    validateObjectId('id'),
    getJobApplications
);

router.put('/:jobId/applications/:applicationId',
    validateObjectId('jobId'),
    validateObjectId('applicationId'),
    (req, res, next) => {
        const { status } = req.body;
        const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interviewed', 'rejected', 'hired'];
        
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid application status is required',
                validStatuses
            });
        }
        next();
    },
    updateApplicationStatus
);

module.exports = router;