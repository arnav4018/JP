const BaseModel = require('./BaseModel');

class Resume extends BaseModel {
    constructor() {
        super('resumes');
    }

    /**
     * Create a new resume
     * @param {Object} resumeData - Resume data
     * @returns {Promise} Created resume
     */
    async createResume(resumeData) {
        const resumeToCreate = {
            user_id: resumeData.user_id || resumeData.user,
            title: resumeData.title || 'New Resume',
            template: resumeData.template || 'modern',
            status: resumeData.status || 'draft',
            personal_info: JSON.stringify(resumeData.personalInfo || resumeData.personal_info || {}),
            summary: resumeData.summary || '',
            experience: JSON.stringify(resumeData.experience || []),
            education: JSON.stringify(resumeData.education || []),
            skills: JSON.stringify(resumeData.skills || []),
            projects: JSON.stringify(resumeData.projects || []),
            certifications: JSON.stringify(resumeData.certifications || []),
            languages: JSON.stringify(resumeData.languages || []),
            custom_sections: JSON.stringify(resumeData.customSections || resumeData.custom_sections || []),
            settings: JSON.stringify(resumeData.settings || {}),
            is_public: resumeData.isPublic || resumeData.is_public || false,
            created_at: new Date(),
            updated_at: new Date()
        };

        return await this.create(resumeToCreate);
    }

    /**
     * Get resumes by user ID
     * @param {number} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise} Resumes array
     */
    async getResumesByUser(userId, options = {}) {
        const query = `
            SELECT r.*, u.first_name, u.last_name, u.email
            FROM resumes r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.user_id = $1
            ORDER BY ${options.orderBy || 'r.updated_at DESC'}
            LIMIT $2 OFFSET $3
        `;
        
        const result = await this.query(query, [
            userId,
            options.limit || 50,
            options.offset || 0
        ]);
        
        return result.rows.map(row => this.formatResumeData(row));
    }

    /**
     * Get resume by ID
     * @param {number} resumeId - Resume ID
     * @returns {Promise} Resume object or null
     */
    async getResumeById(resumeId) {
        const query = `
            SELECT r.*, u.first_name, u.last_name, u.email
            FROM resumes r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = $1
        `;
        
        const result = await this.query(query, [resumeId]);
        
        if (result.rows.length === 0) return null;
        
        return this.formatResumeData(result.rows[0]);
    }

    /**
     * Update resume
     * @param {number} resumeId - Resume ID
     * @param {Object} updateData - Update data
     * @returns {Promise} Updated resume
     */
    async updateResume(resumeId, updateData) {
        const updateFields = {
            title: updateData.title,
            template: updateData.template,
            status: updateData.status,
            summary: updateData.summary,
            is_public: updateData.isPublic || updateData.is_public,
            updated_at: new Date()
        };

        // Handle JSONB fields
        if (updateData.personalInfo || updateData.personal_info) {
            updateFields.personal_info = JSON.stringify(updateData.personalInfo || updateData.personal_info);
        }
        if (updateData.experience) {
            updateFields.experience = JSON.stringify(updateData.experience);
        }
        if (updateData.education) {
            updateFields.education = JSON.stringify(updateData.education);
        }
        if (updateData.skills) {
            updateFields.skills = JSON.stringify(updateData.skills);
        }
        if (updateData.projects) {
            updateFields.projects = JSON.stringify(updateData.projects);
        }
        if (updateData.certifications) {
            updateFields.certifications = JSON.stringify(updateData.certifications);
        }
        if (updateData.languages) {
            updateFields.languages = JSON.stringify(updateData.languages);
        }
        if (updateData.customSections || updateData.custom_sections) {
            updateFields.custom_sections = JSON.stringify(updateData.customSections || updateData.custom_sections);
        }
        if (updateData.settings) {
            updateFields.settings = JSON.stringify(updateData.settings);
        }

        // Remove undefined fields
        Object.keys(updateFields).forEach(key => {
            if (updateFields[key] === undefined) {
                delete updateFields[key];
            }
        });

        return await this.update(resumeId, updateFields);
    }

    /**
     * Delete resume
     * @param {number} resumeId - Resume ID
     * @returns {Promise} Deletion result
     */
    async deleteResume(resumeId) {
        return await this.delete(resumeId);
    }

    /**
     * Get public resumes with filters
     * @param {Object} filters - Search filters
     * @returns {Promise} Public resumes array
     */
    async getPublicResumes(filters = {}) {
        let query = `
            SELECT r.*, u.first_name, u.last_name
            FROM resumes r
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.is_public = true AND r.status = 'completed'
        `;
        
        const params = [];
        let paramCount = 0;
        
        if (filters.skills && filters.skills.length > 0) {
            paramCount++;
            query += ` AND r.skills::text ILIKE $${paramCount}`;
            params.push(`%${filters.skills.join('%')}%`);
        }
        
        if (filters.location) {
            paramCount++;
            query += ` AND r.personal_info::text ILIKE $${paramCount}`;
            params.push(`%${filters.location}%`);
        }
        
        query += ` ORDER BY r.updated_at DESC`;
        
        if (filters.limit) {
            paramCount++;
            query += ` LIMIT $${paramCount}`;
            params.push(filters.limit);
        }
        
        if (filters.offset) {
            paramCount++;
            query += ` OFFSET $${paramCount}`;
            params.push(filters.offset);
        }
        
        const result = await this.query(query, params);
        return result.rows.map(row => this.formatResumeData(row));
    }

    /**
     * Clone resume
     * @param {number} resumeId - Original resume ID
     * @param {number} newUserId - New user ID
     * @returns {Promise} Cloned resume
     */
    async cloneResume(resumeId, newUserId) {
        const originalResume = await this.getResumeById(resumeId);
        
        if (!originalResume) {
            throw new Error('Resume not found');
        }
        
        const cloneData = {
            user_id: newUserId,
            title: `Copy of ${originalResume.title}`,
            template: originalResume.template,
            status: 'draft',
            personal_info: originalResume.personal_info,
            summary: originalResume.summary,
            experience: originalResume.experience,
            education: originalResume.education,
            skills: originalResume.skills,
            projects: originalResume.projects,
            certifications: originalResume.certifications,
            languages: originalResume.languages,
            custom_sections: originalResume.custom_sections,
            settings: originalResume.settings,
            is_public: false
        };
        
        return await this.createResume(cloneData);
    }

    /**
     * Update download count
     * @param {number} resumeId - Resume ID
     * @returns {Promise} Updated resume
     */
    async incrementDownloadCount(resumeId) {
        const query = `
            UPDATE resumes 
            SET download_count = download_count + 1, last_downloaded = CURRENT_TIMESTAMP 
            WHERE id = $1 
            RETURNING *
        `;
        
        const result = await this.query(query, [resumeId]);
        return result.rows[0];
    }

    /**
     * Format resume data for response
     * @private
     */
    formatResumeData(row) {
        const resume = { ...row };
        
        // Parse JSONB fields
        try {
            if (resume.personal_info) resume.personal_info = JSON.parse(resume.personal_info);
            if (resume.experience) resume.experience = JSON.parse(resume.experience);
            if (resume.education) resume.education = JSON.parse(resume.education);
            if (resume.skills) resume.skills = JSON.parse(resume.skills);
            if (resume.projects) resume.projects = JSON.parse(resume.projects);
            if (resume.certifications) resume.certifications = JSON.parse(resume.certifications);
            if (resume.languages) resume.languages = JSON.parse(resume.languages);
            if (resume.custom_sections) resume.custom_sections = JSON.parse(resume.custom_sections);
            if (resume.settings) resume.settings = JSON.parse(resume.settings);
            if (resume.uploaded_file) resume.uploaded_file = JSON.parse(resume.uploaded_file);
            if (resume.parsed_data) resume.parsed_data = JSON.parse(resume.parsed_data);
        } catch (parseError) {
            console.warn('Error parsing resume JSON fields:', parseError);
        }
        
        // Add computed fields
        resume.personalInfo = resume.personal_info; // Alias for frontend compatibility
        resume.isPublic = resume.is_public;
        resume.downloadCount = resume.download_count;
        resume.lastDownloaded = resume.last_downloaded;
        resume.customSections = resume.custom_sections;
        resume.createdAt = resume.created_at;
        resume.updatedAt = resume.updated_at;
        resume.lastUpdated = resume.updated_at; // Alias for frontend compatibility
        
        return resume;
    }

    /**
     * Get resume count by user
     * @param {number} userId - User ID
     * @returns {Promise} Resume count
     */
    async getResumeCountByUser(userId) {
        const query = 'SELECT COUNT(*) FROM resumes WHERE user_id = $1';
        const result = await this.query(query, [userId]);
        return parseInt(result.rows[0].count);
    }
}

module.exports = Resume;