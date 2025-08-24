const User = require('../models/User');
const Driver = require('../models/Driver');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const multer = require('multer');
const { SessionManager } = require('../middleware/sessionManager');
const { setAuthCookie, clearAuthCookie, clearAllAuthCookies } = require('../middleware/cookieAuth');
const { updateDriverLocation, updateDriverLocationInFile } = require('../services/locationService');
const { sanitizeOutput, maskSensitiveData } = require('../middleware/dataEncryption');
const aiChatService = require('../services/aiChatService');
const ChatSession = require('../models/ChatSession');
require('../services/marketingService'); // Initialize marketing scheduler

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
            
            // Send welcome marketing email
            const marketingService = require('../services/marketingService');
            await marketingService.sendWelcomeEmail(user);
            
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
            
            // Set secure cookie
            setAuthCookie(res, token, 'admin');
            
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
            
            // Set secure cookie
            setAuthCookie(res, token, 'driver');
            
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
            // Check if user was migrated to driver
            if (user.driverApplication && user.driverApplication.status === 'approved') {
                return res.status(200).json({ 
                    success: true,
                    migrated: true,
                    message: 'Your account has been migrated to driver. Please use driver login.'
                });
            }
            
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                console.warn(`[SECURITY] Failed user login - ${maskSensitiveData({email}).email} - IP: ${req.ip}`);
                return res.status(401).json({ success: false, error: 'Invalid credentials' });
            }
            
            // Check if 2FA is enabled
            if (user.twoFactorEnabled) {
                const { twoFactorCode } = req.body;
                if (!twoFactorCode) {
                    return res.status(200).json({ 
                        success: true,
                        requires2FA: true,
                        message: 'Please enter your 2FA code'
                    });
                }
                
                const verified = speakeasy.totp.verify({
                    secret: user.twoFactorSecret,
                    encoding: 'base32',
                    token: twoFactorCode,
                    window: 2
                });
                
                if (!verified) {
                    return res.status(401).json({ success: false, error: 'Invalid 2FA code' });
                }
            }
            
            const deviceInfo = {
                userAgent: req.get('User-Agent'),
                ip: req.ip
            };
            const { token, sessionId } = SessionManager.generateSessionToken(user._id, 'user', deviceInfo);
            
            // Set secure cookie
            setAuthCookie(res, token, 'user');
            
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
        
        // Clear all auth cookies
        clearAllAuthCookies(res);
        
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

exports.setup2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        
        const secret = speakeasy.generateSecret({
            name: `CarRental (${user.email})`,
            issuer: 'Car Rental System'
        });
        
        const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
        
        user.twoFactorSecret = secret.base32;
        await user.save();
        
        res.json({
            success: true,
            secret: secret.base32,
            qrCode: qrCodeUrl
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.verify2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ success: false, error: '2FA not set up' });
        }
        
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 2
        });
        
        if (verified) {
            user.twoFactorEnabled = true;
            await user.save();
            
            res.json({ success: true, message: '2FA enabled successfully' });
        } else {
            res.status(400).json({ success: false, error: 'Invalid token' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.disable2FA = async (req, res) => {
    try {
        const { password } = req.body;
        const user = await User.findById(req.user.id);
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ success: false, error: 'Invalid password' });
        }
        
        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        await user.save();
        
        res.json({ success: true, message: '2FA disabled successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.aiChat = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Message is required' });
        }
        
        // Find or create chat session
        let chatSession = await ChatSession.findOne({ sessionId, userId: req.user.id });
        if (!chatSession) {
            chatSession = new ChatSession({
                userId: req.user.id,
                sessionId: sessionId || `chat_${Date.now()}_${req.user.id}`,
                messages: []
            });
        }
        
        // Add user message
        chatSession.messages.push({
            sender: 'user',
            message: message.trim()
        });
        
        // Get conversation history for AI
        const conversationHistory = chatSession.messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.message
        }));
        
        const aiResponse = await aiChatService.generateResponse(message, conversationHistory);
        
        // Add AI response
        chatSession.messages.push({
            sender: 'ai',
            message: aiResponse.response,
            isRelevant: aiResponse.isRelevant
        });
        
        await chatSession.save();
        
        res.json({
            success: true,
            response: aiResponse.response,
            isRelevant: aiResponse.isRelevant,
            shouldTransferToHuman: aiResponse.shouldTransferToHuman,
            sessionId: chatSession.sessionId
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const chatSession = await ChatSession.findOne({ sessionId, userId: req.user.id });
        
        if (!chatSession) {
            return res.status(404).json({ success: false, error: 'Chat session not found' });
        }
        
        res.json({ success: true, chatSession });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.transferToHuman = async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        const chatSession = await ChatSession.findOne({ sessionId, userId: req.user.id });
        if (!chatSession) {
            return res.status(404).json({ success: false, error: 'Chat session not found' });
        }
        
        chatSession.status = 'transferred_to_human';
        chatSession.transferredToHuman = true;
        chatSession.transferredAt = new Date();
        
        await chatSession.save();
        
        res.json({ success: true, message: 'Chat transferred to human agent' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { [`settings.${Object.keys(req.body)[0]}`]: Object.values(req.body)[0] } },
            { new: true }
        );
        res.json({ success: true, settings: user.settings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('settings');
        res.json({ success: true, settings: user.settings || {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.applyDriver = async (req, res) => {
    try {
        const userId = req.user.id;
        const applicationData = req.body;
        
        // Check if user already has a driver application
        const user = await User.findById(userId);
        if (user.driverApplication) {
            return res.status(400).json({ 
                success: false, 
                error: 'Driver application already exists' 
            });
        }
        
        // Create driver application
        const driverApplication = {
            ...applicationData,
            status: 'pending',
            appliedAt: new Date(),
            documents: {
                licensePhoto: req.files?.licensePhoto?.[0]?.filename,
                vehicleRC: req.files?.vehicleRC?.[0]?.filename,
                insurance: req.files?.insurance?.[0]?.filename,
                profilePhoto: req.files?.profilePhoto?.[0]?.filename
            }
        };
        
        // Update user with driver application
        await User.findByIdAndUpdate(userId, {
            driverApplication: driverApplication
        });
        
        res.json({ 
            success: true, 
            message: 'Driver application submitted successfully',
            status: 'pending'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getDriverStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('driverApplication');
        
        if (!user.driverApplication) {
            return res.json({ success: true, status: null });
        }
        
        res.json({ 
            success: true, 
            status: user.driverApplication.status,
            application: user.driverApplication
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateAvailability = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['available', 'busy', 'offline'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid status. Must be available, busy, or offline' 
            });
        }
        
        const driver = await Driver.findByIdAndUpdate(
            req.user.id,
            { status },
            { new: true }
        );
        
        if (!driver) {
            return res.status(404).json({ success: false, error: 'Driver not found' });
        }
        
        res.json({ 
            success: true, 
            message: 'Availability updated successfully',
            status: driver.status
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.submitVerificationDocuments = async (req, res) => {
    try {
        const driverId = req.user.id;
        
        // Create verification request
        const verificationRequest = {
            driverId,
            documents: {},
            status: 'pending',
            submittedAt: new Date()
        };
        
        // Handle file uploads (simplified - in production, use proper file storage)
        if (req.files) {
            Object.keys(req.files).forEach(key => {
                verificationRequest.documents[key] = req.files[key][0].filename;
            });
        }
        
        // Update driver with verification request
        await Driver.findByIdAndUpdate(driverId, {
            verificationRequest
        });
        
        res.json({ 
            success: true, 
            message: 'Verification documents submitted successfully'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};