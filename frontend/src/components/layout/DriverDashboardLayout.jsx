import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiGrid, FiPlus, FiTruck, FiInbox, FiUsers, 
    FiDollarSign, FiStar, FiSettings, FiLogOut, FiMenu, FiX, FiChevronLeft, FiChevronRight, FiBell, FiUser
} from 'react-icons/fi';
import './DriverDashboardLayout.css';

const MENU_ITEMS = [
  { id: 'overview',    icon: <FiGrid />,    label: 'Overview',              badge: null },
  { id: 'post-ride',   icon: <FiPlus />,    label: 'Post a Ride',           badge: null },
  { id: 'my-rides',    icon: <FiTruck />,   label: 'My Rides',              badge: null },
  { id: 'requests',    icon: <FiInbox />,   label: 'Ride Requests',         badge: 3    },
  { id: 'passengers',  icon: <FiUsers />,   label: 'Confirmed Passengers',  badge: null },
  { id: 'earnings',    icon: <FiDollarSign />, label: 'Earnings',           badge: null },
  { id: 'ratings',     icon: <FiStar />,    label: 'Ratings & Reviews',     badge: null },
  { id: 'vehicle',     icon: <FiSettings />,label: 'Vehicle Profile',       badge: null },
];

const INITIAL_NOTIFICATIONS = [
    { 
        id: 1, 
        type: "BOOKING",
        title: "New Booking Request",
        message: "Passenger Madhu Cherukuri requested a booking on ride 1",
        color: "#6366f1", 
        time: "17/3/2026, 10:19:15 pm", 
        unread: true 
    },
    { 
        id: 2, 
        type: "PAYMENT",
        title: "Payment Completed",
        message: "Payment completed for Ride 19 by Madhu Cherukuri",
        color: "#22c55e", 
        time: "17/3/2026, 8:59:50 pm", 
        unread: true 
    },
];

const DriverDashboardLayout = ({ children, activeTab, setActiveTab }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    
    const notificationRef = useRef(null);
    const avatarRef = useRef(null);

    // Format Date helper
    const getFormattedTime = () => {
        const now = new Date();
        return now.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        }).toLowerCase().replace(/\s/g, ' ');
    };

    // Simulated Real-time Notifications
    useEffect(() => {
        const passengers = ["Madhu Cherukuri", "Rajesh Kumar", "Anjali Singh", "Suresh Raina"];
        const rideNumbers = [1, 3, 5, 12, 19, 25];

        const interval = setInterval(() => {
            const isBooking = Math.random() > 0.4;
            const passenger = passengers[Math.floor(Math.random() * passengers.length)];
            const rideNo = rideNumbers[Math.floor(Math.random() * rideNumbers.length)];
            
            const newNotif = {
                id: Date.now(),
                type: isBooking ? "BOOKING" : "PAYMENT",
                title: isBooking ? "New Booking Request" : "Payment Completed",
                message: isBooking 
                    ? `Passenger ${passenger} requested a booking on ride ${rideNo}`
                    : `Payment completed for Ride ${rideNo} by ${passenger}`,
                color: isBooking ? "#6366f1" : "#22c55e",
                time: getFormattedTime(),
                unread: true
            };
            setNotifications(prev => [newNotif, ...prev].slice(0, 10));
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    // Outside click detection
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
            if (avatarRef.current && !avatarRef.current.contains(event.target)) {
                setShowUserDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsCollapsed(!isCollapsed);
    const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="driver-layout">
            {isMobileOpen && (
                <div className="sidebar-mobile-overlay" onClick={() => setIsMobileOpen(false)}></div>
            )}

            <aside className={`driver-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-top">
                    <div className="logo-wrapper">
                        <span className="logo-icon">🚗</span>
                        <div className="logo-text">
                            <span className="logo-title">SmartRide</span>
                            <span className="logo-subtitle">DRIVER PANEL</span>
                        </div>
                    </div>
                    <button className="collapse-toggle" onClick={toggleSidebar}>
                        {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                    </button>
                </div>

                <div className="sidebar-middle">
                    {MENU_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (isMobileOpen) setIsMobileOpen(false);
                            }}
                            title={isCollapsed ? item.label : ''}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!isCollapsed && <span className="nav-label">{item.label}</span>}
                            {item.badge && <span className="nav-badge">{item.badge}</span>}
                        </button>
                    ))}
                </div>

                <div className="sidebar-bottom">
                    <div className="divider"></div>
                    <button className="nav-item logout-item" onClick={() => setShowLogoutModal(true)}>
                        <span className="nav-icon"><FiLogOut /></span>
                        {!isCollapsed && <span className="nav-label">Logout</span>}
                    </button>
                </div>
            </aside>

            <div className="main-wrapper">
                <header className="driver-header">
                    <div className="mobile-header-left d-md-none">
                        <button className="hamburger-btn" onClick={toggleMobileMenu}>
                            <FiMenu />
                        </button>
                    </div>

                    <div className="header-left d-none d-md-block">
                        <h2 className="header-title">{activeTab.replace('-', ' ')}</h2>
                    </div>

                    <div className="header-right">
                        {/* 🔔 BELL WRAPPER */}
                        <div className="bell-wrapper-container" style={{ position: 'relative' }} ref={notificationRef}>
                            <div className="bell-wrapper" 
                                 onClick={() => {
                                    setShowNotifications(p => !p);
                                    setShowUserDropdown(false);
                                 }}>
                                <span role="img" aria-label="notifications" style={{ fontSize: '20px' }}>🔔</span>
                            </div>
                            {unreadCount > 0 && (
                                <span className="bell-badge">{unreadCount}</span>
                            )}
                            
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div 
                                        className="notification-dropdown"
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="notif-header">
                                            <span>🔔 Notifications <span className="live-badge">LIVE</span></span>
                                            <FiX onClick={(e) => {
                                                e.stopPropagation();
                                                setShowNotifications(false);
                                            }} />
                                        </div>
                                        <div className="notif-list">
                                            {notifications.map(n => (
                                                <div key={n.id} 
                                                     className={`notif-item ${n.unread ? 'unread' : ''}`}
                                                     onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(n.id);
                                                     }}>
                                                    <div className="notif-item-top">
                                                        <div className="notif-dot" style={{ background: n.color }}></div>
                                                        <div className="notif-content">
                                                            <span className="notif-title">{n.title}</span>
                                                            <span className="notif-message">{n.message}</span>
                                                            <span className="notif-time">{n.time}</span>
                                                        </div>
                                                        {n.unread && <div className="unread-indicator"></div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="notif-footer">View All Notifications</div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* AVATAR SQUARE */}
                        <div className="avatar-square-container" style={{ position: 'relative' }} ref={avatarRef}>
                            <div className="avatar-square"
                                 onClick={() => {
                                    setShowUserDropdown(p => !p);
                                    setShowNotifications(false);
                                 }}>
                                {user?.name?.charAt(0) || 'M'}
                            </div>
                            
                            <AnimatePresence>
                                {showUserDropdown && (
                                    <motion.div 
                                        className="avatar-dropdown"
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="avatar-user-info" style={{ background: '#f8fafc' }}>
                                            <div className="avatar-mini" style={{ borderRadius: '8px', background: '#6366f1' }}>{user?.name?.charAt(0) || 'M'}</div>
                                            <div>
                                                <div className="avatar-name">{user?.name || 'Madhu Cherukuri'}</div>
                                                <div className="avatar-role" style={{ color: '#6366f1' }}>DRIVER</div>
                                            </div>
                                        </div>
                                        <div className="divider" style={{ borderBottom: '1px solid #f1f5f9' }} />
                                        <div className="logout-item" onClick={() => setShowLogoutModal(true)}>
                                            <FiLogOut size={16} />
                                            <span>Logout</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <div className="content-container">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutModal && (
                    <div className="modal-overlay">
                        <motion.div 
                            className="logout-modal"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div className="modal-icon">🚪</div>
                            <h3 className="modal-title">Logout?</h3>
                            <p className="modal-text">Are you sure you want to logout from SmartRide?</p>
                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
                                <button className="btn-logout" onClick={handleLogout}>Logout</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DriverDashboardLayout;
