const Chat = require('../models/Chat');

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
                
                // Notify admin about new message
                if (message.senderType === 'user') {
                    io.to('admin-room').emit('new-chat-request', {
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