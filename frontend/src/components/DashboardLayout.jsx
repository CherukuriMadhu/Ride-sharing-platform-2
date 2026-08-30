import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import './DashboardLayout.css';

const DashboardLayout = ({ children, menuItems, title }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="brand">
                        <span className="brand-icon">🚗</span>
                        <span className="brand-name">SmartRide</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.id}
                            to={item.path}
                            className={`nav-item ${window.location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-button">
                        <span className="nav-icon">🚪</span>
                        <span className="nav-label">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-container">
                <header className="main-header">
                    <div className="header-left">
                        <button
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                        >
                            {isSidebarOpen ? '❮' : '❯'}
                        </button>
                        <h2 className="header-title">{title}</h2>
                    </div>

                    <div className="header-right">
                        <div className="notifications">
                            <span className="icon">🔔</span>
                            <span className="badge">3</span>
                        </div>
                        <div className="user-profile">
                            <div className="user-avatar">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="user-info">
                                <span className="user-name">{user?.name}</span>
                                <span className="user-role">{user?.role}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={window.location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
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
