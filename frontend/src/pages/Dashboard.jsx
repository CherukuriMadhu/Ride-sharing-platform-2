import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import useRealTimeData from '../hooks/useRealTimeData';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import SkeletonLoader from '../components/common/SkeletonLoader';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
import { jsPDF } from 'jspdf';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import PaymentModal from '../components/PaymentModal';
import ReviewModal from '../components/ReviewModal';
import BrowseRides from '../components/BrowseRides';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const PassengerDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchSource, setSearchSource] = useState('');
    const [searchDest, setSearchDest] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [reviewData, setReviewData] = useState(null);
    const navigate = useNavigate();

    const { data: analytics, refresh: mutateAnalytics } = useRealTimeData(`/api/analytics/passenger/${user?.id}`, 5000);
    const { data: bookingsData, refresh: mutateBookings } = useRealTimeData(`/api/bookings/passenger/${user?.id}`, 5000);
    const { data: paymentsData, refresh: mutatePayments } = useRealTimeData(`/api/payments/passenger/${user?.id}`, 5000);
    const { data: allRides, refresh: mutateRides } = useRealTimeData('/api/rides/all', 5000);
    const { lastMessage } = useNotification();

    useEffect(() => {
        if (lastMessage) {
            mutateAnalytics();
            mutateBookings();
            mutatePayments();
            mutateRides();
        }
    }, [lastMessage, mutateAnalytics, mutateBookings, mutatePayments, mutateRides]);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const tab = queryParams.get('tab');
        if (tab && (tab === 'my-rides' || tab === 'history')) {
            setActiveTab(tab);
        }
    }, [window.location.search]);





    const performSearch = async () => {
        if (!searchSource && !searchDest) {
            setSearchResults(null);
            return;
        }
        setIsSearching(true);
        try {
            const response = await axios.get('/api/rides/search', {
                params: {
                    source: searchSource,
                    destination: searchDest
                },
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setSearchResults(response.data);
            toast.success(`Found ${response.data.length} matching rides`);
        } catch (error) {
            toast.error("Search failed: " + (error.response?.data || error.message));
        } finally {
            setIsSearching(false);
        }
    };

    const handlePayNow = async (bookingId) => {
        try {
            const stripe = await stripePromise;
            if (!stripe) {
                toast.error("Stripe failed to load. Please check your internet or refresh.");
                return;
            }

            toast.info("Preparing checkout session...");
            const response = await axios.post('/api/payments/create-checkout-session', { bookingId });
            const session = response.data;

            if (!session.url) {
                throw new Error(session.error || "No checkout URL returned from server");
            }

            // Direct redirection to Stripe's hosted checkout
            window.location.href = session.url;
        } catch (error) {
            console.error('Payment Error:', error);
            const errorDetail = error.response?.data?.error || error.response?.data?.message || error.message;
            toast.error(`Payment failed: ${errorDetail}`);
        }
    };

    const passengerMenu = [
        { id: 'overview', label: 'Overview', icon: '📊', onClick: () => setActiveTab('overview') },
        { id: 'browse', label: 'Browse Rides', icon: '🚗', onClick: () => setActiveTab('browse') },
        { id: 'history', label: 'Booking History', icon: '📜', onClick: () => setActiveTab('history') },
        { id: 'my-rides', label: 'My Rides', icon: '🎯', onClick: () => setActiveTab('my-rides') },
    ];

    const handleBook = async (rideId) => {
        const seatsToBook = prompt("How many seats?", "1");
        if (seatsToBook) {
            try {
                await axios.post('/api/bookings', {
                    ride: { id: rideId },
                    passenger: { id: user.id },
                    seatsBooked: parseInt(seatsToBook)
                });
                toast.success('Booking requested! Wait for driver approval.');
                setActiveTab('history');
                mutateBookings();
            } catch (error) {
                const errorMsg = error.response?.data?.message ||
                    (typeof error.response?.data === 'string' ? error.response.data : null) ||
                    error.message;
                toast.error(`Booking failed: ${errorMsg}`);
            }
        }
    };

    const handleDownloadReceipt = (booking) => {
        try {
            const doc = new jsPDF();

            // Header
            doc.setFillColor(33, 150, 243);
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text("SmartRide", 105, 25, { align: "center" });

            // Reset for content
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(18);
            doc.text("Booking Confirmation", 20, 55);

            doc.setFontSize(11);
            doc.setTextColor(100, 100, 100);
            doc.text(`Reference ID: #BK-${booking.id}`, 20, 65);
            doc.text(`Date of Issue: ${new Date().toLocaleDateString()}`, 190, 65, { align: "right" });

            doc.setDrawColor(230, 230, 230);
            doc.line(20, 70, 190, 70);

            // Ride Info
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text("Trip Summary", 20, 85);

            doc.setFontSize(11);
            doc.text(`Ride ID: #R-${booking.ride?.id}`, 25, 95);
            doc.text(`Passenger: ${user.firstName} ${user.lastName || ''}`, 25, 102);
            doc.text(`Driver: ${booking.ride?.driver?.name || 'N/A'}`, 25, 109);
            doc.text(`Departure: ${new Date(booking.ride?.departureTime).toLocaleString()}`, 25, 116);

            doc.text("Route Flow:", 20, 130);
            doc.setTextColor(100, 100, 100);
            doc.text(`[FROM] ${booking.ride?.source?.address}`, 25, 140);
            doc.text(`[TO]   ${booking.ride?.destination?.address}`, 25, 147);

            // Payment Summary Box
            doc.setFillColor(245, 247, 249);
            doc.rect(20, 160, 170, 50, 'F');

            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text("Billing Information", 30, 175);
            doc.setFontSize(10);
            doc.text(`Payment ID: ${booking.transactionId || 'STRIPE_PAYMENT'}`, 30, 185);
            doc.text(`Payment Status: ${booking.paymentStatus || 'PAID'}`, 30, 192);
            doc.text(`Seats Booked: ${booking.seatsBooked}`, 30, 199);

            doc.setFontSize(16);
            doc.setTextColor(76, 175, 80);
            doc.text(`TOTAL PAID: INR ${booking.totalPrice}`, 180, 203, { align: "right" });

            // Footer
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(10);
            doc.text("Thank you for choosing SmartRide. This is a computer generated receipt.", 105, 250, { align: "center" });

            doc.save(`SmartRide-Receipt-${booking.id}.pdf`);
            toast.success("Receipt downloaded successfully!");
        } catch (error) {
            console.error("PDF generation failed:", error);
            toast.error("Failed to generate receipt PDF.");
        }
    };

    const handlePayment = (booking) => {
        setSelectedBooking(booking);
        setShowPaymentModal(true);
    };

    const onPaymentSuccess = async () => {
        try {
            await axios.post('/api/payments/process', {
                bookingId: selectedBooking.id,
                passengerId: user.id,
                amount: selectedBooking.totalPrice,
                paymentMethod: 'DEMO_CARD',
                transactionId: 'TXN-' + Date.now()
            });
            toast.success('Payment successful! Your ride is confirmed.');
            setShowPaymentModal(false);
            mutateBookings();
            mutateAnalytics();
        } catch (error) {
            toast.error('Payment finalized failed on server: ' + (error.response?.data || error.message));
        }
    };

    const renderBrowse = () => {
        const displayData = searchResults !== null ? searchResults : (allRides || []);
        const filteredRides = displayData.filter(r =>
            (r.status === 'APPROVED' || r.status === 'PENDING') &&
            (r.source?.address || '').toLowerCase().includes((searchSource || '').toLowerCase()) &&
            (r.destination?.address || '').toLowerCase().includes((searchDest || '').toLowerCase())
        );

        return (
            <BrowseRides
                rides={allRides ? filteredRides : null}
                isSearching={isSearching}
                onBook={handleBook}
                userBookings={bookingsData}
                performSearch={performSearch}
                searchSource={searchSource}
                setSearchSource={setSearchSource}
                searchDest={searchDest}
                setSearchDest={setSearchDest}
            />
        );
    };

    const renderOverview = () => {
        const stats = analytics || {
            totalSpending: 0,
            activeBookings: 0,
            upcomingBookings: 0,
            cancelledBookings: 0,
            monthlySpending: []
        };

        const spendingLabels = (stats.monthlySpending || []).map(r => r?.[0] || '');
        const spendingData = (stats.monthlySpending || []).map(r => r?.[1] || 0);

        const chartData = {
            labels: spendingLabels.length > 0 ? spendingLabels : [],
            datasets: [{
                label: 'Monthly Spending (₹)',
                data: spendingData.length > 0 ? spendingData : [],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        };

        return (
            <motion.div
                className="passenger-overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="row g-3 mb-4">
                    {[
                        { label: 'Total Spending', value: `₹${stats.totalSpending || 0}`, icon: '💳', color: 'danger' },
                        { label: 'Active Bookings', value: stats.activeBookings || 0, icon: '✅', color: 'success' },
                        { label: 'Upcoming', value: stats.upcomingBookings || 0, icon: '📅', color: 'primary' },
                        { label: 'Cancelled', value: stats.cancelledBookings || 0, icon: '❌', color: 'secondary' }
                    ].map((stat, i) => (
                        <div key={i} className="col-md-3">
                            <div className={`card border-0 shadow-sm border-start border-4 border-${stat.color} hover-lift`}>
                                <div className="card-body">
                                    <div className="text-muted small fw-bold">{stat.label}</div>
                                    <div className="h4 mb-0">{stat.value}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {!analytics && (
                    <div className="mt-3 mb-2">
                        <SkeletonLoader type="text" count={1} />
                    </div>
                )}
                {/* Charts: 2 per page, equal width, fixed height */}
                <div className="row g-3 mt-1">
                    {/* Bar Chart – Spending Trend */}
                    <div className="col-12 col-lg-6">
                        <div className="card border-0 shadow-sm p-3" style={{ height: '320px' }}>
                            <h6 className="fw-bold text-muted mb-2">📈 Monthly Spending (₹)</h6>
                            {spendingData.length > 0 ? (
                                <div style={{ position: 'relative', height: '250px' }}>
                                    <Bar
                                        data={chartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { display: false } },
                                            scales: { y: { beginAtZero: true } }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
                                    <div style={{ fontSize: '2rem', opacity: 0.3 }}>📉</div>
                                    <small>No spending data yet</small>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Pie Chart – Booking Status */}
                    <div className="col-12 col-lg-6">
                        <div className="card border-0 shadow-sm p-3" style={{ height: '320px' }}>
                            <h6 className="fw-bold text-muted mb-2">🥧 Booking Status</h6>
                            {analytics?.bookingStatusCounts && Object.keys(analytics.bookingStatusCounts).length > 0 ? (
                                <div style={{ position: 'relative', height: '250px', display: 'flex', justifyContent: 'center' }}>
                                    <Pie
                                        data={{
                                            labels: Object.keys(analytics.bookingStatusCounts),
                                            datasets: [{
                                                data: Object.values(analytics.bookingStatusCounts),
                                                backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'],
                                                hoverOffset: 6,
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="d-flex flex-column justify-content-center align-items-center h-100 text-muted">
                                    <div style={{ fontSize: '2rem', opacity: 0.3 }}>🥧</div>
                                    <small>No booking data available</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const getRealTimeStatus = (booking) => {
        const departureTime = new Date(booking.ride?.departureTime);
        const now = new Date();

        if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') return booking.status;
        if (booking.status === 'PAID') return 'CONFIRMED';
        if (booking.status === 'ACCEPTED') return 'APPROVED';
        if (departureTime < now && booking.status !== 'PAID') return 'EXPIRED';
        return booking.status;
    };

    const [viewingBooking, setViewingBooking] = useState(null);

    const renderHistory = () => (
        <motion.div
            className="booking-history-container"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">Booking History 📜</h4>
                {bookingsData && <span className="badge bg-soft-primary text-primary rounded-pill px-3 py-2">{bookingsData.length} Total Bookings</span>}
            </div>

            <div className="row g-4">
                {!bookingsData ? (
                    <div className="col-12">
                        <SkeletonLoader type="card" count={3} />
                    </div>
                ) : bookingsData.map(booking => {
                    const status = getRealTimeStatus(booking);
                    const isAccepted = booking.status === 'ACCEPTED' && status !== 'EXPIRED';

                    return (
                        <div key={booking.id} className="col-md-6 col-lg-4">
                            <div className={`booking-history-card card shadow-sm border-0 h-100`}>
                                <div className="card-body p-4 d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="status-badge-container">
                                            <span className={`badge-status status-${status.toLowerCase()}`}>
                                                {status}
                                            </span>
                                        </div>
                                        <div className="price-tag text-end">
                                            <span className="d-block text-muted tiny fw-bold text-uppercase">Total Fare</span>
                                            <span className="fs-5 fw-bold text-success">₹{booking.totalPrice}</span>
                                        </div>
                                    </div>

                                    <div className="ride-route-history mb-3 p-3 bg-light rounded-3">
                                        <div className="route-point small mb-2">
                                            <span className="dot start"></span>
                                            <span className="address-text text-truncate"><strong>From:</strong> {booking.ride?.source?.address}</span>
                                        </div>
                                        <div className="route-connector"></div>
                                        <div className="route-point small">
                                            <span className="dot end"></span>
                                            <span className="address-text text-truncate"><strong>To:</strong> {booking.ride?.destination?.address}</span>
                                        </div>
                                    </div>

                                    <div className="row g-2 mb-4">
                                        <div className="col-6">
                                            <div className="detail-item tiny-data">
                                                <span className="icon">👤</span>
                                                <div className="data">
                                                    <small className="text-muted d-block">Driver</small>
                                                    <span className="fw-500">{booking.ride?.driver?.name}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="detail-item tiny-data">
                                                <span className="icon">🪑</span>
                                                <div className="data">
                                                    <small className="text-muted d-block">Seats</small>
                                                    <span className="fw-500">{booking.seatsBooked} Booked</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        {(status === 'APPROVED' || booking.status === 'ACCEPTED') && status !== 'EXPIRED' ? (
                                            <button
                                                className="btn btn-primary w-100 py-2 fw-bold rounded-pill"
                                                onClick={() => setViewingBooking(booking)}
                                            >
                                                View & Pay 💸
                                            </button>
                                        ) : booking.status === 'PAID' || booking.status === 'COMPLETED' ? (
                                            <div className="d-grid gap-2">
                                                <button className={`btn w-100 py-2 fw-bold rounded-pill ${booking.status === 'COMPLETED' ? 'btn-success' : 'btn-info'}`} disabled>
                                                    {booking.status === 'COMPLETED' ? '✓ Completed' : '✓ Paid'}
                                                </button>
                                                <button
                                                    onClick={() => handleDownloadReceipt(booking)}
                                                    className="btn btn-outline-primary btn-sm rounded-pill"
                                                >
                                                    📥 Receipt
                                                </button>
                                                {booking.status === 'COMPLETED' && !booking.reviewed && (
                                                    <button
                                                        onClick={() => {
                                                            setReviewData({
                                                                rideId: booking.ride?.id,
                                                                reviewedUserId: booking.ride?.driver?.id,
                                                                reviewedUserName: booking.ride?.driver?.name,
                                                                reviewerRole: 'PASSENGER'
                                                            });
                                                            setShowReviewModal(true);
                                                        }}
                                                        className="btn btn-warning btn-sm rounded-pill mt-1 fw-bold"
                                                    >
                                                        ⭐ Rate Driver
                                                    </button>
                                                )}
                                                {booking.reviewed && (
                                                    <span className="badge bg-soft-warning text-warning mt-1 rounded-pill fw-bold border border-warning" style={{ padding: '0.4rem 0.8rem' }}>
                                                        Rated ⭐⭐⭐⭐
                                                    </span>
                                                )}
                                            </div>
                                        ) : status === 'EXPIRED' ? (
                                            <button className="btn btn-outline-secondary w-100 py-2 fw-bold rounded-pill" disabled>
                                                Expired
                                            </button>
                                        ) : (
                                            <button className="btn btn-outline-secondary w-100 py-2 fw-bold rounded-pill" disabled>
                                                Waiting...
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="card-footer bg-white border-top-0 py-2 text-center">
                                    <span className="text-muted tiny fw-bold">ID: #BK-{booking.id} • {new Date(booking.ride?.departureTime).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {bookingsData && bookingsData.length === 0 && (
                    <div className="col-12 text-center py-5">
                        <div className="fs-1 mb-3">📭</div>
                        <h5>No Bookings Found</h5>
                        <p className="text-muted">You haven't booked any rides yet.</p>
                        <button className="btn btn-primary mt-3 px-4 rounded-pill" onClick={() => setActiveTab('browse')}>Browse Rides</button>
                    </div>
                )}
            </div>

            {/* Ride Details Modal for Payment */}
            {
                viewingBooking && (
                    <div className="modal-premium-overlay d-flex align-items-center justify-content-center">
                        <motion.div
                            className="modal-premium-content bg-white p-5 rounded-4 shadow-xl border-0"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                        >
                            <h4 className="fw-bold mb-4">Ride Confirmation & Payment 💳</h4>
                            <div className="ride-summary-grid g-3 row mb-4">
                                <div className="col-6">
                                    <label className="text-muted small d-block">Driver</label>
                                    <span className="fw-bold fs-5">{viewingBooking.ride.driver?.name}</span>
                                </div>
                                <div className="col-6 text-end">
                                    <label className="text-muted small d-block">Total Amount</label>
                                    <span className="h3 fw-800 text-success">₹{viewingBooking.totalPrice}</span>
                                </div>
                                <div className="col-12 mt-3">
                                    <div className="p-3 bg-light rounded-3">
                                        <div className="mb-2">📍 <strong>From:</strong> {viewingBooking.ride.source?.address}</div>
                                        <div>🏁 <strong>To:</strong> {viewingBooking.ride.destination?.address}</div>
                                    </div>
                                </div>
                                <div className="col-6 mt-3">
                                    <label className="text-muted small d-block">Departure</label>
                                    <span className="fw-bold small">{new Date(viewingBooking.ride.departureTime).toLocaleString()}</span>
                                </div>
                                <div className="col-6 mt-3 text-end">
                                    <label className="text-muted small d-block">Seats</label>
                                    <span className="fw-bold">{viewingBooking.seatsBooked} Seat(s)</span>
                                </div>
                            </div>
                            <div className="d-flex gap-3 mt-4">
                                <button onClick={() => setViewingBooking(null)} className="btn btn-light rounded-pill px-4 flex-grow-1">Close</button>
                                <button onClick={() => handlePayNow(viewingBooking.id)} className="btn btn-success flex-grow-1 rounded-pill fw-bold py-2">Pay Now with Stripe 🚀</button>
                            </div>
                        </motion.div>
                    </div>
                )
            }
        </motion.div >
    );

    const renderMyRides = () => {
        const confirmedBookings = (bookingsData || []).filter(b => b.status === 'CONFIRMED' || b.status === 'PAID' || b.status === 'COMPLETED');

        return (
            <motion.div
                className="my-rides-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">My Active & Confirmed Rides 🎯</h4>
                    <span className="badge bg-primary rounded-pill px-3 py-2">{confirmedBookings.length} Active Rides</span>
                </div>

                <div className="row g-4">
                    {!bookingsData ? (
                        <div className="col-12">
                            <SkeletonLoader type="card" count={2} />
                        </div>
                    ) : confirmedBookings.length === 0 ? (
                        <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm">
                            <div className="display-4 mb-3">🚗💨</div>
                            <h5>No active rides yet</h5>
                            <p className="text-muted">Once you pay for an approved ride, it will appear here.</p>
                            <button className="btn btn-primary rounded-pill mt-2" onClick={() => setActiveTab('browse')}>Find a Ride</button>
                        </div>
                    ) : confirmedBookings.map(booking => (
                        <div key={booking.id} className="col-md-6 col-lg-4">
                            <div className="card h-100 border-0 shadow-sm hover-lift-lg overflow-hidden" style={{ borderRadius: '20px' }}>
                                <div className="card-header bg-success text-white py-3 d-flex justify-content-between align-items-center">
                                    <span className="fw-bold small">RIDE ID: #R-{booking.ride?.id}</span>
                                    <span className="badge bg-white text-success rounded-pill px-2">{booking.status}</span>
                                </div>
                                <div className="card-body p-4">
                                    <div className="d-flex align-items-center mb-4">
                                        <div className="flex-shrink-0 avatar-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px', borderRadius: '50%' }}>
                                            👤
                                        </div>
                                        <div className="ms-3">
                                            <h6 className="mb-0 fw-bold">{booking.ride?.driver?.name}</h6>
                                            <small className="text-muted">Your Driver</small>
                                        </div>
                                    </div>

                                    <div className="route-flow mb-4">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="route-icon-dot bg-primary me-3"></div>
                                            <div className="text-truncate">
                                                <small className="text-muted d-block">Source</small>
                                                <span className="fw-500">{booking.ride?.source?.address}</span>
                                            </div>
                                        </div>
                                        <div className="route-line-vertical ms-1 py-2" style={{ borderLeft: '2px dashed #ddd', height: '20px' }}></div>
                                        <div className="d-flex align-items-center">
                                            <div className="route-icon-dot bg-danger me-3"></div>
                                            <div className="text-truncate">
                                                <small className="text-muted d-block">Destination</small>
                                                <span className="fw-500">{booking.ride?.destination?.address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-4 p-3 bg-light rounded-3">
                                        <div className="col-6">
                                            <small className="text-muted d-block">Date & Time</small>
                                            <span className="small fw-bold">{new Date(booking.ride?.departureTime).toLocaleString()}</span>
                                        </div>
                                        <div className="col-6 text-end">
                                            <small className="text-muted d-block">Payment Status</small>
                                            <span className="text-success fw-bold small">✅ PAID</span>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2 mt-3">
                                        <button
                                            onClick={() => handleDownloadReceipt(booking)}
                                            className="btn btn-outline-primary fw-bold rounded-pill py-2 flex-grow-1"
                                            style={{ fontSize: '0.9rem' }}
                                        >
                                            📄 Receipt
                                        </button>

                                        {((booking.status === 'COMPLETED') ||
                                            (['PAID', 'CONFIRMED'].includes(booking.status) && new Date(booking.ride?.departureTime) < new Date())) && !booking.reviewed && (
                                                <button
                                                    onClick={() => {
                                                        setReviewData({
                                                            rideId: booking.ride?.id,
                                                            reviewedUserId: booking.ride?.driver?.id,
                                                            reviewedUserName: booking.ride?.driver?.name,
                                                            reviewerRole: 'PASSENGER'
                                                        });
                                                        setShowReviewModal(true);
                                                    }}
                                                    className="rate-driver-btn flex-grow-1"
                                                    style={{ fontSize: '0.9rem', padding: '8px 12px' }}
                                                >
                                                    ⭐ Rate
                                                </button>
                                            )}

                                        {booking.reviewed && (
                                            <div className="d-flex align-items-center">
                                                <span className="badge bg-soft-warning text-warning rounded-pill px-3 py-2 fw-bold border border-warning">
                                                    Rated ⭐⭐⭐⭐
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    };

    return (
        <DashboardLayout menuItems={passengerMenu}>
            <div className="dashboard-content-wrapper">

                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'browse' && renderBrowse()}
                {activeTab === 'history' && renderHistory()}
                {activeTab === 'my-rides' && renderMyRides()}
            </div>

            {showPaymentModal && selectedBooking && (
                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    amount={selectedBooking.totalPrice}
                    bookingDetails={{ seats: selectedBooking.seatsBooked, rideId: selectedBooking.ride.id }}
                    onPaymentSuccess={onPaymentSuccess}
                    onPaymentFailure={() => toast.error('Payment cancelled or failed.')}
                />
            )}
            {showReviewModal && reviewData && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    onSuccess={() => {
                        setShowReviewModal(false);
                        mutateBookings(); // Automatically refresh after successful review
                    }}
                    rideId={reviewData.rideId}
                    reviewerId={user.id}
                    reviewedUserId={reviewData.reviewedUserId}
                    reviewerRole={reviewData.reviewerRole}
                />
            )}
        </DashboardLayout>
    );
};

export default PassengerDashboard;
