import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import api from '../services/api';

export default function AdminChat() {
    const [activeChats, setActiveChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Connect as admin
        const newSocket = io('http://localhost:3000', {
            query: { role: 'admin' }
        });

        newSocket.on('connect', () => {
            console.log('Admin connected to chat server');
            newSocket.emit('join-admin');
        });

        newSocket.on('new-chat-request', (chatInfo) => {
            setActiveChats(prev => [...prev, chatInfo]);
        });

        newSocket.on('chat-message', (message) => {
            if (selectedChat && message.userId === selectedChat.userId) {
                setMessages(prev => [...prev, message]);
            }
        });

        setSocket(newSocket);
        loadActiveChats();

        return () => newSocket.disconnect();
    }, []);

    const loadActiveChats = async () => {
        try {
            const response = await api.get('/chat/active-chats');
            setActiveChats(response.data);
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    };

    const selectChat = async (chat) => {
        setSelectedChat(chat);
        try {
            const response = await api.get(`/chat/history/${chat.userId}`);
            setMessages(response.data);
            socket.emit('join-chat', chat.userId);
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || !socket) return;

        const message = {
            text: newMessage,
            sender: 'Support Agent',
            senderType: 'support',
            timestamp: new Date(),
            userId: selectedChat.userId
        };

        socket.emit('send-message', message);
        setNewMessage('');
    };

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Chat List */}
            <div style={{ width: '300px', borderRight: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                    <h2 style={{ margin: 0, fontSize: '18px' }}>💬 Active Chats</h2>
                </div>
                <div style={{ overflowY: 'auto', height: 'calc(100vh - 80px)' }}>
                    {activeChats.map((chat) => (
                        <div
                            key={chat.userId}
                            onClick={() => selectChat(chat)}
                            style={{
                                padding: '15px 20px',
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                backgroundColor: selectedChat?.userId === chat.userId ? '#f0f9ff' : 'white'
                            }}
                        >
                            <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                                {chat.userName || 'Anonymous User'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                                {chat.lastMessage || 'No messages yet'}
                            </div>
                            {chat.unreadCount > 0 && (
                                <div style={{
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    borderRadius: '10px',
                                    padding: '2px 6px',
                                    fontSize: '10px',
                                    display: 'inline-block',
                                    marginTop: '5px'
                                }}>
                                    {chat.unreadCount}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div style={{
                            padding: '20px',
                            borderBottom: '1px solid #e2e8f0',
                            backgroundColor: 'white'
                        }}>
                            <h3 style={{ margin: 0 }}>
                                Chat with {selectedChat.userName || 'User'}
                            </h3>
                            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                                {selectedChat.userEmail}
                            </p>
                        </div>

                        {/* Messages */}
                        <div style={{
                            flex: 1,
                            padding: '20px',
                            overflowY: 'auto',
                            backgroundColor: '#f8fafc'
                        }}>
                            {messages.map((msg, index) => (
                                <div key={index} style={{
                                    marginBottom: '15px',
                                    display: 'flex',
                                    justifyContent: msg.senderType === 'support' ? 'flex-end' : 'flex-start'
                                }}>
                                    <div style={{
                                        maxWidth: '70%',
                                        padding: '10px 15px',
                                        borderRadius: '15px',
                                        backgroundColor: msg.senderType === 'support' ? '#22c55e' : 'white',
                                        color: msg.senderType === 'support' ? 'white' : '#2d3748',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                    }}>
                                        <p style={{ margin: 0, fontSize: '14px' }}>{msg.text}</p>
                                        <small style={{
                                            opacity: 0.7,
                                            fontSize: '11px',
                                            display: 'block',
                                            marginTop: '5px'
                                        }}>
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </small>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        <form onSubmit={sendMessage} style={{
                            padding: '20px',
                            borderTop: '1px solid #e2e8f0',
                            backgroundColor: 'white',
                            display: 'flex',
                            gap: '10px'
                        }}>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your response..."
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '20px',
                                    outline: 'none'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#22c55e',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '20px',
                                    cursor: 'pointer'
                                }}
                            >
                                Send
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#64748b'
                    }}>
                        Select a chat to start responding
                    </div>
                )}
            </div>
        </div>
    );
}