const nodemailer = require('nodemailer');
const twilio = require('twilio');
const Notification = require('../models/Notification');
const socketService = require('./socketService');

class NotificationService {
    constructor() {
        this.emailTransporter = null;
        this.twilioClient = null;
        this.isEmailConfigured = false;
        this.isSMSConfigured = false;
        
        this.initialize();
    }

    async initialize() {
        await this.initializeEmail();
        await this.initializeSMS();
        this.startNotificationProcessor();
    }

    async initializeEmail() {
        try {
            if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
                console.log('⚠️  Email configuration not found. Email notifications disabled.');
                return;
            }

            this.emailTransporter = nodemailer.createTransporter({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            // Verify email connection
            await this.emailTransporter.verify();
            this.isEmailConfigured = true;
            console.log('📧 Email service initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize email service:', error.message);
            this.isEmailConfigured = false;
        }
    }

    async initializeSMS() {
        try {
            if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
                console.log('⚠️  Twilio configuration not found. SMS notifications disabled.');
                return;
            }

            this.twilioClient = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );

            this.isSMSConfigured = true;
            console.log('📱 SMS service initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize SMS service:', error.message);
            this.isSMSConfigured = false;
        }
    }

    startNotificationProcessor() {
        // Process pending notifications every 30 seconds
        setInterval(async () => {
            await this.processPendingNotifications();
        }, 30000);

        // Cleanup expired notifications every hour
        setInterval(async () => {
            await this.cleanupExpiredNotifications();
        }, 60 * 60 * 1000);

        console.log('🔄 Notification processor started');
    }

    async createNotification(notificationData) {
        try {
            const notification = await Notification.createNotification(notificationData);
            
            // Send real-time notification immediately if in-app channel is requested
            if (notificationData.channels?.includes('in_app')) {
                await this.sendInAppNotification(notification);
            }

            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    async sendInAppNotification(notification) {
        try {
            if (socketService.isUserOnline(notification.recipient.toString())) {
                socketService.sendNotificationToUser(notification.recipient.toString(), {
                    id: notification._id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    category: notification.category,
                    priority: notification.priority,
                    data: notification.data,
                    actions: notification.actions,
                    createdAt: notification.createdAt,
                    timeAgo: notification.timeAgo
                });

                // Mark as delivered
                await notification.markChannelDelivered('in_app', {
                    provider: 'socket.io',
                    messageId: notification._id.toString()
                });
            }
        } catch (error) {
            console.error('Error sending in-app notification:', error);
            await notification.markChannelFailed('in_app', error.message);
        }
    }

    async sendEmailNotification(notification) {
        if (!this.isEmailConfigured) {
            await notification.markChannelFailed('email', 'Email service not configured');
            return;
        }

        try {
            const recipient = await notification.populate('recipient');
            
            if (!recipient.recipient?.email) {
                await notification.markChannelFailed('email', 'Recipient email not found');
                return;
            }

            const emailTemplate = this.getEmailTemplate(notification);
            
            const mailOptions = {
                from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
                to: recipient.recipient.email,
                subject: notification.title,
                html: emailTemplate,
                text: notification.message // Fallback to plain text
            };

            const result = await this.emailTransporter.sendMail(mailOptions);

            await notification.markChannelDelivered('email', {
                provider: 'nodemailer',
                messageId: result.messageId
            });

            console.log(`📧 Email sent to ${recipient.recipient.email}: ${notification.title}`);

        } catch (error) {
            console.error('Error sending email notification:', error);
            await notification.markChannelFailed('email', error.message);
        }
    }

    async sendSMSNotification(notification) {
        if (!this.isSMSConfigured) {
            await notification.markChannelFailed('sms', 'SMS service not configured');
            return;
        }

        try {
            const recipient = await notification.populate('recipient');
            
            if (!recipient.recipient?.phone) {
                await notification.markChannelFailed('sms', 'Recipient phone number not found');
                return;
            }

            const smsBody = `${notification.title}\n\n${notification.message}`;
            
            // Truncate if too long for SMS
            const truncatedBody = smsBody.length > 160 
                ? smsBody.substring(0, 157) + '...' 
                : smsBody;

            const result = await this.twilioClient.messages.create({
                body: truncatedBody,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: recipient.recipient.phone
            });

            await notification.markChannelDelivered('sms', {
                provider: 'twilio',
                messageId: result.sid,
                cost: result.price || 0
            });

            console.log(`📱 SMS sent to ${recipient.recipient.phone}: ${notification.title}`);

        } catch (error) {
            console.error('Error sending SMS notification:', error);
            await notification.markChannelFailed('sms', error.message);
        }
    }

    async processPendingNotifications() {
        try {
            const pendingNotifications = await Notification.getPendingNotifications();

            for (const notification of pendingNotifications) {
                for (const channel of notification.channels) {
                    if (channel.status === 'pending') {
                        switch (channel.type) {
                            case 'email':
                                await this.sendEmailNotification(notification);
                                break;
                            case 'sms':
                                await this.sendSMSNotification(notification);
                                break;
                            case 'in_app':
                                await this.sendInAppNotification(notification);
                                break;
                            default:
                                console.log(`Unknown notification channel: ${channel.type}`);
                        }
                        
                        // Mark channel as sent
                        channel.status = 'sent';
                        channel.sentAt = new Date();
                        await notification.save();
                    }
                }
            }
        } catch (error) {
            console.error('Error processing pending notifications:', error);
        }
    }

    async cleanupExpiredNotifications() {
        try {
            const deletedCount = await Notification.cleanupExpiredNotifications();
            if (deletedCount > 0) {
                console.log(`🗑️ Cleaned up ${deletedCount} expired notifications`);
            }
        } catch (error) {
            console.error('Error cleaning up expired notifications:', error);
        }
    }

    getEmailTemplate(notification) {
        // Basic HTML email template
        const baseTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${notification.title}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: white;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                }
                .content {
                    padding: 30px 20px;
                }
                .message {
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 20px;
                }
                .actions {
                    margin: 30px 0;
                    text-align: center;
                }
                .btn {
                    display: inline-block;
                    padding: 12px 30px;
                    margin: 5px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: 600;
                    text-align: center;
                    transition: all 0.3s ease;
                }
                .btn-primary {
                    background-color: #007bff;
                    color: white;
                }
                .btn-secondary {
                    background-color: #6c757d;
                    color: white;
                }
                .btn-success {
                    background-color: #28a745;
                    color: white;
                }
                .btn-warning {
                    background-color: #ffc107;
                    color: #212529;
                }
                .btn-danger {
                    background-color: #dc3545;
                    color: white;
                }
                .footer {
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    color: #6c757d;
                    font-size: 14px;
                    border-top: 1px solid #dee2e6;
                }
                .priority-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    margin-bottom: 10px;
                }
                .priority-high {
                    background-color: #ffeaa7;
                    color: #d63031;
                }
                .priority-urgent {
                    background-color: #fab1a0;
                    color: #e17055;
                }
                @media only screen and (max-width: 600px) {
                    .container {
                        margin: 0;
                        border-radius: 0;
                    }
                    .content {
                        padding: 20px 15px;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${process.env.APP_NAME || 'Job Portal'}</h1>
                </div>
                <div class="content">
                    ${notification.priority === 'high' || notification.priority === 'urgent' ? 
                        `<div class="priority-badge priority-${notification.priority}">
                            ${notification.priority.toUpperCase()} PRIORITY
                        </div>` : ''
                    }
                    <h2>${notification.title}</h2>
                    <div class="message">
                        ${notification.message.replace(/\n/g, '<br>')}
                    </div>
                    ${notification.actions && notification.actions.length > 0 ? `
                        <div class="actions">
                            ${notification.actions.map(action => 
                                `<a href="${action.url}" class="btn btn-${action.style}">${action.label}</a>`
                            ).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="footer">
                    <p>This email was sent from ${process.env.APP_NAME || 'Job Portal'}.</p>
                    <p>If you no longer wish to receive these notifications, you can update your preferences in your account settings.</p>
                </div>
            </div>
        </body>
        </html>`;

        return baseTemplate;
    }

    // Convenience methods for common notification types
    async sendJobMatchNotification(userId, job) {
        return await this.createNotification({
            recipientId: userId,
            type: 'new_job_match',
            title: `New Job Match: ${job.title}`,
            message: `We found a job that matches your profile! ${job.company} is looking for a ${job.title}. Check it out now!`,
            category: 'info',
            priority: 'normal',
            channels: ['in_app', 'email'],
            data: {
                jobId: job._id,
                company: job.company,
                location: job.location
            },
            actions: [{
                label: 'View Job',
                url: `${process.env.CLIENT_URL}/jobs/${job._id}`,
                style: 'primary'
            }],
            relatedEntities: {
                relatedJob: job._id
            }
        });
    }

    async sendApplicationStatusNotification(application, oldStatus, newStatus) {
        return await this.createNotification({
            recipientId: application.candidate,
            type: 'application_status',
            title: `Application Status Updated`,
            message: `Your application for ${application.job.title} at ${application.job.company} has been updated from ${oldStatus} to ${newStatus}.`,
            category: newStatus === 'accepted' ? 'success' : newStatus === 'rejected' ? 'warning' : 'info',
            priority: newStatus === 'accepted' ? 'high' : 'normal',
            channels: ['in_app', 'email', 'sms'],
            data: {
                applicationId: application._id,
                oldStatus,
                newStatus,
                jobTitle: application.job.title,
                company: application.job.company
            },
            actions: [{
                label: 'View Application',
                url: `${process.env.CLIENT_URL}/applications/${application._id}`,
                style: newStatus === 'accepted' ? 'success' : 'primary'
            }],
            relatedEntities: {
                relatedApplication: application._id,
                relatedJob: application.job
            }
        });
    }

    async sendInterviewScheduledNotification(userId, interview) {
        return await this.createNotification({
            recipientId: userId,
            type: 'interview_scheduled',
            title: `Interview Scheduled`,
            message: `Your interview for ${interview.job.title} at ${interview.company} has been scheduled for ${new Date(interview.scheduledDate).toLocaleString()}.`,
            category: 'info',
            priority: 'high',
            channels: ['in_app', 'email', 'sms'],
            data: {
                interviewId: interview._id,
                scheduledDate: interview.scheduledDate,
                jobTitle: interview.job.title,
                company: interview.company,
                type: interview.type
            },
            actions: [{
                label: 'View Interview Details',
                url: `${process.env.CLIENT_URL}/interviews/${interview._id}`,
                style: 'primary'
            }],
            relatedEntities: {
                relatedJob: interview.job
            }
        });
    }

    async sendPaymentNotification(userId, payment, isSuccess = true) {
        return await this.createNotification({
            recipientId: userId,
            type: isSuccess ? 'payment_success' : 'payment_failed',
            title: isSuccess ? 'Payment Successful' : 'Payment Failed',
            message: isSuccess 
                ? `Your payment of $${payment.amount} has been processed successfully.`
                : `Your payment of $${payment.amount} could not be processed. Please check your payment method.`,
            category: isSuccess ? 'success' : 'error',
            priority: isSuccess ? 'normal' : 'high',
            channels: ['in_app', 'email'],
            data: {
                paymentId: payment._id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status
            },
            actions: [{
                label: isSuccess ? 'View Receipt' : 'Retry Payment',
                url: `${process.env.CLIENT_URL}/payments/${payment._id}`,
                style: isSuccess ? 'primary' : 'warning'
            }],
            relatedEntities: {
                relatedPayment: payment._id
            }
        });
    }

    async sendWelcomeNotification(user) {
        return await this.createNotification({
            recipientId: user._id,
            type: 'welcome',
            title: `Welcome to ${process.env.APP_NAME || 'Job Portal'}!`,
            message: `Hi ${user.firstName}, welcome to our platform! Complete your profile to get started with job recommendations tailored just for you.`,
            category: 'info',
            priority: 'normal',
            channels: ['in_app', 'email'],
            data: {
                firstName: user.firstName,
                role: user.role
            },
            actions: [{
                label: 'Complete Profile',
                url: `${process.env.CLIENT_URL}/profile/edit`,
                style: 'primary'
            }],
            relatedEntities: {
                relatedUser: user._id
            }
        });
    }

    async sendReferralBonusNotification(userId, referral, amount) {
        return await this.createNotification({
            recipientId: userId,
            type: 'referral_bonus',
            title: 'Referral Bonus Earned!',
            message: `Congratulations! You've earned $${amount} for referring ${referral.firstName} ${referral.lastName}. The bonus has been added to your account.`,
            category: 'success',
            priority: 'normal',
            channels: ['in_app', 'email'],
            data: {
                referralId: referral._id,
                bonusAmount: amount,
                referredUser: `${referral.firstName} ${referral.lastName}`
            },
            actions: [{
                label: 'View Earnings',
                url: `${process.env.CLIENT_URL}/referrals`,
                style: 'success'
            }]
        });
    }

    // Bulk notification methods
    async sendBulkNotifications(notifications) {
        try {
            const createdNotifications = await Notification.bulkCreate(notifications);
            console.log(`📨 Created ${createdNotifications.length} bulk notifications`);
            return createdNotifications;
        } catch (error) {
            console.error('Error sending bulk notifications:', error);
            throw error;
        }
    }

    // Analytics and monitoring
    async getNotificationAnalytics(startDate, endDate) {
        return await Notification.getAnalytics(startDate, endDate);
    }

    async getDeliveryStats(startDate, endDate) {
        const pipeline = [
            {
                $match: {
                    createdAt: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    }
                }
            },
            {
                $unwind: '$channels'
            },
            {
                $group: {
                    _id: {
                        type: '$channels.type',
                        status: '$channels.status'
                    },
                    count: { $sum: 1 }
                }
            }
        ];

        return await Notification.aggregate(pipeline);
    }
}

module.exports = new NotificationService();