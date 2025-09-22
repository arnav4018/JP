const { pool } = require('../config/database');

/**
 * Base Model class for PostgreSQL operations
 * Provides common database operations for all models
 */
class BaseModel {
    constructor(tableName) {
        this.tableName = tableName;
        this.pool = pool;
    }

    /**
     * Execute a query with parameters
     * @param {string} query - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise} Query result
     */
    async query(query, params = []) {
        try {
            const result = await this.pool.query(query, params);
            return result;
        } catch (error) {
            console.error(`Database query error in ${this.tableName}:`, error.message);
            throw error;
        }
    }

    /**
     * Find a single record by ID
     * @param {number} id - Record ID
     * @returns {Promise} Single record or null
     */
    async findById(id) {
        const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
        const result = await this.query(query, [id]);
        return result.rows[0] || null;
    }

    /**
     * Find records with conditions
     * @param {Object} conditions - Where conditions
     * @param {Object} options - Query options (limit, offset, orderBy)
     * @returns {Promise} Array of records
     */
    async find(conditions = {}, options = {}) {
        let query = `SELECT * FROM ${this.tableName}`;
        const params = [];
        let paramCount = 0;

        // Build WHERE clause
        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions).map(key => {
                paramCount++;
                params.push(conditions[key]);
                return `${key} = $${paramCount}`;
            }).join(' AND ');
            query += ` WHERE ${whereClause}`;
        }

        // Add ORDER BY
        if (options.orderBy) {
            query += ` ORDER BY ${options.orderBy}`;
        }

        // Add LIMIT
        if (options.limit) {
            paramCount++;
            params.push(options.limit);
            query += ` LIMIT $${paramCount}`;
        }

        // Add OFFSET
        if (options.offset) {
            paramCount++;
            params.push(options.offset);
            query += ` OFFSET $${paramCount}`;
        }

        const result = await this.query(query, params);
        return result.rows;
    }

    /**
     * Create a new record
     * @param {Object} data - Record data
     * @returns {Promise} Created record
     */
    async create(data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
        
        const query = `
            INSERT INTO ${this.tableName} (${keys.join(', ')})
            VALUES (${placeholders})
            RETURNING *
        `;
        
        const result = await this.query(query, values);
        return result.rows[0];
    }

    /**
     * Update a record by ID
     * @param {number} id - Record ID
     * @param {Object} data - Updated data
     * @returns {Promise} Updated record
     */
    async update(id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        
        const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
        
        const query = `
            UPDATE ${this.tableName}
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;
        
        const result = await this.query(query, [id, ...values]);
        return result.rows[0];
    }

    /**
     * Delete a record by ID
     * @param {number} id - Record ID
     * @returns {Promise} Boolean indicating success
     */
    async delete(id) {
        const query = `DELETE FROM ${this.tableName} WHERE id = $1`;
        const result = await this.query(query, [id]);
        return result.rowCount > 0;
    }

    /**
     * Count records with conditions
     * @param {Object} conditions - Where conditions
     * @returns {Promise} Number of records
     */
    async count(conditions = {}) {
        let query = `SELECT COUNT(*) FROM ${this.tableName}`;
        const params = [];
        let paramCount = 0;

        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions).map(key => {
                paramCount++;
                params.push(conditions[key]);
                return `${key} = $${paramCount}`;
            }).join(' AND ');
            query += ` WHERE ${whereClause}`;
        }

        const result = await this.query(query, params);
        return parseInt(result.rows[0].count);
    }

    /**
     * Check if record exists
     * @param {Object} conditions - Where conditions
     * @returns {Promise} Boolean indicating existence
     */
    async exists(conditions) {
        const count = await this.count(conditions);
        return count > 0;
    }
}

module.exports = BaseModel;