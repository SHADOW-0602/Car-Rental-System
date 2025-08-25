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
        const template = this.getWelcomeTemplate(user.name, role);
        const subject = role === 'driver' ? 'Welcome to UrbanFleet - Driver Portal!' : 'Welcome to UrbanFleet!';
        return await this.sendMarketingEmail(user.email, subject, template);
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
}

module.exports = new EmailService();