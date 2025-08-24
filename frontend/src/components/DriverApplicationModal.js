import React, { useState } from 'react';
import api from '../services/api';

export default function DriverApplicationModal({ isOpen, onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Personal Information
        fullName: '',
        phone: '',
        email: '',
        dateOfBirth: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        
        // License Information
        licenseNumber: '',
        licenseExpiry: '',
        licenseState: '',
        
        // Vehicle Information
        vehicleType: '',
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: '',
        vehicleColor: '',
        registrationNumber: '',
        
        // Documents
        licensePhoto: null,
        vehicleRC: null,
        insurance: null,
        profilePhoto: null,
        
        // Experience
        drivingExperience: '',
        previousExperience: false,
        backgroundCheck: false,
        termsAccepted: false
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (field, file) => {
        setFormData(prev => ({ ...prev, [field]: file }));
    };

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handlePrevious = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    submitData.append(key, formData[key]);
                }
            });

            const response = await api.post('/users/apply-driver', submitData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                onSuccess('pending');
                alert('Application submitted successfully! We\'ll review it within 24-48 hours.');
            }
        } catch (error) {
            console.error('Application submission failed:', error);
            alert('Failed to submit application. Please try again.');
        } finally {
            setLoading(false);
        }
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
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '25px',
                    backgroundColor: '#22c55e',
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>🚕 Driver Application</h2>
                        <p style={{ margin: '5px 0 0 0', opacity: 0.9, fontSize: '14px' }}>Step {step} of 4</p>
                    </div>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '24px',
                        cursor: 'pointer'
                    }}>×</button>
                </div>

                {/* Progress Bar */}
                <div style={{ padding: '0 25px', backgroundColor: '#f8fafc' }}>
                    <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px' }}>
                        <div style={{
                            height: '100%',
                            backgroundColor: '#22c55e',
                            borderRadius: '2px',
                            width: `${(step / 4) * 100}%`,
                            transition: 'width 0.3s ease'
                        }}></div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '25px', overflowY: 'auto' }}>
                    {/* Step 1: Personal Information */}
                    {step === 1 && (
                        <div>
                            <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>👤 Personal Information</h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <input
                                    type="text"
                                    placeholder="Full Name *"
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number *"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address *"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                />
                                <input
                                    type="date"
                                    placeholder="Date of Birth *"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                />
                                <textarea
                                    placeholder="Complete Address *"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', minHeight: '80px', resize: 'vertical' }}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="City *"
                                        value={formData.city}
                                        onChange={(e) => handleInputChange('city', e.target.value)}
                                        style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="State *"
                                        value={formData.state}
                                        onChange={(e) => handleInputChange('state', e.target.value)}
                                        style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="PIN *"
                                        value={formData.pincode}
                                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                                        style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: License Information */}
                    {step === 2 && (
                        <div>
                            <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>📄 License Information</h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <input
                                    type="text"
                                    placeholder="Driving License Number *"
                                    value={formData.licenseNumber}
                                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <input
                                        type="date"
                                        placeholder="License Expiry Date *"
                                        value={formData.licenseExpiry}
                                        onChange={(e) => handleInputChange('licenseExpiry', e.target.value)}
                                        style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="License Issuing State *"
                                        value={formData.licenseState}
                                        onChange={(e) => handleInputChange('licenseState', e.target.value)}
                                        style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                    />
                                </div>
                                <select
                                    value={formData.drivingExperience}
                                    onChange={(e) => handleInputChange('drivingExperience', e.target.value)}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                >
                                    <option value="">Select Driving Experience *</option>
                                    <option value="1-2 years">1-2 years</option>
                                    <option value="3-5 years">3-5 years</option>
                                    <option value="5-10 years">5-10 years</option>
                                    <option value="10+ years">10+ years</option>
                                </select>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.previousExperience}
                                        onChange={(e) => handleInputChange('previousExperience', e.target.checked)}
                                    />
                                    <span style={{ fontSize: '14px', color: '#64748b' }}>I have previous experience as a commercial driver</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Vehicle Information */}
                    {step === 3 && (
                        <div>
                            <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>🚗 Vehicle Information</h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <select
                                    value={formData.vehicleType}
                                    onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                >
                                    <option value="">Select Vehicle Type *</option>
                                    <option value="sedan">Sedan</option>
                                    <option value="suv">SUV</option>
                                    <option value="hatchback">Hatchback</option>
                                    <option value="bike">Bike</option>
                                </select>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="Vehicle Make *"
                                        value={formData.vehicleMake}
                                        onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                                        style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Vehicle Model *"
                                        value={formData.vehicleModel}
                                        onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                                        style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px' }}>
                                    <input
                                        type="number"
                                        placeholder="Year *"
                                        value={formData.vehicleYear}
                                        onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                                        style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Vehicle Color *"
                                        value={formData.vehicleColor}
                                        onChange={(e) => handleInputChange('vehicleColor', e.target.value)}
                                        style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Registration Number *"
                                    value={formData.registrationNumber}
                                    onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Documents & Verification */}
                    {step === 4 && (
                        <div>
                            <h3 style={{ marginBottom: '20px', color: '#2d3748' }}>📎 Documents & Verification</h3>
                            <div style={{ display: 'grid', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2d3748' }}>Profile Photo *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange('profilePhoto', e.target.files[0])}
                                        style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2d3748' }}>Driving License Photo *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange('licensePhoto', e.target.files[0])}
                                        style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2d3748' }}>Vehicle Registration Certificate *</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => handleFileChange('vehicleRC', e.target.files[0])}
                                        style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#2d3748' }}>Vehicle Insurance *</label>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={(e) => handleFileChange('insurance', e.target.files[0])}
                                        style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', width: '100%' }}
                                    />
                                </div>
                                
                                <div style={{ marginTop: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.backgroundCheck}
                                            onChange={(e) => handleInputChange('backgroundCheck', e.target.checked)}
                                        />
                                        <span style={{ fontSize: '14px', color: '#64748b' }}>I consent to background verification check</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.termsAccepted}
                                            onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                                        />
                                        <span style={{ fontSize: '14px', color: '#64748b' }}>I accept the terms and conditions for drivers</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '20px 25px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={handlePrevious}
                        disabled={step === 1}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: step === 1 ? '#94a3b8' : '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: step === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Previous
                    </button>
                    
                    {step < 4 ? (
                        <button
                            onClick={handleNext}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#22c55e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !formData.termsAccepted || !formData.backgroundCheck}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: (loading || !formData.termsAccepted || !formData.backgroundCheck) ? '#94a3b8' : '#22c55e',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: (loading || !formData.termsAccepted || !formData.backgroundCheck) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}