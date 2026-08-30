import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Auth.css';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [formData, setFormData] = useState({
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
            toast.error('Passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/auth/reset-password', {
                token,
                newPassword: formData.newPassword
            });
            toast.success('Password reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="container text-center mt-5">
                <h3>Invalid Reset Link</h3>
                <p>Please request a new password reset link.</p>
                <a href="/forgot-password" className="btn btn-primary">Request New Link</a>
            </div>
        );
    }

    return (
        <motion.div
            className="auth-container animated-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="container">
                <div className="row justify-content-center align-items-center min-vh-100">
                    <div className="col-md-5">
                        <motion.div
                            className="card shadow-custom"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="card-header text-center">
                                <h3 className="mb-0">Reset Password</h3>
                            </div>
                            <div className="card-body p-4">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            placeholder="Enter new password"
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Confirm Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm new password"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={loading}
                                    >
                                        {loading ? 'Resetting...' : 'Reset Password'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default ResetPassword;
