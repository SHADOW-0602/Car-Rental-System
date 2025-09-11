import React, { useState } from 'react';

export default function PaymentGateway({ ride, onPaymentComplete }) {
  const [processing, setProcessing] = useState(false);
  const [paymentId, setPaymentId] = useState(null);

  const initiatePayment = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rideId: ride._id,
          paymentMethod: ride.payment_method,
          amount: ride.fare
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentId(data.payment_id);
        
        // Handle different payment methods
        switch (ride.payment_method) {
          case 'razorpay':
            handleRazorpayPayment(data.gateway_response);
            break;
          case 'stripe':
            handleStripePayment(data.gateway_response);
            break;
          case 'paypal':
            handlePayPalPayment(data.gateway_response);
            break;
          case 'cash':
            handleCashPayment();
            break;
          default:
            alert('Unsupported payment method');
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      alert('Failed to initiate payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleRazorpayPayment = (gatewayResponse) => {
    if (window.Razorpay) {
      const options = {
        key: gatewayResponse.key_id,
        amount: gatewayResponse.amount,
        currency: gatewayResponse.currency,
        order_id: gatewayResponse.id,
        name: 'Car Rental Service',
        description: `Payment for Ride #${ride._id.slice(-6).toUpperCase()}`,
        handler: function (response) {
          verifyPayment(response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: {
          name: ride.user_id?.name || '',
          email: ride.user_id?.email || '',
          contact: ride.user_id?.phone || ''
        },
        theme: {
          color: '#667eea'
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      alert('Razorpay SDK not loaded');
    }
  };

  const handleStripePayment = (gatewayResponse) => {
    // Redirect to Stripe checkout or handle with Stripe Elements
    window.open(gatewayResponse.checkout_url, '_blank');
  };

  const handlePayPalPayment = (gatewayResponse) => {
    // Redirect to PayPal
    window.open(gatewayResponse.approval_url, '_blank');
  };

  const handleCashPayment = () => {
    alert('Cash payment selected. Please pay the driver directly.');
    onPaymentComplete();
  };

  const verifyPayment = async (gatewayPaymentId, signature) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payments/${paymentId}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gateway_payment_id: gatewayPaymentId,
          signature: signature
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Payment completed successfully!');
          onPaymentComplete();
        } else {
          alert('Payment verification failed');
        }
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Payment verification failed');
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'razorpay': return '💳';
      case 'stripe': return '💳';
      case 'paypal': return '🅿️';
      case 'cash': return '💵';
      default: return '💰';
    }
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'razorpay': return 'Razorpay';
      case 'stripe': return 'Stripe';
      case 'paypal': return 'PayPal';
      case 'cash': return 'Cash';
      default: return 'Payment';
    }
  };

  return (
    <div style={{
      padding: '25px',
      backgroundColor: '#f8fafc',
      borderRadius: '15px',
      border: '2px solid #e2e8f0',
      marginBottom: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>💳</div>
        <h3 style={{ margin: '0 0 10px 0', color: '#2d3748' }}>
          Complete Your Payment
        </h3>
        <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>
          Your ride has been completed. Please proceed with payment.
        </p>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <span style={{ color: '#718096', fontSize: '14px' }}>Trip Fare</span>
          <span style={{ fontSize: '24px', fontWeight: '700', color: '#2d3748' }}>
            ₹{ride.fare}
          </span>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <span style={{ color: '#718096', fontSize: '14px' }}>Payment Method</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>
              {getPaymentMethodIcon(ride.payment_method)}
            </span>
            <span style={{ fontWeight: '600', color: '#2d3748' }}>
              {getPaymentMethodName(ride.payment_method)}
            </span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '15px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748' }}>
            Total Amount
          </span>
          <span style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>
            ₹{ride.fare}
          </span>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={initiatePayment}
          disabled={processing}
          style={{
            padding: '15px 30px',
            backgroundColor: processing ? '#94a3b8' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: processing ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            minWidth: '200px'
          }}
          onMouseEnter={(e) => {
            if (!processing) {
              e.target.style.backgroundColor = '#5a67d8';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!processing) {
              e.target.style.backgroundColor = '#667eea';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {processing ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '10px'
              }}></div>
              Processing...
            </span>
          ) : (
            `Pay ₹${ride.fare} via ${getPaymentMethodName(ride.payment_method)}`
          )}
        </button>
      </div>

      {ride.payment_method === 'cash' && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          backgroundColor: '#fef3c7',
          borderRadius: '10px',
          border: '1px solid #f59e0b',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#92400e', fontSize: '14px' }}>
            💵 Cash Payment: Please pay the driver directly
          </p>
        </div>
      )}
    </div>
  );
}