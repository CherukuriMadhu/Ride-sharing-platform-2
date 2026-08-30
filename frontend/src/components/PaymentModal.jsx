import React, { useState } from 'react';
import './PaymentModal.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

// Replace with a valid test publishable key (dummy placeholder)
const stripePromise = loadStripe("pk_test_51T6wCiFLob116x8RpgyQ9CxoIG2Lw8npP2okIqCr28He77SiOaDHDVMoIMggFZRRH8vjyDW8EuyVAyKlVOs6v1qY00RNX6rc9Y");

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, onPaymentFailure, amount, bookingDetails }) => {
    const [processing, setProcessing] = useState(false);

    if (!isOpen) return null;

    if (!isOpen) return null;

    const handleSuccess = () => {
        onPaymentSuccess();
    };

    const handleFailure = () => {
        // Keeps modal open if failure but we can close it if preferred
        // onPaymentFailure();
    };
    return (
        <div className="payment-modal-overlay">
            <div className="payment-modal-container">
                <div className="payment-modal-header">
                    <h3>Secure Dummy Payment</h3>
                    <button className="close-btn" onClick={onClose} disabled={processing}>&times;</button>
                </div>
                <div className="payment-modal-body">
                    <div className="payment-summary mb-4">
                        <div className="d-flex justify-content-between mb-2">
                            <span>Amount to Pay:</span>
                            <span className="fw-bold">₹{amount}</span>
                        </div>
                        <div className="small text-muted">
                            For {bookingDetails.seats} seat(s) on Ride #{bookingDetails.rideId}
                        </div>
                    </div>

                    <div className="payment-methods mb-4">
                        <div className="payment-method-item active">
                            <span className="icon">💳</span>
                            <span>Secure Payment with Stripe</span>
                        </div>
                    </div>

                    <Elements stripe={stripePromise}>
                        <CheckoutForm
                            amount={amount}
                            bookingDetails={bookingDetails}
                            onSuccess={handleSuccess}
                            onFailure={handleFailure}
                        />
                    </Elements>

                </div>
                <div className="payment-modal-footer">
                    <small className="text-muted">Use Stripe test card: <br /> 4242 4242 4242 4242 • Any Future Date • Any CVC</small>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
