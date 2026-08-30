import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="brand">SmartRide</Link>
            <div className="nav-links">
                {/* Permanent Links */}
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/faq">FAQ's</Link>

                {user ? (
                    <>
                        {(user.role === 'ADMIN' || user.role === 'ROLE_ADMIN') && (
                            <Link to="/admin">Admin Panel</Link>
                        )}

                        {user.role === 'DRIVER' && (
                            <>
                                <Link to="/driver-dashboard">Dashboard</Link>
                                <Link to="/post-ride">Post Ride</Link>
                            </>
                        )}

                        {user.role === 'PASSENGER' && (
                            <>
                                <Link to="/dashboard">Dashboard</Link>
                                <Link to="/search-ride">Search Ride</Link>
                            </>
                        )}

                        <div className="user-badge">
                            <span style={{ fontWeight: '600' }}>{user.name}</span>
                            <span className="role-tag">{user.role}</span>
                            <NotificationBell />
                            <button onClick={handleLogout} className="btn btn-secondary btn-sm ms-2">Logout</button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                        <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
