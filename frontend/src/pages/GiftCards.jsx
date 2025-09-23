import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function GiftCards() {
    const { user } = useAuthContext();
    const [amount, setAmount] = useState('');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('razorpay');
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        const success = urlParams.get('success');
        const cancelled = urlParams.get('cancelled');
        
        if (success && sessionId) {
            handleStripeSuccess(sessionId);
        } else if (cancelled) {
            alert('Payment was cancelled');
        }
        
        if (sessionId || success || cancelled) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);
    
    const handleStripeSuccess = async (sessionId) => {
        try {
            const response = await fetch('http://localhost:5000/api/gift-cards/stripe/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId })
            });
            const data = await response.json();
            if (data.success) {
                showGiftCardModal(data.giftCard);
            } else {
                alert('Payment verification failed');
            }
        } catch (error) {
            alert('Error processing payment');
        }
    };


    const handlePurchase = async () => {
        if (!amount || amount < 10) {
            alert('Minimum gift card amount is ₹10');
            return;
        }
        
        if (!recipientEmail || !recipientEmail.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            
            if (paymentMethod === 'razorpay') {
                await handleRazorpayPayment();
            } else if (paymentMethod === 'stripe') {
                await handleStripePayment();
            } else if (paymentMethod === 'paypal') {
                await handlePayPalPayment();
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed. Please try again.');
        }
        setLoading(false);
    };

    const handleRazorpayPayment = async () => {
        // Create order
        const orderResponse = await fetch('http://localhost:5000/api/gift-cards/razorpay/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: parseInt(amount) * 100, // Convert to paise
                recipient_email: recipientEmail,
                recipient_name: recipientName
            })
        });
        
        const orderData = await orderResponse.json();
        if (!orderData.success) throw new Error(orderData.error);

        // Initialize Razorpay
        const options = {
            key: 'rzp_test_GtGhzAvU4dco7G',
            amount: orderData.order.amount,
            currency: 'INR',
            name: 'Car Rental Gift Card',
            description: 'Gift Card Purchase',
            order_id: orderData.order.id,
            handler: async (response) => {
                try {
                    // Verify payment
                    const verifyResponse = await fetch('http://localhost:5000/api/gift-cards/razorpay/verify', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            amount: parseInt(amount) * 100,
                            recipient_email: recipientEmail,
                            recipient_name: recipientName
                        })
                    });
                    
                    const verifyData = await verifyResponse.json();
                    if (verifyData.success) {
                        showGiftCardModal(verifyData.giftCard);
                        resetForm();
                    } else {
                        alert('Payment verification failed');
                    }
                } catch (error) {
                    alert('Payment verification error');
                }
            },
            modal: {
                ondismiss: function() {
                    alert('Payment cancelled');
                }
            }
        };

        // Load Razorpay script if not loaded
        if (!window.Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => {
                const rzp = new window.Razorpay(options);
                rzp.open();
            };
            document.body.appendChild(script);
        } else {
            const rzp = new window.Razorpay(options);
            rzp.open();
        }
    };

    const handleStripePayment = async () => {
        // Create payment intent
        const intentResponse = await fetch('http://localhost:5000/api/gift-cards/stripe/create-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: parseInt(amount),
                recipient_email: recipientEmail,
                recipient_name: recipientName
            })
        });
        
        const intentData = await intentResponse.json();
        if (!intentData.success) throw new Error(intentData.error);
        
        // Initialize Stripe Checkout
        const stripe = window.Stripe('pk_test_51RwgnORuv0jgys93nRFUmkJ3M011JRdLn3vr422DNDJRot8xhVHbgMVlxQ9o2hyd8TYP58TF9fyyfZFOoXAzY0uo004P2yueDY');
        
        // Redirect to Stripe Checkout
        const { error } = await stripe.redirectToCheckout({
            sessionId: intentData.session_id
        });
        
        if (error) {
            throw new Error(error.message);
        }
    };

    const handlePayPalPayment = async () => {
        // Create PayPal order first
        const orderResponse = await fetch('http://localhost:5000/api/gift-cards/paypal/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: parseInt(amount),
                recipient_email: recipientEmail,
                recipient_name: recipientName
            })
        });
        
        const orderData = await orderResponse.json();
        if (!orderData.success) throw new Error(orderData.error);
        
        // Open real PayPal gateway in popup
        const popup = window.open(
            orderData.approval_url,
            'paypal-payment',
            'width=600,height=700,scrollbars=yes,resizable=yes'
        );
        
        // Monitor popup for completion
        const checkClosed = setInterval(() => {
            if (popup.closed) {
                clearInterval(checkClosed);
                // Wait a moment then capture payment
                setTimeout(async () => {
                    try {
                        const captureResponse = await fetch('http://localhost:5000/api/gift-cards/paypal/capture', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                order_id: orderData.order_id,
                                amount: parseInt(amount),
                                usd_amount: orderData.usd_amount,
                                recipient_email: recipientEmail,
                                recipient_name: recipientName
                            })
                        });
                        
                        const captureData = await captureResponse.json();
                        if (captureData.success) {
                            showGiftCardModal(captureData.giftCard);
                            resetForm();
                        } else {
                            alert('Payment was cancelled or failed');
                        }
                    } catch (error) {
                        alert('Payment processing error');
                    }
                }, 1000);
            }
        }, 1000);
    };

    const resetForm = () => {
        setAmount('');
        setRecipientEmail('');
        setRecipientName('');
    };

    const showGiftCardModal = (giftCard) => {
        const modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:10000;display:flex;align-items:center;justify-content:center';
        modal.innerHTML = `
            <div style="background:white;padding:40px;border-radius:15px;max-width:500px;width:90%;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.3)">
                <div style="font-size:48px;margin-bottom:20px">🎉</div>
                <h2 style="color:#10b981;margin-bottom:20px;font-size:24px">Gift Card Created Successfully!</h2>
                <div style="background:#f0fdf4;border:2px dashed #10b981;border-radius:12px;padding:30px;margin:20px 0">
                    <div style="font-size:14px;color:#059669;margin-bottom:10px;font-weight:600">GIFT CARD CODE</div>
                    <div style="font-size:32px;font-weight:bold;color:#047857;letter-spacing:2px;margin-bottom:15px">${giftCard.code}</div>
                    <div style="font-size:18px;color:#065f46;margin-bottom:10px">Amount: ₹${giftCard.amount}</div>
                    <div style="font-size:14px;color:#059669">Valid until: ${new Date(giftCard.expires_at).toLocaleDateString()}</div>
                </div>
                <div style="background:#fef3c7;padding:15px;border-radius:8px;margin:20px 0">
                    <div style="font-size:14px;color:#92400e">📧 Recipient: ${giftCard.recipient_name}</div>
                    <div style="font-size:12px;color:#a16207;margin-top:5px">${giftCard.recipient_email}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background:#10b981;color:white;border:none;padding:12px 30px;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;margin-top:10px">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundImage: 'url(/assets/giftcard.png)', backgroundSize: '100% 100%', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
            <Navbar user={user} />
            
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '30px', color: '#2d3748', textAlign: 'center' }}>
                    🎁 Gift Cards
                </h1>

                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {/* Quick Select Gift Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '15px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            marginBottom: '20px'
                        }}
                    >
                        <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>Quick Select</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
                            {[50, 100, 200, 500, 1000].map(value => (
                                <motion.button
                                    key={value}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setAmount(value.toString());
                                        setRecipientName('Gift Recipient');
                                        setRecipientEmail('recipient@example.com');
                                    }}
                                    style={{
                                        padding: '15px',
                                        backgroundColor: amount === value.toString() ? '#3b82f6' : '#f1f5f9',
                                        color: amount === value.toString() ? 'white' : '#2d3748',
                                        border: '2px solid',
                                        borderColor: amount === value.toString() ? '#3b82f6' : '#e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ₹{value}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Purchase Gift Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        style={{
                            backgroundColor: 'white',
                            padding: '30px',
                            borderRadius: '15px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}
                    >
                        <h2 style={{ marginBottom: '20px', color: '#2d3748' }}>Purchase Gift Card</h2>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Amount (₹)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount (min ₹10)"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '16px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Recipient Name</label>
                            <input
                                type="text"
                                value={recipientName}
                                onChange={(e) => setRecipientName(e.target.value)}
                                placeholder="Enter recipient name"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '16px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Recipient Email</label>
                            <input
                                type="email"
                                value={recipientEmail}
                                onChange={(e) => setRecipientEmail(e.target.value)}
                                placeholder="Enter recipient email"
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '16px'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Payment Method</label>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '8px',
                                    fontSize: '16px'
                                }}
                            >
                                <option value="razorpay">Razorpay</option>
                                <option value="stripe">Stripe</option>
                                <option value="paypal">PayPal</option>
                            </select>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePurchase}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '15px',
                                backgroundColor: loading ? '#94a3b8' : '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Processing...' : 'Purchase Gift Card'}
                        </motion.button>
                    </motion.div>


                </div>
            </div>
        </div>
    );
}