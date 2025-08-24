const User = require('../models/User');
const emailService = require('./emailService');
const cron = require('node-cron');

class MarketingService {
    constructor() {
        this.startScheduler();
    }

    startScheduler() {
        // Send weekly marketing emails every Monday at 9 AM
        cron.schedule('0 9 * * 1', () => {
            this.sendWeeklyMarketingEmails();
        });

        // Send weekend specials every Friday at 10 AM
        cron.schedule('0 10 * * 5', () => {
            this.sendWeekendSpecials();
        });
    }

    async sendWeeklyMarketingEmails() {
        try {
            const users = await User.find({
                'settings.marketingEmails': true,
                'settings.emailNotifications': true
            }).select('name email');

            for (const user of users) {
                const content = emailService.getMarketingTemplate(user.name, 'loyalty');
                await emailService.sendMarketingEmail(
                    user.email,
                    'Special Offers Just for You!',
                    content
                );
            }
            console.log(`Marketing emails sent to ${users.length} users`);
        } catch (error) {
            console.error('Marketing email batch failed:', error);
        }
    }

    async sendWeekendSpecials() {
        try {
            const users = await User.find({
                'settings.marketingEmails': true,
                'settings.emailNotifications': true
            }).select('name email');

            for (const user of users) {
                const content = emailService.getMarketingTemplate(user.name, 'weekend');
                await emailService.sendMarketingEmail(
                    user.email,
                    'Weekend Special - Save 15%!',
                    content
                );
            }
            console.log(`Weekend specials sent to ${users.length} users`);
        } catch (error) {
            console.error('Weekend specials batch failed:', error);
        }
    }

    async sendWelcomeEmail(user) {
        if (user.settings?.marketingEmails && user.settings?.emailNotifications) {
            const content = emailService.getMarketingTemplate(user.name, 'welcome');
            await emailService.sendMarketingEmail(
                user.email,
                'Welcome to Car Rental System!',
                content
            );
        }
    }
}

module.exports = new MarketingService();