import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';
import { fadeIn, slideUp, staggerContainer, staggerItem } from '../animations/variants';
import { AnimatedContainer } from '../animations/AnimatedComponents';
import { ScrollFadeIn, ScrollSlideLeft, ScrollSlideRight } from '../animations/ScrollAnimatedComponents';

export default function About() {
    const { user } = useAuthContext();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            
            {/* Hero Section */}
            <AnimatedContainer
                variants={fadeIn}
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '100px 20px 80px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    fontSize: '120px',
                    opacity: '0.1'
                }}>🚗</div>
                <motion.h1 
                    variants={slideUp}
                    style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px', textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}
                >
                    About UrbanFleet
                </motion.h1>
                <p style={{ fontSize: '1.3rem', opacity: '0.9', maxWidth: '600px', margin: '0 auto' }}>
                    Revolutionizing transportation with cutting-edge technology, premium service, and unmatched reliability.
                </p>
            </AnimatedContainer>

            {/* Main Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
                
                {/* Our Story */}
                <ScrollFadeIn style={{ marginBottom: '80px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '60px', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '30px' }}>
                                Our Story 📖
                            </h2>
                            <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: '1.8', marginBottom: '20px' }}>
                                Founded in 2024, UrbanFleet emerged from a simple vision: to make premium transportation accessible, 
                                reliable, and effortless for everyone. We recognized the gap between traditional taxi services and 
                                the modern traveler's needs.
                            </p>
                            <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: '1.8' }}>
                                Today, we're proud to serve thousands of customers daily with our fleet of premium vehicles, 
                                professional drivers, and cutting-edge technology that ensures every ride is safe, comfortable, and memorable.
                            </p>
                        </div>
                        <div style={{
                            backgroundColor: 'white',
                            padding: '40px',
                            borderRadius: '25px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎯</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Our Mission</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                                To provide safe, reliable, and premium transportation services that exceed customer expectations 
                                while supporting our driver partners and contributing to sustainable urban mobility.
                            </p>
                        </div>
                    </div>
                </ScrollFadeIn>

                {/* Key Features */}
                <ScrollSlideLeft style={{ marginBottom: '80px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '20px' }}>
                            Why Choose UrbanFleet? ⭐
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                            We're not just another ride service. Here's what makes us different.
                        </p>
                    </div>

                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}
                    >
                        <motion.div 
                            variants={staggerItem}
                            style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🛡️</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Safety First</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                                All drivers undergo thorough background checks, vehicle inspections, and safety training. 
                                Real-time GPS tracking and 24/7 emergency support ensure your safety.
                            </p>
                        </motion.div>
                        
                        <motion.div 
                            variants={staggerItem}
                            style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚡</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Lightning Fast</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                                Book your ride in under 30 seconds with our streamlined app. Smart matching algorithm 
                                connects you with the nearest available driver instantly.
                            </p>
                        </motion.div>
                        
                        <motion.div 
                            variants={staggerItem}
                            style={{ backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '60px', marginBottom: '20px' }}>💎</div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '15px' }}>Premium Quality</h3>
                            <p style={{ color: '#64748b', lineHeight: '1.6' }}>
                                Our fleet consists of well-maintained, premium vehicles with professional chauffeurs 
                                who prioritize your comfort and satisfaction.
                            </p>
                        </motion.div>
                    </motion.div>
                </ScrollSlideLeft>

                {/* Statistics */}
                <ScrollSlideRight style={{ marginBottom: '80px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                        borderRadius: '30px',
                        padding: '60px 40px',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '50px' }}>
                            Our Impact 📊
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
                            <div>
                                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#667eea', marginBottom: '10px' }}>50K+</div>
                                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Happy Customers</p>
                            </div>
                            <div>
                                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#22c55e', marginBottom: '10px' }}>1M+</div>
                                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Rides Completed</p>
                            </div>
                            <div>
                                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#f59e0b', marginBottom: '10px' }}>500+</div>
                                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Professional Drivers</p>
                            </div>
                            <div>
                                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#ef4444', marginBottom: '10px' }}>4.9★</div>
                                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Average Rating</p>
                            </div>
                        </div>
                    </div>
                </ScrollSlideRight>

                {/* Team Values */}
                <ScrollFadeIn style={{ marginBottom: '80px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#2d3748', marginBottom: '20px' }}>
                            Our Values 💝
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
                            These core values guide everything we do at UrbanFleet.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                        {[
                            { icon: '🤝', title: 'Trust & Reliability', desc: 'Building lasting relationships through consistent, dependable service.' },
                            { icon: '🌟', title: 'Excellence', desc: 'Continuously improving to exceed customer expectations in every interaction.' },
                            { icon: '🌱', title: 'Sustainability', desc: 'Committed to eco-friendly practices and supporting green transportation.' },
                            { icon: '💡', title: 'Innovation', desc: 'Leveraging cutting-edge technology to enhance the transportation experience.' }
                        ].map((value, index) => (
                            <div key={index} style={{
                                backgroundColor: 'white',
                                padding: '30px',
                                borderRadius: '20px',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '50px', marginBottom: '15px' }}>{value.icon}</div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '600', color: '#2d3748', marginBottom: '10px' }}>{value.title}</h3>
                                <p style={{ color: '#64748b', lineHeight: '1.6' }}>{value.desc}</p>
                            </div>
                        ))}
                    </div>
                </ScrollFadeIn>

                {/* Contact Information */}
                <ScrollFadeIn>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '30px',
                        padding: '60px 40px',
                        textAlign: 'center',
                        color: 'white'
                    }}>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '30px' }}>
                            Get in Touch 📞
                        </h2>
                        <p style={{ fontSize: '1.2rem', opacity: '0.9', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                            Have questions or want to learn more about UrbanFleet? We'd love to hear from you!
                        </p>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <a href="/contact" style={{
                                padding: '15px 30px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '50px',
                                fontSize: '16px',
                                fontWeight: '600',
                                border: '2px solid rgba(255,255,255,0.3)',
                                backdropFilter: 'blur(10px)',
                                transition: 'all 0.3s ease'
                            }}>
                                📧 Contact Us
                            </a>
                            {!user && (
                                <a href="/signup" style={{
                                    padding: '15px 30px',
                                    backgroundColor: '#22c55e',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '50px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    boxShadow: '0 8px 25px rgba(34, 197, 94, 0.4)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    🚀 Join UrbanFleet
                                </a>
                            )}
                        </div>
                    </div>
                </ScrollFadeIn>
            </div>
        </div>
    );
}