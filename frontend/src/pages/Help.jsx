import { motion } from 'framer-motion';
import './InfoPages.css';

function Help() {
    return (
        <motion.div
            className="info-page animated-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="container py-5">
                <motion.div
                    className="text-center mb-5"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <h1 className="display-4 text-neon-green mb-3">Help Center</h1>
                    <p className="lead text-muted">We're here to help you get started</p>
                </motion.div>

                <div className="row g-4">
                    <div className="col-md-6">
                        <motion.div
                            className="card h-100"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="card-header">
                                <h4 className="mb-0">For Passengers</h4>
                            </div>
                            <div className="card-body">
                                <h5>Getting Started</h5>
                                <ol>
                                    <li className="mb-2">Create an account and complete your profile</li>
                                    <li className="mb-2">Search for available rides using source and destination</li>
                                    <li className="mb-2">Review driver profiles and ratings</li>
                                    <li className="mb-2">Book your ride and make payment</li>
                                    <li className="mb-2">Track your ride in real-time</li>
                                </ol>

                                <h5 className="mt-4">Common Issues</h5>
                                <ul className="list-unstyled">
                                    <li className="mb-2">
                                        <strong>Can't find rides?</strong> Try adjusting your search radius or time window.
                                    </li>
                                    <li className="mb-2">
                                        <strong>Payment failed?</strong> Check your payment method and try again.
                                    </li>
                                    <li className="mb-2">
                                        <strong>Need to cancel?</strong> Cancel at least 2 hours before departure for a full refund.
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>

                    <div className="col-md-6">
                        <motion.div
                            className="card h-100"
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <div className="card-header">
                                <h4 className="mb-0">For Drivers</h4>
                            </div>
                            <div className="card-body">
                                <h5>Getting Started</h5>
                                <ol>
                                    <li className="mb-2">Register as a driver and upload required documents</li>
                                    <li className="mb-2">Wait for admin approval (usually within 24 hours)</li>
                                    <li className="mb-2">Add your vehicle details</li>
                                    <li className="mb-2">Post your first ride with route and timing</li>
                                    <li className="mb-2">Accept booking requests and earn money</li>
                                </ol>

                                <h5 className="mt-4">Common Issues</h5>
                                <ul className="list-unstyled">
                                    <li className="mb-2">
                                        <strong>Account pending?</strong> Admin approval takes up to 24 hours.
                                    </li>
                                    <li className="mb-2">
                                        <strong>Ride not approved?</strong> Ensure all details are correct and resubmit.
                                    </li>
                                    <li className="mb-2">
                                        <strong>Payment issues?</strong> Earnings are transferred within 3-5 business days.
                                    </li>
                                </ul>
                            </div>
                        </motion.div>
                    </div>

                    <div className="col-12">
                        <motion.div
                            className="card"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="card-header">
                                <h4 className="mb-0">Contact Support</h4>
                            </div>
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md-4 text-center mb-3">
                                        <i className="fas fa-envelope fa-3x text-neon-green mb-3"></i>
                                        <h5>Email Support</h5>
                                        <p className="text-muted">
                                            <a href="mailto:dilullucreations@gmail.com">dilullucreations@gmail.com</a>
                                        </p>
                                        <p className="small text-muted">Response within 24 hours</p>
                                    </div>
                                    <div className="col-md-4 text-center mb-3">
                                        <i className="fas fa-question-circle fa-3x text-neon-green mb-3"></i>
                                        <h5>FAQs</h5>
                                        <p className="text-muted">
                                            <a href="/faq">Visit our FAQ page</a>
                                        </p>
                                        <p className="small text-muted">Quick answers to common questions</p>
                                    </div>
                                    <div className="col-md-4 text-center mb-3">
                                        <i className="fas fa-clock fa-3x text-neon-green mb-3"></i>
                                        <h5>24/7 Support</h5>
                                        <p className="text-muted">Available round the clock</p>
                                        <p className="small text-muted">We're always here to help</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default Help;
