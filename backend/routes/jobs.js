const express = require('express');
const {
    getJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    getCompanies
} = require('../controllers/jobController');

const {
    applyToJob
} = require('../controllers/applicationController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes - no authentication required for testing
router.get('/', getJobs);
router.get('/companies', getCompanies);
router.get('/:id', getJob);

// Routes for candidates and recruiters
// router.get('/user/my-applications', protect, authorize('candidate'), getMyApplications);
router.get('/user/my-jobs', protect, authorize('recruiter', 'admin'), (req, res) => {
    // Temporary implementation for my jobs
    res.status(200).json({
        success: true,
        count: 0,
        data: {
            jobs: []
        }
    });
});

// Job management routes - with authentication
router.post('/', protect, authorize('recruiter', 'admin'), createJob);
router.put('/:id', protect, authorize('recruiter', 'admin'), updateJob);
router.delete('/:id', protect, authorize('recruiter', 'admin'), deleteJob);

// Job application routes
router.post('/:jobId/apply', 
    protect,
    authorize('candidate'),
    (req, res, next) => {
        // Basic validation for resume
        if (!req.body.resume || !req.body.resume.filename) {
            return res.status(400).json({
                success: false,
                message: 'Resume is required'
            });
        }
        next();
    },
    applyToJob
);

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