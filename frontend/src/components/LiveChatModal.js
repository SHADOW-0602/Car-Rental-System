import React, { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../context/AuthContext';
import io from 'socket.io-client';

export default function LiveChatModal({ isOpen, onClose }) {
    const { user } = useAuthContext();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [socket, setSocket] = useState(null);
    const [currentStep, setCurrentStep] = useState('category');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedIssue, setSelectedIssue] = useState('');
    const [escalatedToAdmin, setEscalatedToAdmin] = useState(false);
    const [showFollowUp, setShowFollowUp] = useState(false);
    const [currentFollowUp, setCurrentFollowUp] = useState([]);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackRating, setFeedbackRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [adminConnected, setAdminConnected] = useState(false);
    const [waitingForAdmin, setWaitingForAdmin] = useState(false);
    const [sessionId] = useState(() => Date.now().toString());
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !user) return;

        // Try to connect to Socket.IO server
        const newSocket = io('http://localhost:5000', {
            query: { userId: user._id || user.id },
            timeout: 5000
        });

        newSocket.on('connect', () => {
            console.log('Connected to chat server');
            newSocket.emit('join-chat', user._id || user.id);
        });

        newSocket.on('connect_error', (error) => {
            console.log('Chat server connection failed:', error);
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

    const supportCategories = {
        'booking': {
            title: '📅 Booking Issues',
            issues: {
                'cancel': { 
                    title: 'Cancel Booking', 
                    solution: 'You can cancel your booking up to 5 minutes after confirmation without charges. Go to My Rides > Select Booking > Cancel. After 5 minutes, cancellation fees may apply based on driver proximity.',
                    followUp: ['What are the cancellation charges after 5 minutes?', 'How to get refund for cancelled booking?', 'Can I reschedule instead of cancelling?', 'Driver already arrived but I need to cancel?']
                },
                'modify': { 
                    title: 'Modify Booking Details', 
                    solution: 'To modify your booking, cancel the current one and create a new booking with updated details. For minor changes like pickup location within 500m, contact your driver directly.',
                    followUp: ['Will I be charged for modification?', 'Can I change pickup location slightly?', 'How to change vehicle type?', 'Can I add stops to my current ride?']
                },
                'payment': { 
                    title: 'Payment Failed During Booking', 
                    solution: 'Check your payment method, ensure sufficient balance, or try a different card. Clear app cache and restart if issues persist. Contact your bank for card-specific problems.',
                    followUp: ['Which payment methods are accepted?', 'How to add new payment method?', 'Why was my card declined?', 'Can I pay cash instead?']
                },
                'driver': {
                    title: 'No Driver Found',
                    solution: 'Try booking again after 2-3 minutes. Check if you\'re in a service area. During peak hours, wait times may be longer. Consider booking a different vehicle type.',
                    followUp: ['How to check service areas?', 'What are peak hours?', 'Can I increase fare to find driver faster?', 'Alternative transportation options?']
                }
            }
        },
        'ride': {
            title: '🚗 Ride Issues',
            issues: {
                'driver': { 
                    title: 'Driver Behavior Issues', 
                    solution: 'For safety concerns, contact support immediately at +1-555-123-4567. For minor issues, rate the driver after the ride. All drivers undergo background checks and training.',
                    followUp: ['How to report unsafe driving?', 'Driver not following GPS route?', 'How to contact driver during ride?', 'What if driver asks for cash when I paid online?']
                },
                'route': { 
                    title: 'Wrong Route or Delays', 
                    solution: 'You can suggest the preferred route to your driver through the app chat or call feature. If driver takes significantly longer route, you won\'t be charged extra distance.',
                    followUp: ['Driver taking longer route intentionally?', 'How to suggest better route to driver?', 'Will I be charged extra for traffic delays?', 'Can I change destination mid-ride?']
                },
                'lost': { 
                    title: 'Lost Item in Vehicle', 
                    solution: 'Contact your driver immediately through the app. If no response within 2 hours, report to support with ride details. We\'ll help coordinate item return.',
                    followUp: ['How to contact previous ride driver?', 'What if driver doesn\'t respond about lost item?', 'Is there a fee for returning lost items?', 'How to file police report for valuable items?']
                },
                'safety': {
                    title: 'Safety Concerns',
                    solution: 'Your safety is our priority. Use the emergency button in the app, share ride details with contacts, and call 911 for immediate danger. All rides are GPS tracked.',
                    followUp: ['How to use emergency features?', 'How to share ride with family?', 'What if I feel unsafe during ride?', 'How to verify driver identity?']
                }
            }
        },
        'account': {
            title: '👤 Account Issues',
            issues: {
                'login': { 
                    title: 'Login Problems', 
                    solution: 'Reset your password using "Forgot Password" link. Check if your account needs email verification. Clear app cache or try logging in from web browser.',
                    followUp: ['Not receiving password reset email?', 'Account locked or suspended?', 'How to verify email address?', 'Can I login with phone number instead?']
                },
                'profile': { 
                    title: 'Profile Update Issues', 
                    solution: 'Go to Profile > Edit to update information. Phone number changes require OTP verification. Email changes need confirmation from both old and new email.',
                    followUp: ['How to change phone number?', 'How to update email address?', 'Why is profile picture not uploading?', 'How to verify new phone number?']
                },
                'security': { 
                    title: 'Security and Privacy', 
                    solution: 'Enable 2FA in Security Settings. Use strong, unique passwords. Never share login details. Report suspicious activity immediately to support.',
                    followUp: ['How to enable two-factor authentication?', 'Suspicious activity on my account?', 'How to change password?', 'How to review login history?']
                },
                'delete': {
                    title: 'Delete Account',
                    solution: 'Account deletion is permanent and cannot be undone. Complete any pending rides and clear outstanding payments first. Contact support to initiate deletion process.',
                    followUp: ['What happens to my ride history?', 'Can I reactivate deleted account?', 'How to download my data before deletion?', 'Will my payment methods be removed?']
                }
            }
        },
        'payment': {
            title: '💳 Payment Issues',
            issues: {
                'refund': { 
                    title: 'Refund Request', 
                    solution: 'Refunds are processed within 3-5 business days to your original payment method. Check your bank statement or contact support for refund status updates.',
                    followUp: ['Refund not received after 5 days?', 'Received partial refund only?', 'How to check refund status?', 'Can refund be sent to different account?']
                },
                'billing': { 
                    title: 'Billing Questions', 
                    solution: 'View detailed fare breakdown in My Rides section. Charges include base fare, distance, time, tolls, and applicable taxes. Contact support for billing disputes.',
                    followUp: ['Charged more than estimated fare?', 'What are surge pricing charges?', 'How is waiting time calculated?', 'Why are there additional fees?']
                },
                'methods': { 
                    title: 'Payment Method Issues', 
                    solution: 'Add/remove payment methods in Profile > Payment Settings. We accept major credit/debit cards, digital wallets, and UPI. Set a default payment method for faster checkout.',
                    followUp: ['How to set default payment method?', 'How to remove expired card?', 'Payment method keeps getting declined?', 'Can I use multiple payment methods for one ride?']
                },
                'promo': {
                    title: 'Promo Codes and Discounts',
                    solution: 'Enter promo codes before confirming booking. Check code validity and terms. Some codes have minimum ride value or are valid for specific vehicle types only.',
                    followUp: ['Promo code not working?', 'How to find available offers?', 'Can I combine multiple promo codes?', 'Why was discount not applied?']
                }
            }
        }
    };

    const handleCategorySelect = (categoryKey) => {
        setSelectedCategory(categoryKey);
        setCurrentStep('issue');
        const message = {
            text: `Selected: ${supportCategories[categoryKey].title}`,
            sender: user.name || user.email,
            senderType: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, message]);
    };

    const handleIssueSelect = (issueKey) => {
        setSelectedIssue(issueKey);
        const issue = supportCategories[selectedCategory].issues[issueKey];
        
        const userMessage = {
            text: issue.title,
            sender: user.name || user.email,
            senderType: 'user',
            timestamp: new Date()
        };
        
        const botResponse = {
            text: issue.solution,
            sender: "Support Bot",
            senderType: 'bot',
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage, botResponse]);
        setCurrentFollowUp(issue.followUp);
        setShowFollowUp(true);
        setCurrentStep('followup');
    };

    const getFollowUpResponse = (followUpText) => {
        const responses = {
            // Booking follow-ups
            'What are the cancellation charges after 5 minutes?': 'Cancellation charges are ₹20 if driver is more than 5 minutes away, ₹50 if driver is within 5 minutes, and ₹100 if driver has arrived at pickup location.',
            'How to get refund for cancelled booking?': 'Refunds for cancelled bookings are processed automatically within 24 hours. If you paid online, refund goes to original payment method in 3-5 business days.',
            'Can I reschedule instead of cancelling?': 'Currently, we don\'t have a reschedule feature. Please cancel current booking and create a new one for different time. No charges if cancelled within 5 minutes.',
            'Driver already arrived but I need to cancel?': 'If driver has arrived, cancellation fee of ₹100 applies. Please inform the driver politely about cancellation through app chat or call feature.',
            
            // Ride follow-ups
            'How to report unsafe driving?': 'Use the "Report Issue" button during or after ride. For immediate safety concerns, call our emergency helpline +1-555-911-HELP or use the emergency button in app.',
            'Driver not following GPS route?': 'You can share your preferred route with driver through app chat. If driver deliberately takes longer route, contact support for fare adjustment.',
            'How to contact driver during ride?': 'Use the call or chat button in the active ride screen. Your number remains private through our secure communication system.',
            
            // Account follow-ups
            'Not receiving password reset email?': 'Check spam/junk folder. Ensure email address is correct. If still not received, contact support with your registered email address.',
            'Account locked or suspended?': 'Account may be locked due to security reasons or policy violations. Contact support with your account details for assistance.',
            
            // Payment follow-ups
            'Which payment methods are accepted?': 'We accept Visa, MasterCard, American Express, PayPal, Apple Pay, Google Pay, UPI, and cash (select locations).',
            'How to add new payment method?': 'Go to Profile > Payment Methods > Add New. Enter card details or link digital wallet. We use bank-level encryption for security.',
            
            // Default response
            'default': 'I understand your concern. This requires personalized assistance. Would you like me to connect you with our admin team for detailed help?'
        };
        
        return responses[followUpText] || responses['default'];
    };

    const handleFollowUpSelect = (followUpText) => {
        const userMessage = {
            text: followUpText,
            sender: user.name || user.email,
            senderType: 'user',
            timestamp: new Date()
        };
        
        const botResponse = {
            text: getFollowUpResponse(followUpText),
            sender: "Support Bot",
            senderType: 'bot',
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage, botResponse]);
        
        // Show resolution options after follow-up
        setTimeout(() => {
            setCurrentStep('resolution');
        }, 1500);
    };

    const handleEscalateToAdmin = async () => {
        setWaitingForAdmin(true);
        setEscalatedToAdmin(true);
        setCurrentStep('admin');
        
        const escalationMessage = {
            text: "I need to speak with a human agent",
            sender: user.name || user.email,
            senderType: 'user',
            timestamp: new Date()
        };
        
        const adminResponse = {
            text: "🔄 Connecting you to our admin team... Please wait while we find an available agent. You'll receive an email notification once connected.",
            sender: "Support System",
            senderType: 'admin',
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, escalationMessage, adminResponse]);
        
        // Send email notification
        try {
            await fetch('/api/support/escalate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId: user._id || user.id,
                    userEmail: user.email,
                    userName: user.name || user.email,
                    category: selectedCategory,
                    issue: selectedIssue,
                    sessionId: sessionId,
                    messages: messages,
                    timestamp: new Date()
                })
            });
        } catch (error) {
            console.error('Failed to send escalation notification:', error);
        }
        
        if (socket && socket.connected) {
            socket.emit('escalate-to-admin', {
                userId: user._id || user.id,
                category: selectedCategory,
                issue: selectedIssue,
                sessionId: sessionId,
                messages: messages
            });
        }
        
        // Simulate admin connection after 30 seconds
        setTimeout(() => {
            setAdminConnected(true);
            setWaitingForAdmin(false);
            const adminConnectedMsg = {
                text: "👋 Hello! I'm Sarah from the support team. I've reviewed your conversation and I'm here to help. How can I assist you further?",
                sender: "Admin - Sarah",
                senderType: 'admin',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, adminConnectedMsg]);
        }, 30000);
    };
    
    const handleResolutionChoice = (resolved) => {
        if (resolved) {
            setShowFeedback(true);
            setCurrentStep('feedback');
            const resolvedMsg = {
                text: "Great! I'm glad I could help resolve your issue.",
                sender: "Support Bot",
                senderType: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, resolvedMsg]);
        } else {
            handleEscalateToAdmin();
        }
    };
    
    const submitFeedback = async () => {
        if (feedbackRating === 0) {
            alert('Please provide a rating before submitting.');
            return;
        }
        
        try {
            await fetch('/api/support/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId: user._id || user.id,
                    sessionId: sessionId,
                    category: selectedCategory,
                    issue: selectedIssue,
                    rating: feedbackRating,
                    comment: feedbackComment,
                    timestamp: new Date()
                })
            });
            
            const thankYouMsg = {
                text: `Thank you for your ${feedbackRating}-star rating! Your feedback helps us improve our service. Have a great day! 🌟`,
                sender: "Support System",
                senderType: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, thankYouMsg]);
            
            setTimeout(() => {
                onClose();
            }, 3000);
            
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        }
    };

    const sendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!newMessage.trim() || loading) return;

        setLoading(true);
        
        const userMessage = {
            text: newMessage,
            sender: user.name || user.email,
            senderType: 'user',
            timestamp: new Date(),
            userId: user._id || user.id
        };

        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');

        if (socket && socket.connected && escalatedToAdmin) {
            socket.emit('send-message', userMessage);
        } else if (!escalatedToAdmin) {
            // Auto-reply for general messages
            setTimeout(() => {
                const botResponse = {
                    text: "Thank you for your message. I'm here to help! You can also select from the options above or escalate to our admin team if needed.",
                    sender: "Support Bot",
                    senderType: 'bot',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botResponse]);
            }, 1000);
        }
        
        setLoading(false);
    };

    const resetChat = () => {
        setCurrentStep('category');
        setSelectedCategory('');
        setSelectedIssue('');
        setEscalatedToAdmin(false);
        setShowFollowUp(false);
        setCurrentFollowUp([]);
        setShowFeedback(false);
        setFeedbackRating(0);
        setFeedbackComment('');
        setAdminConnected(false);
        setWaitingForAdmin(false);
        setMessages([]);
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
                    {/* Step 1: Category Selection */}
                    {currentStep === 'category' && (
                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                            <p style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>👋 Welcome to Professional Support!</p>
                            <p style={{ marginBottom: '20px', fontSize: '14px' }}>Please select your issue category:</p>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {Object.entries(supportCategories).map(([key, category]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleCategorySelect(key)}
                                        style={{
                                            padding: '15px 20px',
                                            backgroundColor: 'white',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            textAlign: 'left',
                                            transition: 'all 0.3s',
                                            color: '#4a5568'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = '#667eea';
                                            e.target.style.color = 'white';
                                            e.target.style.borderColor = '#667eea';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'white';
                                            e.target.style.color = '#4a5568';
                                            e.target.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        {category.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Issue Selection */}
                    {currentStep === 'issue' && selectedCategory && (
                        <div style={{ textAlign: 'center', color: '#64748b' }}>
                            <p style={{ marginBottom: '20px', fontSize: '16px', fontWeight: '600' }}>Select your specific issue:</p>
                            <div style={{ display: 'grid', gap: '12px' }}>
                                {Object.entries(supportCategories[selectedCategory].issues).map(([key, issue]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleIssueSelect(key)}
                                        style={{
                                            padding: '15px 20px',
                                            backgroundColor: 'white',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '12px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            textAlign: 'left',
                                            transition: 'all 0.3s',
                                            color: '#4a5568'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = '#22c55e';
                                            e.target.style.color = 'white';
                                            e.target.style.borderColor = '#22c55e';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'white';
                                            e.target.style.color = '#4a5568';
                                            e.target.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        {issue.title}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentStep('category')}
                                style={{
                                    marginTop: '15px',
                                    padding: '8px 16px',
                                    backgroundColor: '#94a3b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                ← Back to Categories
                            </button>
                        </div>
                    )}

                    {/* Step 3: Follow-up Options */}
                    {currentStep === 'followup' && showFollowUp && (
                        <div style={{ marginTop: '20px' }}>
                            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '15px', textAlign: 'center' }}>Related questions you might have:</p>
                            <div style={{ display: 'grid', gap: '8px', marginBottom: '20px' }}>
                                {currentFollowUp.map((followUp, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleFollowUpSelect(followUp)}
                                        style={{
                                            padding: '12px 16px',
                                            backgroundColor: 'white',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            textAlign: 'left',
                                            transition: 'all 0.3s',
                                            color: '#4a5568'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = '#f59e0b';
                                            e.target.style.color = 'white';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'white';
                                            e.target.style.color = '#4a5568';
                                        }}
                                    >
                                        {followUp}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Step 4: Resolution Check */}
                    {currentStep === 'resolution' && (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <p style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '20px' }}>Did this help resolve your issue?</p>
                            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginBottom: '20px' }}>
                                <button
                                    onClick={() => handleResolutionChoice(true)}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#22c55e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    ✅ Yes, Issue Resolved
                                </button>
                                <button
                                    onClick={() => handleResolutionChoice(false)}
                                    style={{
                                        padding: '12px 24px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    ❌ Need More Help
                                </button>
                            </div>
                            <button
                                onClick={resetChat}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#94a3b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                🆕 Start New Query
                            </button>
                        </div>
                    )}
                    
                    {/* Step 5: Feedback Collection */}
                    {currentStep === 'feedback' && showFeedback && (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <p style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748', marginBottom: '20px' }}>Please rate your support experience</p>
                            
                            {/* Star Rating */}
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '20px' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setFeedbackRating(star)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '24px',
                                            cursor: 'pointer',
                                            color: star <= feedbackRating ? '#fbbf24' : '#d1d5db'
                                        }}
                                    >
                                        ⭐
                                    </button>
                                ))}
                            </div>
                            
                            {/* Comment Box */}
                            <textarea
                                value={feedbackComment}
                                onChange={(e) => setFeedbackComment(e.target.value)}
                                placeholder="Tell us about your experience (optional)..."
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    resize: 'vertical',
                                    outline: 'none',
                                    marginBottom: '15px'
                                }}
                            />
                            
                            <button
                                onClick={submitFeedback}
                                disabled={feedbackRating === 0}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: feedbackRating > 0 ? '#667eea' : '#94a3b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: feedbackRating > 0 ? 'pointer' : 'not-allowed',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                }}
                            >
                                Submit Feedback
                            </button>
                        </div>
                    )}
                    
                    {/* Admin Connection Status */}
                    {currentStep === 'admin' && (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            {waitingForAdmin && (
                                <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '12px', marginBottom: '15px' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
                                    <p style={{ margin: 0, color: '#92400e', fontWeight: '600' }}>Connecting to admin...</p>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#92400e' }}>Average wait time: 2-3 minutes</p>
                                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#92400e' }}>📧 Email notification sent to {user.email}</p>
                                </div>
                            )}
                            
                            {adminConnected && (
                                <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '12px', marginBottom: '15px' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>✅</div>
                                    <p style={{ margin: 0, color: '#065f46', fontWeight: '600' }}>Admin Connected!</p>
                                    <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#065f46' }}>You can now chat directly with our support team</p>
                                </div>
                            )}
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

                {/* Input - Always available except during feedback */}
                {currentStep !== 'feedback' && (
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
                            placeholder={
                                escalatedToAdmin && adminConnected 
                                    ? "Type your message to admin..." 
                                    : escalatedToAdmin && waitingForAdmin
                                    ? "Please wait for admin connection..."
                                    : "Type your question or select from options above..."
                            }
                            disabled={loading || (escalatedToAdmin && !adminConnected)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '20px',
                                outline: 'none',
                                opacity: (escalatedToAdmin && !adminConnected) ? 0.6 : 1
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading || !newMessage.trim() || (escalatedToAdmin && !adminConnected)}
                            style={{
                                padding: '10px 15px',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '20px',
                                cursor: 'pointer',
                                opacity: (loading || (escalatedToAdmin && !adminConnected)) ? 0.6 : 1
                            }}
                        >
                            {loading ? '...' : '📤'}
                        </button>
                    </form>
                )}
                
                {/* Footer with reset option */}
                {currentStep !== 'category' && currentStep !== 'feedback' && (
                    <div style={{
                        padding: '10px 20px',
                        borderTop: '1px solid #e2e8f0',
                        textAlign: 'center',
                        backgroundColor: '#f8fafc'
                    }}>
                        <button
                            onClick={resetChat}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#94a3b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            🆕 Start Over
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}