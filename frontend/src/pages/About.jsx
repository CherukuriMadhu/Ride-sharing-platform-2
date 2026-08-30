import { motion } from 'framer-motion';
import './InfoPages.css';

function About() {
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
                    <h1 className="display-4 text-neon-green mb-3">About Smart Ride Sharing</h1>
                    <p className="lead text-muted">Your trusted platform for sustainable transportation</p>
                </motion.div>

                <div className="row g-4">
                    <div className="col-md-6">
                        <motion.div
                            className="card h-100"
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="card-body p-4">
                                <h3 className="text-neon-green mb-3">Our Mission</h3>
                                <p>
                                    Smart Ride Sharing is dedicated to revolutionizing urban transportation by connecting drivers and passengers for safe, affordable, and eco-friendly rides. We believe in building a sustainable future through shared mobility.
                                </p>
                                <p>
                                    Our platform leverages cutting-edge technology to make carpooling accessible, reliable, and convenient for everyone.
                                </p>
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
                            <div className="card-body p-4">
                                <h3 className="text-neon-green mb-3">Why Choose Us?</h3>
                                <ul className="list-unstyled">
                                    <li className="mb-2">✅ Verified drivers and passengers</li>
                                    <li className="mb-2">✅ Real-time ride tracking</li>
                                    <li className="mb-2">✅ Secure payment system</li>
                                    <li className="mb-2">✅ 24/7 customer support</li>
                                    <li className="mb-2">✅ Eco-friendly transportation</li>
                                    <li className="mb-2">✅ Cost-effective commuting</li>
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
                            <div className="card-body p-4">
                                <h3 className="text-neon-green mb-3">Our Values</h3>
                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <h5>🛡️ Safety First</h5>
                                        <p className="text-muted">
                                            All users undergo thorough verification to ensure a safe community.
                                        </p>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <h5>🌱 Sustainability</h5>
                                        <p className="text-muted">
                                            Reducing carbon footprint through shared rides and efficient routing.
                                        </p>
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <h5>🤝 Community</h5>
                                        <p className="text-muted">
                                            Building connections and fostering a supportive ride-sharing community.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="text-center mt-5">
                    <motion.a
                        href="/register"
                        className="btn btn-primary btn-lg"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        Join Us Today
                    </motion.a>
                </div>
            </div>
        </motion.div>
    );
}

export default About;
