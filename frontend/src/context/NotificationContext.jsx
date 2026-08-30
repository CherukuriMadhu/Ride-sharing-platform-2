import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import notificationService from '../notificationService';
import axios from 'axios';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [latestNotification, setLatestNotification] = useState(null);
    const [showToast, setShowToast] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!user?.userId) return;
        try {
            const [notifsRes, countRes] = await Promise.all([
                axios.get(`http://localhost:8082/api/notifications/user/${user.userId}`),
                axios.get(`http://localhost:8082/api/notifications/user/${user.userId}/unread-count`)
            ]);
            setNotifications(notifsRes.data);
            setUnreadCount(countRes.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, [user?.userId]);

    useEffect(() => {
        if (user?.userId) {
            fetchNotifications();

            // Connect to real-time stream
            notificationService.connect(user.userId, (newNotif) => {
                setNotifications(prev => [newNotif, ...prev]);
                setUnreadCount(prev => prev + 1);
                setLatestNotification(newNotif);
                setShowToast(true);
                
                // Auto-hide toast after 5 seconds
                setTimeout(() => setShowToast(false), 5000);
            });

            return () => notificationService.disconnect();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user?.userId, fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`http://localhost:8082/api/notifications/${id}/read`);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (!user?.userId) return;
        try {
            await axios.put(`http://localhost:8082/api/notifications/user/${user.userId}/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`http://localhost:8082/api/notifications/${id}`);
            const deleted = notifications.find(n => n.id === id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (deleted && !deleted.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    return (
        <NotificationContext.Provider value={{ 
            notifications, 
            unreadCount, 
            latestNotification, 
            showToast, 
            setShowToast,
            markAsRead,
            markAllAsRead,
            deleteNotification,
            refresh: fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
