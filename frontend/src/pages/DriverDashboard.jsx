import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import DriverDashboardLayout from '../components/layout/DriverDashboardLayout';
import useRealTimeData from '../hooks/useRealTimeData';
import { motion } from 'framer-motion';
import SkeletonLoader from '../components/common/SkeletonLoader';
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

import ReviewModal from '../components/ReviewModal';
import PublishRide from '../components/PublishRide';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const DriverDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState(null);

    const { data: analytics, refresh: mutateAnalytics } = useRealTimeData(`/api/analytics/driver/${user?.id}`, 5000);
    const { data: ridesData, loading: ridesLoading, error: ridesError, refresh: mutateRides } = useRealTimeData(`/api/rides/driver/${user?.id}`, 5000);
    const { data: earningsData, refresh: mutateEarnings } = useRealTimeData(`/api/payments/driver/${user?.id}`, 5000);
    const { data: avgRatingData, refresh: mutateAvgRating } = useRealTimeData(`/api/reviews/driver/${user?.id}/average`, 5000);
    const { data: reviewsList, refresh: mutateReviews } = useRealTimeData(`/api/reviews/driver/${user?.id}`, 5000);
    const { lastMessage } = useNotification();

    useEffect(() => {
        if (lastMessage) {
            console.log('Driver Real-time update:', lastMessage);
            mutateAnalytics();
            mutateRides();
            mutateEarnings();
            mutateAvgRating();
            mutateReviews();
            if (['requests', 'passengers'].includes(activeTab)) fetchRequests();
            toast.info("Updating dashboard...");
        }
    }, [lastMessage, activeTab, mutateAnalytics, mutateRides, mutateEarnings, mutateAvgRating, mutateReviews]);



    const [requests, setRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(false);

    const fetchRequests = async () => {
        if (!user?.id) return;
        setLoadingRequests(true);
        try {
            const res = await axios.get(`/api/bookings/driver/${user.id}`);
            console.log("Fetched requests:", res.data);
            setRequests(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Fetch requests error:", error);
            toast.error("Failed to fetch requests: " + (error.response?.data?.message || error.message));
            setRequests([]);
        } finally {
            setLoadingRequests(false);
        }
    };

    useEffect(() => {
        if (['requests', 'passengers'].includes(activeTab)) {
            fetchRequests();
        }
    }, [activeTab, user?.id]);

    const handleRequestAction = async (requestId, action) => {
        try {
            await axios.post(`/api/bookings/${requestId}/${action}`);
            toast.success(`Booking ${action === 'accept' ? 'accepted' : 'rejected'}`);
            fetchRequests();
        } catch (error) {
            const errorMsg = error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message;
            toast.error(`Failed to ${action} booking: ${errorMsg}`);
        }
    };
    const [vehicles, setVehicles] = useState([]);
    const [vehicleForm, setVehicleForm] = useState({
        vehicleType: 'Car',
        vehicleModel: '',
        vehicleNumber: '',
        vehicleColor: '',
        seats: 4,
        rcNumber: '',
        insuranceNumber: ''
    });

    // Fetch vehicles on component mount or tab change
    React.useEffect(() => {
        if (activeTab === 'vehicle') {
            const fetchVehicles = async () => {
                try {
                    const response = await axios.get(`/api/vehicles/user/${user.id}`);
                    setVehicles(response.data);
                } catch (error) {
                    console.error('Error fetching vehicles:', error);
                }
            };
            fetchVehicles();
        }
    }, [activeTab, user.id]);

    const handleVehicleChange = (e) => {
        setVehicleForm({ ...vehicleForm, [e.target.name]: e.target.value });
    };

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/vehicles', {
                ...vehicleForm,
                user: { id: user.id }
            });
            toast.success('Vehicle added successfully!');
            setVehicles([...vehicles, response.data]);
            setVehicleForm({
                vehicleType: 'Car',
                vehicleModel: '',
                vehicleNumber: '',
                vehicleColor: '',
                seats: 4,
                rcNumber: '',
                insuranceNumber: ''
            });
        } catch (error) {
            toast.error('Failed to add vehicle: ' + (error.response?.data?.message || 'Check details'));
        }
    };

    const renderVehicleProfile = () => (
        <motion.div
            className="vehicle-profile"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="row g-4">
                {/* Add Vehicle Form */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm p-4">
                        <h5 className="mb-4">Add a new Vehicle</h5>
                        <form onSubmit={handleAddVehicle}>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Vehicle Type</label>
                                <select
                                    name="vehicleType"
                                    className="form-select"
                                    value={vehicleForm.vehicleType}
                                    onChange={handleVehicleChange}
                                >
                                    <option value="Car">Car</option>
                                    <option value="SUV">SUV</option>
                                    <option value="Bike">Bike</option>
                                    <option value="Van">Van</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Model Name</label>
                                <input
                                    name="vehicleModel"
                                    className="form-control"
                                    placeholder="e.g. Toyota Camry"
                                    value={vehicleForm.vehicleModel}
                                    onChange={handleVehicleChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">Plate Number</label>
                                <input
                                    name="vehicleNumber"
                                    className="form-control text-uppercase"
                                    placeholder="TS 09 XY 1234"
                                    value={vehicleForm.vehicleNumber}
                                    onChange={handleVehicleChange}
                                    required
                                />
                            </div>
                            <div className="row g-2 mb-3">
                                <div className="col-6">
                                    <label className="form-label small fw-bold">Color</label>
                                    <input
                                        name="vehicleColor"
                                        className="form-control"
                                        placeholder="White"
                                        value={vehicleForm.vehicleColor}
                                        onChange={handleVehicleChange}
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="form-label small fw-bold">Seats</label>
                                    <input
                                        name="seats"
                                        type="number"
                                        className="form-control"
                                        min="1"
                                        value={vehicleForm.seats}
                                        onChange={handleVehicleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-bold">RC Number</label>
                                <input
                                    name="rcNumber"
                                    className="form-control"
                                    placeholder="RC12345678"
                                    value={vehicleForm.rcNumber}
                                    onChange={handleVehicleChange}
                                />
                            </div>
                            <button type="submit" className="btn btn-success w-100 py-2 fw-bold">
                                ➕ Add Vehicle
                            </button>
                        </form>
                    </div>
                </div>

                {/* Vehicle List */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm p-4">
                        <h5 className="mb-4">My Registered Vehicles</h5>
                        {vehicles.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="display-1 mb-3 opacity-25">🚗</div>
                                <p className="text-muted">No vehicles registered yet.</p>
                            </div>
                        ) : (
                            <div className="row g-3">
                                {vehicles.map(v => (
                                    <div key={v.id} className="col-12">
                                        <div className="card border shadow-none p-3 hover-shadow-sm transition">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-1">{v.vehicleModel}</h6>
                                                    <div className="badge border me-2">{v.vehicleType}</div>
                                                    <span className="font-monospace small text-primary fw-bold text-uppercase">{v.vehicleNumber}</span>
                                                </div>
                                                <div className="text-end">
                                                    <div className="small text-muted mb-1">{v.seats} Seats</div>
                                                    {v.isVerified ? (
                                                        <span className="badge bg-success-subtle text-success border border-success-subtle">
                                                            ✓ Verified
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-warning-subtle text-warning border border-warning-subtle">
                                                            ⚡ Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );

    const renderOverview = () => {
        if (!analytics) return <div className="p-4"><SkeletonLoader type="metric" count={1} /></div>;

        const earningsLabels = (analytics.monthlyEarnings || []).map(r => r[0]);
        const earningsData = (analytics.monthlyEarnings || []).map(r => r[1]);

        const chartData = {
            labels: earningsLabels.length > 0 ? earningsLabels : [],
            datasets: [{
                label: 'Monthly Earnings (₹)',
                data: earningsData.length > 0 ? earningsData : [],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };

        return (
            <motion.div
                className="driver-overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="row g-3 mb-4">
                    {[
                        { label: 'Total Earnings', value: `₹${analytics.totalEarnings || 0}`, icon: '💰', color: 'success' },
                        { label: 'Active Bookings', value: analytics.activeBookings || 0, icon: '📅', color: 'primary' },
                        { label: 'Pending Rides', value: analytics.pendingRides || 0, icon: '⏳', color: 'warning' },
                        { label: 'Total Rides', value: analytics.totalRidesPosted || 0, icon: '🛣️', color: 'info' }
                    ].map((stat, i) => (
                        <div key={i} className="col-md-3">
                            <div className={`card border-0 shadow-sm border-start border-4 border-${stat.color}`}>
                                <div className="card-body">
                                    <div className="text-muted small fw-bold">{stat.label}</div>
                                    <div className="h4 mb-0">{stat.value}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Charts: 2 per page, equal width, fixed height */}
                <div className="row g-3 mt-1">
                    {/* Bar Chart – Earnings Trend */}
                    <div className="col-12 col-lg-6">
                        <div className="card border-0 shadow-sm p-3" style={{ height: '320px' }}>
                            <h6 className="fw-bold text-muted mb-2">📈 Monthly Earnings (₹)</h6>
                            {earningsData.length > 0 ? (
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
                                    <div style={{ fontSize: '2rem', opacity: 0.3 }}>📊</div>
                                    <small>No earnings data yet</small>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Pie Chart – Ride Distribution */}
                    <div className="col-12 col-lg-6">
                        <div className="card border-0 shadow-sm p-3" style={{ height: '320px' }}>
                            <h6 className="fw-bold text-muted mb-2">🥧 Ride Distribution</h6>
                            {analytics?.rideStatusCounts && Object.keys(analytics.rideStatusCounts).length > 0 ? (
                                <div style={{ position: 'relative', height: '250px', display: 'flex', justifyContent: 'center' }}>
                                    <Pie
                                        data={{
                                            labels: Object.keys(analytics.rideStatusCounts),
                                            datasets: [{
                                                data: Object.values(analytics.rideStatusCounts),
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
                                    <small>No ride data available</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const getRideStatus = (ride) => {
        const departureTime = new Date(ride.departureTime);
        const now = new Date();
        if (departureTime < now && ride.status !== 'COMPLETED') return 'EXPIRED';
        return ride.status;
    };

    const renderMyRides = () => {
        if (ridesLoading) {
            return (
                <div className="card border-0 shadow-sm p-4">
                    <SkeletonLoader type="card" count={3} />
                </div>
            );
        }

        if (ridesError) {
            return <div className="text-center p-5 card border-0 shadow-sm text-danger">Error loading rides: {ridesError.message}</div>;
        }

        if (!ridesData || ridesData.length === 0) {
            return (
                <div className="text-center p-5 card border-0 shadow-sm">
                    <div className="display-4 mb-3 opacity-25">🚗</div>
                    <h4>No rides posted yet.</h4>
                    <p className="text-muted">Start by posting a new ride to earn!</p>
                </div>
            );
        }

        return (
            <motion.div
                className="my-rides-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="row g-4">
                    {ridesData.map(ride => {
                        const status = getRideStatus(ride);
                        return (
                            <div key={ride.id} className="col-md-6 col-lg-4">
                                <div className="ride-post-card card h-100 border-0 shadow-sm hover-lift-lg overflow-hidden">
                                    <div className={`card-header-gradient p-3 text-white d-flex justify-content-between align-items-center ${status === 'EXPIRED' ? 'bg-secondary opacity-75' : ''}`}>
                                        <span className="vehicle-type-tag px-2 py-1 rounded-pill small fw-bold">
                                            🚗 {ride.vehicle?.vehicleType || 'Car'}
                                        </span>
                                        <span className={`badge-status status-${status.toLowerCase()}`}>
                                            {status}
                                        </span>
                                    </div>
                                    <div className="card-body p-4">
                                        <div className="ride-route-compact mb-4">
                                            <div className="route-step">
                                                <span className="dot dot-start"></span>
                                                <span className="address-text text-truncate"><strong>From:</strong> {ride.source?.address}</span>
                                            </div>
                                            <div className="route-line-vertical"></div>
                                            <div className="route-step">
                                                <span className="dot dot-end"></span>
                                                <span className="address-text text-truncate"><strong>To:</strong> {ride.destination?.address}</span>
                                            </div>
                                        </div>

                                        <div className="row g-2 mb-4">
                                            <div className="col-6">
                                                <div className="info-pill">
                                                    <span className="icon">📅</span>
                                                    <div className="labels">
                                                        <small className="d-block text-muted">Departure</small>
                                                        <span className="fw-bold small">{new Date(ride.departureTime).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="info-pill">
                                                    <span className="icon">🪑</span>
                                                    <div className="labels">
                                                        <small className="d-block text-muted">Seats</small>
                                                        <span className="fw-bold small">{ride.availableSeats} / {ride.totalSeats}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="price-tag text-success fw-bold fs-5">₹{ride.pricePerSeat}</div>
                                            <button className="btn btn-sm btn-outline-primary rounded-pill px-3">View Details</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        );
    };

    const [requestFilter, setRequestFilter] = useState('PENDING');

    const renderRequests = () => {
        if (loadingRequests) {
            return (
                <div className="card border-0 shadow-sm p-4 mb-4">
                    <SkeletonLoader type="table-row" count={3} />
                </div>
            );
        }

        const filteredReqs = requests.filter(r => {
            if (requestFilter === 'PENDING') return r.status === 'REQUESTED';
            if (requestFilter === 'ACCEPTED') return r.status === 'ACCEPTED' || r.status === 'PAID';
            return true;
        });

        const otherRequests = requests.filter(r => r.status !== 'REQUESTED' && r.status !== 'ACCEPTED' && r.status !== 'PAID');

        return (
            <motion.div
                className="driver-requests-container"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="fw-bold mb-1">Ride Requests 📩</h4>
                        <p className="text-muted mb-0">Review and approve passenger bookings.</p>
                    </div>
                    <div className="request-toggle-switch d-flex bg-white p-1 rounded-pill shadow-sm border">
                        <button
                            className={`btn btn-sm px-4 rounded-pill transition-all ${requestFilter === 'PENDING' ? 'btn-primary shadow' : 'btn-link text-muted text-decoration-none'}`}
                            onClick={() => setRequestFilter('PENDING')}
                        >
                            <span className="me-1">🔔</span> New
                        </button>
                        <button
                            className={`btn btn-sm px-4 rounded-pill transition-all ${requestFilter === 'ACCEPTED' ? 'btn-primary shadow' : 'btn-link text-muted text-decoration-none'}`}
                            onClick={() => setRequestFilter('ACCEPTED')}
                        >
                            <span className="me-1">✅</span> Accepted
                        </button>
                    </div>
                </div>

                <div className="row g-4 mb-5">
                    {filteredReqs.length === 0 ? (
                        <div className="col-12">
                            <div className="card border-0 shadow-sm p-5 text-center bg-light">
                                <div className="fs-1 mb-2">📭</div>
                                <h5 className="text-muted">No {requestFilter.toLowerCase()} requests found</h5>
                            </div>
                        </div>
                    ) : filteredReqs.map(req => (
                        <div key={req.id} className="col-md-6">
                            <div className="request-card-premium card border-0 shadow-sm h-100 overflow-hidden">
                                <div className={`request-status-strip ${req.status === 'REQUESTED' ? 'bg-warning' : 'bg-success'}`}></div>
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="passenger-profile-compact d-flex align-items-center">
                                            <div className="avatar-circle me-3">
                                                {(req.passenger?.name || req.passenger?.firstName || 'P').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold">{req.passenger?.name || 'Passenger'}</h6>
                                                <small className="text-muted">{req.status}</small>
                                            </div>
                                        </div>
                                        <div className="request-price text-end">
                                            <span className="d-block tiny text-muted fw-bold">Earn Potential</span>
                                            <span className="fs-4 fw-bold text-success">₹{req.totalPrice}</span>
                                        </div>
                                    </div>

                                    <div className="request-route-details mb-4 p-3 bg-light rounded-3">
                                        <div className="route-item small mb-2">
                                            <span className="icon">📍</span> <strong>Pick:</strong> {req.ride?.source?.address}
                                        </div>
                                        <div className="route-item small">
                                            <span className="icon">🏁</span> <strong>Drop:</strong> {req.ride?.destination?.address}
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <div className="info-badge-gray px-3 py-2 rounded-pill small">
                                            🪑 <strong>{req.seatsBooked}</strong> Seats Requested
                                        </div>
                                        <div className="info-badge-gray px-3 py-2 rounded-pill small">
                                            🆔 #{req.id}
                                        </div>
                                    </div>

                                    {req?.status === 'REQUESTED' ? (
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-success flex-grow-1 py-2 fw-bold rounded-pill"
                                                onClick={() => handleRequestAction(req.id, 'accept')}
                                            >
                                                Approve ✓
                                            </button>
                                            <button
                                                className="btn btn-outline-danger px-4 py-2 fw-bold rounded-pill"
                                                onClick={() => handleRequestAction(req.id, 'reject')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center p-2 bg-success-subtle text-success rounded-pill fw-bold small">
                                            {req?.status === 'PAID' ? '✓ Paid & Confirmed' : '✓ Accepted'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0 py-3">
                        <h5 className="mb-0">Request History</h5>
                    </div>
                    <div className="card-body">
                        {otherRequests.length === 0 ? (
                            <p className="text-muted text-center py-4">No past requests recorded.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Passenger</th>
                                            <th>Route</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {otherRequests.map(req => (
                                            <tr key={req?.id}>
                                                <td className="small">{req?.bookingTime ? new Date(req.bookingTime).toLocaleDateString() : 'N/A'}</td>
                                                <td>{req?.passenger?.name || 'Unknown'}</td>
                                                <td className="small text-truncate" style={{ maxWidth: '200px' }}>
                                                    {req?.ride?.source?.address || 'N/A'} → {req?.ride?.destination?.address || 'N/A'}
                                                </td>
                                                <td>
                                                    <span className={`badge-status-pill ${req?.status?.toLowerCase() || 'pending'}`}>
                                                        {req?.status || 'PENDING'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderConfirmedPassengers = () => {
        // Create a map of passenger names from bookings
        const passengerMap = {};
        requests?.forEach(req => {
            if (req.passenger) {
                passengerMap[req.passenger.id] = req.passenger;
            }
        });

        const rideMap = {};
        ridesData?.forEach(ride => {
            rideMap[ride.id] = ride;
        });

        // Use earningsData (Payments) as the source for "much data" based on payment
        const payments = (earningsData || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return (
            <motion.div
                className="confirmed-passengers-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold mb-0">Confirmed Passengers 👥</h4>
                    <span className="badge bg-success rounded-pill px-3 py-2">{payments.length} Passenger(s) Paid</span>
                </div>

                <div className="row g-4">
                    {payments.length === 0 ? (
                        <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm">
                            <div className="display-4 mb-3">🤝</div>
                            <h5>No payment records found</h5>
                            <p className="text-muted">Once passengers complete their Stripe payment, their detailed receipt will appear here.</p>
                        </div>
                    ) : payments.map(pay => {
                        const passenger = passengerMap[pay.passengerId] || { name: 'Passenger ' + pay.passengerId };
                        const ride = rideMap[pay.rideId];

                        return (
                            <div key={pay.id} className="col-md-6 col-lg-4">
                                <div className="card h-100 border-0 shadow-sm border-top border-5 border-success rounded-4 overflow-hidden">
                                    <div className="card-body p-4">
                                        <div className="d-flex align-items-center mb-4">
                                            <div className="avatar-circle-lg bg-success text-white">
                                                {(passenger.name || passenger.firstName || 'P').charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ms-3">
                                                <h6 className="mb-0 fw-bold">{passenger.name || `${passenger.firstName || ''} ${passenger.lastName || ''}`.trim() || 'Passenger'}</h6>
                                                <span className="badge bg-success-subtle text-success small">PAID & SECURED</span>
                                            </div>
                                        </div>

                                        <div className="trip-summary-mini p-3 bg-light rounded-3 mb-3">
                                            <div className="small mb-1">📍 <strong>From:</strong> {ride?.source?.address || 'Trip Info Loading...'}</div>
                                            <div className="small">🏁 <strong>To:</strong> {ride?.destination?.address || '...'}</div>
                                        </div>

                                        <div className="payment-breakdown p-3 rounded-3 border mb-3 bg-white">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-bold">Total Earnings</span>
                                                <span className="fw-bold text-success h5 mb-0">₹{pay.totalAmount?.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="text-center">
                                            <div className="tiny text-muted mb-1 text-uppercase fw-bold">Transaction Details</div>
                                            <div className="bg-light p-2 rounded small text-break" style={{ fontSize: '10px' }}>
                                                ID: {pay.paymentId}
                                                <br />
                                                Order: {pay.orderId}
                                                <br />
                                                Time: {new Date(pay.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        );
    };

    const renderEarnings = () => (
        <motion.div
            className="card border-0 shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="card-header border-0 py-3 d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Earnings History</h5>
                {earningsData && <span className="badge bg-success rounded-pill">{earningsData.length} Payments Received</span>}
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>Transaction ID</th>
                                <th>Order ID</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!earningsData ? (
                                <tr>
                                    <td colSpan="5" className="p-0 border-0">
                                        <SkeletonLoader type="table-row" count={4} />
                                    </td>
                                </tr>
                            ) : earningsData.map(payment => (
                                <tr key={payment.id}>
                                    <td className="font-monospace small">{payment.paymentId}</td>
                                    <td className="font-monospace small">{payment.orderId}</td>
                                    <td className="fw-bold text-success">₹{payment.totalAmount}</td>
                                    <td>
                                        <span className={`badge rounded-pill bg-${payment.status === 'SUCCESS' ? 'success' : 'danger'}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="small">{new Date(payment.timestamp).toLocaleString()}</td>
                                </tr>
                            ))}
                            {earningsData && earningsData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">No earnings found yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );

    const renderRatings = () => (
        <motion.div
            className="ratings-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="card border-0 shadow-sm p-4 mb-4 bg-gradient-primary text-white" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="fw-bold mb-0">Driver Rating Summary ⭐</h4>
                        <p className="mb-0 opacity-75">Your overall performance based on passenger feedback.</p>
                    </div>
                    <div className="text-end">
                        <div className="display-4 fw-bold mb-0">{avgRatingData?.averageRating?.toFixed(1) || '0.0'} <small className="fs-6 opacity-75">/ 5</small></div>
                        <div className="badge bg-white text-primary rounded-pill px-3">Total Reviews: {avgRatingData?.totalReviews || 0}</div>
                    </div>
                </div>
                <div className="mt-3 d-flex gap-1 fs-5">
                    {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={star <= Math.round(avgRatingData?.averageRating || 0) ? 'text-warning' : 'text-white opacity-25'}>★</span>
                    ))}
                </div>
            </div>

            <div className="row g-4">
                {!reviewsList ? (
                    <div className="col-12"><SkeletonLoader type="card" count={2} /></div>
                ) : reviewsList.length === 0 ? (
                    <div className="col-12 text-center py-5 bg-white rounded-4 shadow-sm">
                        <div className="display-4 mb-3">⭐</div>
                        <h5>No reviews yet</h5>
                        <p className="text-muted">Once passengers rate your completed rides, they will appear here.</p>
                    </div>
                ) : reviewsList.map(review => (
                    <div key={review.id} className="col-md-6">
                        <div className="card border-0 shadow-sm h-100 rounded-4 overflow-hidden">
                            <div className="card-body p-4">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                    <div className="d-flex align-items-center">
                                        <div className="avatar-circle-sm bg-light text-primary me-2 d-flex align-items-center justify-content-center" style={{ width: '30px', height: '30px', borderRadius: '50%' }}>
                                            {(review.passenger?.name || review.passenger?.firstName || 'P').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h6 className="mb-0 fw-bold">{review.passenger?.name || `${review.passenger?.firstName || ''} ${review.passenger?.lastName || ''}`.trim() || 'Passenger'}</h6>
                                            <small className="text-muted">{new Date(review.createdAt).toLocaleDateString()}</small>
                                        </div>
                                    </div>
                                    <div className="text-warning fw-bold fs-5">
                                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                    </div>
                                </div>
                                <div className="p-3 bg-light rounded-3 mb-2 small italic text-secondary">
                                    "{review.comment || 'No comment provided'}"
                                </div>
                                <div className="text-end">
                                    <span className="tiny text-muted fw-bold">RIDE ID: #R-{review.rideId}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );

    return (
        <DriverDashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            <div className="driver-dashboard-content">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'post-ride' && <PublishRide onSuccess={() => setActiveTab('my-rides')} user={user} />}
                {activeTab === 'my-rides' && renderMyRides()}
                {activeTab === 'requests' && renderRequests()}
                {activeTab === 'passengers' && renderConfirmedPassengers()}
                {activeTab === 'earnings' && renderEarnings()}
                {activeTab === 'ratings' && renderRatings()}
                {activeTab === 'vehicle' && renderVehicleProfile()}
            </div>

            {showReviewModal && reviewData && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    rideId={reviewData.rideId}
                    reviewerId={user.id}
                    reviewedUserId={reviewData.reviewedUserId}
                    reviewerRole={reviewData.reviewerRole}
                />
            )}
        </DriverDashboardLayout>
    );
};


export default DriverDashboard;
