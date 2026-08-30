import { useState, useEffect, useRef } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaTrash, FaCheckDouble, FaInbox } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import './NotificationBell.css';

function NotificationBell() {
    const { user } = useAuth();
    const { 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        deleteNotification 
    } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderIcon = (type) => {
        switch (type) {
            case 'NEW_REQUEST': return '📧';
            case 'RIDE_ACCEPTED': return '✅';
            case 'BOOKING_REJECTED': return '❌';
            case 'BOOKING_CONFIRMED': return '📋';
            case 'RIDE_STARTED': return '🚗';
            case 'RIDE_COMPLETED': return '🏁';
            case 'PAYMENT_SUCCESS': return '💳';
            case 'PAYMENT_RECEIVED': return '💰';
            case 'ACCOUNT_APPROVED': return '🎉';
            case 'NEW_DRIVER': return '🪪';
            case 'NEW_RIDE': return '🛣️';
            default: return '🔔';
        }
    };

    if (!user) return null;

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <div className="bell-icon-wrapper" onClick={() => setIsOpen(!isOpen)}>
                <motion.div
                    animate={unreadCount > 0 ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                    transition={{ repeat: unreadCount > 0 ? Infinity : 0, duration: 0.5, repeatDelay: 3 }}
                >
                    <FaBell size={22} className={unreadCount > 0 ? "bell-active" : "bell-inactive"} />
                </motion.div>
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="notification-badge"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="notification-dropdown shadow-lg"
                    >
                        <div className="dropdown-header">
                            <div className="header-top">
                                <h5 className="m-0 fw-bold">Notifications</h5>
                                <button className="close-btn" onClick={() => setIsOpen(false)}>
                                    <IoClose size={20} />
                                </button>
                            </div>
                            {unreadCount > 0 && (
                                <button className="mark-all-btn" onClick={markAllAsRead}>
                                    <FaCheckDouble className="me-1" /> Mark all read
                                </button>
                            )}
                        </div>

                        <div className="dropdown-body">
                            {notifications.length === 0 ? (
                                <div className="empty-state">
                                    <FaInbox size={40} className="mb-2 text-muted opacity-50" />
                                    <p>All caught up!</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        className={`notification-item ${!notif.read ? 'unread' : 'read'}`}
                                        onClick={() => !notif.read && markAsRead(notif.id)}
                                    >
                                        <div className="notif-icon-circle">{renderIcon(notif.type)}</div>
                                        <div className="notif-content">
                                            <div className="notif-title">{notif.title}</div>
                                            <div className="notif-message">{notif.message}</div>
                                            <div className="notif-time">
                                                {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="notif-actions">
                                            {!notif.read && <div className="unread-dot"></div>}
                                            <button 
                                                className="delete-notif-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notif.id);
                                                }}
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        
                        {notifications.length > 0 && (
                            <div className="dropdown-footer">
                                <a href={
                                    user.role === 'ADMIN' ? "/admin" :
                                    user.role === 'DRIVER' ? "/driver-dashboard" : "/dashboard"
                                } className="view-all-link">
                                    Go to Dashboard
                                </a>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default NotificationBell;
