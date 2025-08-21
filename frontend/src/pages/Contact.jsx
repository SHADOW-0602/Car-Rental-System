import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';
import '../styles/main.css';

export default function Contact() {
  const { user } = useAuthContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar user={user} />
      
      {/* Header Section */}
      <div className="page-header">
        <h1 className="page-title">
          Contact Us
        </h1>
        <p className="page-subtitle">
          Get in touch with our team. We're here to help and answer any questions you may have.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid-container">
        <div className="grid-2">
          {/* Contact Form */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon primary">
                📝
              </div>
              <h2 className="card-title">
                Send us a Message
              </h2>
            </div>

            {submitted ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px'
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: 'white'
                }}>
                  ✓
                </div>
                <h3 style={{
                  color: '#065f46',
                  marginBottom: '15px',
                  fontSize: '1.5rem'
                }}>
                  Message Sent Successfully!
                </h3>
                <p style={{
                  color: '#047857',
                  marginBottom: '25px'
                }}>
                  Thank you for contacting us. We'll get back to you soon!
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      color: '#2d3748',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '15px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      color: '#2d3748',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '15px',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#667eea';
                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#2d3748',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: '#2d3748',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    style={{
                      width: '100%',
                      padding: '15px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 15px 35px rgba(102, 126, 234, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 10px 25px rgba(102, 126, 234, 0.3)';
                    }
                  }}
                >
                  {loading ? '🔄 Sending...' : '📤 Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div className="card">
            <div className="card-header">
              <div className="card-icon success">
                📞
              </div>
              <h2 className="card-title">
                Get in Touch
              </h2>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                color: '#2d3748',
                marginBottom: '20px',
                fontSize: '1.3rem',
                fontWeight: '600'
              }}>
                Contact Information
              </h3>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#667eea',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px',
                  fontSize: '18px',
                  color: 'white'
                }}>
                  📧
                </div>
                <div>
                  <div style={{
                    color: '#2d3748',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Email
                  </div>
                  <div style={{
                    color: '#718096',
                    fontSize: '14px'
                  }}>
                    kushagra.singh0602@gmail.com
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#38a169',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px',
                  fontSize: '18px',
                  color: 'white'
                }}>
                  📱
                </div>
                <div>
                  <div style={{
                    color: '#2d3748',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Phone
                  </div>
                  <div style={{
                    color: '#718096',
                    fontSize: '14px'
                  }}>
                    +91 9411659726
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#f59e0b',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '15px',
                  fontSize: '18px',
                  color: 'white'
                }}>
                  🏢
                </div>
                <div>
                  <div style={{
                    color: '#2d3748',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}>
                    Address
                  </div>
                  <div style={{
                    color: '#718096',
                    fontSize: '14px'
                  }}>
                    123 Car Street, Auto City, AC 12345
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{
                color: '#2d3748',
                marginBottom: '20px',
                fontSize: '1.3rem',
                fontWeight: '600'
              }}>
                Business Hours
              </h3>
              
              <div style={{
                backgroundColor: '#f7fafc',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  fontSize: '14px'
                }}>
                  <span style={{ color: '#4a5568' }}>Monday - Friday</span>
                  <span style={{ color: '#2d3748', fontWeight: '600' }}>8:00 AM - 8:00 PM</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  fontSize: '14px'
                }}>
                  <span style={{ color: '#4a5568' }}>Saturday</span>
                  <span style={{ color: '#2d3748', fontWeight: '600' }}>9:00 AM - 6:00 PM</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px'
                }}>
                  <span style={{ color: '#4a5568' }}>Sunday</span>
                  <span style={{ color: '#2d3748', fontWeight: '600' }}>10:00 AM - 4:00 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="card">
          <div className="card-header">
            <div className="card-icon" style={{ background: 'var(--secondary-gradient)' }}>
              ❓
            </div>
            <h2 className="card-title">
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gap: '20px'
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{
                color: '#2d3748',
                margin: '0 0 10px 0',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                How do I book a ride?
              </h4>
              <p style={{
                color: '#718096',
                margin: 0,
                lineHeight: '1.6'
              }}>
                Simply go to our Home page, select your pickup and drop-off locations, and click "Find Available Ride" to book your journey.
              </p>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{
                color: '#2d3748',
                margin: '0 0 10px 0',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                What payment methods do you accept?
              </h4>
              <p style={{
                color: '#718096',
                margin: 0,
                lineHeight: '1.6'
              }}>
                We accept all major credit cards, debit cards, and digital wallets including PayPal, Apple Pay, and Google Pay.
              </p>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{
                color: '#2d3748',
                margin: '0 0 10px 0',
                fontSize: '1.1rem',
                fontWeight: '600'
              }}>
                Can I cancel my booking?
              </h4>
              <p style={{
                color: '#718096',
                margin: 0,
                lineHeight: '1.6'
              }}>
                Yes, you can cancel your booking up to 1 hour before the scheduled pickup time without any cancellation fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
