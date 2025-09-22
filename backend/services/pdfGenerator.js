const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

class PDFGenerator {
    constructor() {
        this.browser = null;
        this.templates = {
            modern: this.generateModernTemplate,
            classic: this.generateClassicTemplate,
            creative: this.generateCreativeTemplate,
            minimal: this.generateMinimalTemplate,
            professional: this.generateProfessionalTemplate
        };
    }

    /**
     * Initialize browser instance
     */
    async initBrowser() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: 'new',
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        return this.browser;
    }

    /**
     * Close browser instance
     */
    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    /**
     * Generate PDF from resume data
     * @param {Object} resumeData - Resume data from database
     * @param {Object} options - PDF generation options
     * @returns {Buffer} PDF buffer
     */
    async generateResumePDF(resumeData, options = {}) {
        try {
            const browser = await this.initBrowser();
            const page = await browser.newPage();

            // Get template function
            const templateName = resumeData.template || 'modern';
            const templateFunction = this.templates[templateName] || this.templates.modern;

            // Generate HTML content
            const htmlContent = templateFunction.call(this, resumeData);

            // Set content and wait for rendering
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            // Generate PDF
            const pdfOptions = {
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0.5in',
                    right: '0.5in',
                    bottom: '0.5in',
                    left: '0.5in'
                },
                ...options
            };

            const pdfBuffer = await page.pdf(pdfOptions);
            await page.close();

            return pdfBuffer;

        } catch (error) {
            console.error('PDF generation error:', error);
            throw new Error(`PDF generation failed: ${error.message}`);
        }
    }

    /**
     * Generate preview image from resume data
     * @param {Object} resumeData - Resume data
     * @returns {Buffer} Image buffer
     */
    async generatePreview(resumeData) {
        try {
            const browser = await this.initBrowser();
            const page = await browser.newPage();

            // Set viewport for preview
            await page.setViewport({ width: 794, height: 1123 }); // A4 proportions

            const templateName = resumeData.template || 'modern';
            const templateFunction = this.templates[templateName] || this.templates.modern;
            const htmlContent = templateFunction.call(this, resumeData);

            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            const imageBuffer = await page.screenshot({
                type: 'png',
                fullPage: true
            });

            await page.close();
            return imageBuffer;

        } catch (error) {
            console.error('Preview generation error:', error);
            throw new Error(`Preview generation failed: ${error.message}`);
        }
    }

    /**
     * Modern template
     */
    generateModernTemplate(resumeData) {
        const { personalInfo, summary, experience, education, skills, projects, certifications } = resumeData;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Resume</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Arial', sans-serif;
                    font-size: 12px;
                    line-height: 1.4;
                    color: #333;
                    background: white;
                }
                
                .resume-container {
                    max-width: 100%;
                    padding: 0;
                }
                
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                
                .header h1 {
                    font-size: 28px;
                    font-weight: bold;
                    margin-bottom: 10px;
                }
                
                .contact-info {
                    font-size: 14px;
                    opacity: 0.9;
                }
                
                .contact-info span {
                    margin: 0 15px;
                }
                
                .content {
                    display: flex;
                    min-height: calc(100vh - 200px);
                }
                
                .main-content {
                    flex: 2;
                    padding: 30px;
                }
                
                .sidebar {
                    flex: 1;
                    background: #f8f9fa;
                    padding: 30px 20px;
                    border-left: 3px solid #667eea;
                }
                
                .section {
                    margin-bottom: 25px;
                }
                
                .section h2 {
                    font-size: 18px;
                    color: #667eea;
                    margin-bottom: 15px;
                    padding-bottom: 5px;
                    border-bottom: 2px solid #e9ecef;
                }
                
                .sidebar h2 {
                    color: #495057;
                    font-size: 16px;
                }
                
                .experience-item, .education-item, .project-item {
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #e9ecef;
                }
                
                .experience-item:last-child,
                .education-item:last-child,
                .project-item:last-child {
                    border-bottom: none;
                }
                
                .job-title {
                    font-weight: bold;
                    font-size: 14px;
                    color: #495057;
                    margin-bottom: 5px;
                }
                
                .company-name {
                    font-weight: 600;
                    color: #667eea;
                    margin-bottom: 3px;
                }
                
                .duration {
                    font-style: italic;
                    color: #6c757d;
                    font-size: 11px;
                    margin-bottom: 8px;
                }
                
                .description {
                    text-align: justify;
                    line-height: 1.5;
                }
                
                .skills-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .skill-tag {
                    background: #667eea;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 15px;
                    font-size: 11px;
                    white-space: nowrap;
                }
                
                .achievements {
                    margin-top: 10px;
                }
                
                .achievements ul {
                    padding-left: 15px;
                }
                
                .achievements li {
                    margin-bottom: 5px;
                }
                
                @media print {
                    .resume-container {
                        width: 100%;
                        height: 100vh;
                    }
                }
            </style>
        </head>
        <body>
            <div class="resume-container">
                <div class="header">
                    <h1>${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}</h1>
                    <div class="contact-info">
                        ${personalInfo?.email ? `<span>📧 ${personalInfo.email}</span>` : ''}
                        ${personalInfo?.phone ? `<span>📞 ${personalInfo.phone}</span>` : ''}
                        ${personalInfo?.location?.city ? `<span>📍 ${personalInfo.location.city}, ${personalInfo.location.state || ''}</span>` : ''}
                        ${personalInfo?.linkedinUrl ? `<span>🔗 LinkedIn</span>` : ''}
                    </div>
                </div>
                
                <div class="content">
                    <div class="main-content">
                        ${summary ? `
                        <div class="section">
                            <h2>Professional Summary</h2>
                            <p class="description">${summary}</p>
                        </div>
                        ` : ''}
                        
                        ${experience && experience.length > 0 ? `
                        <div class="section">
                            <h2>Work Experience</h2>
                            ${experience.map(exp => `
                                <div class="experience-item">
                                    <div class="job-title">${exp.jobTitle}</div>
                                    <div class="company-name">${exp.companyName}</div>
                                    <div class="duration">
                                        ${this.formatDate(exp.startDate)} - ${exp.isCurrentJob ? 'Present' : this.formatDate(exp.endDate)}
                                        ${exp.location?.city ? ` | ${exp.location.city}` : ''}
                                    </div>
                                    ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
                                    ${exp.achievements && exp.achievements.length > 0 ? `
                                        <div class="achievements">
                                            <ul>
                                                ${exp.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                                            </ul>
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                        
                        ${projects && projects.length > 0 ? `
                        <div class="section">
                            <h2>Projects</h2>
                            ${projects.map(project => `
                                <div class="project-item">
                                    <div class="job-title">${project.name}</div>
                                    ${project.description ? `<div class="description">${project.description}</div>` : ''}
                                    ${project.technologies && project.technologies.length > 0 ? `
                                        <div style="margin-top: 8px;">
                                            <strong>Technologies:</strong> ${project.technologies.join(', ')}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="sidebar">
                        ${skills && (skills.technical?.length > 0 || skills.soft?.length > 0) ? `
                        <div class="section">
                            <h2>Skills</h2>
                            ${skills.technical && skills.technical.length > 0 ? `
                                <div style="margin-bottom: 15px;">
                                    <h3 style="font-size: 13px; margin-bottom: 8px;">Technical Skills</h3>
                                    <div class="skills-list">
                                        ${skills.technical.map(skill => `<span class="skill-tag">${skill.name}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${skills.soft && skills.soft.length > 0 ? `
                                <div>
                                    <h3 style="font-size: 13px; margin-bottom: 8px;">Soft Skills</h3>
                                    <div class="skills-list">
                                        ${skills.soft.map(skill => `<span class="skill-tag" style="background: #6c757d;">${skill}</span>`).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        ` : ''}
                        
                        ${education && education.length > 0 ? `
                        <div class="section">
                            <h2>Education</h2>
                            ${education.map(edu => `
                                <div class="education-item">
                                    <div class="job-title">${edu.degree}</div>
                                    <div class="company-name">${edu.institution}</div>
                                    <div class="duration">
                                        ${this.formatDate(edu.startDate)} - ${this.formatDate(edu.endDate)}
                                    </div>
                                    ${edu.fieldOfStudy ? `<div style="margin-top: 5px;"><strong>Field:</strong> ${edu.fieldOfStudy}</div>` : ''}
                                    ${edu.gpa ? `<div><strong>GPA:</strong> ${edu.gpa}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                        
                        ${certifications && certifications.length > 0 ? `
                        <div class="section">
                            <h2>Certifications</h2>
                            ${certifications.map(cert => `
                                <div class="education-item">
                                    <div class="job-title">${cert.name}</div>
                                    <div class="company-name">${cert.issuer}</div>
                                    <div class="duration">${this.formatDate(cert.issueDate)}</div>
                                </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Classic template
     */
    generateClassicTemplate(resumeData) {
        const { personalInfo, summary, experience, education, skills } = resumeData;

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Resume</title>
            <style>
                body {
                    font-family: 'Times New Roman', serif;
                    font-size: 12px;
                    line-height: 1.5;
                    color: #000;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px;
                }
                
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #000;
                }
                
                .header h1 {
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                
                .contact-info {
                    font-size: 11px;
                    line-height: 1.3;
                }
                
                .section {
                    margin-bottom: 25px;
                }
                
                .section h2 {
                    font-size: 16px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 15px;
                    padding-bottom: 5px;
                    border-bottom: 1px solid #000;
                }
                
                .experience-item, .education-item {
                    margin-bottom: 15px;
                }
                
                .job-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: baseline;
                    margin-bottom: 5px;
                }
                
                .job-title {
                    font-weight: bold;
                    font-size: 13px;
                }
                
                .duration {
                    font-style: italic;
                    font-size: 11px;
                }
                
                .company-name {
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                
                .description {
                    text-align: justify;
                    margin-bottom: 10px;
                }
                
                .skills-list {
                    line-height: 1.6;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${personalInfo?.firstName || ''} ${personalInfo?.lastName || ''}</h1>
                <div class="contact-info">
                    ${personalInfo?.email || ''}<br>
                    ${personalInfo?.phone || ''}<br>
                    ${personalInfo?.location?.city ? `${personalInfo.location.city}, ${personalInfo.location.state || ''}` : ''}
                </div>
            </div>
            
            ${summary ? `
            <div class="section">
                <h2>Objective</h2>
                <p class="description">${summary}</p>
            </div>
            ` : ''}
            
            ${experience && experience.length > 0 ? `
            <div class="section">
                <h2>Experience</h2>
                ${experience.map(exp => `
                    <div class="experience-item">
                        <div class="job-header">
                            <div class="job-title">${exp.jobTitle}</div>
                            <div class="duration">${this.formatDate(exp.startDate)} - ${exp.isCurrentJob ? 'Present' : this.formatDate(exp.endDate)}</div>
                        </div>
                        <div class="company-name">${exp.companyName}</div>
                        ${exp.description ? `<div class="description">${exp.description}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${education && education.length > 0 ? `
            <div class="section">
                <h2>Education</h2>
                ${education.map(edu => `
                    <div class="education-item">
                        <div class="job-header">
                            <div class="job-title">${edu.degree} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
                            <div class="duration">${this.formatDate(edu.startDate)} - ${this.formatDate(edu.endDate)}</div>
                        </div>
                        <div class="company-name">${edu.institution}</div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${skills && skills.technical && skills.technical.length > 0 ? `
            <div class="section">
                <h2>Skills</h2>
                <div class="skills-list">${skills.technical.map(skill => skill.name).join(' • ')}</div>
            </div>
            ` : ''}
        </body>
        </html>
        `;
    }

    /**
     * Creative template (placeholder)
     */
    generateCreativeTemplate(resumeData) {
        // For now, return modern template
        return this.generateModernTemplate(resumeData);
    }

    /**
     * Minimal template (placeholder)
     */
    generateMinimalTemplate(resumeData) {
        // For now, return classic template with minimal styling
        return this.generateClassicTemplate(resumeData);
    }

    /**
     * Professional template (placeholder)
     */
    generateProfessionalTemplate(resumeData) {
        // For now, return modern template
        return this.generateModernTemplate(resumeData);
    }

    /**
     * Format date helper
     */
    formatDate(dateString) {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short' 
            });
        } catch (error) {
            return dateString;
        }
    }

    /**
     * Generate multiple resume formats
     */
    async generateMultipleFormats(resumeData, formats = ['pdf']) {
        const results = {};

        try {
            for (let format of formats) {
                switch (format) {
                    case 'pdf':
                        results.pdf = await this.generateResumePDF(resumeData);
                        break;
                    case 'preview':
                        results.preview = await this.generatePreview(resumeData);
                        break;
                    default:
                        console.warn(`Unsupported format: ${format}`);
                }
            }

            return results;

        } catch (error) {
            console.error('Multiple formats generation error:', error);
            throw error;
        }
    }

    /**
     * Save PDF to file system
     */
    async savePDFToFile(pdfBuffer, filename) {
        try {
            const uploadsDir = path.join(__dirname, '..', 'uploads', 'generated_resumes');
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            const filePath = path.join(uploadsDir, filename);
            fs.writeFileSync(filePath, pdfBuffer);

            return filePath;

        } catch (error) {
            console.error('Save PDF error:', error);
            throw error;
        }
    }
}

// Create singleton instance
const pdfGenerator = new PDFGenerator();

// Graceful shutdown
process.on('SIGINT', async () => {
    await pdfGenerator.closeBrowser();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await pdfGenerator.closeBrowser();
    process.exit(0);
});

module.exports = {
    PDFGenerator,
    pdfGenerator
};