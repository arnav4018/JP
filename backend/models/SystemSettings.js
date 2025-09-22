const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    // Setting Category
    category: {
        type: String,
        enum: [
            'payment',
            'referral',
            'subscription',
            'notification',
            'security',
            'general',
            'analytics',
            'api',
            'email'
        ],
        required: [true, 'Settings category is required'],
        index: true
    },
    
    // Setting Key (unique within category)
    key: {
        type: String,
        required: [true, 'Setting key is required'],
        index: true
    },
    
    // Setting Value
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Setting value is required']
    },
    
    // Value Type for validation
    valueType: {
        type: String,
        enum: ['string', 'number', 'boolean', 'array', 'object', 'date'],
        required: [true, 'Value type is required']
    },
    
    // Setting Name (human readable)
    name: {
        type: String,
        required: [true, 'Setting name is required'],
        maxlength: [100, 'Setting name cannot exceed 100 characters']
    },
    
    // Setting Description
    description: {
        type: String,
        maxlength: [500, 'Setting description cannot exceed 500 characters']
    },
    
    // Default Value
    defaultValue: {
        type: mongoose.Schema.Types.Mixed
    },
    
    // Validation Rules
    validation: {
        required: {
            type: Boolean,
            default: false
        },
        min: Number,
        max: Number,
        minLength: Number,
        maxLength: Number,
        pattern: String,
        allowedValues: [mongoose.Schema.Types.Mixed]
    },
    
    // Setting Metadata
    isEditable: {
        type: Boolean,
        default: true
    },
    
    isVisible: {
        type: Boolean,
        default: true
    },
    
    isEncrypted: {
        type: Boolean,
        default: false
    },
    
    requiresRestart: {
        type: Boolean,
        default: false
    },
    
    // Access Control
    accessLevel: {
        type: String,
        enum: ['super_admin', 'admin', 'moderator', 'system'],
        default: 'admin'
    },
    
    // Version Control
    version: {
        type: Number,
        default: 1
    },
    
    // History of changes
    changeHistory: [{
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        changedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        changedAt: {
            type: Date,
            default: Date.now
        },
        reason: String
    }],
    
    // Last updated by
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Environment specific
    environment: {
        type: String,
        enum: ['development', 'staging', 'production'],
        default: 'production'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Compound unique index for category + key combination
systemSettingsSchema.index({ category: 1, key: 1 }, { unique: true });

// Index for environment-specific settings
systemSettingsSchema.index({ category: 1, environment: 1 });

// Pre-save validation middleware
systemSettingsSchema.pre('save', function(next) {
    // Validate value against type
    if (!this.validateValueType()) {
        return next(new Error(`Value type mismatch. Expected ${this.valueType}, got ${typeof this.value}`));
    }
    
    // Validate value against rules
    const validationError = this.validateValue();
    if (validationError) {
        return next(new Error(validationError));
    }
    
    // Encrypt sensitive values
    if (this.isEncrypted && this.isModified('value')) {
        this.value = this.encryptValue(this.value);
    }
    
    // Track changes in history
    if (this.isModified('value') && !this.isNew) {
        const oldDoc = this.$__.originalDocument;
        if (oldDoc && oldDoc.value !== this.value) {
            this.changeHistory.push({
                oldValue: oldDoc.value,
                newValue: this.value,
                changedBy: this.lastUpdatedBy,
                changedAt: new Date(),
                reason: this.changeReason || 'Updated via API'
            });
            
            this.version += 1;
        }
    }
    
    next();
});

// Method to validate value type
systemSettingsSchema.methods.validateValueType = function() {
    const actualType = Array.isArray(this.value) ? 'array' : typeof this.value;
    
    if (this.valueType === 'object' && actualType === 'object' && !Array.isArray(this.value)) {
        return true;
    }
    
    if (this.valueType === 'date' && (this.value instanceof Date || typeof this.value === 'string')) {
        return true;
    }
    
    return this.valueType === actualType;
};

// Method to validate value against rules
systemSettingsSchema.methods.validateValue = function() {
    const { validation, value } = this;
    
    if (!validation) return null;
    
    // Required check
    if (validation.required && (value === null || value === undefined || value === '')) {
        return 'Value is required';
    }
    
    // Skip further validation if value is empty and not required
    if (!validation.required && (value === null || value === undefined || value === '')) {
        return null;
    }
    
    // Number validations
    if (this.valueType === 'number') {
        if (validation.min !== undefined && value < validation.min) {
            return `Value must be at least ${validation.min}`;
        }
        if (validation.max !== undefined && value > validation.max) {
            return `Value must be at most ${validation.max}`;
        }
    }
    
    // String validations
    if (this.valueType === 'string') {
        if (validation.minLength !== undefined && value.length < validation.minLength) {
            return `Value must be at least ${validation.minLength} characters long`;
        }
        if (validation.maxLength !== undefined && value.length > validation.maxLength) {
            return `Value must be at most ${validation.maxLength} characters long`;
        }
        if (validation.pattern) {
            const regex = new RegExp(validation.pattern);
            if (!regex.test(value)) {
                return 'Value does not match required pattern';
            }
        }
    }
    
    // Array validations
    if (this.valueType === 'array') {
        if (validation.minLength !== undefined && value.length < validation.minLength) {
            return `Array must have at least ${validation.minLength} items`;
        }
        if (validation.maxLength !== undefined && value.length > validation.maxLength) {
            return `Array must have at most ${validation.maxLength} items`;
        }
    }
    
    // Allowed values check
    if (validation.allowedValues && validation.allowedValues.length > 0) {
        const isAllowed = validation.allowedValues.some(allowedValue => 
            JSON.stringify(allowedValue) === JSON.stringify(value)
        );
        if (!isAllowed) {
            return `Value must be one of: ${validation.allowedValues.join(', ')}`;
        }
    }
    
    return null;
};

// Method to encrypt sensitive values
systemSettingsSchema.methods.encryptValue = function(value) {
    // Simple base64 encoding (in production, use proper encryption)
    if (typeof value === 'string') {
        return Buffer.from(value).toString('base64');
    }
    return Buffer.from(JSON.stringify(value)).toString('base64');
};

// Method to decrypt sensitive values
systemSettingsSchema.methods.decryptValue = function() {
    if (!this.isEncrypted) return this.value;
    
    try {
        const decrypted = Buffer.from(this.value, 'base64').toString();
        try {
            return JSON.parse(decrypted);
        } catch {
            return decrypted;
        }
    } catch (error) {
        return this.value; // Return as-is if decryption fails
    }
};

// Virtual to get decrypted value
systemSettingsSchema.virtual('decryptedValue').get(function() {
    return this.decryptValue();
});

// Method to reset to default value
systemSettingsSchema.methods.resetToDefault = function(userId, reason = 'Reset to default') {
    if (this.defaultValue !== undefined) {
        this.value = this.defaultValue;
        this.lastUpdatedBy = userId;
        this.changeReason = reason;
        return this.save();
    }
    throw new Error('No default value defined for this setting');
};

// Static method to get settings by category
systemSettingsSchema.statics.getByCategory = async function(category, environment = 'production') {
    const settings = await this.find({ 
        category, 
        environment,
        isVisible: true 
    }).select('-changeHistory -__v');
    
    const result = {};
    settings.forEach(setting => {
        result[setting.key] = setting.isEncrypted ? setting.decryptedValue : setting.value;
    });
    
    return result;
};

// Static method to get all categories
systemSettingsSchema.statics.getCategories = function() {
    return this.schema.paths.category.enumValues;
};

// Static method to bulk update settings
systemSettingsSchema.statics.bulkUpdate = async function(updates, userId) {
    const results = [];
    
    for (const update of updates) {
        try {
            const setting = await this.findOne({
                category: update.category,
                key: update.key
            });
            
            if (!setting) {
                throw new Error(`Setting not found: ${update.category}.${update.key}`);
            }
            
            if (!setting.isEditable) {
                throw new Error(`Setting is not editable: ${update.category}.${update.key}`);
            }
            
            setting.value = update.value;
            setting.lastUpdatedBy = userId;
            setting.changeReason = update.reason || 'Bulk update';
            
            await setting.save();
            results.push({ success: true, setting: update.category + '.' + update.key });
        } catch (error) {
            results.push({ 
                success: false, 
                setting: update.category + '.' + update.key, 
                error: error.message 
            });
        }
    }
    
    return results;
};

// Static method to initialize default settings
systemSettingsSchema.statics.initializeDefaults = async function() {
    const defaultSettings = [
        // Payment Settings
        {
            category: 'payment',
            key: 'job_posting_fee',
            value: 100,
            valueType: 'number',
            name: 'Job Posting Fee',
            description: 'Cost in INR for posting a job',
            defaultValue: 100,
            validation: { required: true, min: 0, max: 10000 }
        },
        {
            category: 'payment',
            key: 'featured_job_fee',
            value: 500,
            valueType: 'number',
            name: 'Featured Job Fee',
            description: 'Additional cost in INR for featuring a job',
            defaultValue: 500,
            validation: { required: true, min: 0, max: 50000 }
        },
        {
            category: 'payment',
            key: 'payment_enabled',
            value: true,
            valueType: 'boolean',
            name: 'Payment System Enabled',
            description: 'Enable/disable the payment system',
            defaultValue: true
        },
        {
            category: 'payment',
            key: 'supported_gateways',
            value: ['razorpay', 'stripe'],
            valueType: 'array',
            name: 'Supported Payment Gateways',
            description: 'List of enabled payment gateways',
            defaultValue: ['razorpay'],
            validation: { required: true, allowedValues: ['razorpay', 'stripe', 'paypal', 'upi'] }
        },
        
        // Referral Settings
        {
            category: 'referral',
            key: 'referral_enabled',
            value: true,
            valueType: 'boolean',
            name: 'Referral System Enabled',
            description: 'Enable/disable the referral system',
            defaultValue: true
        },
        {
            category: 'referral',
            key: 'referral_bonus_candidate',
            value: 50,
            valueType: 'number',
            name: 'Candidate Referral Bonus',
            description: 'Bonus amount for successful candidate referral',
            defaultValue: 50,
            validation: { required: true, min: 0, max: 1000 }
        },
        {
            category: 'referral',
            key: 'referral_bonus_employer',
            value: 100,
            valueType: 'number',
            name: 'Employer Referral Bonus',
            description: 'Bonus amount for successful employer referral',
            defaultValue: 100,
            validation: { required: true, min: 0, max: 1000 }
        },
        {
            category: 'referral',
            key: 'min_payout_amount',
            value: 100,
            valueType: 'number',
            name: 'Minimum Payout Amount',
            description: 'Minimum amount required to request payout',
            defaultValue: 100,
            validation: { required: true, min: 10, max: 1000 }
        },
        
        // General Settings
        {
            category: 'general',
            key: 'site_name',
            value: 'JobPortal',
            valueType: 'string',
            name: 'Site Name',
            description: 'Name of the job portal',
            defaultValue: 'JobPortal',
            validation: { required: true, minLength: 2, maxLength: 50 }
        },
        {
            category: 'general',
            key: 'max_applications_per_job',
            value: 100,
            valueType: 'number',
            name: 'Max Applications Per Job',
            description: 'Maximum number of applications allowed per job',
            defaultValue: 100,
            validation: { required: true, min: 1, max: 1000 }
        },
        {
            category: 'general',
            key: 'job_expiry_days',
            value: 30,
            valueType: 'number',
            name: 'Job Expiry Days',
            description: 'Default number of days before a job expires',
            defaultValue: 30,
            validation: { required: true, min: 1, max: 365 }
        },
        
        // Security Settings
        {
            category: 'security',
            key: 'max_login_attempts',
            value: 5,
            valueType: 'number',
            name: 'Max Login Attempts',
            description: 'Maximum failed login attempts before lockout',
            defaultValue: 5,
            validation: { required: true, min: 3, max: 10 }
        },
        {
            category: 'security',
            key: 'lockout_duration_minutes',
            value: 30,
            valueType: 'number',
            name: 'Lockout Duration (Minutes)',
            description: 'Duration of account lockout after max failed attempts',
            defaultValue: 30,
            validation: { required: true, min: 5, max: 1440 }
        },
        {
            category: 'security',
            key: 'password_min_length',
            value: 8,
            valueType: 'number',
            name: 'Password Minimum Length',
            description: 'Minimum required password length',
            defaultValue: 8,
            validation: { required: true, min: 6, max: 20 }
        },
        
        // Notification Settings
        {
            category: 'notification',
            key: 'email_notifications_enabled',
            value: true,
            valueType: 'boolean',
            name: 'Email Notifications Enabled',
            description: 'Enable/disable email notifications',
            defaultValue: true
        },
        {
            category: 'notification',
            key: 'sms_notifications_enabled',
            value: false,
            valueType: 'boolean',
            name: 'SMS Notifications Enabled',
            description: 'Enable/disable SMS notifications',
            defaultValue: false
        }
    ];
    
    const results = [];
    
    for (const setting of defaultSettings) {
        try {
            const existing = await this.findOne({
                category: setting.category,
                key: setting.key
            });
            
            if (!existing) {
                await this.create(setting);
                results.push({ success: true, setting: `${setting.category}.${setting.key}` });
            } else {
                results.push({ 
                    success: false, 
                    setting: `${setting.category}.${setting.key}`, 
                    error: 'Already exists' 
                });
            }
        } catch (error) {
            results.push({ 
                success: false, 
                setting: `${setting.category}.${setting.key}`, 
                error: error.message 
            });
        }
    }
    
    return results;
};

// Static method to get setting value
systemSettingsSchema.statics.getValue = async function(category, key, environment = 'production') {
    const setting = await this.findOne({ 
        category, 
        key, 
        environment 
    });
    
    if (!setting) {
        throw new Error(`Setting not found: ${category}.${key}`);
    }
    
    return setting.isEncrypted ? setting.decryptedValue : setting.value;
};

// Static method to set setting value
systemSettingsSchema.statics.setValue = async function(category, key, value, userId, reason = 'Updated via API') {
    const setting = await this.findOne({ category, key });
    
    if (!setting) {
        throw new Error(`Setting not found: ${category}.${key}`);
    }
    
    if (!setting.isEditable) {
        throw new Error(`Setting is not editable: ${category}.${key}`);
    }
    
    setting.value = value;
    setting.lastUpdatedBy = userId;
    setting.changeReason = reason;
    
    return await setting.save();
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);