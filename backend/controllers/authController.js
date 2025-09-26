const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, role, phone } = req.body;

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
                    role: user.role
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
                    role: user.role
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
const updateProfile = async (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "Profile update not implemented yet" 
    });
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
const refreshToken = async (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "Token refresh not implemented yet" 
    });
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