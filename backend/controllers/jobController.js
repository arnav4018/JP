const Job = require('../models/Job');
const { aiScoringService } = require('../services/aiScoringService');
const SystemSettings = require('../models/SystemSettings');

// @desc    Get all jobs with filters and pagination
// @route   GET /api/jobs
// @access  Public
const getJobs = async (req, res, next) => {
    try {
        const {
            search,
            location,
            category,
            employmentType,
            salaryMin,
            salaryMax,
            experienceMin,
            experienceMax,
            isRemote,
            companySize,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filters = {
            search,
            location,
            category,
            employmentType,
            salaryMin,
            salaryMax,
            experienceMin,
            experienceMax,
            isRemote,
            companySize,
            page,
            limit,
            sortBy,
            sortOrder
        };

        // Get filtered jobs
        const jobs = await Job.getFilteredJobs(filters);

        // Get total count for pagination
        const totalJobs = await Job.countDocuments({ status: 'active' });
        const totalPages = Math.ceil(totalJobs / parseInt(limit));

        res.status(200).json({
            success: true,
            count: jobs.length,
            pagination: {
                page: parseInt(page),
                pages: totalPages,
                limit: parseInt(limit),
                total: totalJobs
            },
            data: {
                jobs
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'firstName lastName companyName avatar companyWebsite')
            .populate('applications.candidate', 'firstName lastName email avatar');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Increment view count
        job.views = (job.views || 0) + 1;
        await job.save();

        // If user is authenticated and is the job owner, include applications
        let jobData = job.toObject();
        
        if (req.user && req.user.id.toString() === job.postedBy._id.toString()) {
            // Job owner can see all applications
            jobData.applications = job.applications;
        } else {
            // Others can only see application count
            jobData.applications = undefined;
            jobData.applicationCount = job.applicationCount;
        }

        res.status(200).json({
            success: true,
            data: {
                job: jobData
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (Recruiter/Admin only)
const createJob = async (req, res, next) => {
    try {
        // Add posted by user ID
        req.body.postedBy = req.user.id;

        const job = await Job.create(req.body);

        // Populate posted by user info
        await job.populate('postedBy', 'firstName lastName companyName avatar');

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            data: {
                job
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Job owner/Admin only)
const updateJob = async (req, res, next) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if user is job owner or admin
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this job'
            });
        }

        job = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('postedBy', 'firstName lastName companyName avatar');

        res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            data: {
                job
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Job owner/Admin only)
const deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if user is job owner or admin
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this job'
            });
        }

        await Job.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Apply to a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Candidates only)
const applyToJob = async (req, res, next) => {
    try {
        const { resume, coverLetter } = req.body;
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if job is active
        if (job.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'This job is no longer accepting applications'
            });
        }

        // Check if application deadline has passed
        if (job.applicationDeadline && new Date() > job.applicationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Application deadline has passed'
            });
        }

        // Check if user has already applied
        if (job.hasUserApplied(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied to this job'
            });
        }

        // Check if user is trying to apply to their own job
        if (job.postedBy.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot apply to your own job posting'
            });
        }

        // Add application
        job.applications.push({
            candidate: req.user.id,
            resume,
            coverLetter,
            appliedAt: new Date()
        });

        await job.save();

        res.status(200).json({
            success: true,
            message: 'Application submitted successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get job applications
// @route   GET /api/jobs/:id/applications
// @access  Private (Job owner/Admin only)
const getJobApplications = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('applications.candidate', 'firstName lastName email avatar skills experience location');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if user is job owner or admin
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view applications for this job'
            });
        }

        const { status, page = 1, limit = 10, sortBy = 'appliedAt', includeAIScoring = false } = req.query;
        let applications = job.applications;

        // Filter by status if provided
        if (status) {
            applications = applications.filter(app => app.status === status);
        }

        // Add AI scoring if requested and enabled
        if (includeAIScoring === 'true') {
            const jobRequirements = {
                skills: job.skills || [],
                experience: {
                    min: job.experienceRequired?.min || 0,
                    max: job.experienceRequired?.max || 20
                },
                education: job.educationRequired || 'any',
                location: {
                    city: job.location?.city,
                    state: job.location?.state,
                    country: job.location?.country,
                    isRemote: job.isRemote
                },
                salary: {
                    min: job.salary?.min,
                    max: job.salary?.max
                }
            };

            // Score applications and sort by AI fit
            applications = aiScoringService.scoreMultipleApplications(jobRequirements, applications);
            
            if (sortBy === 'aiScore') {
                applications.sort((a, b) => (b.aiScoring?.scores?.overallFit || 0) - (a.aiScoring?.scores?.overallFit || 0));
            }
        } else {
            // Regular sorting
            if (sortBy === 'appliedAt') {
                applications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
            }
        }

        // Pagination
        const startIndex = (parseInt(page) - 1) * parseInt(limit);
        const endIndex = startIndex + parseInt(limit);
        const paginatedApplications = applications.slice(startIndex, endIndex);

        res.status(200).json({
            success: true,
            count: paginatedApplications.length,
            total: applications.length,
            pagination: {
                page: parseInt(page),
                pages: Math.ceil(applications.length / parseInt(limit)),
                limit: parseInt(limit)
            },
            data: {
                applications: paginatedApplications,
                aiScoringEnabled: includeAIScoring === 'true'
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update application status
// @route   PUT /api/jobs/:jobId/applications/:applicationId
// @access  Private (Job owner/Admin only)
const updateApplicationStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const { jobId, applicationId } = req.params;

        const job = await Job.findById(jobId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check if user is job owner or admin
        if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update applications for this job'
            });
        }

        // Find and update application
        const application = job.applications.id(applicationId);
        
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        application.status = status;
        await job.save();

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

// @desc    Get user's job applications
// @route   GET /api/jobs/my-applications
// @access  Private (Candidates only)
const getMyApplications = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        // Build match criteria
        const matchCriteria = {
            'applications.candidate': req.user.id
        };

        // Aggregation pipeline to get user's applications
        const pipeline = [
            { $match: matchCriteria },
            { $unwind: '$applications' },
            { $match: { 'applications.candidate': req.user.id } },
            ...(status ? [{ $match: { 'applications.status': status } }] : []),
            {
                $lookup: {
                    from: 'users',
                    localField: 'postedBy',
                    foreignField: '_id',
                    as: 'recruiter'
                }
            },
            { $unwind: '$recruiter' },
            {
                $project: {
                    title: 1,
                    company: 1,
                    location: 1,
                    employment: 1,
                    salary: 1,
                    status: 1,
                    createdAt: 1,
                    applicationStatus: '$applications.status',
                    appliedAt: '$applications.appliedAt',
                    coverLetter: '$applications.coverLetter',
                    recruiter: {
                        firstName: '$recruiter.firstName',
                        lastName: '$recruiter.lastName',
                        companyName: '$recruiter.companyName'
                    }
                }
            },
            { $sort: { appliedAt: -1 } },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
        ];

        const applications = await Job.aggregate(pipeline);

        // Get total count
        const countPipeline = [
            { $match: matchCriteria },
            { $unwind: '$applications' },
            { $match: { 'applications.candidate': req.user.id } },
            ...(status ? [{ $match: { 'applications.status': status } }] : []),
            { $count: 'total' }
        ];

        const countResult = await Job.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;

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

// @desc    Get jobs posted by current user
// @route   GET /api/jobs/my-jobs
// @access  Private (Recruiters only)
const getMyJobs = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        // Build query
        const query = { postedBy: req.user.id };
        if (status) {
            query.status = status;
        }

        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit))
            .populate('postedBy', 'firstName lastName companyName avatar');

        // Get total count
        const total = await Job.countDocuments(query);

        res.status(200).json({
            success: true,
            count: jobs.length,
            total,
            pagination: {
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            },
            data: {
                jobs
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get AI-powered job recommendations for current user
// @route   GET /api/jobs/recommendations
// @access  Private (Candidates only)
const getJobRecommendations = async (req, res, next) => {
    try {
        const { limit = 10, minScore = 0.6 } = req.query;
        
        // Get active jobs
        const activeJobs = await Job.find({ status: 'active' })
            .limit(50) // Limit for performance
            .sort({ createdAt: -1 })
            .populate('postedBy', 'firstName lastName companyName');

        // Prepare candidate profile from user data
        const candidateProfile = {
            skills: req.user.skills || [],
            experience: req.user.experience?.totalYears || 0,
            education: req.user.education || [],
            location: req.user.location || {},
            salaryExpectation: req.user.preferences?.expectedSalary || {}
        };

        // Score candidate against each job
        const jobRecommendations = [];
        for (const job of activeJobs) {
            // Skip jobs posted by the user themselves
            if (job.postedBy._id.toString() === req.user.id) {
                continue;
            }

            const jobRequirements = {
                skills: job.skills || [],
                experience: {
                    min: job.experienceRequired?.min || 0,
                    max: job.experienceRequired?.max || 20
                },
                education: job.educationRequired || 'any',
                location: {
                    city: job.location?.city,
                    state: job.location?.state,
                    country: job.location?.country,
                    isRemote: job.isRemote
                },
                salary: {
                    min: job.salary?.min,
                    max: job.salary?.max
                }
            };

            const scoring = aiScoringService.scoreApplication(jobRequirements, candidateProfile);
            
            // Only include jobs above minimum score
            if (scoring.scores?.overallFit >= parseFloat(minScore)) {
                jobRecommendations.push({
                    job: {
                        _id: job._id,
                        title: job.title,
                        company: job.company,
                        location: job.location,
                        isRemote: job.isRemote,
                        salary: job.salary,
                        employmentType: job.employmentType,
                        createdAt: job.createdAt,
                        postedBy: job.postedBy
                    },
                    matchScore: scoring.scores?.overallFit || 0,
                    skillMatch: scoring.scores?.skillMatch || 0,
                    experienceMatch: scoring.scores?.experienceMatch || 0,
                    locationMatch: scoring.scores?.locationMatch || 0,
                    salaryMatch: scoring.scores?.salaryMatch || 0,
                    matchReasons: generateMatchReasons(scoring),
                    recommendationLevel: getRecommendationLevel(scoring.scores?.overallFit || 0)
                });
            }
        }

        // Sort by match score and take top recommendations
        jobRecommendations.sort((a, b) => b.matchScore - a.matchScore);
        const topRecommendations = jobRecommendations.slice(0, parseInt(limit));

        res.status(200).json({
            success: true,
            count: topRecommendations.length,
            data: {
                recommendations: topRecommendations,
                candidateProfile: {
                    skillsCount: candidateProfile.skills.length,
                    experienceYears: candidateProfile.experience,
                    location: candidateProfile.location?.city || 'Not specified'
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// Helper functions for job recommendations
const generateMatchReasons = (scoring) => {
    const reasons = [];
    const scores = scoring.scores || {};

    if (scores.skillMatch >= 0.8) {
        reasons.push('Strong skill match');
    }
    if (scores.experienceMatch >= 0.8) {
        reasons.push('Experience level aligns well');
    }
    if (scores.locationMatch >= 0.8) {
        reasons.push('Great location fit');
    }
    if (scores.salaryMatch >= 0.8) {
        reasons.push('Salary expectations match');
    }

    return reasons;
};

const getRecommendationLevel = (score) => {
    if (score >= 0.9) return 'Highly Recommended';
    if (score >= 0.8) return 'Recommended';
    if (score >= 0.7) return 'Good Match';
    if (score >= 0.6) return 'Potential Match';
    return 'Consider';
};

module.exports = {
    getJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    applyToJob,
    getJobApplications,
    updateApplicationStatus,
    getMyApplications,
    getMyJobs,
    getJobRecommendations
};
