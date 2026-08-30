import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RoleSelection from './pages/RoleSelection';
import Dashboard from './pages/Dashboard';
import PostRide from './pages/PostRide';
import SearchRide from './pages/SearchRide';
import AdminDashboard from './pages/AdminDashboard';
import DriverDashboard from './pages/DriverDashboard';
import AdminTest from './pages/AdminTest';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UpdatePassword from './pages/UpdatePassword';
import About from './pages/About';
import Help from './pages/Help';
import FAQ from './pages/FAQ';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import NotificationToast from './components/NotificationToast';

import PendingApproval from './pages/PendingApproval';

const ConditionalLayout = ({ children }) => {
    const location = useLocation();
    const hideNavFooter = ['/login', '/register', '/forgot-password', '/pending-approval', '/dashboard', '/driver-dashboard', '/admin', '/post-ride'].includes(location.pathname);

    return (
        <>
            {!hideNavFooter && <Navbar />}
            {children}
            {!hideNavFooter && <Footer />}
        </>
    );
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <NotificationProvider>
                    <div className="app">
                        <NotificationToast />
                        <ConditionalLayout>
                            <AnimatePresence mode="wait">
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/get-started" element={<RoleSelection />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/pending-approval" element={<PendingApproval />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                                    <Route path="/reset-password" element={<ResetPassword />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/help" element={<Help />} />
                                    <Route path="/faq" element={<FAQ />} />
                                    <Route path="/payment-success" element={<PaymentSuccess />} />
                                    <Route path="/payment-cancel" element={<PaymentCancel />} />

                                    {/* Protected Routes */}
                                    <Route path="/dashboard" element={
                                        <ProtectedRoute allowedRoles={['PASSENGER']}>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/driver-dashboard" element={
                                        <ProtectedRoute allowedRoles={['DRIVER']}>
                                            <DriverDashboard />
                                        </ProtectedRoute>
                                    } />
                                    <Route path="/post-ride" element={<PostRide />} />
                                    <Route path="/search-ride" element={<SearchRide />} />
                                    <Route path="/update-password" element={<UpdatePassword />} />
                                    <Route path="/admin-test" element={<AdminTest />} />
                                    <Route path="/admin" element={
                                        <ProtectedRoute allowedRoles={['ADMIN']}>
                                            <AdminDashboard />
                                        </ProtectedRoute>
                                    } />
                                </Routes>
                            </AnimatePresence>
                        </ConditionalLayout>
                        <ToastContainer
                            position="top-right"
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop={true}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                            theme="colored"
                        />
                    </div>
                </NotificationProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
