const { validateSession } = require('./sessionManager');
const { sanitizeOutput } = require('./dataEncryption');

// Enhanced authentication with session management
module.exports = async (req, res, next) => {
    try {
        await validateSession(req, res, next);
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            error: 'Authentication failed',
            code: 'AUTH_FAILED'
        });
    }
};

// Middleware to sanitize response data based on user role
module.exports.sanitizeResponse = (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
        if (req.user && data) {
            try {
                const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                const sanitized = sanitizeOutput(parsed, req.user.role);
                return originalSend.call(this, JSON.stringify(sanitized));
            } catch (error) {
                return originalSend.call(this, data);
            }
        }
        return originalSend.call(this, data);
    };
    
    next();
};