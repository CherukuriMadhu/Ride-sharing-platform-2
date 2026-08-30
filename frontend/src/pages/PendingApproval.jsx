import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PendingApproval = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f6fa',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card shadow-lg"
                style={{
                    maxWidth: '500px',
                    width: '100%',
                    textAlign: 'center',
                    padding: '40px',
                    borderRadius: '20px',
                    border: 'none'
                }}
            >
                <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
                <h2 style={{ fontWeight: '800', color: '#2d3436', marginBottom: '15px' }}>
                    Registration Successful!
                </h2>
                <p style={{ color: '#636e72', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '30px' }}>
                    Welcome to <strong>SmartRide</strong>! Your account has been registered successfully.
                    We have sent a confirmation email to your inbox.
                </p>
                <div style={{
                    backgroundColor: '#e3f2fd',
                    padding: '20px',
                    borderRadius: '12px',
                    marginBottom: '30px',
                    border: '1px solid #bbdefb'
                }}>
                    <p style={{ margin: 0, color: '#1976d2', fontWeight: '600' }}>
                        Admin Approval Required
                    </p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#1976d2' }}>
                        Our team is currently reviewing your application. You will be notified via email once your account is activated.
                    </p>
                </div>

                <div className="d-grid gap-2">
                    <button
                        className="btn btn-outline-secondary"
                        onClick={handleLogout}
                        style={{ padding: '12px', borderRadius: '10px', fontWeight: '600' }}
                    >
                        Logout & Exit
                    </button>
                </div>

                <p style={{ marginTop: '25px', fontSize: '0.85rem', color: '#b2bec3' }}>
                    Need help? Contact <a href="mailto:support@smartride.com" style={{ color: '#28a745' }}>support@smartride.com</a>
                </p>
            </motion.div>
        </div>
    );
};

export default PendingApproval;
