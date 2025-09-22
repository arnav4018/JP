const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { resumeParser } = require('../services/resumeParser');
const { uploadHelpers } = require('../config/aws');

// @desc    Apply to a job with resume upload or online resume
// @route   POST /api/applications/apply/:jobId
// @access  Private (Candidates only)
const applyToJob = async (req, res, next) => {
    try {
        const { jobId } = req.params;
        const {
            resumeType, // 'uploaded', 'online_resume', 'external_url'
            resumeId,
            coverLetter,
            salaryExpectation,
            availability,
            questionnaire,
            source = 'direct_application',
            sourceDetails
        } = req.body;

        // Get job details
        const job = await Job.findById(jobId).populate('postedBy', 'firstName lastName companyName');
        
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
        if (job.applicationDeadline && new Date() > job.applicationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Application deadline has passed'
            });
        }

        // Check if user already applied
        const existingApplication = await Application.findOne({
            candidate: req.user.id,
            job: jobId
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this job'
            });
        }

        // Check if applying to own job
        if (job.postedBy._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot apply to your own job posting'
            });
        }

        // Handle different resume types
        let resumeData = {
            type: resumeType
        };

        if (resumeType === 'uploaded' && req.file) {
            // Handle file upload and parsing
            resumeData.fileUrl = req.file.location || req.file.path;
            resumeData.fileName = req.file.originalname;
            resumeData.fileSize = req.file.size;
            resumeData.uploadDate = new Date();

            // Parse uploaded resume
            try {
                const parseResult = await resumeParser.parseResume(req.file.buffer || req.file.path);
                if (parseResult.success) {
                    // Create or update user's parsed resume data
                    const parsedResume = await Resume.findOneAndUpdate(
                        { user: req.user.id, title: `Parsed from ${req.file.originalname}` },
                        {
                            user: req.user.id,
                            title: `Parsed from ${req.file.originalname}`,
                            parsedData: {
                                rawText: parseResult.data.rawText,
                                extractedSkills: parseResult.data.skills,
                                extractedExperience: parseResult.data.experience.totalYears,
                                extractedCompanies: parseResult.data.companies,
                                extractedEducation: parseResult.data.education.map(edu => edu.degree),
                                confidence: parseResult.data.confidence
                            },
                            uploadedFile: {
                                filename: req.file.filename,
                                originalName: req.file.originalname,
                                mimeType: req.file.mimetype,
                                size: req.file.size,
                                url: req.file.location || req.file.path,
                                uploadDate: new Date()
                            }
                        },
                        { upsert: true, new: true }
                    );

                    resumeData.resumeId = parsedResume._id;
                }
            } catch (parseError) {
                console.log('Resume parsing failed:', parseError.message);
                // Continue with application even if parsing fails
            }

        } else if (resumeType === 'online_resume' && resumeId) {
            // Verify resume belongs to user
            const resume = await Resume.findOne({
                _id: resumeId,
                user: req.user.id
            });

            if (!resume) {
                return res.status(400).json({
                    success: false,
                    message: 'Resume not found or not owned by you'
                });
            }

            resumeData.resumeId = resumeId;
            resumeData.fileName = resume.title;

        } else if (resumeType === 'external_url') {
            resumeData.fileUrl = req.body.resumeUrl;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Valid resume information is required'
            });
        }

        // Create application
        const application = await Application.create({
            candidate: req.user.id,
            job: jobId,
            recruiter: job.postedBy._id,
            resume: resumeData,
            coverLetter,
            salaryExpectation,
            availability,
            questionnaire,
            source,
            sourceDetails,
            status: 'applied'
        });

        // Populate application data
        await application.populate([
            {
                path: 'candidate',
                select: 'firstName lastName email avatar skills experience'
            },
            {
                path: 'job',
                select: 'title company location'
            },
            {
                path: 'resume.resumeId',
                select: 'title personalInfo skills totalExperience'
            }
        ]);

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: {
                application
            }
        });

    } catch (error) {
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
            dateFrom,
            dateTo,
            page = 1,
            limit = 10,
            sortBy = 'appliedAt',
            sortOrder = 'desc'
        } = req.query;

        const filters = {
            candidate: req.user.id,
            status,
            dateFrom,
            dateTo,
            page,
            limit,
            sortBy,
            sortOrder
        };

        const applications = await Application.findWithFilters(filters);
        const total = await Application.countDocuments({ candidate: req.user.id });

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
            status,
            starred,
            viewed,
            page = 1,
            limit = 10,
            sortBy = 'appliedAt',
            sortOrder = 'desc'
        } = req.query;

        // Verify job ownership
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view applications for this job'
            });
        }

        const filters = {
            job: jobId,
            status,
            starred,
            viewed,
            page,
            limit,
            sortBy,
            sortOrder
        };

        const applications = await Application.findWithFilters(filters);
        const total = await Application.countDocuments({ job: jobId });

        // Mark applications as viewed by recruiter
        await Application.updateMany(
            { job: jobId, viewedByRecruiter: false },
            { viewedByRecruiter: true, viewedAt: new Date() }
        );

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
        const { status, feedback, rejection, offer } = req.body;

        const application = await Application.findById(applicationId)
            .populate('job', 'postedBy title company')
            .populate('candidate', 'firstName lastName email');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check authorization
        if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this application'
            });
        }

        // Update status with metadata
        const metadata = {};
        if (status === 'rejected' && rejection) {
            metadata.rejection = rejection;
        }
        if (status === 'offer_extended' && offer) {
            metadata.offer = offer;
        }

        await application.updateStatus(status, req.user.id, metadata);

        // Add communication log entry
        await application.addCommunication({
            type: 'note',
            direction: 'outbound',
            content: `Application status changed to: ${status}`,
            sender: req.user.id,
            recipient: application.candidate._id
        });

        await application.populate([
            {
                path: 'candidate',
                select: 'firstName lastName email avatar'
            },
            {
                path: 'job',
                select: 'title company'
            }
        ]);

        res.status(200).json({
            success: true,
            message: 'Application status updated successfully',
            data: {
                application
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Schedule interview for application
// @route   POST /api/applications/:applicationId/interview
// @access  Private (Recruiters/Job owners only)
const scheduleInterview = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const interviewData = req.body;

        const application = await Application.findById(applicationId)
            .populate('job', 'postedBy title')
            .populate('candidate', 'firstName lastName email');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check authorization
        if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to schedule interview for this application'
            });
        }

        // Schedule interview
        await application.scheduleInterview(interviewData);

        // Add communication log
        await application.addCommunication({
            type: 'email',
            direction: 'outbound',
            subject: `Interview Scheduled - ${application.job.title}`,
            content: `Interview scheduled for ${interviewData.scheduledDate}`,
            sender: req.user.id,
            recipient: application.candidate._id
        });

        res.status(200).json({
            success: true,
            message: 'Interview scheduled successfully',
            data: {
                application
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Add assessment to application
// @route   POST /api/applications/:applicationId/assessment
// @access  Private (Recruiters/Job owners only)
const addAssessment = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const assessmentData = req.body;

        const application = await Application.findById(applicationId)
            .populate('job', 'postedBy title')
            .populate('candidate', 'firstName lastName email');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check authorization
        if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add assessment to this application'
            });
        }

        // Add assessment
        await application.addAssessment(assessmentData);

        // Add communication log
        await application.addCommunication({
            type: 'email',
            direction: 'outbound',
            subject: `Assessment Assigned - ${assessmentData.title}`,
            content: `Assessment "${assessmentData.title}" has been assigned. Due date: ${assessmentData.dueDate}`,
            sender: req.user.id,
            recipient: application.candidate._id
        });

        res.status(200).json({
            success: true,
            message: 'Assessment added successfully',
            data: {
                application
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Add communication to application
// @route   POST /api/applications/:applicationId/communication
// @access  Private
const addCommunication = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { type, direction, subject, content, recipient } = req.body;

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check authorization (candidate can only communicate about their own applications)
        const isCandidate = application.candidate.toString() === req.user.id;
        const isRecruiter = application.recruiter.toString() === req.user.id || req.user.role === 'admin';

        if (!isCandidate && !isRecruiter) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to add communication to this application'
            });
        }

        // Add communication
        await application.addCommunication({
            type,
            direction,
            subject,
            content,
            sender: req.user.id,
            recipient: recipient || (isCandidate ? application.recruiter : application.candidate)
        });

        res.status(200).json({
            success: true,
            message: 'Communication added successfully',
            data: {
                application
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Star/unstar application
// @route   PUT /api/applications/:applicationId/star
// @access  Private (Recruiters only)
const toggleStarApplication = async (req, res, next) => {
    try {
        const { applicationId } = req.params;

        const application = await Application.findById(applicationId).populate('job', 'postedBy');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check authorization
        if (application.job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to star this application'
            });
        }

        // Toggle star status
        application.isStarred = !application.isStarred;
        await application.save();

        res.status(200).json({
            success: true,
            message: `Application ${application.isStarred ? 'starred' : 'unstarred'} successfully`,
            data: {
                isStarred: application.isStarred
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get application statistics for recruiter
// @route   GET /api/applications/stats
// @access  Private (Recruiters only)
const getApplicationStats = async (req, res, next) => {
    try {
        const { jobId, dateFrom, dateTo } = req.query;

        let filters = { recruiter: req.user.id };
        
        if (jobId) filters.job = jobId;
        if (dateFrom) filters.appliedAt = { $gte: new Date(dateFrom) };
        if (dateTo) {
            filters.appliedAt = { ...filters.appliedAt, $lte: new Date(dateTo) };
        }

        const stats = await Application.getApplicationStats(req.user.id, filters);

        // Get additional metrics
        const totalApplications = await Application.countDocuments(filters);
        const newApplications = await Application.countDocuments({
            ...filters,
            appliedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        });
        const starredApplications = await Application.countDocuments({
            ...filters,
            isStarred: true
        });

        res.status(200).json({
            success: true,
            data: {
                statusBreakdown: stats,
                totalApplications,
                newApplications,
                starredApplications,
                responseRate: totalApplications > 0 ? Math.round((stats.length / totalApplications) * 100) : 0
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Withdraw application (candidate)
// @route   DELETE /api/applications/:applicationId/withdraw
// @access  Private (Candidates only)
const withdrawApplication = async (req, res, next) => {
    try {
        const { applicationId } = req.params;
        const { reason } = req.body;

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if it's the candidate's application
        if (application.candidate.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to withdraw this application'
            });
        }

        // Check if application can be withdrawn
        if (['offer_accepted', 'hired'].includes(application.status)) {
            return res.status(400).json({
                success: false,
                message: 'Cannot withdraw application at this stage'
            });
        }

        // Update status to withdrawn
        await application.updateStatus('withdrawn', req.user.id, {
            withdrawal: {
                reason: reason || 'No reason provided',
                withdrawnAt: new Date()
            }
        });

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