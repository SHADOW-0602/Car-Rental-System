const { SessionManager } = require('./sessionManager');

// Cookie configuration
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: process.env.COOKIE_SAME_SITE || 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
};

// Set authentication cookie
exports.setAuthCookie = (res, token, role) => {
    const cookieName = `auth_${role}`;
    res.cookie(cookieName, token, COOKIE_OPTIONS);
};

// Clear authentication cookie
exports.clearAuthCookie = (res, role) => {
    const cookieName = `auth_${role}`;
    res.clearCookie(cookieName, { path: '/' });
};

// Clear all auth cookies
exports.clearAllAuthCookies = (res) => {
    ['user', 'driver', 'admin'].forEach(role => {
        exports.clearAuthCookie(res, role);
    });
};

// Cookie-based authentication middleware
exports.cookieAuth = async (req, res, next) => {
    try {
        // Check for token in cookies first, then fallback to Authorization header
        let token = req.cookies?.auth_user || req.cookies?.auth_driver || req.cookies?.auth_admin;
        
        if (!token) {
            token = req.header('Authorization')?.replace('Bearer ', '');
        }
        
        if (!token) {
            return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
        }
        
        const decoded = await SessionManager.validateSession(token, req);
        req.user = decoded;
        req.sessionId = decoded.sessionId;
        
        next();
    } catch (error) {
        return res.status(401).json({ success: false, error: error.message });
    }
};