const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendMarketingEmail(to, subject, content) {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to,
                subject,
                html: content
            });
            return true;
        } catch (error) {
            console.error('Email send failed:', error);
            return false;
        }
    }

    async sendWelcomeEmail(user, role = 'user') {
        try {
            const template = this.getWelcomeTemplate(user.name, role);
            const subject = role === 'driver' ? 'Welcome to UrbanFleet - Driver Portal!' : 'Welcome to UrbanFleet!';
            return await this.sendMarketingEmail(user.email, subject, template);
        } catch (error) {
            logger.error('Failed to send welcome email:', error);
            return false;
        }
    }

    getWelcomeTemplate(userName, role) {
        if (role === 'driver') {
            return `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #48bb78;">🚕 Welcome to UrbanFleet, ${userName}!</h2>
                    <p>Congratulations on joining our driver community!</p>
                    <p>You can now:</p>
                    <ul>
                        <li>Accept ride requests</li>
                        <li>Track your earnings</li>
                        <li>Manage your availability</li>
                    </ul>
                    <p>Start earning today with your first ride bonus: <strong>DRIVER50</strong></p>
                    <p>Happy driving!</p>
                </div>
            `;
        }
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #667eea;">🚗 Welcome to UrbanFleet, ${userName}!</h2>
                <p>Thank you for joining our premium car rental service!</p>
                <p>Get started with:</p>
                <ul>
                    <li>Book rides instantly</li>
                    <li>Choose from luxury vehicles</li>
                    <li>Track your rides in real-time</li>
                </ul>
                <p>Special welcome offer: <strong>20% off</strong> your first ride with code: <strong>WELCOME20</strong></p>
                <p>Happy riding!</p>
            </div>
        `;
    }

    getMarketingTemplate(userName, offerType) {
        const templates = {
            welcome: `
                <h2>Welcome to UrbanFleet, ${userName}!</h2>
                <p>Get 20% off your first ride with code: WELCOME20</p>
            `,
            weekend: `
                <h2>Weekend Special for ${userName}!</h2>
                <p>Book now and save 15% on weekend rides. Code: WEEKEND15</p>
            `,
            loyalty: `
                <h2>Thank you ${userName}!</h2>
                <p>As a valued customer, enjoy 25% off your next booking. Code: LOYAL25</p>
            `
        };
        return templates[offerType] || templates.welcome;
    }

    async sendVerificationEmail(email, code) {
        const template = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #667eea;">🔐 Email Verification</h2>
                <p>Your verification code is:</p>
                <div style="background: #f7fafc; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #667eea; border-radius: 8px; margin: 20px 0;">
                    ${code}
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this verification, please ignore this email.</p>
            </div>
        `;
        return await this.sendMarketingEmail(email, 'Email Verification Code', template);
    }

    async sendSecurityAlert(email, alertData) {
        const template = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #e53e3e;">🚨 Security Alert</h2>
                <p>We detected a suspicious login attempt on your account:</p>
                <div style="background: #fed7d7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>IP Address:</strong> ${alertData.ip}</p>
                    <p><strong>Device:</strong> ${alertData.device}</p>
                    <p><strong>Time:</strong> ${alertData.timestamp.toLocaleString()}</p>
                </div>
                <p>If this was you, you can safely ignore this email. If not, please:</p>
                <ul>
                    <li>Change your password immediately</li>
                    <li>Enable two-factor authentication</li>
                    <li>Review your recent login activity</li>
                </ul>
                <p>Stay safe!</p>
            </div>
        `;
        return await this.sendMarketingEmail(email, 'Security Alert - Suspicious Login Detected', template);
    }

    async sendPasswordResetEmail(email, resetToken) {
        const template = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #667eea;">🔑 Password Reset Request</h2>
                <p>You requested to reset your password. Click the button below to proceed:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
                       style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this reset, please ignore this email.</p>
            </div>
        `;
        return await this.sendMarketingEmail(email, 'Password Reset Request', template);
    }

    async sendDriverSuspensionEmail(driver, suspensionData) {
        const { reason, suspensionType, suspensionEndDate } = suspensionData;
        const endDateText = suspensionType === 'permanent' ? 'permanently' : 
            suspensionEndDate ? `until ${new Date(suspensionEndDate).toLocaleDateString()}` : 'temporarily';
        
        const template = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2d3748; margin: 0;">UrbanFleet</h1>
                        <p style="color: #718096; margin: 5px 0 0 0;">Driver Portal</p>
                    </div>
                    
                    <h2 style="color: #e53e3e; text-align: center; margin-bottom: 20px;">Account Suspension Notice</h2>
                    
                    <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">Dear ${driver.name},</p>
                    
                    <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
                        We hope this message finds you well. We are writing to inform you that your driver account has been ${endDateText} suspended from our platform.
                    </p>
                    
                    <div style="background: #fed7d7; border-left: 4px solid #e53e3e; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #2d3748; font-weight: bold;">Reason for Suspension:</p>
                        <p style="margin: 5px 0 0 0; color: #2d3748;">${reason}</p>
                        ${suspensionEndDate ? `<p style="margin: 10px 0 0 0; color: #2d3748;"><strong>Suspension Period:</strong> Until ${new Date(suspensionEndDate).toLocaleDateString()}</p>` : ''}
                    </div>
                    
                    <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
                        We understand this may be disappointing, and we want to assure you that this decision was made after careful consideration. 
                        Our primary goal is to maintain a safe and reliable service for all users.
                    </p>
                    
                    <div style="background: #e6fffa; border-left: 4px solid #38b2ac; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #2d3748; font-weight: bold;">What happens next:</p>
                        <ul style="margin: 10px 0 0 0; color: #2d3748; padding-left: 20px;">
                            <li>Your account access is temporarily restricted</li>
                            <li>You will not be able to accept new ride requests</li>
                            <li>Any pending rides will be handled appropriately</li>
                            ${suspensionType === 'temporary' ? '<li>You can appeal this decision by contacting our support team</li>' : ''}
                        </ul>
                    </div>
                    
                    ${suspensionType === 'temporary' ? `
                    <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
                        If you believe this suspension was issued in error or if you have additional information that might help resolve this matter, 
                        please don't hesitate to contact our support team. We are committed to fair and transparent processes.
                    </p>
                    ` : ''}
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="mailto:support@urbanfleet.com" 
                           style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                            Contact Support
                        </a>
                    </div>
                    
                    <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
                        We appreciate your understanding and cooperation. We value all our drivers and hope to resolve this matter promptly.
                    </p>
                    
                    <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
                        Thank you for your service to our community.
                    </p>
                    
                    <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                        <p style="color: #718096; font-size: 14px; margin: 0;">Best regards,</p>
                        <p style="color: #2d3748; font-weight: bold; margin: 5px 0;">The UrbanFleet Team</p>
                        <p style="color: #718096; font-size: 12px; margin: 10px 0 0 0;">
                            This is an automated message. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        try {
            await this.sendMarketingEmail(driver.email, 'Important: Account Suspension Notice - UrbanFleet', template);
            return true;
        } catch (error) {
            logger.error('Failed to send suspension email:', error);
            return false;
        }
    }

    async sendDriverUnsuspensionEmail(driver) {
        const template = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #2d3748; margin: 0;">UrbanFleet</h1>
                        <p style="color: #718096; margin: 5px 0 0 0;">Driver Portal</p>
                    </div>
                    
                    <h2 style="color: #38a169; text-align: center; margin-bottom: 20px;">🎉 Account Reactivated!</h2>
                    
                    <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">Dear ${driver.name},</p>
                    
                    <p style="color: #2d3748; font-size: 16px; line-height: 1.6;">
                        Great news! Your driver account has been successfully reactivated and you can now resume providing rides on our platform.
                    </p>
                    
                    <div style="background: #c6f6d5; border-left: 4px solid #38a169; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0; color: #2d3748; font-weight: bold;">✅ Your account is now active</p>
                        <p style="margin: 5px 0 0 0; color: #2d3748;">You can immediately start accepting ride requests</p>
                    </div>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'https://app.urbanfleet.com'}/driver/dashboard" 
                           style="background: #38a169; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                            Go to Dashboard
                        </a>
                    </div>
                    
                    <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; text-align: center;">
                        <p style="color: #718096; font-size: 14px; margin: 0;">Welcome back!</p>
                        <p style="color: #2d3748; font-weight: bold; margin: 5px 0;">The UrbanFleet Team</p>
                    </div>
                </div>
            </div>
        `;
        
        try {
            await this.sendMarketingEmail(driver.email, 'Welcome Back! Your Account Has Been Reactivated - UrbanFleet', template);
            return true;
        } catch (error) {
            logger.error('Failed to send unsuspension email:', error);
            return false;
        }
    }
}

module.exports = new EmailService();