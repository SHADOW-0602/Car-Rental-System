const express = require('express');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const Chat = require('../models/Chat');

const router = express.Router();

// Get chat history for user
router.get('/history', auth, async (req, res) => {
    try {
        const messages = await Chat.find({ userId: req.user.id })
            .sort({ timestamp: 1 })
            .limit(50);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send message
router.post('/message', auth, async (req, res) => {
    try {
        const { text, senderType = 'user' } = req.body;
        
        const message = new Chat({
            userId: req.user.id,
            text,
            sender: req.user.name || req.user.email,
            senderType,
            timestamp: new Date()
        });

        await message.save();
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get active chats (admin only)
router.get('/active-chats', auth, roleAuth(['admin']), async (req, res) => {
    try {
        const activeChats = await Chat.aggregate([
            {
                $group: {
                    _id: '$userId',
                    lastMessage: { $last: '$text' },
                    lastTimestamp: { $last: '$timestamp' },
                    userName: { $last: '$sender' },
                    messageCount: { $sum: 1 }
                }
            },
            { $sort: { lastTimestamp: -1 } }
        ]);
        
        const formattedChats = activeChats.map(chat => ({
            userId: chat._id,
            userName: chat.userName,
            lastMessage: chat.lastMessage,
            unreadCount: 0, // Can be enhanced with read status
            timestamp: chat.lastTimestamp
        }));
        
        res.json(formattedChats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get chat history for specific user (admin)
router.get('/history/:userId', auth, roleAuth(['admin']), async (req, res) => {
    try {
        const messages = await Chat.find({ userId: req.params.userId })
            .sort({ timestamp: 1 })
            .limit(100);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;