import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
            <motion.div
                className="card border-0 shadow-lg p-5 text-center"
                style={{ maxWidth: '500px', borderRadius: '24px' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="display-1 text-warning mb-4">⚠️</div>
                <h2 className="fw-bold mb-3">Payment Cancelled</h2>
                <p className="text-muted fs-5 mb-4">
                    Your payment was not completed. No charges were made. You can try again from your booking history.
                </p>

                <div className="d-grid gap-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentCancel;
