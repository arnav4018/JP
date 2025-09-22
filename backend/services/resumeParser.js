const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

class ResumeParser {
    constructor() {
        // Common skills database
        this.skillsDatabase = [
            // Programming Languages
            'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
            'kotlin', 'typescript', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash', 'powershell',
            
            // Web Technologies
            'html', 'css', 'react', 'angular', 'vue', 'nodejs', 'express', 'django', 'flask',
            'spring', 'laravel', 'codeigniter', 'bootstrap', 'jquery', 'sass', 'less', 'webpack',
            'gulp', 'grunt', 'babel', 'nextjs', 'nuxtjs', 'gatsby',
            
            // Mobile Development
            'ios', 'android', 'react native', 'flutter', 'xamarin', 'cordova', 'phonegap',
            
            // Databases
            'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server',
            'cassandra', 'dynamodb', 'elasticsearch', 'solr', 'neo4j',
            
            // Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github',
            'terraform', 'ansible', 'puppet', 'chef', 'vagrant', 'ci/cd', 'devops',
            
            // Data Science & AI
            'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'scikit-learn',
            'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter', 'tableau', 'power bi',
            'data analysis', 'statistics', 'nlp', 'computer vision',
            
            // Other Technologies
            'git', 'linux', 'unix', 'windows', 'api', 'rest', 'graphql', 'microservices',
            'agile', 'scrum', 'kanban', 'jira', 'confluence', 'slack', 'figma', 'sketch',
            'photoshop', 'illustrator', 'after effects'
        ];

        // Education patterns
        this.educationPatterns = [
            /bachelor['\s]?(?:of|in|degree)?\s?(?:science|arts|engineering|technology|computer science|information technology)?\s?(?:\(([^)]+)\))?/gi,
            /master['\s]?(?:of|in|degree)?\s?(?:science|arts|engineering|technology|computer science|information technology)?\s?(?:\(([^)]+)\))?/gi,
            /phd|ph\.d|doctorate|doctoral/gi,
            /diploma\s?(?:in|of)?\s?([^,\n\.]+)/gi,
            /b\.?(?:sc|tech|eng|com|a)\b/gi,
            /m\.?(?:sc|tech|eng|com|a|ba)\b/gi,
            /(?:high school|secondary school|12th|intermediate)/gi
        ];

        // Experience patterns
        this.experiencePatterns = [
            /(\d+(?:\.\d+)?)\s*(?:\+\s*)?years?\s*(?:of\s*)?(?:experience|exp)/gi,
            /(\d+(?:\.\d+)?)\s*(?:\+\s*)?yrs?\s*(?:of\s*)?(?:experience|exp)/gi,
            /experience\s*(?:of\s*)?(\d+(?:\.\d+)?)\s*(?:\+\s*)?years?/gi,
            /(\d+(?:\.\d+)?)\s*(?:\+\s*)?year\s*experienced?/gi
        ];

        // Company patterns (common company suffixes)
        this.companyPatterns = [
            /([A-Z][A-Za-z\s&]+(?:Inc|Corp|Corporation|Ltd|Limited|LLC|Co|Company|Technologies|Tech|Systems|Solutions|Services|Consulting|Group|Holdings))\b/g
        ];

        // Email pattern
        this.emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

        // Phone pattern
        this.phonePattern = /(?:\+?1[-.\s]?)?(?:\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}|(?:\+?91[-.\s]?)?(?:\(?[0-9]{3,4}\)?[-.\s]?)?[0-9]{6,10}/g;

        // Date patterns for work experience
        this.datePatterns = [
            /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/gi,
            /\d{1,2}\/\d{4}/g,
            /\d{4}\s*-\s*(?:present|current|now)/gi,
            /\d{4}\s*-\s*\d{4}/g
        ];
    }

    /**
     * Parse resume from buffer or file path
     * @param {Buffer|string} input - File buffer or file path
     * @returns {Promise<Object>} Parsed resume data
     */
    async parseResume(input) {
        try {
            let pdfBuffer;

            // Handle different input types
            if (Buffer.isBuffer(input)) {
                pdfBuffer = input;
            } else if (typeof input === 'string') {
                if (fs.existsSync(input)) {
                    pdfBuffer = fs.readFileSync(input);
                } else {
                    throw new Error('File not found');
                }
            } else {
                throw new Error('Invalid input type');
            }

            // Extract text from PDF
            const pdfData = await pdfParse(pdfBuffer);
            const rawText = pdfData.text;

            // Parse different sections
            const parsedData = {
                rawText: rawText,
                personalInfo: this.extractPersonalInfo(rawText),
                skills: this.extractSkills(rawText),
                experience: this.extractExperience(rawText),
                education: this.extractEducation(rawText),
                companies: this.extractCompanies(rawText),
                contact: this.extractContactInfo(rawText),
                summary: this.extractSummary(rawText),
                confidence: this.calculateConfidence(rawText)
            };

            return {
                success: true,
                data: parsedData,
                metadata: {
                    pages: pdfData.numpages,
                    parsedAt: new Date(),
                    textLength: rawText.length
                }
            };

        } catch (error) {
            console.error('Resume parsing error:', error);
            return {
                success: false,
                error: error.message,
                data: null
            };
        }
    }

    /**
     * Extract personal information
     */
    extractPersonalInfo(text) {
        const lines = text.split('\n');
        const firstLines = lines.slice(0, 10).join(' ');

        // Extract name (usually in first few lines)
        const namePattern = /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;
        const nameMatch = firstLines.match(namePattern);

        return {
            name: nameMatch ? nameMatch[1].trim() : null,
            email: this.extractEmails(text)[0] || null,
            phone: this.extractPhones(text)[0] || null
        };
    }

    /**
     * Extract skills from resume text
     */
    extractSkills(text) {
        const extractedSkills = [];
        const lowerText = text.toLowerCase();

        // Find skills section
        const skillsSectionRegex = /(?:skills?|technologies?|technical skills?|expertise)[:\s]*([^]*?)(?:\n\s*\n|education|experience|projects?|certifications?|$)/i;
        const skillsSection = text.match(skillsSectionRegex);
        const skillsText = skillsSection ? skillsSection[1] : text;

        // Match skills from database
        this.skillsDatabase.forEach(skill => {
            const skillPattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
            if (skillPattern.test(lowerText)) {
                extractedSkills.push(skill);
            }
        });

        // Remove duplicates and return
        return [...new Set(extractedSkills)];
    }

    /**
     * Extract work experience
     */
    extractExperience(text) {
        const experienceYears = [];
        
        // Extract years of experience mentions
        this.experiencePatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                experienceYears.push(parseFloat(match[1]));
            }
        });

        // Calculate experience from date ranges
        const dateRanges = this.extractDateRanges(text);
        let calculatedExperience = 0;

        dateRanges.forEach(range => {
            if (range.start && range.end) {
                const years = (range.end.getFullYear() - range.start.getFullYear());
                const months = (range.end.getMonth() - range.start.getMonth());
                calculatedExperience += years + (months / 12);
            }
        });

        // Return the maximum experience found
        const maxExperience = Math.max(
            ...experienceYears,
            calculatedExperience,
            0
        );

        return {
            totalYears: Math.round(maxExperience * 10) / 10,
            mentionedExperience: experienceYears,
            calculatedExperience: Math.round(calculatedExperience * 10) / 10,
            workPeriods: dateRanges.length
        };
    }

    /**
     * Extract education information
     */
    extractEducation(text) {
        const education = [];

        this.educationPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                education.push({
                    degree: match[0].trim(),
                    field: match[1] ? match[1].trim() : null
                });
            }
        });

        return education;
    }

    /**
     * Extract company names
     */
    extractCompanies(text) {
        const companies = [];

        this.companyPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                companies.push(match[1].trim());
            }
        });

        return [...new Set(companies)];
    }

    /**
     * Extract contact information
     */
    extractContactInfo(text) {
        return {
            emails: this.extractEmails(text),
            phones: this.extractPhones(text)
        };
    }

    /**
     * Extract summary/objective section
     */
    extractSummary(text) {
        const summaryPatterns = [
            /(?:summary|objective|profile|about)[:\s]*([^]*?)(?:\n\s*\n|experience|education|skills|$)/i,
            /^([^]*?)(?:\n\s*\n|experience|education|skills)/i
        ];

        for (let pattern of summaryPatterns) {
            const match = text.match(pattern);
            if (match && match[1] && match[1].length > 50 && match[1].length < 500) {
                return match[1].trim();
            }
        }

        return null;
    }

    /**
     * Extract email addresses
     */
    extractEmails(text) {
        const emails = [];
        let match;
        while ((match = this.emailPattern.exec(text)) !== null) {
            emails.push(match[1]);
        }
        return [...new Set(emails)];
    }

    /**
     * Extract phone numbers
     */
    extractPhones(text) {
        const phones = [];
        let match;
        while ((match = this.phonePattern.exec(text)) !== null) {
            phones.push(match[0]);
        }
        return [...new Set(phones)];
    }

    /**
     * Extract date ranges from text
     */
    extractDateRanges(text) {
        const ranges = [];
        const lines = text.split('\n');

        lines.forEach(line => {
            // Look for date ranges like "Jan 2020 - Dec 2022"
            const rangePattern = /(\w+\s+\d{4}|\d{1,2}\/\d{4}|\d{4})\s*[-–—to]\s*(\w+\s+\d{4}|\d{1,2}\/\d{4}|\d{4}|present|current|now)/gi;
            let match;

            while ((match = rangePattern.exec(line)) !== null) {
                const startDate = this.parseDate(match[1]);
                const endDate = match[2].toLowerCase().includes('present') || 
                               match[2].toLowerCase().includes('current') || 
                               match[2].toLowerCase().includes('now') 
                               ? new Date() 
                               : this.parseDate(match[2]);

                if (startDate && endDate) {
                    ranges.push({ start: startDate, end: endDate });
                }
            }
        });

        return ranges;
    }

    /**
     * Parse date string to Date object
     */
    parseDate(dateStr) {
        try {
            // Handle "Jan 2020" format
            if (/\w+\s+\d{4}/.test(dateStr)) {
                return new Date(dateStr);
            }
            
            // Handle "01/2020" format
            if (/\d{1,2}\/\d{4}/.test(dateStr)) {
                const parts = dateStr.split('/');
                return new Date(parseInt(parts[1]), parseInt(parts[0]) - 1);
            }
            
            // Handle "2020" format
            if (/^\d{4}$/.test(dateStr)) {
                return new Date(parseInt(dateStr), 0);
            }

            return new Date(dateStr);
        } catch (error) {
            return null;
        }
    }

    /**
     * Calculate confidence score based on extracted data
     */
    calculateConfidence(text) {
        let score = 0;
        let maxScore = 100;

        // Check for basic contact info
        if (this.extractEmails(text).length > 0) score += 20;
        if (this.extractPhones(text).length > 0) score += 15;

        // Check for skills
        const skills = this.extractSkills(text);
        if (skills.length > 0) score += 25;
        if (skills.length > 5) score += 10;

        // Check for experience
        const experience = this.extractExperience(text);
        if (experience.totalYears > 0) score += 20;

        // Check for education
        const education = this.extractEducation(text);
        if (education.length > 0) score += 10;

        // Check for structure (sections)
        const structureKeywords = ['experience', 'education', 'skills', 'summary', 'objective'];
        const foundSections = structureKeywords.filter(keyword => 
            text.toLowerCase().includes(keyword)
        );
        
        if (foundSections.length >= 3) score += 10;

        return Math.min(score / maxScore, 1);
    }

    /**
     * Parse multiple resumes
     */
    async parseMultipleResumes(files) {
        const results = [];

        for (let file of files) {
            try {
                const result = await this.parseResume(file);
                results.push({
                    file: file.originalname || file,
                    ...result
                });
            } catch (error) {
                results.push({
                    file: file.originalname || file,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Validate parsed resume data
     */
    validateParsedData(data) {
        const validation = {
            isValid: true,
            warnings: [],
            errors: []
        };

        // Check required fields
        if (!data.contact.emails || data.contact.emails.length === 0) {
            validation.warnings.push('No email address found');
        }

        if (!data.skills || data.skills.length === 0) {
            validation.warnings.push('No skills identified');
        }

        if (!data.experience || data.experience.totalYears === 0) {
            validation.warnings.push('No work experience found');
        }

        // Check confidence score
        if (data.confidence < 0.5) {
            validation.warnings.push('Low confidence in parsing accuracy');
        }

        validation.isValid = validation.errors.length === 0;

        return validation;
    }
}

// Create and export singleton instance
const resumeParser = new ResumeParser();

module.exports = {
    ResumeParser,
    resumeParser
};