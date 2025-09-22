const socketService = require('../services/socketService');
const notificationService = require('../services/notificationService');

/**
 * Middleware to add real-time notifications to controller responses
 */
const broadcastApplicationUpdate = async (req, res, next) => {
    // Store original methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Override res.json to intercept application updates
    res.json = function(data) {
        // Check if this is a successful application status update
        if (data.success && 
            req.route?.path?.includes('applications') && 
            (req.method === 'PATCH' || req.method === 'PUT') &&
            data.data?.application) {
            
            const application = data.data.application;
            
            // Broadcast to candidate if status changed
            if (application.candidate && application.status) {
                socketService.sendMessageToUser(
                    application.candidate.toString(),
                    'application_status_updated',
                    {
                        applicationId: application._id,
                        jobTitle: application.job?.title,
                        company: application.job?.company,
                        status: application.status,
                        updatedAt: new Date()
                    }
                );
                
                // Send notification based on status
                const statusMessages = {
                    'reviewed': 'Your application is being reviewed',
                    'shortlisted': 'Congratulations! You have been shortlisted',
                    'interview': 'You have been invited for an interview',
                    'accepted': 'Congratulations! Your application has been accepted',
                    'rejected': 'Unfortunately, your application was not selected'
                };

                if (statusMessages[application.status]) {
                    notificationService.sendApplicationStatusNotification(
                        application,
                        req.body.oldStatus || 'pending',
                        application.status
                    ).catch(err => console.error('Notification error:', err));
                }
            }

            // Notify recruiter/admin of application activity
            if (application.job?.recruiter) {
                socketService.sendMessageToUser(
                    application.job.recruiter.toString(),
                    'application_activity',
                    {
                        applicationId: application._id,
                        candidateName: application.candidate?.firstName + ' ' + application.candidate?.lastName,
                        jobTitle: application.job?.title,
                        action: 'status_updated',
                        newStatus: application.status,
                        updatedAt: new Date()
                    }
                );
            }
        }

        // Call original json method
        return originalJson.call(this, data);
    };

    next();
};

/**
 * Middleware to broadcast job updates
 */
const broadcastJobUpdate = async (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
        // Check if this is a successful job update
        if (data.success && 
            req.route?.path?.includes('jobs') && 
            (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') &&
            data.data?.job) {
            
            const job = data.data.job;
            
            // Broadcast new job to relevant users
            if (req.method === 'POST') {
                socketService.io.emit('new_job_posted', {
                    jobId: job._id,
                    title: job.title,
                    company: job.company,
                    category: job.category,
                    location: job.location,
                    postedAt: new Date()
                });

                // Send job match notifications to relevant candidates
                // This would be implemented based on your matching algorithm
                setTimeout(() => {
                    broadcastJobMatchesToCandidates(job);
                }, 5000); // Delay to allow job to be fully processed
            }

            // Broadcast job status changes
            if (req.method === 'PATCH' || req.method === 'PUT') {
                socketService.broadcastJobUpdate(job._id, {
                    jobId: job._id,
                    title: job.title,
                    status: job.status,
                    updatedAt: new Date()
                });
            }
        }

        return originalJson.call(this, data);
    };

    next();
};

/**
 * Middleware to broadcast payment updates
 */
const broadcastPaymentUpdate = async (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
        if (data.success && 
            req.route?.path?.includes('payments') && 
            data.data?.payment) {
            
            const payment = data.data.payment;
            
            // Notify user of payment status
            if (payment.userId && payment.status) {
                socketService.sendMessageToUser(
                    payment.userId.toString(),
                    'payment_status_updated',
                    {
                        paymentId: payment._id,
                        amount: payment.amount,
                        currency: payment.currency,
                        status: payment.status,
                        updatedAt: new Date()
                    }
                );

                // Send notification
                const isSuccess = payment.status === 'completed' || payment.status === 'success';
                notificationService.sendPaymentNotification(
                    payment.userId,
                    payment,
                    isSuccess
                ).catch(err => console.error('Payment notification error:', err));
            }
        }

        return originalJson.call(this, data);
    };

    next();
};

/**
 * Middleware to broadcast message updates
 */
const broadcastMessageUpdate = async (req, res, next) => {
    const originalJson = res.json;

    res.json = function(data) {
        if (data.success && 
            req.route?.path?.includes('messages') && 
            req.method === 'POST' &&
            data.data?.message) {
            
            const message = data.data.message;
            
            // This is handled by the message controller and socket service
            // but we can add additional system-level notifications here
            
            // Update user activity timestamps
            if (message.sender) {
                // This could trigger user activity analytics
                console.log(`User ${message.sender} sent a message at ${new Date()}`);
            }
        }

        return originalJson.call(this, data);
    };

    next();
};

/**
 * Helper function to broadcast job matches to candidates
 */
async function broadcastJobMatchesToCandidates(job) {
    try {
        // This is a simplified matching algorithm
        // In a real application, you'd have more sophisticated matching logic
        const User = require('../models/User');
        
        const matchingCandidates = await User.find({
            role: 'candidate',
            isActive: true,
            $or: [
                { skills: { $in: job.requiredSkills || [] } },
                { 'location.city': job.location?.city },
                { 'location.state': job.location?.state }
            ]
        }).limit(50); // Limit to prevent overwhelming

        for (const candidate of matchingCandidates) {
            // Send real-time notification
            socketService.sendMessageToUser(
                candidate._id.toString(),
                'job_match_found',
                {
                    jobId: job._id,
                    title: job.title,
                    company: job.company,
                    matchScore: calculateMatchScore(candidate, job),
                    postedAt: new Date()
                }
            );

            // Send push notification
            notificationService.sendJobMatchNotification(candidate._id, job)
                .catch(err => console.error('Job match notification error:', err));
        }
    } catch (error) {
        console.error('Error broadcasting job matches:', error);
    }
}

/**
 * Simple match score calculation
 */
function calculateMatchScore(candidate, job) {
    let score = 0;
    
    // Skill matching
    if (candidate.skills && job.requiredSkills) {
        const matchingSkills = candidate.skills.filter(skill => 
            job.requiredSkills.some(reqSkill => 
                reqSkill.toLowerCase().includes(skill.toLowerCase())
            )
        );
        score += matchingSkills.length * 10;
    }
    
    // Location matching
    if (candidate.location?.city === job.location?.city) score += 20;
    if (candidate.location?.state === job.location?.state) score += 10;
    
    // Experience matching
    if (candidate.experience && job.minExperience) {
        if (candidate.experience >= job.minExperience) score += 15;
    }
    
    return Math.min(score, 100); // Cap at 100%
}

/**
 * General real-time integration middleware
 */
const enableRealTimeUpdates = (entityType) => {
    return (req, res, next) => {
        switch (entityType) {
            case 'application':
                return broadcastApplicationUpdate(req, res, next);
            case 'job':
                return broadcastJobUpdate(req, res, next);
            case 'payment':
                return broadcastPaymentUpdate(req, res, next);
            case 'message':
                return broadcastMessageUpdate(req, res, next);
            default:
                return next();
        }
    };
};

/**
 * Middleware to track user activity for analytics
 */
const trackUserActivity = (activityType) => {
    return (req, res, next) => {
        const originalJson = res.json;

        res.json = function(data) {
            if (data.success && req.user) {
                // Track user activity for analytics
                // This could be sent to an analytics service
                const activityData = {
                    userId: req.user.id,
                    activityType,
                    endpoint: req.route?.path,
                    method: req.method,
                    timestamp: new Date(),
                    success: data.success,
                    userAgent: req.headers['user-agent'],
                    ip: req.ip
                };

                // In a production app, you'd send this to an analytics service
                console.log(`User Activity: ${JSON.stringify(activityData)}`);
            }

            return originalJson.call(this, data);
        };

        next();
    };
};

module.exports = {
    broadcastApplicationUpdate,
    broadcastJobUpdate,
    broadcastPaymentUpdate,
    broadcastMessageUpdate,
    enableRealTimeUpdates,
    trackUserActivity
};