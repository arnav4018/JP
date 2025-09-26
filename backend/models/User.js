const BaseModel = require('./BaseModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class User extends BaseModel {
    constructor() {
        super('users');
    }

    /**
     * Create a new user
     * @param {Object} userData - User data
     * @returns {Promise} Created user
     */
    async createUser(userData) {
        // Hash password before saving
        if (userData.password) {
            const salt = await bcrypt.genSalt(12);
            userData.password_hash = await bcrypt.hash(userData.password, salt);
            delete userData.password; // Remove plain password
        }

        // Set only the essential fields that exist in all versions of the users table
        const userToCreate = {
            first_name: userData.firstName || userData.first_name,
            last_name: userData.lastName || userData.last_name,
            email: userData.email.toLowerCase(),
            password_hash: userData.password_hash,
            role: userData.role || 'candidate',
            is_active: true
        };

        return await this.create(userToCreate);
    }

    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise} User or null
     */
    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await this.query(query, [email.toLowerCase()]);
        return result.rows[0] || null;
    }

    /**
     * Find user by email including password
     * @param {string} email - User email
     * @returns {Promise} User with password or null
     */
    async findByEmailWithPassword(email) {
        return await this.findByEmail(email);
    }

    /**
     * Find user by OAuth ID
     * @param {string} oauthId - OAuth ID
     * @param {string} provider - OAuth provider (google, linkedin)
     * @returns {Promise} User or null
     */
    async findByOAuthId(oauthId, provider) {
        const field = provider === 'google' ? 'google_id' : 'linkedin_id';
        const query = `SELECT * FROM users WHERE ${field} = $1`;
        const result = await this.query(query, [oauthId]);
        return result.rows[0] || null;
    }

    /**
     * Update user profile
     * @param {number} userId - User ID
     * @param {Object} updateData - Data to update
     * @returns {Promise} Updated user
     */
    async updateProfile(userId, updateData) {
        // Convert camelCase to snake_case for database fields
        const dbData = {};
        Object.keys(updateData).forEach(key => {
            switch (key) {
                case 'firstName':
                    dbData.first_name = updateData[key];
                    break;
                case 'lastName':
                    dbData.last_name = updateData[key];
                    break;
                case 'isProfileComplete':
                    dbData.is_profile_complete = updateData[key];
                    break;
                case 'isEmailVerified':
                    dbData.is_email_verified = updateData[key];
                    break;
                case 'isActive':
                    dbData.is_active = updateData[key];
                    break;
                case 'lastLogin':
                    dbData.last_login = updateData[key];
                    break;
                case 'isOnline':
                    dbData.is_online = updateData[key];
                    break;
                case 'lastSeen':
                    dbData.last_seen = updateData[key];
                    break;
                case 'companyName':
                    dbData.company_name = updateData[key];
                    break;
                case 'companyWebsite':
                    dbData.company_website = updateData[key];
                    break;
                case 'companySize':
                    dbData.company_size = updateData[key];
                    break;
                default:
                    dbData[key] = updateData[key];
            }
        });

        return await this.update(userId, dbData);
    }

    /**
     * Compare password
     * @param {string} candidatePassword - Plain text password
     * @param {string} hashedPassword - Hashed password from database
     * @returns {Promise<boolean>} Password match result
     */
    async comparePassword(candidatePassword, hashedPassword) {
        if (!hashedPassword) return false;
        return await bcrypt.compare(candidatePassword, hashedPassword);
    }

    /**
     * Generate JWT token
     * @param {Object} user - User object
     * @returns {string} JWT token
     */
    generateAuthToken(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });
    }

    /**
     * Generate refresh token
     * @param {Object} user - User object
     * @returns {string} Refresh token
     */
    generateRefreshToken(user) {
        const payload = {
            id: user.id,
            type: 'refresh'
        };

        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: process.env.JWT_REFRESH_EXPIRE
        });
    }

    /**
     * Generate email verification token
     * @param {Object} user - User object
     * @returns {Promise} Updated user with verification token
     */
    async generateEmailVerificationToken(user) {
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        
        return await this.update(user.id, {
            email_verification_token: token,
            email_verification_expires: expires
        });
    }

    /**
     * Generate password reset token
     * @param {Object} user - User object
     * @returns {Promise} Updated user with reset token
     */
    async generatePasswordResetToken(user) {
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        
        return await this.update(user.id, {
            password_reset_token: token,
            password_reset_expires: expires
        });
    }

    /**
     * Update user password
     * @param {number} userId - User ID
     * @param {string} newPassword - New password
     * @returns {Promise} Updated user
     */
    async updatePassword(userId, newPassword) {
        const salt = await bcrypt.genSalt(12);
        const password_hash = await bcrypt.hash(newPassword, salt);
        
        return await this.update(userId, {
            password_hash,
            password_reset_token: null,
            password_reset_expires: null
        });
    }

    /**
     * Get full name virtual property
     * @param {Object} user - User object
     * @returns {string} Full name
     */
    getFullName(user) {
        return `${user.first_name} ${user.last_name}`;
    }

    /**
     * Get user profile by ID
     * @param {number} userId - User ID
     * @returns {Promise} User profile or null
     */
    async getProfile(userId) {
        return await this.findById(userId);
    }

    /**
     * Search users with text search
     * @param {string} searchText - Search text
     * @param {Object} options - Query options
     * @returns {Promise} Array of users
     */
    async searchUsers(searchText, options = {}) {
        const query = `
            SELECT * FROM users 
            WHERE 
                first_name ILIKE $1 OR 
                last_name ILIKE $1 OR 
                email ILIKE $1 OR 
                company_name ILIKE $1
            ORDER BY ${options.orderBy || 'created_at DESC'}
            LIMIT ${options.limit || 50}
            OFFSET ${options.offset || 0}
        `;
        
        const result = await this.query(query, [`%${searchText}%`]);
        return result.rows;
    }
}

// Export the class
module.exports = User;
