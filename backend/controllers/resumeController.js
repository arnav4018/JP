const Resume = require('../models/Resume');
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
            user: req.user.id,
            ...req.body
        };

        // Auto-populate personal info from user profile if not provided
        if (!resumeData.personalInfo || !resumeData.personalInfo.email) {
            resumeData.personalInfo = {
                ...resumeData.personalInfo,
                firstName: resumeData.personalInfo?.firstName || req.user.firstName,
                lastName: resumeData.personalInfo?.lastName || req.user.lastName,
                email: resumeData.personalInfo?.email || req.user.email,
                phone: resumeData.personalInfo?.phone || req.user.phone
            };
        }

        const resume = await Resume.create(resumeData);

        res.status(201).json({
            success: true,
            message: 'Resume created successfully',
            data: {
                resume
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
        const { page = 1, limit = 10, status, template } = req.query;

        const query = { user: req.user.id };
        if (status) query.status = status;
        if (template) query.template = template;

        const resumes = await Resume.find(query)
            .sort({ updatedAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await Resume.countDocuments(query);

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
                    ...resume.toObject(),
                    statistics: resume.getStatistics()
                }))
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
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check ownership or if resume is public
        if (resume.user.toString() !== req.user.id && !resume.isPublic) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this resume'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                resume: {
                    ...resume.toObject(),
                    statistics: resume.getStatistics()
                }
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
        let resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check ownership
        if (resume.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this resume'
            });
        }

        resume = await Resume.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            message: 'Resume updated successfully',
            data: {
                resume
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
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check ownership
        if (resume.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this resume'
            });
        }

        // Delete associated files if any
        if (resume.uploadedFile?.url) {
            try {
                const fileKey = resume.uploadedFile.url.split('/').pop();
                await uploadHelpers.deleteFromS3(fileKey);
            } catch (fileError) {
                console.log('Error deleting file:', fileError.message);
            }
        }

        await Resume.findByIdAndDelete(req.params.id);

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
        const resume = await Resume.findById(req.params.id).populate('user', 'firstName lastName');

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check ownership or if resume is public
        if (resume.user._id.toString() !== req.user.id && !resume.isPublic) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to download this resume'
            });
        }

        // Update download count and last downloaded date
        resume.downloadCount += 1;
        resume.lastDownloaded = new Date();
        await resume.save();

        if (format === 'pdf') {
            // Generate PDF
            const resumeData = resume.exportForPDF();
            const pdfBuffer = await pdfGenerator.generateResumePDF(resumeData);

            const fileName = `${resume.personalInfo.firstName}_${resume.personalInfo.lastName}_Resume.pdf`;
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Length', pdfBuffer.length);
            
            res.end(pdfBuffer);

        } else if (format === 'json') {
            // Return JSON data
            const fileName = `${resume.personalInfo.firstName}_${resume.personalInfo.lastName}_Resume.json`;
            
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            
            res.json({
                success: true,
                data: resume.exportForPDF()
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
        const resume = await Resume.findById(req.params.id);

        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check ownership or if resume is public
        if (resume.user.toString() !== req.user.id && !resume.isPublic) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to preview this resume'
            });
        }

        // Generate preview image
        const resumeData = resume.exportForPDF();
        const previewBuffer = await pdfGenerator.generatePreview(resumeData);

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
            user: req.user.id,
            title: `Parsed from ${req.file.originalname}`,
            personalInfo: {
                firstName: parsedData.personalInfo.name?.split(' ')[0] || req.user.firstName,
                lastName: parsedData.personalInfo.name?.split(' ').slice(1).join(' ') || req.user.lastName,
                email: parsedData.personalInfo.email || req.user.email,
                phone: parsedData.personalInfo.phone || req.user.phone
            },
            summary: parsedData.summary,
            skills: {
                technical: parsedData.skills.map(skill => ({
                    name: skill,
                    level: 'intermediate'
                })),
                soft: [],
                languages: []
            },
            parsedData: {
                rawText: parsedData.rawText,
                extractedSkills: parsedData.skills,
                extractedExperience: parsedData.experience.totalYears,
                extractedCompanies: parsedData.companies,
                extractedEducation: parsedData.education.map(edu => edu.degree),
                confidence: parsedData.confidence
            },
            uploadedFile: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                url: req.file.location || req.file.path,
                uploadDate: new Date()
            },
            status: 'draft'
        };

        const resume = await Resume.create(resumeData);

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
            experience: experience ? parseInt(experience) : undefined,
            location,
            page,
            limit
        };

        const resumes = await Resume.findPublicResumes(filters);
        const total = await Resume.countDocuments({ isPublic: true, status: 'active' });

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
                    id: resume._id,
                    title: resume.title,
                    personalInfo: {
                        firstName: resume.personalInfo.firstName,
                        lastName: resume.personalInfo.lastName,
                        location: resume.personalInfo.location
                    },
                    summary: resume.summary,
                    skills: resume.skills,
                    totalExperience: resume.totalExperience,
                    template: resume.template,
                    user: resume.user,
                    updatedAt: resume.updatedAt
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
        const originalResume = await Resume.findById(req.params.id);

        if (!originalResume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // Check if user can clone this resume (own resume or public resume)
        if (originalResume.user.toString() !== req.user.id && !originalResume.isPublic) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to clone this resume'
            });
        }

        // Create clone
        const resumeData = originalResume.toObject();
        delete resumeData._id;
        delete resumeData.createdAt;
        delete resumeData.updatedAt;
        delete resumeData.__v;
        delete resumeData.uploadedFile; // Don't copy uploaded file reference

        resumeData.user = req.user.id;
        resumeData.title = `Copy of ${resumeData.title}`;
        resumeData.status = 'draft';
        resumeData.isPublic = false;
        resumeData.downloadCount = 0;
        resumeData.lastDownloaded = undefined;

        const clonedResume = await Resume.create(resumeData);

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