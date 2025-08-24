const axios = require('axios');

class AIChatService {
    constructor() {
        this.cohereApiKey = process.env.COHERE_API_KEY;
        this.carRentalKeywords = [
            'car', 'rental', 'vehicle', 'booking', 'ride', 'driver', 'fare', 'payment',
            'pickup', 'destination', 'suv', 'sedan', 'luxury', 'economy', 'price',
            'reservation', 'cancel', 'modify', 'insurance', 'fuel', 'mileage',
            'availability', 'location', 'hours', 'policy', 'deposit', 'license'
        ];
    }

    isCarRentalRelated(message) {
        const lowerMessage = message.toLowerCase();
        return this.carRentalKeywords.some(keyword => 
            lowerMessage.includes(keyword)
        ) || lowerMessage.includes('rent') || lowerMessage.includes('book');
    }

    async generateResponse(userMessage, conversationHistory = []) {
        try {
            if (!this.isCarRentalRelated(userMessage)) {
                return {
                    isRelevant: false,
                    response: "I'm here to help with car rental related questions only. For other inquiries, I'll connect you with a human agent. Would you like me to transfer you to our support team?",
                    shouldTransferToHuman: true
                };
            }

            const systemPrompt = `You are a helpful car rental customer service AI assistant. You can only answer questions related to car rentals, bookings, vehicles, pricing, policies, and related services. 

Car Rental System Information:
- We offer Economy cars (₹20 base + ₹8/km), Premium SUVs (₹20 base + ₹18/km), and Luxury vehicles (₹20 base + ₹25/km)
- We accept Credit/Debit cards, UPI, Wallet, and Cash payments
- Bookings can be made through our app with pickup and destination selection
- We have driver verification and GPS tracking for safety
- 24/7 customer support available

Keep responses concise, helpful, and focused on car rental topics only.`;

            const messages = [
                { role: 'system', content: systemPrompt },
                ...conversationHistory.slice(-5), // Last 5 messages for context
                { role: 'user', content: userMessage }
            ];

            const response = await axios.post('https://api.cohere.ai/v1/chat', {
                model: 'command-r',
                message: userMessage,
                chat_history: conversationHistory.slice(-5).map(msg => ({
                    role: msg.role === 'user' ? 'USER' : 'CHATBOT',
                    message: msg.content
                })),
                preamble: systemPrompt,
                max_tokens: 150,
                temperature: 0.3
            }, {
                headers: {
                    'Authorization': `Bearer ${this.cohereApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                isRelevant: true,
                response: response.data.text,
                shouldTransferToHuman: false
            };

        } catch (error) {
            console.error('Cohere API Error:', error.response?.data || error.message);
            return {
                isRelevant: true,
                response: "I'm having trouble processing your request right now. Let me connect you with a human agent who can better assist you.",
                shouldTransferToHuman: true
            };
        }
    }
}

module.exports = new AIChatService();