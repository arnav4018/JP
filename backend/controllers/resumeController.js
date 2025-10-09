const Resume = require('../models/ResumePostgreSQL');
const { pdfGenerator } = require('../services/pdfGenerator');
const { resumeParser } = require('../services/resumeParser');
const { uploadHelpers } = require('../config/aws');
const path = require('path');

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
const createResume = async (req, res, next) => {
    try {
        const resumeData = {
            ...req.body,
            user_id: req.user.id,
            personalInfo: {
                firstName: req.user.firstName || req.body.personalInfo?.firstName || '',
                lastName: req.user.lastName || req.body.personalInfo?.lastName || '',
                email: req.user.email || req.body.personalInfo?.email || '',
                phone: req.user.phone || req.body.personalInfo?.phone || ''
            }
        };

        const resumeModel = new Resume();
        const newResume = await resumeModel.createResume(resumeData);

        res.status(201).json({
            success: true,
            message: 'Resume created successfully',
            data: {
                resume: newResume
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get user's resumes
// @route   GET /api/resumes
// @access  Private
const getUserResumes = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, orderBy } = req.query;
        
        const resumeModel = new Resume();
        const options = {
            limit: parseInt(limit),
            offset: (page - 1) * limit,
            orderBy: orderBy || 'r.updated_at DESC'
        };
        
        const userResumes = await resumeModel.getResumesByUser(userId, options);
        const totalCount = await resumeModel.getResumeCountByUser(userId);
        
        res.status(200).json({
            success: true,
            count: userResumes.length,
            total: totalCount,
            pagination: {
                page: parseInt(page),
                pages: Math.ceil(totalCount / limit),
                limit: parseInt(limit)
            },
            data: {
                resumes: userResumes
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
const getResume = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const resumeModel = new Resume();
        const resume = await resumeModel.getResumeById(id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check ownership or if resume is public
        if (resume.user_id !== userId && !resume.is_public) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this resume'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                resume
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
const updateResume = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updateData = req.body;
        
        const resumeModel = new Resume();
        
        // Check if resume exists and user owns it
        const existingResume = await resumeModel.getResumeById(id);
        if (!existingResume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }
        
        if (existingResume.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this resume'
            });
        }
        
        // Update resume
        const updatedResume = await resumeModel.updateResume(id, updateData);

        res.status(200).json({
            success: true,
            message: 'Resume updated successfully',
            data: {
                resume: updatedResume
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const resumeModel = new Resume();
        
        // Check if resume exists and user owns it
        const existingResume = await resumeModel.getResumeById(id);
        if (!existingResume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }
        
        if (existingResume.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this resume'
            });
        }

        // Delete associated files if any
        if (existingResume.uploaded_file?.url) {
            try {
                const fileKey = existingResume.uploaded_file.url.split('/').pop();
                await uploadHelpers.deleteFromS3(fileKey);
            } catch (fileError) {
                console.log('Error deleting file:', fileError.message);
            }
        }

        // Delete resume
        await resumeModel.deleteResume(id);

        res.status(200).json({
            success: true,
            message: 'Resume deleted successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Download resume as PDF
// @route   GET /api/resumes/:id/download
// @access  Private
const downloadResume = async (req, res, next) => {
    try {
        const { format = 'pdf' } = req.query;
        const { id } = req.params;
        const userId = req.user.id;
        
        const resumeModel = new Resume();
        const resume = await resumeModel.getResumeById(id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check ownership or if resume is public
        if (resume.user_id !== userId && !resume.is_public) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to download this resume'
            });
        }

        // Update download count and last downloaded date
        if (resume.user_id !== userId && resume.is_public) {
            await resumeModel.incrementDownloadCount(id);
        }

        if (format === 'pdf') {
            // Generate PDF
            const pdfBuffer = await pdfGenerator.generateResumePDF(resume);

            const firstName = resume.personal_info?.firstName || 'Resume';
            const lastName = resume.personal_info?.lastName || '';
            const fileName = `${firstName}_${lastName}_Resume.pdf`.replace(/\s+/g, '_');
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            
            res.end(pdfBuffer);

        } else if (format === 'json') {
            // Return JSON data
            const firstName = resume.personal_info?.firstName || 'Resume';
            const lastName = resume.personal_info?.lastName || '';
            const fileName = `${firstName}_${lastName}_Resume.json`.replace(/\s+/g, '_');
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            
            res.json({
                success: true,
                data: resume
            });

        } else {
            return res.status(400).json({
                success: false,
                message: 'Unsupported format. Use pdf or json'
            });
        }

    } catch (error) {
        next(error);
    }
};

// @desc    Generate resume preview
// @route   GET /api/resumes/:id/preview
// @access  Private
const getResumePreview = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const resumeModel = new Resume();
        const resume = await resumeModel.getResumeById(id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check ownership or if resume is public
        if (resume.user_id !== userId && !resume.is_public) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to preview this resume'
            });
        }

        // Generate preview image
        const previewBuffer = await pdfGenerator.generatePreview(resume);

        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        
        res.end(previewBuffer);

    } catch (error) {
        next(error);
    }
};

// @desc    Upload and parse resume
// @route   POST /api/resumes/upload-parse
// @access  Private
const uploadAndParseResume = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Resume file is required'
            });
        }

        // Parse the uploaded resume
        const parseResult = await resumeParser.parseResume(req.file.buffer || req.file.path);

        if (!parseResult.success) {
            return res.status(400).json({
                success: false,
                message: 'Failed to parse resume',
                error: parseResult.error
            });
        }

        // Create resume from parsed data
        const parsedData = parseResult.data;
        const resumeData = {
            user_id: req.user.id,
            title: `Parsed from ${req.file.originalname}`,
            personalInfo: {
                firstName: parsedData.personalInfo.name?.split(' ')[0] || req.user.firstName,
                lastName: parsedData.personalInfo.name?.split(' ').slice(1).join(' ') || req.user.lastName,
                email: parsedData.personalInfo.email || req.user.email,
                phone: parsedData.personalInfo.phone || req.user.phone
            },
            summary: parsedData.summary,
            skills: parsedData.skills.map(skill => ({
                name: skill,
                level: 'intermediate'
            })),
            parsed_data: {
                rawText: parsedData.rawText,
                extractedSkills: parsedData.skills,
                extractedExperience: parsedData.experience.totalYears,
                extractedCompanies: parsedData.companies,
                extractedEducation: parsedData.education.map(edu => edu.degree),
                confidence: parsedData.confidence
            },
            uploaded_file: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                url: req.file.location || req.file.path,
                uploadDate: new Date()
            },
            status: 'draft'
        };

        const resumeModel = new Resume();
        const resume = await resumeModel.createResume(resumeData);

        res.status(201).json({
            success: true,
            message: 'Resume uploaded and parsed successfully',
            data: {
                resume,
                parseResult: {
                    confidence: parsedData.confidence,
                    extractedFields: {
                        personalInfo: !!parsedData.personalInfo.name,
                        skills: parsedData.skills.length > 0,
                        experience: parsedData.experience.totalYears > 0,
                        education: parsedData.education.length > 0,
                        companies: parsedData.companies.length > 0
                    }
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get public resumes
// @route   GET /api/resumes/public
// @access  Public
const getPublicResumes = async (req, res, next) => {
    try {
        const { skills, experience, location, page = 1, limit = 10 } = req.query;

        const filters = {
            skills: skills ? skills.split(',') : undefined,
            location,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        };

        const resumeModel = new Resume();
        const resumes = await resumeModel.getPublicResumes(filters);
        
        // For total count, we'll use a simple count query
        const totalQuery = `SELECT COUNT(*) FROM resumes WHERE is_public = true AND status = 'completed'`;
        const totalResult = await resumeModel.query(totalQuery);
        const total = parseInt(totalResult.rows[0].count);

        res.status(200).json({
            success: true,
            count: resumes.length,
            total,
            pagination: {
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit)
            },
            data: {
                resumes: resumes.map(resume => ({
                    id: resume.id,
                    title: resume.title,
                    personalInfo: {
                        firstName: resume.personal_info?.firstName,
                        lastName: resume.personal_info?.lastName,
                        location: resume.personal_info?.location
                    },
                    summary: resume.summary,
                    skills: resume.skills,
                    template: resume.template,
                    user: {
                        firstName: resume.first_name,
                        lastName: resume.last_name
                    },
                    updatedAt: resume.updated_at
                }))
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Clone resume
// @route   POST /api/resumes/:id/clone
// @access  Private
const cloneResume = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const resumeModel = new Resume();
        const originalResume = await resumeModel.getResumeById(id);

        if (!originalResume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check if user can clone this resume (own resume or public resume)
        if (originalResume.user_id !== userId && !originalResume.is_public) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to clone this resume'
            });
        }

        // Clone resume using the model method
        const clonedResume = await resumeModel.cloneResume(id, userId);

        res.status(201).json({
            success: true,
            message: 'Resume cloned successfully',
            data: {
                resume: clonedResume
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get resume templates
// @route   GET /api/resumes/templates
// @access  Public
const getResumeTemplates = async (req, res, next) => {
    try {
        const templates = [
            {
                id: 'modern',
                name: 'Modern',
                description: 'A clean, modern design with color accents',
                preview: '/api/templates/modern/preview.png',
                category: 'professional'
            },
            {
                id: 'classic',
                name: 'Classic',
                description: 'Traditional, formal design suitable for conservative industries',
                preview: '/api/templates/classic/preview.png',
                category: 'traditional'
            },
            {
                id: 'creative',
                name: 'Creative',
                description: 'Eye-catching design for creative professionals',
                preview: '/api/templates/creative/preview.png',
                category: 'creative'
            },
            {
                id: 'minimal',
                name: 'Minimal',
                description: 'Clean, minimalist design focusing on content',
                preview: '/api/templates/minimal/preview.png',
                category: 'minimal'
            },
            {
                id: 'professional',
                name: 'Professional',
                description: 'Professional design suitable for corporate roles',
                preview: '/api/templates/professional/preview.png',
                category: 'professional'
            }
        ];

        res.status(200).json({
            success: true,
            data: {
                templates
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createResume,
    getUserResumes,
    getResume,
    updateResume,
    deleteResume,
    downloadResume,
    getResumePreview,
    uploadAndParseResume,
    getPublicResumes,
    cloneResume,
    getResumeTemplates
};