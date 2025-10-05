const BaseModel = require('./BaseModel');

class Job extends BaseModel {
    constructor() {
        super('jobs');
    }

    /**
     * Create a new job
     * @param {Object} jobData - Job data
     * @returns {Promise} Created job
     */
    async createJob(jobData) {
        const jobToCreate = {
            title: jobData.title,
            description: jobData.description,
            company_id: jobData.company_id,
            location: jobData.location || 'Remote',
            salary_min: jobData.salary?.min || jobData.salary_min || null,
            salary_max: jobData.salary?.max || jobData.salary_max || null,
            experience_level: jobData.experience_level || 'Mid-Level',
            employment_type: jobData.employment?.type || jobData.employment_type || 'full-time',
            is_remote: jobData.location?.isRemote || jobData.is_remote || false,
            posted_by_recruiter_id: jobData.postedBy || jobData.posted_by_recruiter_id,
            status: jobData.status || 'active',
            requirements: JSON.stringify(jobData.requirements || []),
            benefits: JSON.stringify(jobData.benefits || []),
            skills_required: JSON.stringify(jobData.requirements?.skills || []),
            application_deadline: jobData.applicationDeadline || jobData.application_deadline,
            is_active: jobData.status !== 'draft',
            views: 0,
            is_urgent: jobData.isUrgent || false,
            is_featured: jobData.isFeatured || false
        };

        return await this.create(jobToCreate);
    }

    /**
     * Get jobs with filters and pagination
     * @param {Object} filters - Search filters
     * @param {Object} options - Pagination and sorting options
     * @returns {Promise} Jobs array and count
     */
    async getJobs(filters = {}, options = {}) {
        let query = `
            SELECT j.*, c.name as company_name, c.logo_url as company_logo,
                   u.first_name || ' ' || u.last_name as posted_by_name
            FROM jobs j
            LEFT JOIN companies c ON j.company_id = c.id
            LEFT JOIN users u ON j.posted_by_recruiter_id = u.id
            WHERE j.is_active = true
        `;
        const params = [];
        let paramCount = 0;

        // Apply filters
        if (filters.title) {
            paramCount++;
            query += ` AND j.title ILIKE $${paramCount}`;
            params.push(`%${filters.title}%`);
        }

        if (filters.location) {
            paramCount++;
            query += ` AND (j.location ILIKE $${paramCount} OR j.is_remote = true)`;
            params.push(`%${filters.location}%`);
        }

        if (filters.experience_level) {
            paramCount++;
            query += ` AND j.experience_level = $${paramCount}`;
            params.push(filters.experience_level);
        }

        if (filters.employment_type) {
            paramCount++;
            query += ` AND j.employment_type = $${paramCount}`;
            params.push(filters.employment_type);
        }

        if (filters.salary_min) {
            paramCount++;
            query += ` AND j.salary_min >= $${paramCount}`;
            params.push(filters.salary_min);
        }

        if (filters.company_id) {
            paramCount++;
            query += ` AND j.company_id = $${paramCount}`;
            params.push(filters.company_id);
        }

        // Add ordering
        const orderBy = options.orderBy || 'j.posted_at DESC';
        query += ` ORDER BY ${orderBy}`;

        // Add pagination
        if (options.limit) {
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            params.push(options.limit);
        }

        if (options.offset) {
            paramCount++;
            query += ` OFFSET $${paramCount}`;
            params.push(options.offset);
        }

        const result = await this.query(query, params);
        
        // Get total count for pagination
        const countQuery = `
            SELECT COUNT(*) FROM jobs j
            WHERE j.is_active = true
            ${filters.title ? `AND j.title ILIKE '%${filters.title}%'` : ''}
            ${filters.location ? `AND (j.location ILIKE '%${filters.location}%' OR j.is_remote = true)` : ''}
        `;
        const countResult = await this.query(countQuery);
        const total = parseInt(countResult.rows[0].count);

        return {
            jobs: result.rows,
            total,
            page: Math.floor((options.offset || 0) / (options.limit || 10)) + 1,
            totalPages: Math.ceil(total / (options.limit || 10))
        };
    }

    /**
     * Get job by ID with company details
     * @param {number} jobId - Job ID
     * @returns {Promise} Job details
     */
    async getJobById(jobId) {
        try {
            // Ultra-conservative approach - start with just the basic columns we know exist
            const basicQuery = `
                SELECT j.id, j.title, j.description, j.location, j.company_id,
                       j.salary_min, j.salary_max, j.is_active, j.created_at,
                       c.name as company_name
                FROM jobs j
                LEFT JOIN companies c ON j.company_id = c.id
                WHERE j.id = $1
            `;
            
            const result = await this.query(basicQuery, [jobId]);
            if (result.rows.length === 0) return null;

            const job = result.rows[0];
            
            // Add safe default values for commonly expected fields
            job.requirements = [];
            job.benefits = [];
            job.skills_required = [];
            job.employment_type = job.employment_type || 'full-time';
            job.experience_level = job.experience_level || 'Mid-Level';
            job.is_remote = job.is_remote || false;
            job.status = job.status || 'active';
            job.views = job.views || 0;
            job.company = job.company_name;
            job.postedDate = job.created_at;
            job.posted_at = job.created_at;
            
            // Try to get additional fields if they exist
            try {
                const extendedQuery = `
                    SELECT employment_type, experience_level, is_remote, status, views,
                           requirements, benefits, skills_required, posted_at
                    FROM jobs WHERE id = $1
                `;
                const extendedResult = await this.query(extendedQuery, [jobId]);
                if (extendedResult.rows.length > 0) {
                    const extended = extendedResult.rows[0];
                    Object.keys(extended).forEach(key => {
                        if (extended[key] !== null) {
                            job[key] = extended[key];
                        }
                    });
                    
                    // Parse JSON fields if they exist
                    this.parseJobJsonFields(job);
                }
            } catch (extendedError) {
                console.log('Extended fields not available, using defaults');
            }
            
            return job;
            
        } catch (error) {
            console.error(`Error in getJobById for job ${jobId}:`, error);
            throw error;
        }
    }
    
    /**
     * Helper method to safely parse JSON fields in job objects
     * @param {Object} job - Job object to parse
     */
    parseJobJsonFields(job) {
        const jsonFields = ['requirements', 'benefits', 'skills_required'];
        
        jsonFields.forEach(field => {
            try {
                if (job[field]) {
                    // Check if it's already an object/array
                    if (typeof job[field] === 'string') {
                        job[field] = JSON.parse(job[field]);
                    }
                } else {
                    job[field] = [];
                }
            } catch (e) {
                console.log(`Failed to parse ${field} JSON for job ${job.id}:`, e.message, 'Raw value:', job[field]);
                job[field] = [];
            }
        });
    }

    /**
     * Update job views
     * @param {number} jobId - Job ID
     * @returns {Promise} Updated job
     */
    async incrementViews(jobId) {
        try {
            const query = `
                UPDATE jobs 
                SET views = views + 1 
                WHERE id = $1 
                RETURNING *
            `;
            const result = await this.query(query, [jobId]);
            return result.rows[0];
        } catch (error) {
            // If views column doesn't exist, silently fail
            console.log('Views column not available, skipping increment');
            return null;
        }
    }

    /**
     * Get jobs by recruiter
     * @param {number} recruiterId - Recruiter ID
     * @param {Object} options - Query options
     * @returns {Promise} Jobs array
     */
    async getJobsByRecruiter(recruiterId, options = {}) {
        return await this.find(
            { posted_by_recruiter_id: recruiterId },
            { 
                orderBy: 'posted_at DESC',
                limit: options.limit || 50,
                offset: options.offset || 0
            }
        );
    }

    /**
     * Search jobs by text
     * @param {string} searchText - Search text
     * @param {Object} options - Search options
     * @returns {Promise} Jobs array
     */
    async searchJobs(searchText, options = {}) {
        const query = `
            SELECT j.*, c.name as company_name, c.logo_url as company_logo
            FROM jobs j
            LEFT JOIN companies c ON j.company_id = c.id
            WHERE j.is_active = true AND (
                j.title ILIKE $1 OR
                j.description ILIKE $1 OR
                c.name ILIKE $1 OR
                j.location ILIKE $1
            )
            ORDER BY j.posted_at DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await this.query(query, [
            `%${searchText}%`,
            options.limit || 20,
            options.offset || 0
        ]);
        
        return result.rows;
    }

    /**
     * Update job status
     * @param {number} jobId - Job ID
     * @param {string} status - New status
     * @returns {Promise} Updated job
     */
    async updateJobStatus(jobId, status) {
        return await this.update(jobId, { 
            status,
            is_active: status === 'active'
        });
    }
}

// Export the class
module.exports = Job;
