const Job = require('../models/Job');
// const { aiScoringService } = require('../services/aiScoringService');
// const SystemSettings = require('../models/SystemSettings');

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
            title: search,
            location,
            employment_type: employmentType,
            salary_min: salaryMin,
            experience_level: category
        };

        // Remove undefined values
        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined) {
                delete filters[key];
            }
        });

        // Build options for pagination and sorting
        const options = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            orderBy: 'posted_at DESC'
        };

        // Initialize Job model instance
        const jobModel = new Job();

        // Simple query to get all jobs
        const query = `
            SELECT j.*, c.name as company_name 
            FROM jobs j
            LEFT JOIN companies c ON j.company_id = c.id
            WHERE j.is_active = true
            ORDER BY j.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        
        const countQuery = `SELECT COUNT(*) FROM jobs WHERE is_active = true`;
        
        const result = await jobModel.query(query, [options.limit, options.offset]);
        const countResult = await jobModel.query(countQuery);
        
        const jobs = result.rows;
        const total = parseInt(countResult.rows[0].count);

        res.status(200).json({
            success: true,
            count: jobs.length,
            pagination: {
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit),
                total: total
            },
            data: {
                jobs: jobs
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
        const jobModel = new Job();
        const job = await jobModel.getJobById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Skip incrementing view count as views column doesn't exist in current schema
        // await jobModel.incrementViews(req.params.id);

        res.status(200).json({
            success: true,
            data: {
                job
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
        console.log('📝 Creating job with data:', req.body);
        console.log('👤 User:', req.user);
        
        // Add posted by user ID
        req.body.posted_by_recruiter_id = req.user?.id;
        
        // Handle company - create a simple company entry if not provided
        if (!req.body.company_id && req.body.company) {
            // For now, use a default company_id of 1, or create logic to handle company creation
            req.body.company_id = 1;
            console.log('🏢 Using default company_id for:', req.body.company);
        }
        
        const jobModel = new Job();
        const job = await jobModel.createJob(req.body);
        
        console.log('✅ Job created successfully:', job.id);

        res.status(201).json({
            success: true,
            message: 'Job created successfully',
            data: {
                job
            }
        });

    } catch (error) {
        console.error('❌ Error creating job:', error);
        next(error);
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Job owner/Admin only)
const updateJob = async (req, res, next) => {
    try {
        const jobModel = new Job();
        const job = await jobModel.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        const updatedJob = await jobModel.update(req.params.id, req.body);

        res.status(200).json({
            success: true,
            message: 'Job updated successfully',
            data: {
                job: updatedJob
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
        const jobModel = new Job();
        const job = await jobModel.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        await jobModel.delete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get all companies
// @route   GET /api/jobs/companies
// @access  Public
const getCompanies = async (req, res, next) => {
    try {
        const jobModel = new Job();
        const query = `
            SELECT DISTINCT c.id, c.name, c.logo_url, c.website
            FROM companies c 
            ORDER BY c.name
        `;
        
        const result = await jobModel.query(query);
        
        res.status(200).json({
            success: true,
            count: result.rows.length,
            data: {
                companies: result.rows
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob,
    getCompanies
};
