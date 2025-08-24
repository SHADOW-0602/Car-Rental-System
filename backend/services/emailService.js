const nodemailer = require('nodemailer');

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

    getMarketingTemplate(userName, offerType) {
        const templates = {
            welcome: `
                <h2>Welcome to Car Rental System, ${userName}!</h2>
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