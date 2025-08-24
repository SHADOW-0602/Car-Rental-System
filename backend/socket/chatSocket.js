const Chat = require('../models/Chat');

// Auto-response function
function getAutoResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cancel')) {
        return "To cancel your booking, go to 'My Bookings' and click 'Cancel'. Free cancellation is available up to 5 minutes after booking.";
    } else if (lowerMessage.includes('payment')) {
        return "We accept all major credit cards, debit cards, and digital wallets. You can update your payment method in Profile > Payment Settings.";
    } else if (lowerMessage.includes('track')) {
        return "You can track your ride in real-time from the 'My Rides' section. You'll see your driver's location and estimated arrival time.";
    } else if (lowerMessage.includes('account')) {
        return "For account issues, please check your Profile settings or contact us at support@carrental.com. What specific help do you need?";
    } else if (lowerMessage.includes('driver') || lowerMessage.includes('contact')) {
        return "Once your ride is confirmed, you'll get your driver's contact details. You can call or message them directly through the app.";
    } else if (lowerMessage.includes('lost') || lowerMessage.includes('forgot')) {
        return "For lost items, please contact your driver first. If unsuccessful, call our support at +1 (555) 123-4567 with your ride details.";
    } else {
        return "Thank you for contacting us! An admin will assist you shortly. For urgent matters, please call +1 (555) 123-4567.";
    }
}

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        
        // Admin joins to monitor all chats
        socket.on('join-admin', () => {
            socket.join('admin-room');
            console.log('Admin joined chat monitoring');
        });

        socket.on('join-chat', async (userId) => {
            socket.join(`chat_${userId}`);
            
            // Send chat history
            try {
                const history = await Chat.find({ userId })
                    .sort({ timestamp: 1 })
                    .limit(50);
                socket.emit('chat-history', history);
            } catch (error) {
                console.error('Error fetching chat history:', error);
            }
        });

        socket.on('send-message', async (message) => {
            try {
                // Save to database
                const chatMessage = new Chat({
                    userId: message.userId,
                    text: message.text,
                    sender: message.sender,
                    senderType: message.senderType,
                    timestamp: new Date()
                });

                await chatMessage.save();

                // Broadcast to user's room
                io.to(`chat_${message.userId}`).emit('chat-message', chatMessage);
                
                // Notify all connected clients
                io.emit('chat-message', chatMessage);
                
                // Auto-response for user messages
                if (message.senderType === 'user') {
                    setTimeout(async () => {
                        const adminResponse = new Chat({
                            userId: message.userId,
                            text: getAutoResponse(message.text),
                            sender: "Support Team",
                            senderType: 'admin',
                            timestamp: new Date()
                        });
                        
                        await adminResponse.save();
                        io.emit('chat-message', adminResponse);
                    }, 1500);
                    
                    // Notify admin about new message
                    io.emit('new-chat-notification', {
                        userId: message.userId,
                        userName: message.sender,
                        lastMessage: message.text,
                        timestamp: new Date()
                    });
                }

            } catch (error) {
                console.error('Error saving message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};