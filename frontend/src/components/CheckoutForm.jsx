import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { toast } from 'react-toastify';
import './PaymentModal.css';

const CheckoutForm = ({ amount, bookingDetails, onSuccess, onFailure }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        // Create PaymentIntent as soon as the component loads
        const fetchIntent = async () => {
            try {
                const response = await axios.post('http://localhost:8082/api/payments/create-intent', {
                    bookingId: bookingDetails.bookingId,
                });
                setClientSecret(response.data.clientSecret);
            } catch (error) {
                console.error("Error creating payment intent", error);
                toast.error("Could not initialize payment.");
                onFailure();
            }
        };

        if (bookingDetails?.bookingId) {
            fetchIntent();
        }
    }, [bookingDetails]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            return;
        }

        setLoading(true);

        const cardElement = elements.getElement(CardElement);

        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        });

        if (error) {
            console.error("Payment failed", error);
            toast.error(error.message || "Payment failed!");
            setLoading(false);
            onFailure();
        } else if (paymentIntent.status === 'succeeded') {
            try {
                await axios.post('http://localhost:8082/api/payments/confirm', {
                    bookingId: bookingDetails.bookingId,
                    paymentIntentId: paymentIntent.id
                });
                toast.success('Payment successful!');
                onSuccess();
            } catch (confirmError) {
                console.error("Error confirming with backend", confirmError);
                toast.error(confirmError.response?.data || "Payment successful, but confirmation failed.");
                onFailure();
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <div className="card-element-container mb-4 p-3 border rounded">
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#ffffff', // For dark theme
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>
            <button
                type="submit"
                disabled={!stripe || loading || !clientSecret}
                className="btn py-2 fw-bold w-100 pay-now-btn"
                style={{ backgroundColor: '#00ff88', color: '#000000' }}
            >
                {loading ? (
                    <span>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                    </span>
                ) : (
                    `Pay ₹${amount}`
                )}
            </button>
        </form>
    );
};

export default CheckoutForm;
