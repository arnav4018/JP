const express = require('express');
const {
    getJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    getCompanies
    // Temporarily disabled:
    // applyToJob,
    // getJobApplications,
    // updateApplicationStatus,
    // getMyApplications,
    // getMyJobs
} = require('../controllers/jobController');

// Temporarily disabled auth and validation middleware
// const { protect, authorize, optionalAuth } = require('../middleware/auth');
// const {
//     validateJobCreation,
//     validateJobUpdate,
//     validateObjectId,
//     validateJobSearch
// } = require('../middleware/validation');

const router = express.Router();

// Public routes - no authentication required for testing
router.get('/', getJobs);
router.get('/companies', getCompanies);
router.get('/:id', getJob);

// Routes for candidates and recruiters - temporarily disabled
// router.get('/user/my-applications', authorize('candidate'), getMyApplications);
// router.get('/user/my-jobs', authorize('recruiter', 'admin'), getMyJobs);

// Job management routes - simplified for testing
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

// Job application routes - temporarily disabled
// router.post('/:id/apply', 
//     validateObjectId('id'),
//     authorize('candidate'),
//     (req, res, next) => {
//         // Custom validation for resume
//         if (!req.body.resume) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Resume is required'
//             });
//         }
//         next();
//     },
//     applyToJob
// );

// Application management routes - temporarily disabled
// router.get('/:id/applications', 
//     validateObjectId('id'),
//     getJobApplications
// );

// router.put('/:jobId/applications/:applicationId',
//     validateObjectId('jobId'),
//     validateObjectId('applicationId'),
//     (req, res, next) => {
//         const { status } = req.body;
//         const validStatuses = ['pending', 'reviewed', 'shortlisted', 'interviewed', 'rejected', 'hired'];
//         
//         if (!status || !validStatuses.includes(status)) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Valid application status is required',
//                 validStatuses
//             });
//         }
//         next();
//     },
//     updateApplicationStatus
// );

module.exports = router;