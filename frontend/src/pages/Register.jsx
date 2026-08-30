import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './RegisterWizard.css';

const Register = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('ROLE_SELECTION'); // 'ROLE_SELECTION' or 'WIZARD'
    const [role, setRole] = useState('PASSENGER');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1: Personal
        firstName: '', lastName: '', email: '', password: '',
        dob: '', gender: '', contactNo: '',

        // Step 2: Address
        address: '', city: '', state: '', zipCode: '',

        // Step 3: Education
        highSchoolName: '', highSchoolPercentage: '', highSchoolYear: '',
        intermediateCollegeName: '', intermediatePercentage: '', intermediateYear: '',
        graduationCollegeName: '', graduationPercentage: '', graduationYear: '',

        // Step 4: Documents (Files)
        aadhaarFile: null,

        // Driver Defaults removed
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    };

    const handleRoleSelect = (selectedRole) => {
        setRole(selectedRole);
        setView('WIZARD');
        setStep(1);
    };

    const handleBackToRoles = () => {
        setView('ROLE_SELECTION');
        setStep(1);
    };

    const validateStep = (currentStep) => {
        if (currentStep === 1) {
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.password ||
                !formData.dob || !formData.gender || !formData.contactNo) {
                toast.error("Please fill all Personal Details.");
                return false;
            }
        }
        if (currentStep === 2) {
            if (!formData.address || !formData.city || !formData.state || !formData.zipCode) {
                toast.error("Please fill all Address Details.");
                return false;
            }
        }
        if (currentStep === 3) {
            // Optional education check
        }
        if (currentStep === 4) {
            if (!formData.aadhaarFile) {
                toast.error("Please upload Aadhaar Card.");
                return false;
            }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(step)) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(4)) return;

        setLoading(true);
        const data = new FormData();
        const jsonPayload = {
            firstName: formData.firstName, lastName: formData.lastName,
            email: formData.email, password: formData.password,
            dob: formData.dob, gender: formData.gender, contactNo: formData.contactNo,
            role: role,
            address: formData.address, city: formData.city, state: formData.state, zipCode: formData.zipCode,
            highSchoolName: formData.highSchoolName, highSchoolPercentage: formData.highSchoolPercentage, highSchoolYear: formData.highSchoolYear,
            intermediateCollegeName: formData.intermediateCollegeName, intermediatePercentage: formData.intermediatePercentage, intermediateYear: formData.intermediateYear,
            graduationCollegeName: formData.graduationCollegeName, graduationPercentage: formData.graduationPercentage, graduationYear: formData.graduationYear
        };

        data.append('data', new Blob([JSON.stringify(jsonPayload)], { type: "application/json" }));
        if (formData.aadhaarFile) data.append('aadhaarFile', formData.aadhaarFile);

        try {
            const response = await axios.post('/api/users/register', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success("Registrated Successdfully! A welcome email has been sent. Please wait for admin approval.", {
                position: "top-center",
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Delay navigation slightly to let the user see the success message
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (error) {
            console.error('Registration Error:', error);
            const errorMsg = error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message;
            toast.error('Registration Failed: ' + errorMsg, {
                position: "top-center",
                autoClose: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="fade-in">
                        <h5 className="mb-3 text-secondary">Step 1: Personal Details</h5>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-group-label">First Name</label>
                                <input name="firstName" className="form-control" value={formData.firstName} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-group-label">Last Name</label>
                                <input name="lastName" className="form-control" value={formData.lastName} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-group-label">Email</label>
                                <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-group-label">Password</label>
                                <input type="password" name="password" className="form-control" value={formData.password} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-group-label">Date of Birth</label>
                                <input type="date" name="dob" className="form-control" value={formData.dob} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-group-label">Gender</label>
                                <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-group-label">Contact No</label>
                                <input name="contactNo" className="form-control" value={formData.contactNo} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="fade-in">
                        <h5 className="mb-3 text-secondary">Step 2: Address</h5>
                        <div className="row g-3">
                            <div className="col-12">
                                <label className="form-group-label">Full Address</label>
                                <input name="address" className="form-control" placeholder="Street, Sector, Apt..." value={formData.address} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-group-label">City</label>
                                <input name="city" className="form-control" value={formData.city} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-group-label">State</label>
                                <input name="state" className="form-control" value={formData.state} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-group-label">Zip Code</label>
                                <input name="zipCode" className="form-control" value={formData.zipCode} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="fade-in">
                        <h5 className="mb-3 text-secondary">Step 3: Educational Details</h5>
                        <div className="row g-3">
                            {/* 10th */}
                            <div className="col-12"><h6 className="text-muted border-bottom pb-1">10th Standard</h6></div>
                            <div className="col-md-6"><input name="highSchoolName" className="form-control" placeholder="School Name" value={formData.highSchoolName} onChange={handleChange} /></div>
                            <div className="col-md-3"><input name="highSchoolYear" className="form-control" placeholder="Year" value={formData.highSchoolYear} onChange={handleChange} /></div>
                            <div className="col-md-3"><input name="highSchoolPercentage" className="form-control" placeholder="%" value={formData.highSchoolPercentage} onChange={handleChange} /></div>

                            {/* 12th */}
                            <div className="col-12 mt-2"><h6 className="text-muted border-bottom pb-1">12th Standard</h6></div>
                            <div className="col-md-6"><input name="intermediateCollegeName" className="form-control" placeholder="College Name" value={formData.intermediateCollegeName} onChange={handleChange} /></div>
                            <div className="col-md-3"><input name="intermediateYear" className="form-control" placeholder="Year" value={formData.intermediateYear} onChange={handleChange} /></div>
                            <div className="col-md-3"><input name="intermediatePercentage" className="form-control" placeholder="%" value={formData.intermediatePercentage} onChange={handleChange} /></div>

                            {/* Graduation */}
                            <div className="col-12 mt-2"><h6 className="text-muted border-bottom pb-1">Graduation</h6></div>
                            <div className="col-md-6"><input name="graduationCollegeName" className="form-control" placeholder="University/College" value={formData.graduationCollegeName} onChange={handleChange} /></div>
                            <div className="col-md-3"><input name="graduationYear" className="form-control" placeholder="Year" value={formData.graduationYear} onChange={handleChange} /></div>
                            <div className="col-md-3"><input name="graduationPercentage" className="form-control" placeholder="%" value={formData.graduationPercentage} onChange={handleChange} /></div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="fade-in">
                        <h5 className="mb-3 text-secondary">Step 4: Documents</h5>
                        <div className="row g-3">
                            <div className="col-12">
                                <div className="p-3 border rounded bg-light">
                                    <label className="form-group-label">Aadhaar Card (PDF/Image)</label>
                                    <input type="file" name="aadhaarFile" className="form-control mt-1" onChange={handleFileChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="register-page-container">
            <div className="ken-burns-bg"></div>
            <div className="register-overlay"></div>

            {view === 'ROLE_SELECTION' ? (
                // --- STAGE 1: ROLE SELECTION ---
                <div className="role-selection-container fade-in">
                    <h2 className="role-selection-title">Join SmartRide</h2>
                    <p className="role-selection-subtitle">Choose how you want to register</p>

                    <div className="role-options-row">
                        <div className="role-card-select" onClick={() => handleRoleSelect('PASSENGER')}>
                            <div className="role-icon">🧑‍✈️</div>
                            <div className="role-title">Passenger</div>
                        </div>
                        <div className="role-card-select" onClick={() => handleRoleSelect('DRIVER')}>
                            <div className="role-icon">🚗</div>
                            <div className="role-title">Driver</div>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>
                            Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#28a745', cursor: 'pointer', fontWeight: 'bold' }}>Login here</span>
                        </p>
                    </div>
                </div>
            ) : (
                // --- STAGE 2: WIZARD FORM ---
                <div className="wizard-card">
                    {/* Header with Back Button (No Tabs) */}
                    <div className="wizard-header">
                        <button className="btn-back-role" onClick={handleBackToRoles}>
                            ← Back to Roles
                        </button>
                        <div className="wizard-title">
                            Registering as <span className="text-warning">{role === 'PASSENGER' ? 'Passenger' : 'Driver'}</span>
                        </div>
                        <div style={{ width: '80px' }}></div> {/* Spacer for alignment */}
                    </div>

                    {/* Step Indicators */}
                    <div className="step-indicator">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className={`step-dot ${step === s ? 'active' : ''} ${step > s ? 'completed' : ''}`}>
                                {step > s ? '✓' : s}
                                <span className="step-label">
                                    {s === 1 && 'Personal'}
                                    {s === 2 && 'Address'}
                                    {s === 3 && 'Education'}
                                    {s === 4 && 'Docs'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="wizard-content">
                        {renderStepContent()}
                    </div>

                    {/* Footer Buttons */}
                    <div className="wizard-footer">
                        <button
                            className="btn btn-wizard btn-prev"
                            onClick={prevStep}
                            disabled={step === 1}
                            style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
                        >
                            Previous
                        </button>

                        {step < 4 ? (
                            <button className="btn btn-wizard btn-next" onClick={nextStep}>
                                Next Step →
                            </button>
                        ) : (
                            <button className="btn btn-wizard btn-submit" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Submitting...' : 'Sign Up'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
