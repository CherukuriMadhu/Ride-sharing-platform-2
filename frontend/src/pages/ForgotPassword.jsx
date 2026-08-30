import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Auth.css';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/users/forgot-password', { email });
            toast.success(response.data || 'Password reset email sent! Please check your inbox.', {
                position: 'top-center',
                autoClose: 5000
            });
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data || 'Failed to send reset email', {
                position: 'top-center'
            });
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
                    <h2 style={{ fontWeight: 'bold', color: '#2c3e50' }}>Recover Password</h2>
                    <p className="text-muted">Enter email to receive a temporary password</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ padding: '10px', borderRadius: '8px' }}
                        />
                    </div>

                    <button type="submit" className="btn w-100 py-2" disabled={loading} style={{
                        borderRadius: '8px', fontWeight: 'bold',
                        backgroundColor: '#ffc107', borderColor: '#ffc107', color: '#000',
                        fontSize: '1rem'
                    }}>
                        {loading ? 'Sending...' : 'Send Temporary Password'}
                    </button>

                    <button type="button" className="btn btn-secondary w-100 py-2 mt-2"
                        onClick={() => window.location.href = '/login'} style={{
                            borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem'
                        }}>
                        Back to Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;
