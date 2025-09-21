import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useAuthContext } from '../context/AuthContext';

export default function Careers() {
    const { user } = useAuthContext();

    const jobs = [
        {
            title: 'Senior Software Engineer',
            department: 'Engineering',
            location: 'Delhi NCR',
            type: 'Full-time',
            description: 'Build scalable backend systems for our ride-sharing platform.'
        },
        {
            title: 'Product Manager',
            department: 'Product',
            location: 'Mumbai',
            type: 'Full-time',
            description: 'Drive product strategy and roadmap for rider experience.'
        },
        {
            title: 'Data Scientist',
            department: 'Data & Analytics',
            location: 'Bangalore',
            type: 'Full-time',
            description: 'Analyze user behavior and optimize matching algorithms.'
        },
        {
            title: 'UX Designer',
            department: 'Design',
            location: 'Remote',
            type: 'Full-time',
            description: 'Design intuitive user experiences for mobile and web platforms.'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar user={user} />
            
            <div style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                padding: '100px 20px',
                textAlign: 'center'
            }}>
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: '3.5rem', fontWeight: '800', marginBottom: '20px' }}
                >
                    Join Our Team
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}
                >
                    Help us revolutionize urban transportation and build the future of mobility.
                </motion.p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px' }}>
                {/* Why Join Us */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '80px' }}
                >
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '40px', color: '#1f2937' }}>
                        Why Work at UrbanFleet?
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                        {[
                            { icon: '🚀', title: 'Innovation', desc: 'Work on cutting-edge technology that impacts millions of users' },
                            { icon: '🌱', title: 'Growth', desc: 'Continuous learning opportunities and career advancement' },
                            { icon: '🤝', title: 'Culture', desc: 'Collaborative environment with diverse, talented teams' },
                            { icon: '💰', title: 'Benefits', desc: 'Competitive salary, equity, health insurance, and more' }
                        ].map((item, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    backgroundColor: 'white',
                                    padding: '30px',
                                    borderRadius: '20px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{item.icon}</div>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '10px', color: '#1f2937' }}>
                                    {item.title}
                                </h3>
                                <p style={{ color: '#6b7280', lineHeight: '1.6' }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Open Positions */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                >
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '40px', color: '#1f2937', textAlign: 'center' }}>
                        Open Positions
                    </h2>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {jobs.map((job, index) => (
                            <motion.div 
                                key={index}
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    backgroundColor: 'white',
                                    padding: '30px',
                                    borderRadius: '15px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '20px'
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px', color: '#1f2937' }}>
                                        {job.title}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '15px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                        <span style={{ color: '#8b5cf6', fontWeight: '600', fontSize: '14px' }}>{job.department}</span>
                                        <span style={{ color: '#6b7280', fontSize: '14px' }}>📍 {job.location}</span>
                                        <span style={{ color: '#6b7280', fontSize: '14px' }}>⏰ {job.type}</span>
                                    </div>
                                    <p style={{ color: '#6b7280', lineHeight: '1.6' }}>{job.description}</p>
                                </div>
                                <button 
                                    className="btn btn-primary"
                                    style={{ padding: '12px 24px', fontSize: '14px', whiteSpace: 'nowrap' }}
                                >
                                    Apply Now
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    style={{
                        backgroundColor: '#f3f4f6',
                        borderRadius: '20px',
                        padding: '60px 40px',
                        textAlign: 'center',
                        marginTop: '80px'
                    }}
                >
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '20px', color: '#1f2937' }}>
                        Don't See Your Role?
                    </h2>
                    <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '1.1rem' }}>
                        We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
                    </p>
                    <a href="/contact" className="btn btn-success" style={{ textDecoration: 'none', padding: '15px 30px' }}>
                        Send Your Resume
                    </a>
                </motion.div>
            </div>
        </div>
    );
}