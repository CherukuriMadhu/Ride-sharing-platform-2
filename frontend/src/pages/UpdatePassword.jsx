import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Auth.css';

function UpdatePassword() {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/users/update-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Password updated successfully!');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'url("https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative'
        }}>
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1
            }}></div>

            <div className="card shadow-lg" style={{
                maxWidth: '400px', width: '90%', padding: '2rem',
                borderRadius: '15px', backgroundColor: 'rgba(255, 255, 255, 0.95)',
                zIndex: 2, position: 'relative'
            }}>
                <div className="text-center mb-4">
                    <h2 style={{ fontWeight: 'bold', color: '#2c3e50' }}>Update Password</h2>
                    <p className="text-muted">Secure your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Current Password</label>
                        <input
                            type="password"
                            className="form-control"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            placeholder="Enter current password"
                            required
                            style={{ padding: '10px', borderRadius: '8px' }}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            required
                            style={{ padding: '10px', borderRadius: '8px' }}
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Confirm New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                            required
                            style={{ padding: '10px', borderRadius: '8px' }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-100 py-2"
                        disabled={loading}
                        style={{
                            borderRadius: '8px', fontWeight: 'bold',
                            backgroundColor: '#28a745', border: 'none',
                            fontSize: '1rem'
                        }}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button type="button" className="btn btn-secondary w-100 py-2 mt-2"
                        onClick={() => window.history.back()} style={{
                            borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem'
                        }}>
                        Back
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UpdatePassword;
