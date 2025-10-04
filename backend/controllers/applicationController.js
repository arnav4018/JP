const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Apply to a job
// @route   POST /api/jobs/:jobId/apply
// @access  Private (Candidates only)
const applyToJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const {
            fullName,
            email,
            phone,
            location,
            coverLetter,
            resume
        } = req.body;

        // Get job details using the improved method
        const jobModel = new Job();
        const job = await jobModel.getJobById(jobId);
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if job is still accepting applications
        if (job.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'This job is no longer accepting applications'
            });
        }

        // Check application deadline
        if (job.application_deadline && new Date() > new Date(job.application_deadline)) {
            return res.status(400).json({
                success: false,
                message: 'Application deadline has passed'
            });
        }

        // Check if user already applied
        const applicationModel = new Application();
        const hasApplied = await applicationModel.hasAlreadyApplied(jobId, req.user.id);

        if (hasApplied) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this job'
            });
        }

        // Check if applying to own job (for recruiters)
        if (job.posted_by_recruiter_id && job.posted_by_recruiter_id.toString() === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Cannot apply to your own job posting'
            });
        }

        // Prepare application data
        const applicationData = {
            job_id: parseInt(jobId),
            candidate_id: req.user.id,
            status: 'Applied',
            cover_letter: coverLetter,
            source: 'direct'
        };

        // Handle resume data if provided
        if (resume && resume.filename) {
            applicationData.resume_filename = resume.filename;
            applicationData.resume_original_name = resume.filename;
            if (resume.file) {
                applicationData.resume_file_size = resume.file.size;
            }
        }

        // Create application
        const application = await applicationModel.createApplication(applicationData);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: {
                applicationId: application.id,
                jobTitle: job.title,
                company: job.company_name || job.company,
                status: application.status,
                submittedAt: application.submitted_at
            }
        });

    } catch (error) {
        console.error('Application submission error:', error);
        next(error);
    }
};

// @desc    Get applications for a candidate
// @route   GET /api/applications/my-applications
// @access  Private (Candidates only)
const getMyApplications = async (req, res, next) => {
    try {
        const {
            status,
            page = 1,
            limit = 10
        } = req.query;

        const applicationModel = new Application();
        const options = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            orderBy: 'submitted_at DESC'
        };

        const applications = await applicationModel.getApplicationsByCandidate(req.user.id, options);
        
        // Get total count
        const countQuery = 'SELECT COUNT(*) FROM applications WHERE candidate_id = $1';
        const countResult = await applicationModel.query(countQuery, [req.user.id]);
        const total = parseInt(countResult.rows[0].count);

        res.status(200).json({
            success: true,
            count: applications.length,
            total,
            pagination: {
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            },
            data: {
                applications
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get applications for a job (recruiter view)
// @route   GET /api/applications/job/:jobId
// @access  Private (Recruiters/Job owners only)
const getJobApplications = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const {
            page = 1,
            limit = 10
        } = req.query;

        const jobModel = new Job();
        const job = await jobModel.getJobById(jobId);
        
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Basic authorization check (can be enhanced later)
        if (job.posted_by_recruiter_id && job.posted_by_recruiter_id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view applications for this job'
            });
        }

        const applicationModel = new Application();
        const options = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            orderBy: 'submitted_at DESC'
        };

        const applications = await applicationModel.getApplicationsByJob(jobId, options);
        
        // Get total count
        const countQuery = 'SELECT COUNT(*) FROM applications WHERE job_id = $1';
        const countResult = await applicationModel.query(countQuery, [jobId]);
        const total = parseInt(countResult.rows[0].count);

        res.status(200).json({
            success: true,
            count: applications.length,
            total,
            pagination: {
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            },
            data: {
                applications
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update application status
// @route   PUT /api/applications/:applicationId/status
// @access  Private (Recruiters/Job owners only)
const updateApplicationStatus = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { status, reason } = req.body;

        const applicationModel = new Application();
        const application = await applicationModel.getApplicationWithDetails(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Basic authorization check
        const jobModel = new Job();
        const job = await jobModel.getJobById(application.job_id);
        
        if (job.posted_by_recruiter_id && job.posted_by_recruiter_id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this application'
            });
        }

        // Update application status
        const updatedApplication = await applicationModel.updateApplicationStatus(applicationId, status, reason, req.user.id);

        res.status(200).json({
            success: true,
            message: 'Application status updated successfully',
            data: {
                application: updatedApplication
            }
        });

    } catch (error) {
        next(error);
    }
};

// Simplified placeholder methods for future implementation
const scheduleInterview = (req, res) => {
    res.status(501).json({ success: false, message: 'Interview scheduling not yet implemented' });
};

const addAssessment = (req, res) => {
    res.status(501).json({ success: false, message: 'Assessment feature not yet implemented' });
};

const addCommunication = (req, res) => {
    res.status(501).json({ success: false, message: 'Communication feature not yet implemented' });
};

const toggleStarApplication = (req, res) => {
    res.status(501).json({ success: false, message: 'Star application feature not yet implemented' });
};

const getApplicationStats = async (req, res, next) => {
    try {
        const { jobId } = req.query;
        const applicationModel = new Application();
        const stats = await applicationModel.getApplicationStats(jobId);
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

const withdrawApplication = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { reason } = req.body;

        const applicationModel = new Application();
        const application = await applicationModel.getApplicationWithDetails(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if it's the candidate's application
        if (application.candidate_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to withdraw this application'
            });
        }

        // Update status to withdrawn
        await applicationModel.updateApplicationStatus(applicationId, 'Withdrawn', reason, req.user.id);

        res.status(200).json({
            success: true,
            message: 'Application withdrawn successfully'
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyToJob,
    getMyApplications,
    getJobApplications,
    updateApplicationStatus,
    scheduleInterview,
    addAssessment,
    addCommunication,
    toggleStarApplication,
    getApplicationStats,
    withdrawApplication
};
