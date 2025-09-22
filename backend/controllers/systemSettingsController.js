const SystemSettings = require('../models/SystemSettings');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Initialize default system settings
 * @route   POST /api/settings/initialize
 * @access  Private (Super Admin)
 */
exports.initializeSettings = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can initialize system settings', 403));
    }
    
    const results = await SystemSettings.initializeDefaults();
    
    res.status(201).json({
        status: 'success',
        data: {
            results
        }
    });
});

/**
 * @desc    Get all system settings
 * @route   GET /api/settings
 * @access  Private (Admin)
 */
exports.getAllSettings = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can view system settings', 403));
    }
    
    const { category, environment, visible } = req.query;
    
    // Build filter
    const filter = {};
    if (category) filter.category = category;
    if (environment) filter.environment = environment;
    if (visible !== undefined) filter.isVisible = visible === 'true';
    
    const settings = await SystemSettings.find(filter)
        .populate('lastUpdatedBy', 'name email')
        .populate('changeHistory.changedBy', 'name email')
        .sort({ category: 1, key: 1 });
    
    res.status(200).json({
        status: 'success',
        results: settings.length,
        data: {
            settings
        }
    });
});

/**
 * @desc    Get settings by category
 * @route   GET /api/settings/category/:category
 * @access  Private (Admin)
 */
exports.getSettingsByCategory = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can view system settings', 403));
    }
    
    const { category } = req.params;
    const { environment } = req.query;
    
    const settings = await SystemSettings.getByCategory(category, environment);
    
    res.status(200).json({
        status: 'success',
        data: {
            category,
            settings
        }
    });
});

/**
 * @desc    Get a specific setting
 * @route   GET /api/settings/:category/:key
 * @access  Private (Admin)
 */
exports.getSetting = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can view system settings', 403));
    }
    
    const { category, key } = req.params;
    const { environment } = req.query;
    
    const setting = await SystemSettings.findOne({ 
        category, 
        key, 
        environment: environment || 'production'
    })
    .populate('lastUpdatedBy', 'name email')
    .populate('changeHistory.changedBy', 'name email');
    
    if (!setting) {
        return next(new AppError('Setting not found', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            setting
        }
    });
});

/**
 * @desc    Create a new setting
 * @route   POST /api/settings
 * @access  Private (Admin)
 */
exports.createSetting = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can create system settings', 403));
    }
    
    // Check if setting already exists
    const existingSetting = await SystemSettings.findOne({
        category: req.body.category,
        key: req.body.key,
        environment: req.body.environment || 'production'
    });
    
    if (existingSetting) {
        return next(new AppError('Setting already exists', 400));
    }
    
    req.body.lastUpdatedBy = req.user.id;
    
    const setting = await SystemSettings.create(req.body);
    
    res.status(201).json({
        status: 'success',
        data: {
            setting
        }
    });
});

/**
 * @desc    Update a setting value
 * @route   PUT /api/settings/:category/:key
 * @access  Private (Admin)
 */
exports.updateSetting = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can update system settings', 403));
    }
    
    const { category, key } = req.params;
    const { value, reason } = req.body;
    
    if (value === undefined) {
        return next(new AppError('Setting value is required', 400));
    }
    
    const setting = await SystemSettings.setValue(category, key, value, req.user.id, reason);
    
    res.status(200).json({
        status: 'success',
        data: {
            setting
        }
    });
});

/**
 * @desc    Update multiple settings
 * @route   PUT /api/settings/bulk
 * @access  Private (Admin)
 */
exports.bulkUpdateSettings = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can update system settings', 403));
    }
    
    const { updates } = req.body;
    
    if (!updates || !Array.isArray(updates)) {
        return next(new AppError('Updates array is required', 400));
    }
    
    const results = await SystemSettings.bulkUpdate(updates, req.user.id);
    
    res.status(200).json({
        status: 'success',
        data: {
            results
        }
    });
});

/**
 * @desc    Reset a setting to its default value
 * @route   POST /api/settings/:category/:key/reset
 * @access  Private (Admin)
 */
exports.resetSetting = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can reset system settings', 403));
    }
    
    const { category, key } = req.params;
    const { reason } = req.body;
    
    const setting = await SystemSettings.findOne({ category, key });
    
    if (!setting) {
        return next(new AppError('Setting not found', 404));
    }
    
    await setting.resetToDefault(req.user.id, reason || 'Reset to default');
    
    res.status(200).json({
        status: 'success',
        data: {
            setting
        }
    });
});

/**
 * @desc    Get setting value (for internal use by other controllers)
 * @route   GET /api/settings/:category/:key/value
 * @access  Private (Admin)
 */
exports.getSettingValue = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can view system settings', 403));
    }
    
    const { category, key } = req.params;
    const { environment } = req.query;
    
    try {
        const value = await SystemSettings.getValue(category, key, environment);
        
        res.status(200).json({
            status: 'success',
            data: {
                category,
                key,
                value
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 404));
    }
});

/**
 * @desc    Get all setting categories
 * @route   GET /api/settings/categories
 * @access  Private (Admin)
 */
exports.getCategories = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can view system settings', 403));
    }
    
    const categories = SystemSettings.getCategories();
    
    // Get count of settings per category
    const categoryCounts = await SystemSettings.aggregate([
        {
            $group: {
                _id: '$category',
                count: { $sum: 1 },
                visibleCount: {
                    $sum: { $cond: ['$isVisible', 1, 0] }
                },
                editableCount: {
                    $sum: { $cond: ['$isEditable', 1, 0] }
                }
            }
        }
    ]);
    
    const categoriesWithCounts = categories.map(category => {
        const count = categoryCounts.find(c => c._id === category);
        return {
            name: category,
            totalSettings: count?.count || 0,
            visibleSettings: count?.visibleCount || 0,
            editableSettings: count?.editableCount || 0
        };
    });
    
    res.status(200).json({
        status: 'success',
        data: {
            categories: categoriesWithCounts
        }
    });
});

/**
 * @desc    Delete a setting (soft delete by hiding it)
 * @route   DELETE /api/settings/:category/:key
 * @access  Private (Admin)
 */
exports.deleteSetting = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can delete system settings', 403));
    }
    
    const { category, key } = req.params;
    
    const setting = await SystemSettings.findOne({ category, key });
    
    if (!setting) {
        return next(new AppError('Setting not found', 404));
    }
    
    // Soft delete by making it invisible and non-editable
    setting.isVisible = false;
    setting.isEditable = false;
    setting.lastUpdatedBy = req.user.id;
    setting.changeReason = 'Setting deleted via API';
    
    await setting.save();
    
    res.status(200).json({
        status: 'success',
        message: 'Setting has been hidden successfully'
    });
});

/**
 * @desc    Export settings configuration
 * @route   GET /api/settings/export
 * @access  Private (Admin)
 */
exports.exportSettings = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can export system settings', 403));
    }
    
    const { category, environment } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (environment) filter.environment = environment;
    
    const settings = await SystemSettings.find(filter)
        .select('-changeHistory -__v -_id')
        .lean();
    
    // Transform settings for export
    const exportData = {
        exportedAt: new Date(),
        exportedBy: req.user.id,
        totalSettings: settings.length,
        settings: settings.map(setting => ({
            category: setting.category,
            key: setting.key,
            value: setting.value,
            valueType: setting.valueType,
            name: setting.name,
            description: setting.description,
            defaultValue: setting.defaultValue,
            validation: setting.validation,
            isEditable: setting.isEditable,
            isVisible: setting.isVisible,
            isEncrypted: setting.isEncrypted,
            environment: setting.environment
        }))
    };
    
    res.status(200).json({
        status: 'success',
        data: exportData
    });
});

/**
 * @desc    Import settings configuration
 * @route   POST /api/settings/import
 * @access  Private (Admin)
 */
exports.importSettings = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can import system settings', 403));
    }
    
    const { settings, overwrite = false } = req.body;
    
    if (!settings || !Array.isArray(settings)) {
        return next(new AppError('Settings array is required', 400));
    }
    
    const results = [];
    
    for (const settingData of settings) {
        try {
            const existingSetting = await SystemSettings.findOne({
                category: settingData.category,
                key: settingData.key,
                environment: settingData.environment || 'production'
            });
            
            if (existingSetting && !overwrite) {
                results.push({
                    success: false,
                    setting: `${settingData.category}.${settingData.key}`,
                    error: 'Setting exists and overwrite is disabled'
                });
                continue;
            }
            
            if (existingSetting && overwrite) {
                // Update existing setting
                existingSetting.value = settingData.value;
                existingSetting.lastUpdatedBy = req.user.id;
                existingSetting.changeReason = 'Imported via API';
                
                await existingSetting.save();
                
                results.push({
                    success: true,
                    setting: `${settingData.category}.${settingData.key}`,
                    action: 'updated'
                });
            } else {
                // Create new setting
                await SystemSettings.create({
                    ...settingData,
                    lastUpdatedBy: req.user.id
                });
                
                results.push({
                    success: true,
                    setting: `${settingData.category}.${settingData.key}`,
                    action: 'created'
                });
            }
        } catch (error) {
            results.push({
                success: false,
                setting: `${settingData.category}.${settingData.key}`,
                error: error.message
            });
        }
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            results
        }
    });
});

/**
 * @desc    Get setting history
 * @route   GET /api/settings/:category/:key/history
 * @access  Private (Admin)
 */
exports.getSettingHistory = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can view setting history', 403));
    }
    
    const { category, key } = req.params;
    
    const setting = await SystemSettings.findOne({ category, key })
        .populate('changeHistory.changedBy', 'name email')
        .select('changeHistory category key name');
    
    if (!setting) {
        return next(new AppError('Setting not found', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            category: setting.category,
            key: setting.key,
            name: setting.name,
            history: setting.changeHistory.sort((a, b) => b.changedAt - a.changedAt)
        }
    });
});

/**
 * @desc    Validate setting value without saving
 * @route   POST /api/settings/validate
 * @access  Private (Admin)
 */
exports.validateSetting = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new AppError('Only administrators can validate system settings', 403));
    }
    
    const { category, key, value, valueType, validation } = req.body;
    
    if (!category || !key || value === undefined || !valueType) {
        return next(new AppError('Category, key, value, and valueType are required', 400));
    }
    
    // Create a temporary setting instance for validation
    const tempSetting = new SystemSettings({
        category,
        key,
        value,
        valueType,
        validation: validation || {},
        name: 'temp_validation',
        lastUpdatedBy: req.user.id
    });
    
    // Validate the setting
    const typeValid = tempSetting.validateValueType();
    const valueError = tempSetting.validateValue();
    
    res.status(200).json({
        status: 'success',
        data: {
            valid: typeValid && !valueError,
            typeValid,
            valueError,
            category,
            key,
            value,
            valueType
        }
    });
});

module.exports = exports;