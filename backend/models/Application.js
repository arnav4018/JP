const BaseModel = require('./BaseModel');

class Application extends BaseModel {
    constructor() {
        super('applications');
    }

    /**
     * Create a new application
     * @param {Object} applicationData - Application data
     * @returns {Promise} Created application
     */
    async createApplication(applicationData) {
        const applicationToCreate = {
            job_id: applicationData.job || applicationData.job_id,
            candidate_id: applicationData.candidate || applicationData.candidate_id,
            status: applicationData.status || 'Applied',
            resume_filename: applicationData.resume?.filename || applicationData.resume_filename,
            resume_original_name: applicationData.resume?.originalName || applicationData.resume_original_name,
            resume_file_size: applicationData.resume?.fileSize || applicationData.resume_file_size,
            resume_mime_type: applicationData.resume?.mimeType || applicationData.resume_mime_type,
            cover_letter: applicationData.coverLetter || applicationData.cover_letter,
            submitted_at: new Date(),
            source: applicationData.source || 'direct',
            referred_by: applicationData.referredBy || applicationData.referred_by || null,
            expected_salary_amount: applicationData.expectedSalary?.amount || applicationData.expected_salary_amount,
            expected_salary_currency: applicationData.expectedSalary?.currency || applicationData.expected_salary_currency || 'INR',
            availability_date: applicationData.availabilityDate || applicationData.availability_date,
            notice_period: applicationData.noticePeriod || applicationData.notice_period
        };

        return await this.create(applicationToCreate);
    }

    /**
     * Get applications by job
     * @param {number} jobId - Job ID
     * @param {Object} options - Query options
     * @returns {Promise} Applications array
     */
    async getApplicationsByJob(jobId, options = {}) {
        const query = `
            SELECT a.*, 
                   u.first_name, u.last_name, u.email, u.avatar, u.skills,
                   j.title as job_title, j.location as job_location,
                   c.name as company_name
            FROM applications a
            LEFT JOIN users u ON a.candidate_id = u.id
            LEFT JOIN jobs j ON a.job_id = j.id
            LEFT JOIN companies c ON j.company_id = c.id
            WHERE a.job_id = $1
            ORDER BY ${options.orderBy || 'a.submitted_at DESC'}
            LIMIT $2 OFFSET $3
        `;
        
        const result = await this.query(query, [
            jobId,
            options.limit || 50,
            options.offset || 0
        ]);
        
        return result.rows;
    }

    /**
     * Get applications by candidate
     * @param {number} candidateId - Candidate ID
     * @param {Object} options - Query options
     * @returns {Promise} Applications array
     */
    async getApplicationsByCandidate(candidateId, options = {}) {
        const query = `
            SELECT a.*, 
                   j.title as job_title, j.location as job_location, j.salary_min, j.salary_max,
                   c.name as company_name, c.logo_url as company_logo
            FROM applications a
            LEFT JOIN jobs j ON a.job_id = j.id
            LEFT JOIN companies c ON j.company_id = c.id
            WHERE a.candidate_id = $1
            ORDER BY ${options.orderBy || 'a.submitted_at DESC'}
            LIMIT $2 OFFSET $3
        `;
        
        const result = await this.query(query, [
            candidateId,
            options.limit || 50,
            options.offset || 0
        ]);
        
        return result.rows;
    }

    /**
     * Update application status
     * @param {number} applicationId - Application ID
     * @param {string} status - New status
     * @param {string} reason - Status change reason
     * @param {number} updatedBy - User ID who updated
     * @returns {Promise} Updated application
     */
    async updateApplicationStatus(applicationId, status, reason = null, updatedBy = null) {
        const updateData = {
            status,
            status_reason: reason,
            reviewed_at: new Date(),
            reviewed_by: updatedBy
        };

        return await this.update(applicationId, updateData);
    }

    /**
     * Check if candidate has already applied to job
     * @param {number} jobId - Job ID
     * @param {number} candidateId - Candidate ID
     * @returns {Promise} Boolean
     */
    async hasAlreadyApplied(jobId, candidateId) {
        return await this.exists({
            job_id: jobId,
            candidate_id: candidateId
        });
    }

    /**
     * Get application statistics
     * @param {number} jobId - Optional job ID filter
     * @returns {Promise} Statistics object
     */
    async getApplicationStats(jobId = null) {
        let query = `
            SELECT 
                status,
                COUNT(*) as count
            FROM applications
        `;
        
        const params = [];
        if (jobId) {
            query += ' WHERE job_id = $1';
            params.push(jobId);
        }
        
        query += ' GROUP BY status';
        
        const result = await this.query(query, params);
        
        const stats = {
            total: 0,
            statusBreakdown: {}
        };
        
        result.rows.forEach(row => {
            stats.total += parseInt(row.count);
            stats.statusBreakdown[row.status] = parseInt(row.count);
        });
        
        return stats;
    }

    /**
     * Search applications
     * @param {Object} filters - Search filters
     * @param {Object} options - Query options
     * @returns {Promise} Applications array
     */
    async searchApplications(filters = {}, options = {}) {
        let query = `
            SELECT a.*, 
                   u.first_name, u.last_name, u.email,
                   j.title as job_title, c.name as company_name
            FROM applications a
            LEFT JOIN users u ON a.candidate_id = u.id
            LEFT JOIN jobs j ON a.job_id = j.id
            LEFT JOIN companies c ON j.company_id = c.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 0;
        
        if (filters.status) {
            paramCount++;
            query += ` AND a.status = $${paramCount}`;
            params.push(filters.status);
        }
        
        if (filters.jobId) {
            paramCount++;
            query += ` AND a.job_id = $${paramCount}`;
            params.push(filters.jobId);
        }
        
        if (filters.candidateId) {
            paramCount++;
            query += ` AND a.candidate_id = $${paramCount}`;
            params.push(filters.candidateId);
        }
        
        if (filters.submittedAfter) {
            paramCount++;
            query += ` AND a.submitted_at >= $${paramCount}`;
            params.push(filters.submittedAfter);
        }
        
        query += ` ORDER BY ${options.orderBy || 'a.submitted_at DESC'}`;
        
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
        return result.rows;
    }

    /**
     * Get application with full details
     * @param {number} applicationId - Application ID
     * @returns {Promise} Application with job and candidate details
     */
    async getApplicationWithDetails(applicationId) {
        const query = `
            SELECT a.*, 
                   u.first_name, u.last_name, u.email, u.phone, u.avatar, u.skills, u.experience,
                   j.title as job_title, j.description as job_description, j.location as job_location,
                   j.salary_min, j.salary_max, j.requirements,
                   c.name as company_name, c.logo_url as company_logo, c.website as company_website
            FROM applications a
            LEFT JOIN users u ON a.candidate_id = u.id
            LEFT JOIN jobs j ON a.job_id = j.id
            LEFT JOIN companies c ON j.company_id = c.id
            WHERE a.id = $1
        `;
        
        const result = await this.query(query, [applicationId]);
        if (result.rows.length === 0) return null;
        
        const application = result.rows[0];
        // Parse JSON fields if they exist
        if (application.requirements) {
            application.requirements = JSON.parse(application.requirements);
        }
        
        return application;
    }
}

// Export the class, not a singleton instance
module.exports = Application;
