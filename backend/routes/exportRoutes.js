const express = require('express');
const {
    exportUsersCSV,
    exportJobsCSV,
    exportApplicationsCSV,
    exportPaymentsCSV,
    exportAnalyticsPDF,
    exportResumesCSV,
    getExportStatus
} = require('../controllers/exportController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// All export routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

// Export Status Route
// @route   GET /api/admin/export/status
// @desc    Get export status and available exports info
// @access  Private (Admin)
router.get('/status', getExportStatus);

// CSV Export Routes
// @route   GET /api/admin/export/users/csv
// @desc    Export users data as CSV
// @access  Private (Admin)
router.get('/users/csv', exportUsersCSV);

// @route   GET /api/admin/export/jobs/csv
// @desc    Export jobs data as CSV
// @access  Private (Admin)
router.get('/jobs/csv', exportJobsCSV);

// @route   GET /api/admin/export/applications/csv
// @desc    Export applications data as CSV
// @access  Private (Admin)
router.get('/applications/csv', exportApplicationsCSV);

// @route   GET /api/admin/export/payments/csv
// @desc    Export payments data as CSV
// @access  Private (Admin)
router.get('/payments/csv', exportPaymentsCSV);

// @route   GET /api/admin/export/resumes/csv
// @desc    Export resumes data as CSV
// @access  Private (Admin)
router.get('/resumes/csv', exportResumesCSV);

// PDF Export Routes
// @route   GET /api/admin/export/analytics/pdf
// @desc    Generate comprehensive analytics report as PDF
// @access  Private (Admin)
router.get('/analytics/pdf', exportAnalyticsPDF);

module.exports = router;