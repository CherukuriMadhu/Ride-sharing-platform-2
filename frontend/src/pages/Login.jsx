import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import axios from 'axios';

import { useAuth } from '../context/AuthContext';



function Login() {

    const [email, setEmail] = useState('');

    const [password, setPassword] = useState('');

    const { login } = useAuth();

    const navigate = useNavigate();



    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const response = await axios.post('/api/users/login', { email, password });

            const { token, user } = response.data;

            login(user, token);



            if (user.status === 'PENDING') {

                navigate('/pending-approval');

                return;

            }



            if (user.status === 'INACTIVE' || user.status === 'BANNED') {

                alert(`Login failed: Your account is ${user.status.toLowerCase()}. Please contact support.`);

                return;

            }



            if (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') {

                navigate('/admin');

            } else if (user.role === 'DRIVER') {

                navigate('/driver-dashboard');

            } else {

                navigate('/dashboard');

            }

        } catch (error) {

            alert('Login failed: ' + (error.response?.data || error.message));

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

            {/* Dark Overlay */}

            <div style={{

                position: 'absolute',

                top: 0,

                left: 0,

                right: 0,

                bottom: 0,

                backgroundColor: 'rgba(0,0,0,0.5)',

                zIndex: 1

            }}></div>



            <div className="card shadow-lg" style={{

                maxWidth: '400px',

                width: '90%',

                padding: '2rem',

                borderRadius: '15px',

                backgroundColor: 'rgba(255, 255, 255, 0.95)', // Glassmorphism-ish

                zIndex: 2,

                position: 'relative'

            }}>

                <div className="text-center mb-4">

                    <h2 style={{ fontWeight: 'bold', color: '#2c3e50' }}>Welcome Back</h2>

                    <p className="text-muted">Login to continue</p>

                </div>



                <form onSubmit={handleSubmit}>

                    <div className="mb-3">

                        <label className="form-label fw-bold">Email</label>

                        <input

                            type="email"

                            className="form-control"

                            placeholder="Enter your email"

                            value={email}

                            onChange={(e) => setEmail(e.target.value)}

                            required

                            style={{ padding: '10px', borderRadius: '8px' }}

                        />

                    </div>

                    <div className="mb-3">

                        <label className="form-label fw-bold">Password</label>

                        <input

                            type="password"

                            className="form-control"

                            placeholder="Enter your password"

                            value={password}

                            onChange={(e) => setPassword(e.target.value)}

                            required

                            style={{ padding: '10px', borderRadius: '8px' }}

                        />

                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-2" style={{

                        borderRadius: '8px',

                        fontWeight: 'bold',

                        backgroundColor: '#28a745',

                        border: 'none',

                        fontSize: '1rem'

                    }}>

                        Login

                    </button>

                </form>



                <div className="d-flex justify-content-between mt-3 align-items-center">

                    <span

                        onClick={() => navigate('/forgot-password')}

                        style={{ color: '#0d6efd', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'none' }}

                    >

                        Forgot Password?

                    </span>

                </div>



                <div className="text-center mt-4">

                    <p className="mb-0 text-muted" style={{ fontSize: '0.9rem' }}>

                        New to SmartRide? <span onClick={() => navigate('/register')} style={{ color: '#28a745', cursor: 'pointer', fontWeight: 'bold' }}>Create Account</span>

                    </p>

                </div>

            </div>

        </div>

    );

}



export default Login;

