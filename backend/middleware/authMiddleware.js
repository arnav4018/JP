const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - authenticate user
const protect = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if user is active
            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'User account is deactivated'
                });
            }

            // Add user to request object
            req.user = user;
            next();

        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

// Grant access to specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }

        next();
    };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                // Get user from token
                const user = await User.findById(decoded.id).select('-password');

                if (user && user.isActive) {
                    req.user = user;
                }
            } catch (error) {
                // Invalid token, but continue without user
                console.log('Invalid token in optional auth:', error.message);
            }
        }

        next();

    } catch (error) {
        next();
    }
};

// Grant access to specific roles (alias for authorize)
const restrictTo = (...roles) => {
    return authorize(...roles);
};

module.exports = {
    protect,
    authorize,
    restrictTo,
    optionalAuth
};
