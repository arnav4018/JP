const natural = require('natural');
const _ = require('lodash');

class AIApplicationScoringService {
    constructor() {
        // Initialize tokenizer and stemmer for text processing
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
        this.distance = natural.JaroWinklerDistance;

        // Skill categories and their weights
        this.skillCategories = {
            'programming': { weight: 0.3, keywords: ['programming', 'coding', 'development', 'software'] },
            'framework': { weight: 0.25, keywords: ['framework', 'library', 'tool', 'platform'] },
            'database': { weight: 0.2, keywords: ['database', 'db', 'storage', 'data'] },
            'cloud': { weight: 0.15, keywords: ['cloud', 'aws', 'azure', 'devops'] },
            'other': { weight: 0.1, keywords: [] }
        };

        // Experience level mappings
        this.experienceLevels = {
            'junior': { min: 0, max: 2, multiplier: 0.7 },
            'mid': { min: 2, max: 5, multiplier: 1.0 },
            'senior': { min: 5, max: 10, multiplier: 1.3 },
            'lead': { min: 8, max: 15, multiplier: 1.5 },
            'architect': { min: 10, max: 20, multiplier: 1.7 }
        };

        // Common skill synonyms for better matching
        this.skillSynonyms = {
            'javascript': ['js', 'node', 'nodejs', 'es6', 'es2015', 'typescript', 'ts'],
            'python': ['py', 'django', 'flask', 'fastapi', 'pandas', 'numpy'],
            'java': ['spring', 'springboot', 'hibernate', 'maven', 'gradle'],
            'react': ['reactjs', 'jsx', 'react.js', 'nextjs', 'next.js'],
            'angular': ['angularjs', 'angular2', 'ng', 'typescript'],
            'vue': ['vuejs', 'vue.js', 'nuxt', 'nuxtjs'],
            'aws': ['amazon web services', 'ec2', 's3', 'lambda', 'cloudformation'],
            'docker': ['containerization', 'containers', 'kubernetes', 'k8s'],
            'mongodb': ['mongo', 'nosql', 'document database'],
            'mysql': ['sql', 'relational database', 'rdbms'],
            'postgresql': ['postgres', 'psql', 'relational database']
        };
    }

    /**
     * Score an application based on job requirements and candidate profile
     * @param {Object} jobRequirements - Job posting requirements
     * @param {Object} candidateProfile - Candidate's profile and resume data
     * @returns {Object} Comprehensive scoring breakdown
     */
    scoreApplication(jobRequirements, candidateProfile) {
        try {
            const scores = {
                skillMatch: this.calculateSkillMatchScore(jobRequirements, candidateProfile),
                experienceMatch: this.calculateExperienceScore(jobRequirements, candidateProfile),
                educationMatch: this.calculateEducationScore(jobRequirements, candidateProfile),
                locationMatch: this.calculateLocationScore(jobRequirements, candidateProfile),
                salaryMatch: this.calculateSalaryCompatibility(jobRequirements, candidateProfile),
                overallFit: 0
            };

            // Calculate weighted overall score
            const weights = {
                skillMatch: 0.4,
                experienceMatch: 0.25,
                educationMatch: 0.15,
                locationMatch: 0.1,
                salaryMatch: 0.1
            };

            scores.overallFit = Object.keys(weights).reduce((total, key) => {
                return total + (scores[key] * weights[key]);
            }, 0);

            // Add additional metadata
            const metadata = this.generateScoringMetadata(jobRequirements, candidateProfile, scores);

            return {
                success: true,
                scores: {
                    ...scores,
                    overallFit: Math.round(scores.overallFit * 100) / 100
                },
                metadata,
                scoredAt: new Date()
            };

        } catch (error) {
            console.error('AI Scoring Error:', error);
            return {
                success: false,
                error: error.message,
                scores: this.getDefaultScores(),
                metadata: {},
                scoredAt: new Date()
            };
        }
    }

    /**
     * Calculate skill match score between job requirements and candidate skills
     */
    calculateSkillMatchScore(jobRequirements, candidateProfile) {
        const requiredSkills = this.extractSkills(jobRequirements.skills || []);
        const candidateSkills = this.extractSkills(candidateProfile.skills || []);

        if (requiredSkills.length === 0) {
            return candidateSkills.length > 0 ? 0.8 : 0.5; // Default scoring when no requirements
        }

        let matchedSkills = 0;
        let partialMatches = 0;
        const matchedSkillsList = [];
        const missingSkills = [];

        requiredSkills.forEach(requiredSkill => {
            const normalizedRequired = this.normalizeSkill(requiredSkill);
            let bestMatch = 0;
            let matchedSkill = null;

            candidateSkills.forEach(candidateSkill => {
                const normalizedCandidate = this.normalizeSkill(candidateSkill);
                const similarity = this.calculateSkillSimilarity(normalizedRequired, normalizedCandidate);

                if (similarity > bestMatch) {
                    bestMatch = similarity;
                    matchedSkill = candidateSkill;
                }
            });

            if (bestMatch >= 0.9) {
                matchedSkills++;
                matchedSkillsList.push({ required: requiredSkill, matched: matchedSkill, similarity: bestMatch });
            } else if (bestMatch >= 0.6) {
                partialMatches++;
                matchedSkillsList.push({ required: requiredSkill, matched: matchedSkill, similarity: bestMatch, partial: true });
            } else {
                missingSkills.push(requiredSkill);
            }
        });

        // Calculate score with partial matches counting as 0.5
        const totalMatches = matchedSkills + (partialMatches * 0.5);
        const baseScore = totalMatches / requiredSkills.length;

        // Bonus for having additional relevant skills
        const additionalSkills = candidateSkills.length - requiredSkills.length;
        const bonusScore = additionalSkills > 0 ? Math.min(0.1, additionalSkills * 0.02) : 0;

        return Math.min(1.0, baseScore + bonusScore);
    }

    /**
     * Calculate experience compatibility score
     */
    calculateExperienceScore(jobRequirements, candidateProfile) {
        const requiredExperience = jobRequirements.experience || {};
        const candidateExperience = candidateProfile.experience || 0;

        const minRequired = requiredExperience.min || 0;
        const maxRequired = requiredExperience.max || 20;

        // Perfect match bonus
        if (candidateExperience >= minRequired && candidateExperience <= maxRequired) {
            return 1.0;
        }

        // Below minimum experience
        if (candidateExperience < minRequired) {
            const gap = minRequired - candidateExperience;
            if (gap <= 1) return 0.8; // Small gap penalty
            if (gap <= 2) return 0.6; // Medium gap penalty
            return Math.max(0.2, 1 - (gap * 0.2)); // Larger gap penalty
        }

        // Above maximum experience (overqualified)
        if (candidateExperience > maxRequired) {
            const excess = candidateExperience - maxRequired;
            if (excess <= 2) return 0.9; // Slight overqualification bonus
            return Math.max(0.7, 1 - (excess * 0.05)); // Overqualification penalty
        }

        return 0.5;
    }

    /**
     * Calculate education compatibility score
     */
    calculateEducationScore(jobRequirements, candidateProfile) {
        const requiredEducation = jobRequirements.education || 'any';
        const candidateEducation = candidateProfile.education || [];

        if (requiredEducation === 'any' || candidateEducation.length === 0) {
            return 0.7; // Neutral score
        }

        const educationLevels = {
            'high-school': 1,
            'diploma': 2,
            'bachelor': 3,
            'master': 4,
            'phd': 5
        };

        const requiredLevel = educationLevels[requiredEducation] || 3;
        const highestCandidateLevel = Math.max(...candidateEducation.map(edu => {
            const degree = edu.degree ? edu.degree.toLowerCase() : '';
            
            if (degree.includes('phd') || degree.includes('doctorate')) return 5;
            if (degree.includes('master') || degree.includes('mba')) return 4;
            if (degree.includes('bachelor') || degree.includes('degree')) return 3;
            if (degree.includes('diploma')) return 2;
            if (degree.includes('high school') || degree.includes('12th')) return 1;
            
            return 3; // Default to bachelor level
        }));

        // Perfect match
        if (highestCandidateLevel === requiredLevel) return 1.0;
        
        // Higher education than required
        if (highestCandidateLevel > requiredLevel) {
            return Math.min(1.0, 0.8 + (highestCandidateLevel - requiredLevel) * 0.1);
        }
        
        // Lower education than required
        const gap = requiredLevel - highestCandidateLevel;
        return Math.max(0.3, 1 - (gap * 0.2));
    }

    /**
     * Calculate location compatibility score
     */
    calculateLocationScore(jobRequirements, candidateProfile) {
        const jobLocation = jobRequirements.location || {};
        const candidateLocation = candidateProfile.location || {};

        // Remote work bonus
        if (jobLocation.isRemote) {
            return 1.0;
        }

        // No location information
        if (!jobLocation.city || !candidateLocation.city) {
            return 0.5;
        }

        // Exact city match
        if (this.normalizeLocation(jobLocation.city) === this.normalizeLocation(candidateLocation.city)) {
            return 1.0;
        }

        // State match
        if (jobLocation.state && candidateLocation.state &&
            this.normalizeLocation(jobLocation.state) === this.normalizeLocation(candidateLocation.state)) {
            return 0.7;
        }

        // Country match
        if (jobLocation.country && candidateLocation.country &&
            this.normalizeLocation(jobLocation.country) === this.normalizeLocation(candidateLocation.country)) {
            return 0.4;
        }

        return 0.2; // Different locations
    }

    /**
     * Calculate salary compatibility score
     */
    calculateSalaryCompatibility(jobRequirements, candidateProfile) {
        const jobSalary = jobRequirements.salary || {};
        const candidateExpectation = candidateProfile.salaryExpectation || {};

        // No salary information
        if (!jobSalary.min && !candidateExpectation.amount) {
            return 0.7; // Neutral score
        }

        const jobMin = jobSalary.min || 0;
        const jobMax = jobSalary.max || jobSalary.min * 1.5 || 1000000;
        const candidateExpected = candidateExpectation.amount || 0;

        // No candidate expectation
        if (!candidateExpected) {
            return 0.8; // Slightly positive (negotiable)
        }

        // Within job salary range
        if (candidateExpected >= jobMin && candidateExpected <= jobMax) {
            return 1.0;
        }

        // Below minimum (good for employer)
        if (candidateExpected < jobMin) {
            const difference = (jobMin - candidateExpected) / jobMin;
            return Math.min(1.0, 0.9 + difference * 0.1); // Slight bonus
        }

        // Above maximum (potential issue)
        if (candidateExpected > jobMax) {
            const difference = (candidateExpected - jobMax) / jobMax;
            if (difference <= 0.1) return 0.8; // 10% over is manageable
            if (difference <= 0.2) return 0.6; // 20% over is concerning
            return Math.max(0.2, 0.6 - difference * 0.5); // Higher expectations penalized
        }

        return 0.5;
    }

    /**
     * Extract and normalize skills from various formats
     */
    extractSkills(skills) {
        if (!skills) return [];
        
        if (Array.isArray(skills)) {
            return skills.flatMap(skill => {
                if (typeof skill === 'string') return [skill];
                if (skill && skill.name) return [skill.name];
                return [];
            });
        }
        
        if (typeof skills === 'string') {
            return skills.split(/[,;|\n]/).map(s => s.trim()).filter(s => s.length > 0);
        }
        
        return [];
    }

    /**
     * Normalize skill name for better matching
     */
    normalizeSkill(skill) {
        if (!skill) return '';
        return skill.toLowerCase()
            .replace(/[^\w\s]/g, '') // Remove special characters
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }

    /**
     * Calculate similarity between two skills using multiple methods
     */
    calculateSkillSimilarity(skill1, skill2) {
        if (skill1 === skill2) return 1.0;

        // Check synonyms
        const synonyms1 = this.skillSynonyms[skill1] || [];
        const synonyms2 = this.skillSynonyms[skill2] || [];

        if (synonyms1.includes(skill2) || synonyms2.includes(skill1)) {
            return 1.0;
        }

        // Check if either skill contains the other
        if (skill1.includes(skill2) || skill2.includes(skill1)) {
            return 0.9;
        }

        // Use Jaro-Winkler distance for fuzzy matching
        const distance = this.distance(skill1, skill2);
        return distance;
    }

    /**
     * Normalize location strings
     */
    normalizeLocation(location) {
        if (!location) return '';
        return location.toLowerCase().trim();
    }

    /**
     * Generate additional scoring metadata
     */
    generateScoringMetadata(jobRequirements, candidateProfile, scores) {
        const requiredSkills = this.extractSkills(jobRequirements.skills || []);
        const candidateSkills = this.extractSkills(candidateProfile.skills || []);

        return {
            skillsAnalysis: {
                requiredCount: requiredSkills.length,
                candidateCount: candidateSkills.length,
                matchingSkills: this.findMatchingSkills(requiredSkills, candidateSkills),
                missingSkills: this.findMissingSkills(requiredSkills, candidateSkills),
                additionalSkills: this.findAdditionalSkills(requiredSkills, candidateSkills)
            },
            experienceAnalysis: {
                required: jobRequirements.experience,
                candidate: candidateProfile.experience,
                gap: (jobRequirements.experience?.min || 0) - (candidateProfile.experience || 0)
            },
            recommendations: this.generateRecommendations(scores, jobRequirements, candidateProfile)
        };
    }

    /**
     * Find skills that match between job requirements and candidate
     */
    findMatchingSkills(requiredSkills, candidateSkills) {
        const matches = [];
        
        requiredSkills.forEach(required => {
            const normalized = this.normalizeSkill(required);
            candidateSkills.forEach(candidate => {
                const similarity = this.calculateSkillSimilarity(normalized, this.normalizeSkill(candidate));
                if (similarity >= 0.8) {
                    matches.push({
                        required,
                        matched: candidate,
                        similarity
                    });
                }
            });
        });
        
        return matches;
    }

    /**
     * Find skills that are required but missing from candidate
     */
    findMissingSkills(requiredSkills, candidateSkills) {
        const missing = [];
        
        requiredSkills.forEach(required => {
            const normalized = this.normalizeSkill(required);
            const hasMatch = candidateSkills.some(candidate => {
                return this.calculateSkillSimilarity(normalized, this.normalizeSkill(candidate)) >= 0.8;
            });
            
            if (!hasMatch) {
                missing.push(required);
            }
        });
        
        return missing;
    }

    /**
     * Find additional skills candidate has beyond requirements
     */
    findAdditionalSkills(requiredSkills, candidateSkills) {
        const additional = [];
        
        candidateSkills.forEach(candidate => {
            const normalized = this.normalizeSkill(candidate);
            const isRequired = requiredSkills.some(required => {
                return this.calculateSkillSimilarity(this.normalizeSkill(required), normalized) >= 0.8;
            });
            
            if (!isRequired) {
                additional.push(candidate);
            }
        });
        
        return additional;
    }

    /**
     * Generate recommendations based on scoring
     */
    generateRecommendations(scores, jobRequirements, candidateProfile) {
        const recommendations = [];

        if (scores.skillMatch < 0.7) {
            recommendations.push({
                type: 'skill_gap',
                message: 'Candidate may need additional technical skills training',
                severity: 'medium'
            });
        }

        if (scores.experienceMatch < 0.6) {
            recommendations.push({
                type: 'experience_gap',
                message: 'Consider if candidate\'s experience level aligns with role requirements',
                severity: 'high'
            });
        }

        if (scores.locationMatch < 0.5 && !jobRequirements.location?.isRemote) {
            recommendations.push({
                type: 'location_mismatch',
                message: 'Location may require relocation or remote work arrangement',
                severity: 'medium'
            });
        }

        if (scores.salaryMatch < 0.4) {
            recommendations.push({
                type: 'salary_mismatch',
                message: 'Significant salary expectation gap may require negotiation',
                severity: 'high'
            });
        }

        if (scores.overallFit >= 0.8) {
            recommendations.push({
                type: 'strong_match',
                message: 'Excellent candidate match - recommend for interview',
                severity: 'positive'
            });
        }

        return recommendations;
    }

    /**
     * Get default scores for error cases
     */
    getDefaultScores() {
        return {
            skillMatch: 0.5,
            experienceMatch: 0.5,
            educationMatch: 0.5,
            locationMatch: 0.5,
            salaryMatch: 0.5,
            overallFit: 0.5
        };
    }

    /**
     * Score multiple applications and return sorted by overall fit
     */
    scoreMultipleApplications(jobRequirements, applications) {
        const scoredApplications = applications.map(application => {
            const candidateProfile = {
                skills: application.candidate?.skills || 
                       application.resume?.resumeId?.skills?.technical || 
                       application.resume?.resumeId?.parsedData?.extractedSkills || [],
                experience: application.candidate?.experience || 
                           application.resume?.resumeId?.totalExperience || 
                           application.resume?.resumeId?.parsedData?.extractedExperience || 0,
                education: application.candidate?.education || 
                          application.resume?.resumeId?.education || [],
                location: application.candidate?.location || 
                         application.resume?.resumeId?.personalInfo?.location || {},
                salaryExpectation: application.salaryExpectation
            };

            const scoring = this.scoreApplication(jobRequirements, candidateProfile);
            
            return {
                ...application.toObject(),
                aiScoring: scoring
            };
        });

        // Sort by overall fit score (descending)
        return scoredApplications.sort((a, b) => {
            const scoreA = a.aiScoring?.scores?.overallFit || 0;
            const scoreB = b.aiScoring?.scores?.overallFit || 0;
            return scoreB - scoreA;
        });
    }

    /**
     * Get skill match percentage for quick display
     */
    getSkillMatchPercentage(jobRequirements, candidateProfile) {
        const score = this.calculateSkillMatchScore(jobRequirements, candidateProfile);
        return Math.round(score * 100);
    }
}

// Create and export singleton instance
const aiScoringService = new AIApplicationScoringService();

module.exports = {
    AIApplicationScoringService,
    aiScoringService
};