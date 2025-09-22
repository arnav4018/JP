const fs = require('fs').promises;
const path = require('path');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Resume = require('../models/Resume');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

/**
 * @desc    Export users data as CSV
 * @route   GET /api/admin/export/users/csv
 * @access  Private (Admin)
 */
const exportUsersCSV = async (req, res) => {
    try {
        const {
            role,
            isActive = 'all',
            startDate,
            endDate,
            fields = 'basic'
        } = req.query;

        // Build query
        const query = {};
        if (role) query.role = role;
        if (isActive !== 'all') query.isActive = isActive === 'true';
        if (startDate) query.createdAt = { $gte: new Date(startDate) };
        if (endDate) {
            query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
        }

        // Get users data
        const users = await User.find(query).lean();

        // Define field sets
        const fieldSets = {
            basic: [
                'firstName',
                'lastName', 
                'email',
                'role',
                'isActive',
                'createdAt'
            ],
            detailed: [
                'firstName',
                'lastName',
                'email',
                'phone',
                'role',
                'isActive',
                'isEmailVerified',
                'lastLogin',
                'location.city',
                'location.state',
                'location.country',
                'companyName',
                'companySize',
                'skills',
                'experience',
                'createdAt',
                'updatedAt'
            ],
            all: [
                '_id',
                'firstName',
                'lastName',
                'email',
                'phone',
                'role',
                'isActive',
                'isEmailVerified',
                'lastLogin',
                'location.city',
                'location.state', 
                'location.country',
                'companyName',
                'companyWebsite',
                'companySize',
                'skills',
                'experience',
                'isProfileComplete',
                'createdAt',
                'updatedAt'
            ]
        };

        const selectedFields = fieldSets[fields] || fieldSets.basic;

        // Transform data for CSV
        const transformedUsers = users.map(user => {
            const transformed = {};
            selectedFields.forEach(field => {
                if (field.includes('.')) {
                    const [parent, child] = field.split('.');
                    transformed[field] = user[parent] ? user[parent][child] : '';
                } else if (field === 'skills') {
                    transformed[field] = Array.isArray(user.skills) ? user.skills.join('; ') : '';
                } else {
                    transformed[field] = user[field] || '';
                }
            });
            return transformed;
        });

        // Convert to CSV
        const parser = new Parser({
            fields: selectedFields,
            header: true
        });
        const csv = parser.parse(transformedUsers);

        // Set response headers for CSV download
        const filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'text/csv');

        res.status(200).send(csv);

    } catch (error) {
        console.error('Error exporting users CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export users data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Export jobs data as CSV
 * @route   GET /api/admin/export/jobs/csv
 * @access  Private (Admin)
 */
const exportJobsCSV = async (req, res) => {
    try {
        const {
            status,
            category,
            type,
            startDate,
            endDate,
            includeApplications = 'false'
        } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (category) query.category = category;
        if (type) query.type = type;
        if (startDate) query.createdAt = { $gte: new Date(startDate) };
        if (endDate) {
            query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
        }

        let jobs;
        
        if (includeApplications === 'true') {
            // Include application counts using aggregation
            jobs = await Job.aggregate([
                { $match: query },
                {
                    $lookup: {
                        from: 'applications',
                        localField: '_id',
                        foreignField: 'job',
                        as: 'applications'
                    }
                },
                {
                    $addFields: {
                        applicationCount: { $size: '$applications' },
                        pendingApplications: {
                            $size: {
                                $filter: {
                                    input: '$applications',
                                    cond: { $eq: ['$$this.status', 'pending'] }
                                }
                            }
                        },
                        acceptedApplications: {
                            $size: {
                                $filter: {
                                    input: '$applications',
                                    cond: { $eq: ['$$this.status', 'accepted'] }
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        applications: 0 // Remove the applications array to reduce size
                    }
                }
            ]);
        } else {
            jobs = await Job.find(query).lean();
        }

        // Define fields for CSV
        const baseFields = [
            'title',
            'company',
            'category',
            'type',
            'status',
            'location.city',
            'location.state',
            'location.country',
            'salary.min',
            'salary.max',
            'salary.currency',
            'experienceLevel',
            'deadline',
            'createdAt'
        ];

        const fields = includeApplications === 'true' 
            ? [...baseFields, 'applicationCount', 'pendingApplications', 'acceptedApplications']
            : baseFields;

        // Transform data for CSV
        const transformedJobs = jobs.map(job => {
            const transformed = {};
            fields.forEach(field => {
                if (field.includes('.')) {
                    const [parent, child] = field.split('.');
                    transformed[field] = job[parent] ? job[parent][child] : '';
                } else {
                    transformed[field] = job[field] || '';
                }
            });
            return transformed;
        });

        // Convert to CSV
        const parser = new Parser({
            fields,
            header: true
        });
        const csv = parser.parse(transformedJobs);

        // Set response headers
        const filename = `jobs_export_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'text/csv');

        res.status(200).send(csv);

    } catch (error) {
        console.error('Error exporting jobs CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export jobs data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Export applications data as CSV
 * @route   GET /api/admin/export/applications/csv
 * @access  Private (Admin)
 */
const exportApplicationsCSV = async (req, res) => {
    try {
        const {
            status,
            startDate,
            endDate
        } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (startDate) query.createdAt = { $gte: new Date(startDate) };
        if (endDate) {
            query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
        }

        // Get applications with populated data
        const applications = await Application.find(query)
            .populate('candidate', 'firstName lastName email')
            .populate('job', 'title company category')
            .lean();

        // Transform data for CSV
        const transformedApplications = applications.map(app => ({
            'Application ID': app._id,
            'Candidate Name': app.candidate ? `${app.candidate.firstName} ${app.candidate.lastName}` : 'N/A',
            'Candidate Email': app.candidate ? app.candidate.email : 'N/A',
            'Job Title': app.job ? app.job.title : 'N/A',
            'Company': app.job ? app.job.company : 'N/A',
            'Job Category': app.job ? app.job.category : 'N/A',
            'Status': app.status,
            'Applied Date': app.createdAt,
            'Last Updated': app.updatedAt,
            'Cover Letter Length': app.coverLetter ? app.coverLetter.length : 0
        }));

        // Convert to CSV
        const parser = new Parser({
            header: true
        });
        const csv = parser.parse(transformedApplications);

        // Set response headers
        const filename = `applications_export_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'text/csv');

        res.status(200).send(csv);

    } catch (error) {
        console.error('Error exporting applications CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export applications data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Export payments data as CSV
 * @route   GET /api/admin/export/payments/csv
 * @access  Private (Admin)
 */
const exportPaymentsCSV = async (req, res) => {
    try {
        const {
            status,
            startDate,
            endDate
        } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (startDate) query.createdAt = { $gte: new Date(startDate) };
        if (endDate) {
            query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
        }

        // Get payments with user data
        const payments = await Payment.find(query)
            .populate('userId', 'firstName lastName email')
            .lean();

        // Transform data for CSV
        const transformedPayments = payments.map(payment => ({
            'Payment ID': payment._id,
            'User Name': payment.userId ? `${payment.userId.firstName} ${payment.userId.lastName}` : 'N/A',
            'User Email': payment.userId ? payment.userId.email : 'N/A',
            'Amount': payment.amount,
            'Currency': payment.currency,
            'Status': payment.status,
            'Payment Method': payment.paymentMethod,
            'Transaction ID': payment.transactionId || 'N/A',
            'Type': payment.type || 'N/A',
            'Created Date': payment.createdAt,
            'Updated Date': payment.updatedAt
        }));

        // Convert to CSV
        const parser = new Parser({
            header: true
        });
        const csv = parser.parse(transformedPayments);

        // Set response headers
        const filename = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'text/csv');

        res.status(200).send(csv);

    } catch (error) {
        console.error('Error exporting payments CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export payments data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Generate comprehensive analytics report as PDF
 * @route   GET /api/admin/export/analytics/pdf
 * @access  Private (Admin)
 */
const exportAnalyticsPDF = async (req, res) => {
    try {
        const {
            startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate = new Date()
        } = req.query;

        // Get analytics data
        const [
            userStats,
            jobStats,
            applicationStats,
            paymentStats
        ] = await Promise.all([
            // User statistics
            User.aggregate([
                {
                    $facet: {
                        total: [{ $count: 'count' }],
                        byRole: [{ $group: { _id: '$role', count: { $sum: 1 } } }],
                        newUsers: [{
                            $match: {
                                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                            }
                        }, { $count: 'count' }]
                    }
                }
            ]),

            // Job statistics
            Job.aggregate([
                {
                    $facet: {
                        total: [{ $count: 'count' }],
                        active: [{ $match: { status: 'active' } }, { $count: 'count' }],
                        byCategory: [{ $group: { _id: '$category', count: { $sum: 1 } } }]
                    }
                }
            ]),

            // Application statistics
            Application.aggregate([
                {
                    $facet: {
                        total: [{ $count: 'count' }],
                        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
                        recent: [{
                            $match: {
                                createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                            }
                        }, { $count: 'count' }]
                    }
                }
            ]),

            // Payment statistics
            Payment.aggregate([
                {
                    $facet: {
                        totalRevenue: [{
                            $match: { status: 'completed' }
                        }, {
                            $group: { _id: null, revenue: { $sum: '$amount' } }
                        }],
                        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }]
                    }
                }
            ])
        ]);

        // Create PDF document
        const doc = new PDFDocument();
        const filename = `analytics_report_${new Date().toISOString().split('T')[0]}.pdf`;

        // Set response headers
        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'application/pdf');

        // Pipe PDF to response
        doc.pipe(res);

        // Add content to PDF
        doc.fontSize(20).text('Job Portal Analytics Report', 100, 100);
        doc.fontSize(12).text(`Report Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, 100, 130);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 100, 150);

        let yPosition = 200;

        // User Statistics
        doc.fontSize(16).text('User Statistics', 100, yPosition);
        yPosition += 30;
        
        const totalUsers = userStats[0]?.total[0]?.count || 0;
        const newUsers = userStats[0]?.newUsers[0]?.count || 0;
        
        doc.fontSize(12)
           .text(`Total Users: ${totalUsers}`, 120, yPosition)
           .text(`New Users (in period): ${newUsers}`, 120, yPosition + 20);
        
        yPosition += 50;
        
        if (userStats[0]?.byRole) {
            doc.text('Users by Role:', 120, yPosition);
            yPosition += 20;
            userStats[0].byRole.forEach(role => {
                doc.text(`  ${role._id}: ${role.count}`, 140, yPosition);
                yPosition += 15;
            });
        }

        yPosition += 30;

        // Job Statistics
        doc.fontSize(16).text('Job Statistics', 100, yPosition);
        yPosition += 30;
        
        const totalJobs = jobStats[0]?.total[0]?.count || 0;
        const activeJobs = jobStats[0]?.active[0]?.count || 0;
        
        doc.fontSize(12)
           .text(`Total Jobs: ${totalJobs}`, 120, yPosition)
           .text(`Active Jobs: ${activeJobs}`, 120, yPosition + 20);

        yPosition += 50;

        // Application Statistics
        doc.fontSize(16).text('Application Statistics', 100, yPosition);
        yPosition += 30;
        
        const totalApplications = applicationStats[0]?.total[0]?.count || 0;
        const recentApplications = applicationStats[0]?.recent[0]?.count || 0;
        
        doc.fontSize(12)
           .text(`Total Applications: ${totalApplications}`, 120, yPosition)
           .text(`Recent Applications: ${recentApplications}`, 120, yPosition + 20);

        yPosition += 50;

        // Payment Statistics
        doc.fontSize(16).text('Payment Statistics', 100, yPosition);
        yPosition += 30;
        
        const totalRevenue = paymentStats[0]?.totalRevenue[0]?.revenue || 0;
        
        doc.fontSize(12).text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 120, yPosition);

        // End PDF
        doc.end();

    } catch (error) {
        console.error('Error generating analytics PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate analytics report',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Export resume data as CSV
 * @route   GET /api/admin/export/resumes/csv
 * @access  Private (Admin)
 */
const exportResumesCSV = async (req, res) => {
    try {
        const {
            status,
            startDate,
            endDate
        } = req.query;

        // Build query
        const query = {};
        if (status) query.status = status;
        if (startDate) query.createdAt = { $gte: new Date(startDate) };
        if (endDate) {
            query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
        }

        // Get resumes with user data
        const resumes = await Resume.find(query)
            .populate('userId', 'firstName lastName email')
            .lean();

        // Transform data for CSV
        const transformedResumes = resumes.map(resume => ({
            'Resume ID': resume._id,
            'User Name': resume.userId ? `${resume.userId.firstName} ${resume.userId.lastName}` : 'N/A',
            'User Email': resume.userId ? resume.userId.email : 'N/A',
            'Filename': resume.filename || 'N/A',
            'File Size': resume.size || 0,
            'Content Type': resume.contentType || 'N/A',
            'Status': resume.status || 'active',
            'Upload Date': resume.createdAt,
            'Last Updated': resume.updatedAt
        }));

        // Convert to CSV
        const parser = new Parser({
            header: true
        });
        const csv = parser.parse(transformedResumes);

        // Set response headers
        const filename = `resumes_export_${new Date().toISOString().split('T')[0]}.csv`;
        res.setHeader('Content-disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Type', 'text/csv');

        res.status(200).send(csv);

    } catch (error) {
        console.error('Error exporting resumes CSV:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export resumes data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get export status and available exports
 * @route   GET /api/admin/export/status
 * @access  Private (Admin)
 */
const getExportStatus = async (req, res) => {
    try {
        // Get counts for all exportable data
        const [
            userCount,
            jobCount,
            applicationCount,
            paymentCount,
            resumeCount,
            notificationCount
        ] = await Promise.all([
            User.countDocuments(),
            Job.countDocuments(),
            Application.countDocuments(),
            Payment.countDocuments(),
            Resume.countDocuments(),
            Notification.countDocuments()
        ]);

        const exportInfo = {
            availableExports: {
                users: {
                    totalRecords: userCount,
                    formats: ['csv'],
                    fields: ['basic', 'detailed', 'all'],
                    filters: ['role', 'isActive', 'dateRange']
                },
                jobs: {
                    totalRecords: jobCount,
                    formats: ['csv'],
                    fields: ['standard'],
                    filters: ['status', 'category', 'type', 'dateRange', 'includeApplications']
                },
                applications: {
                    totalRecords: applicationCount,
                    formats: ['csv'],
                    fields: ['standard'],
                    filters: ['status', 'dateRange']
                },
                payments: {
                    totalRecords: paymentCount,
                    formats: ['csv'],
                    fields: ['standard'],
                    filters: ['status', 'dateRange']
                },
                resumes: {
                    totalRecords: resumeCount,
                    formats: ['csv'],
                    fields: ['standard'],
                    filters: ['status', 'dateRange']
                },
                analytics: {
                    formats: ['pdf'],
                    description: 'Comprehensive analytics report'
                }
            },
            recommendations: {
                maxRecordsPerExport: 10000,
                supportedDateRange: '2 years',
                recommendedFormats: {
                    'small datasets (< 1000 records)': 'Any format',
                    'large datasets (> 1000 records)': 'CSV for better performance'
                }
            }
        };

        res.status(200).json({
            success: true,
            message: 'Export status retrieved successfully',
            data: exportInfo
        });

    } catch (error) {
        console.error('Error getting export status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get export status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    exportUsersCSV,
    exportJobsCSV,
    exportApplicationsCSV,
    exportPaymentsCSV,
    exportAnalyticsPDF,
    exportResumesCSV,
    getExportStatus
};