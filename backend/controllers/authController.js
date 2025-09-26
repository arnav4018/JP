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

        // Create user
        const user = await userModel.createUser({
            firstName,
            lastName,
            email,
            password,
            role: role || 'candidate',
            phone
        });

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
                    avatar: user.avatar,
                    isEmailVerified: user.is_email_verified,
                    isProfileComplete: user.is_profile_complete
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

        // Check if account is active
        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

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

        // Update last login
        await userModel.updateProfile(user.id, { last_login: new Date() });

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
                    avatar: user.avatar,
                    isEmailVerified: user.is_email_verified,
                    isProfileComplete: user.is_profile_complete,
                    lastLogin: user.last_login
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
        const {
            firstName,
            lastName,
            phone,
            skills,
            experience,
            location,
            companyName,
            companyWebsite,
            companySize
        } = req.body;

        const user = await User.findById(req.user.id);

        // Update fields
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (skills) user.skills = skills;
        if (experience !== undefined) user.experience = experience;
        if (location) user.location = location;
        if (companyName) user.companyName = companyName;
        if (companyWebsite) user.companyWebsite = companyWebsite;
        if (companySize) user.companySize = companySize;

        // Check if profile is complete
        const requiredFields = ['firstName', 'lastName', 'email'];
        const roleSpecificFields = user.role === 'candidate' 
            ? ['skills', 'experience'] 
            : ['companyName'];

        const isComplete = [...requiredFields, ...roleSpecificFields].every(field => {
            return user[field] !== undefined && user[field] !== null && user[field] !== '';
        });

        user.isProfileComplete = isComplete;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    avatar: user.avatar,
                    isEmailVerified: user.isEmailVerified,
                    isProfileComplete: user.isProfileComplete,
                    skills: user.skills,
                    experience: user.experience,
                    location: user.location,
                    companyName: user.companyName,
                    companyWebsite: user.companyWebsite,
                    companySize: user.companySize
                }
            }
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user.id).select('+password');

        // Check current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            
            // Get user
            const user = await User.findById(decoded.id);
            
            if (!user || !user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
            }

            // Generate new access token
            const newToken = user.generateAuthToken();

            res.status(200).json({
                success: true,
                data: {
                    token: newToken
                }
            });

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
    try {
        // In a more advanced implementation, you might want to:
        // 1. Add the token to a blacklist
        // 2. Clear refresh tokens from database
        // 3. Clear any other session data

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this email'
            });
        }

        // Generate reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save();

        // In a real application, you would send this token via email
        // For now, we'll just return it in the response (not recommended for production)
        
        res.status(200).json({
            success: true,
            message: 'Password reset token generated',
            // Remove this in production - send via email instead
            resetToken
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user and check if token is still valid
            const user = await User.findOne({
                _id: decoded.id,
                passwordResetToken: token,
                passwordResetExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired password reset token'
                });
            }

            // Set new password
            user.password = password;
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Password reset successfully'
            });

        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired password reset token'
            });
        }

    } catch (error) {
        next(error);
    }
};

// Simple stub methods for remaining functions
const updateProfile = async (req, res) => {
    res.json({ success: true, message: "Profile update not implemented yet" });
};

const changePassword = async (req, res) => {
    res.json({ success: true, message: "Password change not implemented yet" });
};

const refreshToken = async (req, res) => {
    res.json({ success: true, message: "Token refresh not implemented yet" });
};

const logout = async (req, res) => {
    res.json({ success: true, message: "Logout successful" });
};

const forgotPassword = async (req, res) => {
    res.json({ success: true, message: "Password reset not implemented yet" });
};

const resetPassword = async (req, res) => {
    res.json({ success: true, message: "Password reset not implemented yet" });
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
