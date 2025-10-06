const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role, phone, companyName } = req.body;

        const userModel = new User();
        
        // Check if user already exists
        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user data object, only include phone if provided
        const userData = {
            firstName,
            lastName,
            email,
            password,
            role: role || 'candidate'
        };
        
        if (phone) {
            userData.phone = phone;
        }
        
        // Add company name for recruiters
        if (role === 'recruiter' && companyName) {
            userData.companyName = companyName;
        }

        // Create user
        const user = await userModel.createUser(userData);

        // Generate tokens
        const token = userModel.generateAuthToken(user);
        const refreshToken = userModel.generateRefreshToken(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                refreshToken,
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    role: user.role,
                    companyName: user.company_name
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const userModel = new User();
        
        // Check if user exists
        const user = await userModel.findByEmail(email);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Note: is_active check removed for basic authentication

        // Check password
        const isPasswordMatch = await userModel.comparePassword(password, user.password_hash);
        
        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate tokens
        const token = userModel.generateAuthToken(user);
        const refreshToken = userModel.generateRefreshToken(user);

        // Note: last_login update removed for basic authentication

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                refreshToken,
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    role: user.role,
                    companyName: user.company_name
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const userModel = new User();
        const user = await userModel.getProfile(req.user.id);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    avatar: user.avatar,
                    isEmailVerified: user.is_email_verified,
                    isProfileComplete: user.is_profile_complete,
                    lastLogin: user.last_login,
                    skills: user.skills,
                    experience: user.experience,
                    companyName: user.company_name,
                    companyWebsite: user.company_website,
                    companySize: user.company_size
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile  
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const userModel = new User();
        const userId = req.user.id;
        
        const {
            firstName,
            lastName,
            phone,
            location,
            bio,
            title,
            website,
            skills,
            companyName,
            companyWebsite,
            companySize
        } = req.body;

        // Update user profile
        const updatedUser = await userModel.updateProfile(userId, {
            firstName,
            lastName,
            phone,
            location,
            bio,
            title,
            website,
            skills: JSON.stringify(skills || []),
            ...(req.user.role === 'recruiter' && {
                companyName,
                companyWebsite,
                companySize
            })
        });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: updatedUser.id,
                    firstName: updatedUser.first_name,
                    lastName: updatedUser.last_name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                    phone: updatedUser.phone,
                    location: updatedUser.location,
                    bio: updatedUser.bio,
                    title: updatedUser.title,
                    website: updatedUser.website,
                    skills: updatedUser.skills ? JSON.parse(updatedUser.skills) : [],
                    companyName: updatedUser.company_name,
                    companyWebsite: updatedUser.company_website,
                    companySize: updatedUser.company_size
                }
            }
        });

    } catch (error) {
        console.error('Profile update error:', error);
        next(error);
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password  
// @access  Private
const changePassword = async (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "Password change not implemented yet" 
    });
};

// @desc    Refresh token
// @route   POST /api/auth/refresh-token
// @access  Public  
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        const userModel = new User();
        
        // Verify refresh token
        try {
            const decoded = userModel.verifyRefreshToken(refreshToken);
            
            // Get user from database
            const user = await userModel.getProfile(decoded.id);
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
            }
            
            // Generate new tokens
            const newToken = userModel.generateAuthToken(user);
            const newRefreshToken = userModel.generateRefreshToken(user);
            
            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    token: newToken,
                    refreshToken: newRefreshToken,
                    user: {
                        id: user.id,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        email: user.email,
                        role: user.role,
                        companyName: user.company_name
                    }
                }
            });
            
        } catch (tokenError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }
        
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "Logout successful" 
    });
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "Password reset not implemented yet" 
    });
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "Password reset not implemented yet" 
    });
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword
};