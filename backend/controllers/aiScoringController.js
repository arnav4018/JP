const { aiScoringService } = require('../services/aiScoringService');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const Resume = require('../models/Resume');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Score a specific application using AI
 * @route   POST /api/ai-scoring/score-application
 * @access  Private (Employer/Admin)
 */
exports.scoreApplication = catchAsync(async (req, res, next) => {
    const { applicationId } = req.body;

    if (!applicationId) {
        return next(new AppError('Application ID is required', 400));
    }

    // Get the application with populated data
    const application = await Application.findById(applicationId)
        .populate('candidate', 'firstName lastName email skills experience education location preferences')
        .populate('job', 'title company skills requirements experience location salary')
        .populate('resume');

    if (!application) {
        return next(new AppError('Application not found', 404));
    }

    // Check if user has permission to score this application
    if (
        req.user.role !== 'admin' && 
        application.job.user.toString() !== req.user.id
    ) {
        return next(new AppError('You do not have permission to score this application', 403));
    }

    // Prepare job requirements
    const jobRequirements = {
        skills: application.job.skills || [],
        experience: {
            min: application.job.experience?.min || 0,
            max: application.job.experience?.max || 20
        },
        education: application.job.requirements?.education || 'any',
        location: {
            city: application.job.location?.city,
            state: application.job.location?.state,
            country: application.job.location?.country,
            isRemote: application.job.isRemote
        },
        salary: {
            min: application.job.salary?.min,
            max: application.job.salary?.max
        }
    };

    // Prepare candidate profile
    const candidateProfile = {
        skills: application.candidate?.skills || 
               application.resume?.skills?.map(s => s.name || s) || [],
        experience: application.candidate?.experience?.totalYears || 
                   application.resume?.totalExperience || 0,
        education: application.candidate?.education || 
                  application.resume?.education || [],
        location: application.candidate?.location || 
                 application.resume?.personalInfo?.location || {},
        salaryExpectation: application.candidate?.preferences?.expectedSalary || {}
    };

    // Score the application
    const scoring = aiScoringService.scoreApplication(jobRequirements, candidateProfile);

    // Save the scoring to the application
    application.aiScoring = scoring;
    await application.save();

    res.status(200).json({
        status: 'success',
        data: {
            applicationId: application._id,
            candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
            jobTitle: application.job.title,
            scoring: scoring
        }
    });
});

/**
 * @desc    Score multiple applications for a job
 * @route   POST /api/ai-scoring/score-job-applications
 * @access  Private (Employer/Admin)
 */
exports.scoreJobApplications = catchAsync(async (req, res, next) => {
    const { jobId } = req.body;

    if (!jobId) {
        return next(new AppError('Job ID is required', 400));
    }

    // Get the job
    const job = await Job.findById(jobId);
    if (!job) {
        return next(new AppError('Job not found', 404));
    }

    // Check if user has permission to score applications for this job
    if (req.user.role !== 'admin' && job.user.toString() !== req.user.id) {
        return next(new AppError('You do not have permission to score applications for this job', 403));
    }

    // Get all applications for this job
    const applications = await Application.find({ job: jobId })
        .populate('candidate', 'firstName lastName email skills experience education location preferences')
        .populate('resume');

    if (applications.length === 0) {
        return next(new AppError('No applications found for this job', 404));
    }

    // Prepare job requirements
    const jobRequirements = {
        skills: job.skills || [],
        experience: {
            min: job.experience?.min || 0,
            max: job.experience?.max || 20
        },
        education: job.requirements?.education || 'any',
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

    // Score all applications
    const scoredApplications = aiScoringService.scoreMultipleApplications(jobRequirements, applications);

    // Save scores to database
    const bulkOperations = scoredApplications.map(app => ({
        updateOne: {
            filter: { _id: app._id },
            update: { 
                aiScoring: app.aiScoring,
                aiScoredAt: new Date()
            }
        }
    }));

    await Application.bulkWrite(bulkOperations);

    res.status(200).json({
        status: 'success',
        results: scoredApplications.length,
        data: {
            jobTitle: job.title,
            totalApplications: scoredApplications.length,
            scoredApplications: scoredApplications.map(app => ({
                applicationId: app._id,
                candidateName: `${app.candidate?.firstName} ${app.candidate?.lastName}`,
                overallScore: app.aiScoring?.scores?.overallFit || 0,
                skillMatch: app.aiScoring?.scores?.skillMatch || 0,
                experienceMatch: app.aiScoring?.scores?.experienceMatch || 0,
                recommendations: app.aiScoring?.metadata?.recommendations || []
            }))
        }
    });
});

/**
 * @desc    Get AI scoring analysis for a job
 * @route   GET /api/ai-scoring/job/:jobId/analysis
 * @access  Private (Employer/Admin)
 */
exports.getJobScoringAnalysis = catchAsync(async (req, res, next) => {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
        return next(new AppError('Job not found', 404));
    }

    // Check permissions
    if (req.user.role !== 'admin' && job.user.toString() !== req.user.id) {
        return next(new AppError('You do not have permission to view this analysis', 403));
    }

    // Get all scored applications for this job
    const applications = await Application.find({ 
        job: jobId,
        aiScoring: { $exists: true }
    })
    .populate('candidate', 'firstName lastName email')
    .sort({ 'aiScoring.scores.overallFit': -1 });

    if (applications.length === 0) {
        return next(new AppError('No scored applications found for this job', 404));
    }

    // Calculate analytics
    const scores = applications.map(app => app.aiScoring?.scores || {});
    const analytics = {
        totalScoredApplications: applications.length,
        averageScores: {
            overallFit: scores.reduce((sum, s) => sum + (s.overallFit || 0), 0) / scores.length,
            skillMatch: scores.reduce((sum, s) => sum + (s.skillMatch || 0), 0) / scores.length,
            experienceMatch: scores.reduce((sum, s) => sum + (s.experienceMatch || 0), 0) / scores.length,
            educationMatch: scores.reduce((sum, s) => sum + (s.educationMatch || 0), 0) / scores.length,
            locationMatch: scores.reduce((sum, s) => sum + (s.locationMatch || 0), 0) / scores.length,
            salaryMatch: scores.reduce((sum, s) => sum + (s.salaryMatch || 0), 0) / scores.length
        },
        scoreDistribution: {
            excellent: scores.filter(s => (s.overallFit || 0) >= 0.9).length,
            good: scores.filter(s => (s.overallFit || 0) >= 0.7 && (s.overallFit || 0) < 0.9).length,
            fair: scores.filter(s => (s.overallFit || 0) >= 0.5 && (s.overallFit || 0) < 0.7).length,
            poor: scores.filter(s => (s.overallFit || 0) < 0.5).length
        },
        topCandidates: applications.slice(0, 5).map(app => ({
            applicationId: app._id,
            candidateName: `${app.candidate?.firstName} ${app.candidate?.lastName}`,
            overallScore: app.aiScoring?.scores?.overallFit || 0,
            strengths: this.identifyStrengths(app.aiScoring?.scores || {}),
            weaknesses: this.identifyWeaknesses(app.aiScoring?.scores || {})
        })),
        commonSkillGaps: this.identifyCommonSkillGaps(applications),
        recommendations: this.generateJobRecommendations(analytics, job)
    };

    res.status(200).json({
        status: 'success',
        data: {
            jobTitle: job.title,
            analytics
        }
    });
});

/**
 * @desc    Get skill match analysis for a candidate
 * @route   GET /api/ai-scoring/candidate/:candidateId/skills
 * @access  Private (Admin, or candidate themselves)
 */
exports.getCandidateSkillAnalysis = catchAsync(async (req, res, next) => {
    const { candidateId } = req.params;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== candidateId) {
        return next(new AppError('You do not have permission to view this analysis', 403));
    }

    const candidate = await User.findById(candidateId)
        .populate('resumes');

    if (!candidate) {
        return next(new AppError('Candidate not found', 404));
    }

    // Get candidate's applications with AI scoring
    const applications = await Application.find({ 
        candidate: candidateId,
        aiScoring: { $exists: true }
    })
    .populate('job', 'title company skills')
    .sort({ createdAt: -1 });

    // Analyze skill performance across applications
    const skillAnalysis = this.analyzeSkillPerformance(applications, candidate);

    // Get skill recommendations
    const skillRecommendations = this.generateSkillRecommendations(skillAnalysis, applications);

    res.status(200).json({
        status: 'success',
        data: {
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            totalApplications: applications.length,
            skillAnalysis,
            skillRecommendations
        }
    });
});

/**
 * @desc    Get job recommendation for a candidate using AI
 * @route   GET /api/ai-scoring/candidate/:candidateId/recommendations
 * @access  Private (Admin, or candidate themselves)
 */
exports.getCandidateJobRecommendations = catchAsync(async (req, res, next) => {
    const { candidateId } = req.params;
    const { limit = 10 } = req.query;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.id !== candidateId) {
        return next(new AppError('You do not have permission to view this analysis', 403));
    }

    const candidate = await User.findById(candidateId)
        .populate('resumes');

    if (!candidate) {
        return next(new AppError('Candidate not found', 404));
    }

    // Get active jobs
    const activeJobs = await Job.find({ status: 'active' })
        .limit(50) // Limit for performance
        .sort({ createdAt: -1 });

    // Prepare candidate profile
    const candidateProfile = {
        skills: candidate.skills || [],
        experience: candidate.experience?.totalYears || 0,
        education: candidate.education || [],
        location: candidate.location || {},
        salaryExpectation: candidate.preferences?.expectedSalary || {}
    };

    // Score candidate against each job
    const jobRecommendations = [];
    for (const job of activeJobs) {
        const jobRequirements = {
            skills: job.skills || [],
            experience: {
                min: job.experience?.min || 0,
                max: job.experience?.max || 20
            },
            education: job.requirements?.education || 'any',
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
        
        jobRecommendations.push({
            job: {
                _id: job._id,
                title: job.title,
                company: job.company,
                location: job.location,
                isRemote: job.isRemote,
                salary: job.salary,
                createdAt: job.createdAt
            },
            matchScore: scoring.scores?.overallFit || 0,
            skillMatchScore: scoring.scores?.skillMatch || 0,
            experienceMatchScore: scoring.scores?.experienceMatch || 0,
            matchReasons: this.generateMatchReasons(scoring),
            recommendationLevel: this.getRecommendationLevel(scoring.scores?.overallFit || 0)
        });
    }

    // Sort by match score and take top recommendations
    jobRecommendations.sort((a, b) => b.matchScore - a.matchScore);
    const topRecommendations = jobRecommendations.slice(0, parseInt(limit));

    res.status(200).json({
        status: 'success',
        results: topRecommendations.length,
        data: {
            candidateName: `${candidate.firstName} ${candidate.lastName}`,
            recommendations: topRecommendations
        }
    });
});

/**
 * @desc    Get AI scoring dashboard for admin
 * @route   GET /api/ai-scoring/dashboard
 * @access  Private (Admin)
 */
exports.getAIScoringDashboard = catchAsync(async (req, res, next) => {
    // Get overall statistics
    const totalApplications = await Application.countDocuments();
    const scoredApplications = await Application.countDocuments({ aiScoring: { $exists: true } });
    
    // Get recent scoring activity
    const recentActivity = await Application.find({ 
        aiScoring: { $exists: true },
        aiScoredAt: { $exists: true }
    })
    .populate('candidate', 'firstName lastName')
    .populate('job', 'title company')
    .sort({ aiScoredAt: -1 })
    .limit(20);

    // Get scoring performance metrics
    const scoringMetrics = await Application.aggregate([
        { $match: { aiScoring: { $exists: true } } },
        {
            $group: {
                _id: null,
                avgOverallScore: { $avg: '$aiScoring.scores.overallFit' },
                avgSkillMatch: { $avg: '$aiScoring.scores.skillMatch' },
                avgExperienceMatch: { $avg: '$aiScoring.scores.experienceMatch' },
                highScoreCount: {
                    $sum: { $cond: [{ $gte: ['$aiScoring.scores.overallFit', 0.8] }, 1, 0] }
                },
                lowScoreCount: {
                    $sum: { $cond: [{ $lt: ['$aiScoring.scores.overallFit', 0.5] }, 1, 0] }
                }
            }
        }
    ]);

    // Get top performing jobs (by application quality)
    const topJobs = await Application.aggregate([
        { $match: { aiScoring: { $exists: true } } },
        {
            $group: {
                _id: '$job',
                avgScore: { $avg: '$aiScoring.scores.overallFit' },
                applicationCount: { $sum: 1 }
            }
        },
        { $match: { applicationCount: { $gte: 3 } } }, // At least 3 applications
        { $sort: { avgScore: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: 'jobs',
                localField: '_id',
                foreignField: '_id',
                as: 'jobDetails'
            }
        },
        { $unwind: '$jobDetails' }
    ]);

    const dashboard = {
        overview: {
            totalApplications,
            scoredApplications,
            scoringCoverage: totalApplications > 0 ? (scoredApplications / totalApplications * 100).toFixed(1) : 0,
            averageScore: scoringMetrics[0]?.avgOverallScore || 0
        },
        metrics: scoringMetrics[0] || {},
        recentActivity: recentActivity.map(app => ({
            applicationId: app._id,
            candidateName: `${app.candidate?.firstName} ${app.candidate?.lastName}`,
            jobTitle: app.job?.title,
            company: app.job?.company,
            overallScore: app.aiScoring?.scores?.overallFit || 0,
            scoredAt: app.aiScoredAt
        })),
        topPerformingJobs: topJobs.map(job => ({
            jobId: job._id,
            title: job.jobDetails.title,
            company: job.jobDetails.company,
            averageScore: job.avgScore,
            applicationCount: job.applicationCount
        }))
    };

    res.status(200).json({
        status: 'success',
        data: dashboard
    });
});

// Helper methods
exports.identifyStrengths = (scores) => {
    const strengths = [];
    Object.entries(scores).forEach(([key, value]) => {
        if (value >= 0.8 && key !== 'overallFit') {
            strengths.push(key);
        }
    });
    return strengths;
};

exports.identifyWeaknesses = (scores) => {
    const weaknesses = [];
    Object.entries(scores).forEach(([key, value]) => {
        if (value < 0.5 && key !== 'overallFit') {
            weaknesses.push(key);
        }
    });
    return weaknesses;
};

exports.identifyCommonSkillGaps = (applications) => {
    const skillGaps = {};
    applications.forEach(app => {
        const missingSkills = app.aiScoring?.metadata?.skillsAnalysis?.missingSkills || [];
        missingSkills.forEach(skill => {
            skillGaps[skill] = (skillGaps[skill] || 0) + 1;
        });
    });

    return Object.entries(skillGaps)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count }));
};

exports.generateJobRecommendations = (analytics, job) => {
    const recommendations = [];

    if (analytics.averageScores.skillMatch < 0.6) {
        recommendations.push({
            type: 'skill_requirements',
            message: 'Consider reviewing skill requirements - they may be too specific or demanding',
            priority: 'medium'
        });
    }

    if (analytics.scoreDistribution.poor > analytics.totalScoredApplications * 0.7) {
        recommendations.push({
            type: 'job_posting',
            message: 'Job posting may need optimization to attract more qualified candidates',
            priority: 'high'
        });
    }

    return recommendations;
};

exports.analyzeSkillPerformance = (applications, candidate) => {
    const skillScores = {};
    applications.forEach(app => {
        const matchingSkills = app.aiScoring?.metadata?.skillsAnalysis?.matchingSkills || [];
        matchingSkills.forEach(match => {
            if (!skillScores[match.required]) {
                skillScores[match.required] = [];
            }
            skillScores[match.required].push(match.similarity);
        });
    });

    return Object.entries(skillScores).map(([skill, scores]) => ({
        skill,
        averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
        applicationCount: scores.length
    })).sort((a, b) => b.averageScore - a.averageScore);
};

exports.generateSkillRecommendations = (skillAnalysis, applications) => {
    const recommendations = [];
    const allMissingSkills = {};

    applications.forEach(app => {
        const missing = app.aiScoring?.metadata?.skillsAnalysis?.missingSkills || [];
        missing.forEach(skill => {
            allMissingSkills[skill] = (allMissingSkills[skill] || 0) + 1;
        });
    });

    const topMissingSkills = Object.entries(allMissingSkills)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    topMissingSkills.forEach(([skill, count]) => {
        recommendations.push({
            skill,
            priority: count > 3 ? 'high' : 'medium',
            reason: `Missing in ${count} job applications`
        });
    });

    return recommendations;
};

exports.generateMatchReasons = (scoring) => {
    const reasons = [];
    const scores = scoring.scores || {};

    if (scores.skillMatch >= 0.8) {
        reasons.push('Strong skill match');
    }
    if (scores.experienceMatch >= 0.8) {
        reasons.push('Experience level aligns well');
    }
    if (scores.locationMatch >= 0.8) {
        reasons.push('Location compatibility');
    }
    if (scores.salaryMatch >= 0.8) {
        reasons.push('Salary expectations match');
    }

    return reasons;
};

exports.getRecommendationLevel = (score) => {
    if (score >= 0.9) return 'Highly Recommended';
    if (score >= 0.8) return 'Recommended';
    if (score >= 0.7) return 'Consider';
    if (score >= 0.6) return 'Maybe';
    return 'Not Recommended';
};