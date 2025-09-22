const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

// S3 bucket configuration
const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'job-portal-uploads';

// File type validation
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        resumes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    };

    const uploadType = req.route.path.includes('resume') ? 'resumes' : 
                      req.route.path.includes('avatar') || req.route.path.includes('logo') ? 'images' : 
                      'documents';

    if (allowedTypes[uploadType].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Allowed types for ${uploadType}: ${allowedTypes[uploadType].join(', ')}`), false);
    }
};

// Generate file name
const generateFileName = (file, userId, type) => {
    const timestamp = Date.now();
    const uuid = uuidv4().split('-')[0];
    const extension = path.extname(file.originalname);
    return `${type}/${userId}/${timestamp}-${uuid}${extension}`;
};

// S3 upload configuration
const s3Storage = multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    acl: 'public-read',
    metadata: (req, file, cb) => {
        cb(null, {
            fieldName: file.fieldname,
            originalName: file.originalname,
            uploadedBy: req.user ? req.user.id : 'anonymous',
            uploadDate: new Date().toISOString()
        });
    },
    key: (req, file, cb) => {
        const userId = req.user ? req.user.id : 'anonymous';
        let type = 'documents';
        
        if (req.route.path.includes('resume')) type = 'resumes';
        else if (req.route.path.includes('avatar')) type = 'avatars';
        else if (req.route.path.includes('logo')) type = 'logos';
        
        const fileName = generateFileName(file, userId, type);
        cb(null, fileName);
    }
});

// Local storage configuration (fallback)
const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/documents';
        
        if (req.route.path.includes('resume')) uploadPath = 'uploads/resumes';
        else if (req.route.path.includes('avatar')) uploadPath = 'uploads/avatars';
        else if (req.route.path.includes('logo')) uploadPath = 'uploads/logos';
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const userId = req.user ? req.user.id : 'anonymous';
        const fileName = generateFileName(file, userId, 'local');
        cb(null, fileName.replace('local/', ''));
    }
});

// File size limits
const limits = {
    fileSize: {
        resumes: 5 * 1024 * 1024, // 5MB
        images: 2 * 1024 * 1024,  // 2MB
        documents: 10 * 1024 * 1024 // 10MB
    }
};

// Create multer instance based on environment
const createUpload = (type = 'documents') => {
    const useS3 = process.env.USE_S3_STORAGE === 'true' && process.env.AWS_ACCESS_KEY_ID;
    const storage = useS3 ? s3Storage : localStorage;
    
    let fileSize;
    if (type === 'resumes') fileSize = limits.fileSize.resumes;
    else if (type === 'images') fileSize = limits.fileSize.images;
    else fileSize = limits.fileSize.documents;

    return multer({
        storage: storage,
        fileFilter: fileFilter,
        limits: { fileSize }
    });
};

// Upload configurations for different file types
const uploadConfigs = {
    resume: createUpload('resumes'),
    avatar: createUpload('images'),
    logo: createUpload('images'),
    document: createUpload('documents')
};

// Helper functions
const uploadHelpers = {
    // Delete file from S3
    deleteFromS3: async (fileKey) => {
        if (!process.env.USE_S3_STORAGE) return;
        
        try {
            await s3.deleteObject({
                Bucket: BUCKET_NAME,
                Key: fileKey
            }).promise();
            
            console.log(`File deleted from S3: ${fileKey}`);
        } catch (error) {
            console.error('Error deleting file from S3:', error);
            throw error;
        }
    },

    // Generate signed URL for private files
    generateSignedUrl: (fileKey, expires = 3600) => {
        if (!process.env.USE_S3_STORAGE) {
            return `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${fileKey}`;
        }

        return s3.getSignedUrl('getObject', {
            Bucket: BUCKET_NAME,
            Key: fileKey,
            Expires: expires
        });
    },

    // Get file metadata from S3
    getFileMetadata: async (fileKey) => {
        if (!process.env.USE_S3_STORAGE) return null;
        
        try {
            const response = await s3.headObject({
                Bucket: BUCKET_NAME,
                Key: fileKey
            }).promise();
            
            return {
                size: response.ContentLength,
                lastModified: response.LastModified,
                contentType: response.ContentType,
                metadata: response.Metadata
            };
        } catch (error) {
            console.error('Error getting file metadata:', error);
            return null;
        }
    },

    // Copy file within S3
    copyFile: async (sourceKey, destinationKey) => {
        if (!process.env.USE_S3_STORAGE) return;
        
        try {
            await s3.copyObject({
                Bucket: BUCKET_NAME,
                CopySource: `${BUCKET_NAME}/${sourceKey}`,
                Key: destinationKey
            }).promise();
            
            console.log(`File copied in S3: ${sourceKey} -> ${destinationKey}`);
        } catch (error) {
            console.error('Error copying file in S3:', error);
            throw error;
        }
    },

    // Check if file exists
    fileExists: async (fileKey) => {
        if (!process.env.USE_S3_STORAGE) {
            const fs = require('fs');
            const filePath = path.join(__dirname, '..', 'uploads', fileKey);
            return fs.existsSync(filePath);
        }
        
        try {
            await s3.headObject({
                Bucket: BUCKET_NAME,
                Key: fileKey
            }).promise();
            return true;
        } catch (error) {
            return false;
        }
    }
};

// Middleware to handle upload errors
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large',
                details: 'Please upload a file smaller than the allowed limit'
            });
        }
        
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files',
                details: 'Maximum number of files exceeded'
            });
        }
        
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                message: 'Unexpected file field',
                details: 'File uploaded to unexpected field'
            });
        }
    }
    
    if (error.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            message: 'Invalid file type',
            details: error.message
        });
    }
    
    return res.status(500).json({
        success: false,
        message: 'File upload error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
};

module.exports = {
    uploadConfigs,
    uploadHelpers,
    handleUploadError,
    s3,
    BUCKET_NAME
};