import React from 'react';
import { useNotification } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoAlertCircle, IoCheckmarkCircle, IoInformationCircle } from 'react-icons/io5';
import './NotificationToast.css';

const NotificationToast = () => {
  const { latestNotification, showToast, setShowToast } = useNotification();

  const getIcon = (type) => {
    if (type?.includes('SUCCESS') || type?.includes('APPROVED') || type?.includes('CONFIRMED')) {
      return <IoCheckmarkCircle className="toast-icon text-success" />;
    }
    if (type?.includes('REJECTED') || type?.includes('DECLINED') || type?.includes('ERROR')) {
      return <IoAlertCircle className="toast-icon text-danger" />;
    }
    return <IoInformationCircle className="toast-icon text-primary" />;
  };

  return (
    <AnimatePresence>
      {showToast && latestNotification && (
        <motion.div
          initial={{ opacity: 0, x: 100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 100, scale: 0.95 }}
          className="notification-toast-container"
        >
          <div className="toast-content">
            <div className="toast-icon-wrapper">
              {getIcon(latestNotification.type)}
            </div>
            <div className="toast-text">
              <h6 className="toast-title">{latestNotification.title}</h6>
              <p className="toast-message">{latestNotification.message}</p>
            </div>
            <button 
              className="toast-close-btn"
              onClick={() => setShowToast(false)}
            >
              <IoClose size={20} />
            </button>
          </div>
          <div className="toast-progress-bar">
            <motion.div 
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className="toast-progress-fill"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationToast;
