const User = require('../models/User');
const Driver = require('../models/Driver');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const { SessionManager } = require('../middleware/sessionManager');
const { updateDriverLocation, updateDriverLocationInFile } = require('../services/locationService');
const { sanitizeOutput, maskSensitiveData } = require('../middleware/dataEncryption');

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, role, driverInfo } = req.body;
        
        // Check if email exists in any collection
        const [existingUser, existingDriver, existingAdmin] = await Promise.all([
            User.findOne({ email }),
            Driver.findOne({ email }),
            Admin.findOne({ email })
        ]);
        
        if (existingUser || existingDriver || existingAdmin) {
            return res.status(400).json({ success: false, error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        if (role === 'driver') {
            const driverData = {
                name,
                email,
                phone,
                password: hashedPassword,
                driverInfo
            };
            const driver = await Driver.create(driverData);
            return res.json({ success: true, user: sanitizeOutput(driver, 'driver') });
        } else {
            const userData = {
                name,
                email,
                phone,
                password: hashedPassword
            };
            const user = await User.create(userData);
            return res.json({ success: true, user: sanitizeOutput(user, 'user') });
        }
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, secretKey } = req.body;
        console.log(`[LOGIN] Attempt for email: ${email?.substring(0, 3)}***`);
        
        // Check admin login first
        const admin = await Admin.findOne({ email });
        if (admin) {
            const passwordMatch = await bcrypt.compare(password, admin.password);
            if (!passwordMatch) {
                console.warn(`[SECURITY] Failed admin login attempt - ${maskSensitiveData({email}).email} - IP: ${req.ip}`);
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }
            
            if (!secretKey) {
                return res.status(200).json({ 
                    success: true,
                    requiresSecretKey: true, 
                    message: 'Please enter admin secret key' 
                });
            }
            
            const secretMatch = await bcrypt.compare(secretKey, admin.secretKey);
            if (!secretMatch) {
                console.warn(`[SECURITY] Invalid admin secret key - ${admin.email} - IP: ${req.ip}`);
                return res.status(401).json({ success: false, error: 'Invalid secret key' });
            }
            
            const deviceInfo = {
                userAgent: req.get('User-Agent'),
                ip: req.ip
            };
            const { token, sessionId } = SessionManager.generateSessionToken(admin._id, 'admin', deviceInfo);
            
            console.log(`[SECURITY] Admin login successful - ${admin.email} - IP: ${req.ip}`);
            return res.json({ 
                success: true,
                token, 
                user: sanitizeOutput(admin, 'admin'),
                sessionId
            });
        }
        
        // Check driver login
        const driver = await Driver.findOne({ email });
        if (driver) {
            const match = await bcrypt.compare(password, driver.password);
            if (!match) {
                console.warn(`[SECURITY] Failed driver login - ${maskSensitiveData({email}).email} - IP: ${req.ip}`);
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }
            
            const deviceInfo = {
                userAgent: req.get('User-Agent'),
                ip: req.ip
            };
            const { token, sessionId } = SessionManager.generateSessionToken(driver._id, 'driver', deviceInfo);
            
            return res.json({ 
                success: true,
                token, 
                user: sanitizeOutput(driver, 'driver'),
                sessionId
            });
        }
        
        // Check user login
        const user = await User.findOne({ email });
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                console.warn(`[SECURITY] Failed user login - ${maskSensitiveData({email}).email} - IP: ${req.ip}`);
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }
            
            const deviceInfo = {
                userAgent: req.get('User-Agent'),
                ip: req.ip
            };
            const { token, sessionId } = SessionManager.generateSessionToken(user._id, 'user', deviceInfo);
            
            return res.json({ 
                success: true,
                token, 
                user: sanitizeOutput(user, 'user'),
                sessionId
            });
        }
        
        console.warn(`[SECURITY] Login attempt with non-existent email: ${maskSensitiveData({email}).email} - IP: ${req.ip}`);
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        let user;
        if (req.user.role === 'admin') {
            user = await Admin.findById(req.user.id).select('-password -secretKey');
        } else if (req.user.role === 'driver') {
            user = await Driver.findById(req.user.id).select('-password');
        } else {
            user = await User.findById(req.user.id).select('-password');
        }
        res.json({ success: true, user: sanitizeOutput(user, req.user.role) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        
        let user;
        if (req.user.role === 'admin') {
            user = await Admin.findByIdAndUpdate(req.user.id, updates, { new: true });
        } else if (req.user.role === 'driver') {
            user = await Driver.findByIdAndUpdate(req.user.id, updates, { new: true });
        } else {
            user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
        }
        res.json({ success: true, user: sanitizeOutput(user, req.user.role) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        let user;
        if (req.user.role === 'admin') {
            user = await Admin.findById(req.user.id);
        } else if (req.user.role === 'driver') {
            user = await Driver.findById(req.user.id);
        } else {
            user = await User.findById(req.user.id);
        }
        
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ success: false, error: 'Current password is incorrect' });
        }
        
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        
        if (req.user.role === 'admin') {
            await Admin.findByIdAndUpdate(req.user.id, { password: hashedNewPassword });
        } else if (req.user.role === 'driver') {
            await Driver.findByIdAndUpdate(req.user.id, { password: hashedNewPassword });
        } else {
            await User.findByIdAndUpdate(req.user.id, { password: hashedNewPassword });
        }
        
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateLocation = async (req, res) => {
    try {
        const { latitude, longitude, address, status = 'available' } = req.body;
        const location = { latitude, longitude, address };
        
        // Update in both database and file
        const dbSuccess = await updateDriverLocation(req.user.id, location);
        const fileSuccess = await updateDriverLocationInFile(req.user.id, location, status);
        
        if (dbSuccess && fileSuccess) {
            res.json({ 
                success: true, 
                message: 'Location updated in database and file', 
                location,
                status 
            });
        } else {
            res.json({ 
                success: true, 
                message: 'Location partially updated', 
                location,
                dbUpdated: dbSuccess,
                fileUpdated: fileSuccess 
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.logout = async (req, res) => {
    try {
        if (req.sessionId) {
            SessionManager.invalidateSession(req.sessionId);
        }
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const sessions = SessionManager.getUserSessions(req.user.id);
        res.json({ success: true, sessions });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const [existingUser, existingDriver, existingAdmin] = await Promise.all([
            User.findOne({ email }),
            Driver.findOne({ email }),
            Admin.findOne({ email })
        ]);
        
        if (existingUser || existingDriver || existingAdmin) {
            return res.json({ exists: true });
        }
        
        return res.status(404).json({ exists: false });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};