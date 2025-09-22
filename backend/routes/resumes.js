const express = require('express');
const {
    createResume,
    getUserResumes,
    getResume,
    updateResume,
    deleteResume,
    downloadResume,
    getResumePreview,
    uploadAndParseResume,
    getPublicResumes,
    cloneResume,
    getResumeTemplates
} = require('../controllers/resumeController');

const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadConfigs, handleUploadError } = require('../config/aws');

const router = express.Router();

// Public routes
router.get('/templates', getResumeTemplates);
router.get('/public', getPublicResumes);

// Protected routes
router.use(protect);

// CRUD operations
router.post('/', createResume);
router.get('/', getUserResumes);

// Upload and parse resume
router.post('/upload-parse',
    uploadConfigs.resume.single('resume'),
    handleUploadError,
    uploadAndParseResume
);

// Specific resume operations
router.get('/:id', getResume);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);

// Download and preview
router.get('/:id/download', downloadResume);
router.get('/:id/preview', getResumePreview);

// Clone resume
router.post('/:id/clone', cloneResume);

module.exports = router;