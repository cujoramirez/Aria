// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Authentication required' });
    }
};

// Optional authentication middleware
const optionalAuth = (req, res, next) => {
    // Just add user info if available, don't block
    next();
};

module.exports = {
    requireAuth,
    optionalAuth
};