import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

export default function AIChat({ onTransferToHuman }) {
    const [messages, setMessages] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(`chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    useEffect(() => {
        // Initialize chat with welcome message
        if (!isInitialized) {
            const token = localStorage.getItem('token');
            const welcomeText = token 
                ? "Hi! I'm your AI assistant. I can help you with car rental questions like booking, pricing, vehicles, and policies. How can I assist you today?"
                : "Hi! Please log in to your account to use the AI chat feature. Once logged in, I can help you with car rental questions!";
            
            setMessages([{
                id: 1,
                text: welcomeText,
                sender: 'ai',
                timestamp: new Date()
            }]);
            setIsInitialized(true);
        }
    }, [isInitialized]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            
            // Check if user is authenticated
            if (!token) {
                throw new Error('Please log in to use the AI chat feature');
            }

            if (!config.API_BASE_URL) {
                throw new Error('API URL not configured');
            }

            const response = await axios.post(`${config.API_BASE_URL}/users/ai-chat`, {
                message: inputMessage,
                sessionId
            }, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('AI Response:', response.data);
            
            // Update sessionId if returned from server
            if (response.data.sessionId) {
                setSessionId(response.data.sessionId);
            }

            const aiMessage = {
                id: Date.now() + 1,
                text: response.data.response,
                sender: 'ai',
                timestamp: new Date(),
                shouldTransferToHuman: response.data.shouldTransferToHuman
            };

            setMessages(prev => [...prev, aiMessage]);

            if (response.data.shouldTransferToHuman) {
                setTimeout(() => {
                    const transferMessage = {
                        id: Date.now() + 2,
                        text: "Would you like me to connect you with a human agent now?",
                        sender: 'ai',
                        timestamp: new Date(),
                        showTransferButton: true
                    };
                    setMessages(prev => [...prev, transferMessage]);
                }, 1000);
            }

        } catch (error) {
            console.error('Chat error:', error);
            let errorText = "I'm having trouble right now. Let me connect you with a human agent.";
            
            if (error.response?.status === 401) {
                errorText = "Your session has expired. Please log in again to continue using the chat.";
            } else if (error.message === 'Please log in to use the AI chat feature') {
                errorText = error.message;
            } else if (error.response?.data?.error) {
                errorText = error.response.data.error;
            }
            
            const errorMessage = {
                id: Date.now() + 1,
                text: errorText,
                sender: 'ai',
                timestamp: new Date(),
                showTransferButton: error.response?.status !== 401
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '500px',
            backgroundColor: 'white',
            borderRadius: '15px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '15px 20px',
                backgroundColor: '#667eea',
                color: 'white',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <span style={{ fontSize: '20px' }}>🤖</span>
                AI Assistant
                <span style={{
                    marginLeft: 'auto',
                    fontSize: '12px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '4px 8px',
                    borderRadius: '12px'
                }}>
                    Car Rental Help
                </span>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
            }}>
                {messages.map((message) => (
                    <div key={message.id}>
                        <div style={{
                            display: 'flex',
                            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                            marginBottom: '5px'
                        }}>
                            <div style={{
                                maxWidth: '80%',
                                padding: '12px 16px',
                                borderRadius: message.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                backgroundColor: message.sender === 'user' ? '#667eea' : '#f1f5f9',
                                color: message.sender === 'user' ? 'white' : '#2d3748',
                                fontSize: '14px',
                                lineHeight: '1.4'
                            }}>
                                {message.text}
                            </div>
                        </div>
                        
                        {message.showTransferButton && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
                                <button
                                    onClick={async () => {
                                        try {
                                            const token = localStorage.getItem('token');
                                            if (!token) {
                                                alert('Please log in to connect with a human agent');
                                                return;
                                            }
                                            await axios.post(`${config.API_BASE_URL}/users/transfer-to-human`, {
                                                sessionId
                                            }, {
                                                headers: { 
                                                    'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                }
                                            });
                                            onTransferToHuman && onTransferToHuman();
                                        } catch (error) {
                                            console.error('Transfer failed:', error);
                                            if (error.response?.status === 401) {
                                                alert('Your session has expired. Please log in again.');
                                            }
                                        }
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#22c55e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    🙋‍♂️ Connect to Human Agent
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                
                {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '18px 18px 18px 4px',
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            fontSize: '14px'
                        }}>
                            <span>AI is thinking</span>
                            <span style={{ animation: 'pulse 1.5s infinite' }}>...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '15px 20px',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-end'
            }}>
                <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about car rentals, booking, pricing..."
                    style={{
                        flex: 1,
                        padding: '10px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '20px',
                        resize: 'none',
                        fontSize: '14px',
                        maxHeight: '80px',
                        minHeight: '40px'
                    }}
                    rows={1}
                />
                <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    style={{
                        padding: '10px 16px',
                        backgroundColor: inputMessage.trim() && !isLoading ? '#667eea' : '#94a3b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
}