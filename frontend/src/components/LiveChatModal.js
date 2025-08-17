import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../context/AuthContext';
import io from 'socket.io-client';

export default function LiveChatModal({ isOpen, onClose }) {
    const { user } = useAuthContext();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !user) return;

        // Connect to Socket.IO server
        const newSocket = io('http://localhost:3000', {
            query: { userId: user._id || user.id }
        });

        newSocket.on('connect', () => {
            console.log('Connected to chat server');
            // Join user's chat room
            newSocket.emit('join-chat', user._id || user.id);
        });

        newSocket.on('chat-message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        newSocket.on('chat-history', (history) => {
            setMessages(history);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [isOpen, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || loading || !socket) return;

        setLoading(true);
        
        const message = {
            text: newMessage,
            sender: user.name || user.email,
            senderType: 'user',
            timestamp: new Date(),
            userId: user._id || user.id
        };

        socket.emit('send-message', message);
        setNewMessage('');
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                width: '400px',
                height: '500px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0 }}>💬 Live Support</h3>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '20px',
                        cursor: 'pointer'
                    }}>×</button>
                </div>

                {/* Messages */}
                <div style={{
                    flex: 1,
                    padding: '20px',
                    overflowY: 'auto',
                    backgroundColor: '#f8fafc'
                }}>
                    {messages.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '50px' }}>
                            <p>👋 Welcome! How can we help you today?</p>
                        </div>
                    )}
                    
                    {messages.map((msg, index) => (
                        <div key={index} style={{
                            marginBottom: '15px',
                            display: 'flex',
                            justifyContent: msg.senderType === 'user' ? 'flex-end' : 'flex-start'
                        }}>
                            <div style={{
                                maxWidth: '70%',
                                padding: '10px 15px',
                                borderRadius: '15px',
                                backgroundColor: msg.senderType === 'user' ? '#667eea' : 'white',
                                color: msg.senderType === 'user' ? 'white' : '#2d3748',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}>
                                <p style={{ margin: 0, fontSize: '14px' }}>{msg.text}</p>
                                <small style={{ 
                                    opacity: 0.7, 
                                    fontSize: '11px',
                                    display: 'block',
                                    marginTop: '5px'
                                }}>
                                    {msg.sender}
                                </small>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} style={{
                    padding: '20px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    gap: '10px'
                }}>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        disabled={loading}
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
                        disabled={loading || !newMessage.trim()}
                        style={{
                            padding: '10px 15px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                    >
                        {loading ? '...' : '📤'}
                    </button>
                </form>
            </div>
        </div>
    );
}