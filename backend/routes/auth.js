const express = require('express');
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword,
    refreshToken,
    logout,
    forgotPassword,
    resetPassword
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const {
    validateUserRegistration,
    validateUserLogin,
    validatePassword,
    validateEmail
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validateEmail, forgotPassword);
router.put('/reset-password/:token', validatePassword, resetPassword);

// Protected routes
router.use(protect); // Apply authentication middleware to all routes below

router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/change-password', [
    ...validatePassword,
    (req, res, next) => {
        // Custom validation for current password
        if (!req.body.currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is required'
            });
        }
        next();
    }
], changePassword);
router.post('/logout', logout);

module.exports = router;