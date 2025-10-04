const express = require('express');
const {
    getMyApplications,
    getJobApplications,
    updateApplicationStatus,
    scheduleInterview,
    addAssessment,
    addCommunication,
    toggleStarApplication,
    getApplicationStats,
    withdrawApplication
} = require('../controllers/applicationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Note: Apply functionality moved to /api/jobs/:jobId/apply

// Get candidate's applications
router.get('/my-applications',
    authorize('candidate'),
    getMyApplications
);

// Get applications for a specific job (recruiters)
router.get('/job/:jobId',
    authorize('recruiter', 'admin'),
    getJobApplications
);

// Update application status
router.put('/:applicationId/status',
    authorize('recruiter', 'admin'),
    updateApplicationStatus
);

// Schedule interview
router.post('/:applicationId/interview',
    authorize('recruiter', 'admin'),
    scheduleInterview
);

// Add assessment
router.post('/:applicationId/assessment',
    authorize('recruiter', 'admin'),
    addAssessment
);

// Add communication
router.post('/:applicationId/communication',
    addCommunication
);

// Star/unstar application
router.put('/:applicationId/star',
    authorize('recruiter', 'admin'),
    toggleStarApplication
);

// Get application statistics
router.get('/stats',
    authorize('recruiter', 'admin'),
    getApplicationStats
);

// Withdraw application
router.delete('/:applicationId/withdraw',
    authorize('candidate'),
    withdrawApplication
);

module.exports = router;