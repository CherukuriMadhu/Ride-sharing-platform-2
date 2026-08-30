import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import { toast } from 'react-toastify';
import axios from 'axios';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState(null);

    useEffect(() => {
        const verifyPayment = async (retryCount = 0) => {
            if (!sessionId) {
                setLoading(false);
                return;
            }
            try {
                // Use a clean axios request to bypass any global interceptors 
                // that might be adding Authorization headers which cause 403 on some configs
                const response = await axios.get(`/api/payments/verify?sessionId=${sessionId}`, {
                    headers: { 'Authorization': undefined }
                });

                if (response.data && response.data.status === "SUCCESS") {
                    setBookingData(response.data.booking);
                    toast.success("Payment verified successfully!");

                    // Show a fancy confetti style or prominent success message
                    setTimeout(() => {
                        alert("🎉 PAYMENT COMPLETED SUCCESSFULLY! \nYour ride is confirmed. You can now download the receipt.");
                    }, 500);
                } else {
                    throw new Error(response.data?.message || "Invalid response data");
                }
            } catch (error) {
                console.error("Verification error (attempt " + (retryCount + 1) + "):", error);

                // If it's a 400 (Payment not completed yet), retry a few times
                if (retryCount < 3 && (error.response?.status === 400 || !error.response)) {
                    console.log("Retrying in 2 seconds...");
                    setTimeout(() => verifyPayment(retryCount + 1), 2000);
                    return;
                }

                const msg = error.response?.data?.message || error.response?.data || error.message;
                toast.error(`Verification failed: ${msg}`);
            } finally {
                // IMPORTANT: Always set loading to false after retries or success
                // This prevents the stuck "Verifying Payment..." spinner
                setLoading(false);
            }
        };
        verifyPayment();
    }, [sessionId]);

    const downloadReceipt = () => {
        if (!bookingData) {
            toast.error("Receipt data not available yet.");
            return;
        }
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setTextColor(33, 150, 243);
        doc.text("SmartRide - Payment Receipt", 105, 20, { align: "center" });

        doc.setLineWidth(0.5);
        doc.line(20, 25, 190, 25);

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 35);
        doc.text(`Transaction ID: ${bookingData.transactionId || 'STRIPE-' + sessionId?.substring(0, 10)}`, 20, 42);

        doc.setFontSize(14);
        doc.text("Ride Summary", 20, 55);
        doc.setFontSize(11);
        doc.text(`From: ${bookingData.ride?.source?.address || 'N/A'}`, 25, 65);
        doc.text(`To: ${bookingData.ride?.destination?.address || 'N/A'}`, 25, 72);
        doc.text(`Driver: ${bookingData.ride?.driver?.name || 'N/A'}`, 25, 79);

        doc.setDrawColor(200, 200, 200);
        doc.rect(20, 90, 170, 40);
        doc.text(`Status: ${bookingData.status}`, 25, 100);
        doc.text(`Seats Booked: ${bookingData.seatsBooked}`, 25, 110);
        doc.setFontSize(14);
        doc.setTextColor(76, 175, 80);
        doc.text(`Total Amount: INR ${bookingData.totalPrice}`, 180, 110, { align: "right" });

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("Thank you for choosing SmartRide!", 105, 150, { align: "center" });

        doc.save(`SmartRide-Receipt-${bookingData.id}.pdf`);
        toast.success("Receipt downloaded!");
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-4">
            <motion.div
                className="card border-0 shadow-lg p-5 text-center"
                style={{ maxWidth: '600px', borderRadius: '24px' }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {loading ? (
                    <div className="py-5">
                        <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                        <h3 className="fw-bold">Verifying Payment...</h3>
                        <p className="text-muted">Please wait while we confirm your transaction.</p>
                    </div>
                ) : !bookingData ? (
                    <div className="py-5">
                        <div className="display-1 text-danger mb-4">❌</div>
                        <h3 className="fw-bold">Verification Failed</h3>
                        <p className="text-muted">We couldn't confirm your payment status. Please check your history.</p>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-primary rounded-pill">Back to Dashboard</button>
                    </div>
                ) : (
                    <>
                        <div className="display-1 text-success mb-4 animate-bounce">✅</div>
                        <h2 className="fw-bold mb-3">Ride Payment Confirmed!</h2>
                        <p className="text-muted fs-5 mb-4">
                            Great news! Your payment for the ride from <strong>{bookingData.ride?.source?.city}</strong> to <strong>{bookingData.ride?.destination?.city}</strong> has been received.
                            The driver has been notified and your seat is secured.
                        </p>

                        <div className="bg-white p-4 rounded-4 shadow-sm mb-4 border text-start">
                            <h6 className="fw-bold mb-3 border-bottom pb-2">💳 Payment Breakdown</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Transaction ID</span>
                                <span className="small text-break">{bookingData.transactionId}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Base Fare</span>
                                <span>₹{bookingData.ride?.pricePerSeat}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Seats Booked</span>
                                <span>x{bookingData.seatsBooked}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="fw-bold">Total Amount Paid</span>
                                <span className="h4 fw-bold text-success mb-0">₹{bookingData.totalPrice}</span>
                            </div>
                        </div>

                        <div className="d-grid gap-3">
                            <button
                                onClick={downloadReceipt}
                                className="btn btn-primary btn-lg rounded-pill fw-bold shadow-sm py-3"
                            >
                                📄 Download Full Receipt & Details
                            </button>
                            <button
                                onClick={() => navigate('/dashboard?tab=my-rides')}
                                className="btn btn-link text-decoration-none text-muted fw-bold"
                            >
                                ← Go to My Rides Section
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
