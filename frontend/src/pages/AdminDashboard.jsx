import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';
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
import { Line, Pie, Bar } from 'react-chartjs-2';

import { useNotification } from '../context/NotificationContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const { lastMessage } = useNotification();

    // Real-time Analytics Data
    const { data: analytics, refresh: refreshAnalytics } =
        useRealTimeData('/api/analytics/admin', 5000);

    // Users Data
    const { data: usersData, refresh: refreshUsers } =
        useRealTimeData('/api/admin/users', 5000);

    // Rides Data
    const { data: ridesData, refresh: refreshRides } =
        useRealTimeData('/api/admin/rides', 10000);

    // Payments Data
    const { data: paymentsData, refresh: refreshPayments } =
        useRealTimeData('/api/admin/payments', 10000);

    // Reviews Data
    const { data: reviewsData, refresh: refreshReviews } =
        useRealTimeData('/api/admin/reviews', 10000);

    const refreshAll = () => {
        refreshAnalytics();
        refreshUsers();
        refreshRides();
        refreshPayments();
        refreshReviews();
    };

    React.useEffect(() => {
        if (lastMessage) {
            refreshAll();
            toast.info("Updating admin dashboard...");
        }
    }, [lastMessage]);

    const adminMenu = [
        { id: 'overview', label: 'Overview', icon: '📊', onClick: () => setActiveTab('overview') },
        { id: 'users', label: 'Users', icon: '👥', onClick: () => setActiveTab('users') },
        { id: 'rides', label: 'Rides', icon: '🚗', onClick: () => setActiveTab('rides') },
        { id: 'payments', label: 'Payments', icon: '💳', onClick: () => setActiveTab('payments') },
        { id: 'reviews', label: 'Reviews', icon: '⭐', onClick: () => setActiveTab('reviews') },
        { id: 'verification', label: 'Verification', icon: '📄', onClick: () => setActiveTab('verification') },
    ];

    const handleApproveUser = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/users/${id}/approve`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User approved and notification sent');
            refreshUsers();
            refreshAnalytics();
        } catch (error) {
            toast.error('Approval failed');
        }
    };


    const handleToggleUser = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/admin/users/${id}/toggle-status`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.info('Status updated');
            refreshUsers();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/admin/reviews/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Review deleted');
            refreshReviews();
            refreshAnalytics();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const renderOverview = () => {
        if (!analytics) return <div className="p-4"><SkeletonLoader type="metric" count={1} /></div>;

        const registrationLabels = (analytics.monthlyRegistrations || []).map(r => r[0]);
        const registrationData = (analytics.monthlyRegistrations || []).map(r => r[1]);

        const chartData = {
            labels: registrationLabels.length > 0 ? registrationLabels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Registrations',
                    data: registrationData.length > 0 ? registrationData : [0, 0, 0, 0, 0, 0],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4
                }
            ]
        };


        return (
            <motion.div
                className="overview-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="row g-3 mb-4">
                    {[
                        { label: 'Total Users', value: analytics.totalUsers, color: 'primary', icon: '👥' },
                        { label: 'Total Drivers', value: analytics.totalDrivers, color: 'info', icon: '🚘' },
                        { label: 'Total Passengers', value: analytics.totalPassengers, color: 'success', icon: '🧍' },
                        { label: 'Total Revenue', value: `₹${analytics.totalRevenue || 0}`, color: 'warning', icon: '💰' },
                        { label: 'Total Rides', value: analytics.totalRides || 0, color: 'dark', icon: '🚗' },
                        { label: 'Total Reviews', value: analytics.totalReviews || 0, color: 'secondary', icon: '⭐' }
                    ].map((card, i) => (
                        <div className="col-md-4 col-sm-6" key={i}>
                            <div className={`card border-0 shadow-sm border-start border-4 border-${card.color}`}>
                                <div className="card-body d-flex justify-content-between align-items-center">
                                    <div>
                                        <div className="text-muted small fw-bold">{card.label}</div>
                                        <div className="h3 mb-0">{card.value}</div>
                                    </div>
                                    <div className="metric-icon fs-4">{card.icon}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row g-4">
                    <div className="col-lg-12">
                        <div className="card border-0 shadow-sm p-4">
                            <h5 className="mb-4 fw-bold">User Registration Growth</h5>
                            <div style={{ height: '300px' }}>
                                <Line data={chartData} options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' } }
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderRides = () => (
        <motion.div
            className="card border-0 shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Platform Rides Monitoring 🚗</h5>
                <span className="badge bg-primary rounded-pill">{ridesData?.length || 0} Total Rides</span>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">Ride ID</th>
                                <th>Driver</th>
                                <th>Route</th>
                                <th>Price</th>
                                <th>Status</th>
                                <th className="pe-4">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!ridesData ? (
                                <tr><td colSpan="6"><SkeletonLoader type="table-row" count={5} /></td></tr>
                            ) : ridesData.map(ride => (
                                <tr key={ride.id}>
                                    <td className="ps-4 fw-bold text-primary">#R-{ride.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-circle-sm me-2 bg-info-subtle text-info">
                                                {ride.driver?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="small fw-bold">{ride.driver?.name}</div>
                                                <div className="tiny text-muted">{ride.driver?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="small text-truncate" style={{ maxWidth: '250px' }}>
                                            <span className="text-success">●</span> {ride.source?.address}
                                            <br />
                                            <span className="text-danger">●</span> {ride.destination?.address}
                                        </div>
                                    </td>
                                    <td className="fw-bold">₹{ride.pricePerSeat}</td>
                                    <td>
                                        <span className={`badge-status-pill ${ride.status.toLowerCase()}`}>
                                            {ride.status}
                                        </span>
                                    </td>
                                    <td className="pe-4 small">
                                        {new Date(ride.departureTime).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );

    const renderPayments = () => (
        <motion.div
            className="card border-0 shadow-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <div className="card-header bg-white border-0 pt-4 px-4">
                <h5 className="mb-0 fw-bold">Transaction History 💳</h5>
            </div>
            <div className="card-body p-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">Stripe Session</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th className="pe-4">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!paymentsData ? (
                                <tr><td colSpan="4"><SkeletonLoader type="table-row" count={5} /></td></tr>
                            ) : paymentsData.map(pay => (
                                <tr key={pay.id}>
                                    <td className="ps-4 small font-monospace text-muted">{pay.sessionId}</td>
                                    <td className="fw-bold text-success">₹{pay.amount?.toFixed(2)}</td>
                                    <td><span className="badge bg-success-subtle text-success border border-success-subtle">{pay.status}</span></td>
                                    <td className="pe-4 small">{new Date(pay.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            {paymentsData?.length === 0 && (
                                <tr><td colSpan="4" className="text-center py-5 text-muted">No transactions recorded yet.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );

    const renderReviews = () => (
        <motion.div
            className="card border-0 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fw-bold">Platform Feedback ⭐</h5>
                <span className="badge bg-secondary rounded-pill">{reviewsData?.length || 0} Reviews</span>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-light">
                            <tr>
                                <th>IDs</th>
                                <th>Reviewer / Participant</th>
                                <th>Feedback</th>
                                <th>Rating</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!reviewsData ? (
                                <tr><td colSpan="6"><SkeletonLoader type="table-row" count={5} /></td></tr>
                            ) : reviewsData.map(review => (
                                <tr key={review.id}>
                                    <td className="small">
                                        <div className="tiny text-muted">Review: #{review.id}</div>
                                        <div className="tiny text-muted text-primary fw-bold">Ride: #R-{review.rideId}</div>
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column">
                                            <div className="small"><strong>By:</strong> {review.passenger?.name}</div>
                                            <div className="small"><strong>To:</strong> {review.driver?.name}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="small text-truncate" style={{ maxWidth: '200px' }} title={review.comment}>
                                            "{review.comment || 'No comment'}"
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-warning small">
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </div>
                                    </td>
                                    <td className="small">{new Date(review.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-danger border-0"
                                            onClick={() => handleDeleteReview(review.id)}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {reviewsData?.length === 0 && (
                    <div className="text-center py-5 text-muted">No reviews submitted yet.</div>
                )}
            </div>
        </motion.div>
    );

    const renderUsers = () => (
        <motion.div
            className="card border-0 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="card-header border-0 pt-4 px-4 d-flex justify-content-between">
                <h5 className="mb-0">User Management</h5>
                <div className="d-flex gap-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="form-control form-control-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!usersData ? (
                                <tr>
                                    <td colSpan="4" className="p-0 border-0">
                                        <SkeletonLoader type="table-row" count={4} />
                                    </td>
                                </tr>
                            ) : usersData
                                .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(u => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="fw-bold">{u.name}</div>
                                            <small className="text-muted">{u.email}</small>
                                        </td>
                                        <td>{u.role}</td>
                                        <td><span className={`badge bg-${u.status === 'ACTIVE' ? 'success' : 'warning'}`}>{u.status}</span></td>
                                        <td>
                                            <div className="btn-group btn-group-sm">
                                                {u.status === 'PENDING' && <button className="btn btn-success" onClick={() => handleApproveUser(u.id)}>Approve</button>}
                                                <button className="btn btn-outline-warning" onClick={() => handleToggleUser(u.id)}>Toggle</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );


    const renderVerification = () => (
        <motion.div
            className="card border-0 shadow-sm"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="card-header bg-white border-0 pt-4 px-4">
                <h5 className="mb-0">Document Verification</h5>
            </div>
            <div className="card-body">
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Driver</th>
                                <th>Docs</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!usersData ? (
                                <tr>
                                    <td colSpan="3" className="p-0 border-0">
                                        <SkeletonLoader type="table-row" count={3} />
                                    </td>
                                </tr>
                            ) : usersData.filter(u => u.role === 'DRIVER').map(u => (
                                <tr key={u.id}>
                                    <td>{u.name}</td>
                                    <td>
                                        <div className="d-flex gap-1">
                                            {u.aadhaarImage && <span className="badge bg-secondary">Aadhaar</span>}
                                            {u.licenseImage && <span className="badge bg-secondary">License</span>}
                                        </div>
                                    </td>
                                    <td>
                                        {u.status === 'PENDING' && <button className="btn btn-primary btn-sm" onClick={() => handleApproveUser(u.id)}>Verify All</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );



    return (
        <DashboardLayout menuItems={adminMenu}>
            <div className="admin-dashboard p-4">
                <div className="mb-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h3 className="fw-bold mb-1">System Administration 🛡️</h3>
                        <p className="text-muted mb-0">Monitor system performance and user activity.</p>
                    </div>
                    <button onClick={refreshAll} className="btn btn-outline-primary btn-sm rounded-pill px-3">
                        🔄 Refresh Stats
                    </button>
                </div>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'rides' && renderRides()}
                {activeTab === 'payments' && renderPayments()}
                {activeTab === 'reviews' && renderReviews()}
                {activeTab === 'verification' && renderVerification()}
            </div>
        </DashboardLayout>
    );
};

export default AdminDashboard;
