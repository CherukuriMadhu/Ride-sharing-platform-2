import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import './DashboardLayout.css';

const DashboardLayout = ({ children, menuItems }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const token = localStorage.getItem('token');
                const [notifRes, unreadRes] = await Promise.all([
                    axios.get(`/api/notifications/user/${user.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`/api/notifications/user/${user.id}/unread-count`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);
                setNotifications(notifRes.data);
                setUnreadCount(unreadRes.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 5000); // Poll every 5s instead of 20s
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleMarkAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/notifications/${id}/read`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <h3>SmartRide</h3>
                    <small>{user?.role || 'User'} Panel</small>
                </div>
                <nav className="sidebar-nav">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => {
                                if (item.onClick) item.onClick();
                                if (item.path) navigate(item.path);
                            }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                    <button className="nav-item logout-btn" onClick={logout}>
                        <span className="nav-icon">🚪</span>
                        <span className="nav-label">Logout</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="dashboard-main">
                {/* Navbar */}
                <header className="dashboard-navbar">
                    <div className="navbar-left">
                        <h4 className="mb-0">Welcome, {user?.name || 'Guest'}</h4>
                    </div>
                    <div className="navbar-right">
                        <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
                            <span className="bell-icon">🔔</span>
                            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                        </div>
                        <div className="user-profile">
                            <div className="profile-img">{(user?.name || 'U').charAt(0)}</div>
                        </div>
                    </div>

                    {/* Notification Dropdown */}
                    {showNotifications && (
                        <div className="notification-dropdown shadow">
                            <div className="dropdown-header">Notifications</div>
                            <div className="notification-list">
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div
                                            key={n.id}
                                            className={`notification-item ${n.read ? 'read' : 'unread'}`}
                                            onClick={() => handleMarkAsRead(n.id)}
                                        >
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="notif-title fw-bold">{n.title}</div>
                                                {n.userRole && <span className="badge bg-light text-dark tiny">{n.userRole}</span>}
                                            </div>
                                            <div className="notif-message small mt-1">{n.message}</div>
                                            <small className="notif-time text-muted">{new Date(n.createdAt).toLocaleString()}</small>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-center text-muted">No notifications</div>
                                )}
                            </div>
                        </div>
                    )}
                </header>

                <div className="dashboard-content position-relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
