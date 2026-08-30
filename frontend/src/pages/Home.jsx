import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Home.css';

function Home() {
    const [bgIndex, setBgIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const images = [
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
    ];

    const captions = [
        "Travel Smart, Travel Together",
        "Share Rides, Share Costs",
        "Eco-Friendly Daily Commutes",
        "Premium Carpooling Experience"
    ];

    // Auto-slideshow with 2-second interval
    useEffect(() => {
        if (!isPaused) {
            const interval = setInterval(() => {
                setBgIndex((prev) => (prev + 1) % images.length);
            }, 2000); // 2 seconds
            return () => clearInterval(interval);
        }
    }, [isPaused, images.length]);

    const goToSlide = (index) => {
        setBgIndex(index);
    };

    const nextSlide = () => {
        setBgIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setBgIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="home-page">
            {/* NEW SECTION 1: Modern Split Layout Hero */}
            <section className="hero-modern">
                <div className="hero-container">
                    {/* Left Column: Content */}
                    <motion.div
                        className="hero-left"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="hero-title-modern">
                            Share the Ride, <br />
                            <span className="text-gradient">Split the Bill.</span>
                        </h1>
                        <p className="hero-description">
                            Join the most energetic community of travelers. Save money, reduce CO₂, and make new friends on every journey.
                        </p>
                    </motion.div>

                    {/* Right Column: Visuals */}
                    <div className="hero-right">
                        <div className="floating-cards-container">
                            <motion.div
                                className="main-visual-card"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <img src="/assets/car-ride.png" alt="Comfortable Car Ride" className="hero-img" />
                            </motion.div>

                            <motion.div
                                className="secondary-visual-card"
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <img src="/assets/map-navigation.png" alt="Live Navigation" className="hero-img" />
                            </motion.div>

                            {/* Stat Cards */}
                            <motion.div
                                className="stat-card stat-1"
                                whileHover={{ scale: 1.1, rotate: 2 }}
                                animate={{ x: [0, 5, 0], y: [0, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="stat-icon pulse">🚗</div>
                                <div className="stat-info">
                                    <span className="stat-value">50+</span>
                                    <span className="stat-label">Active Rides</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className="stat-card stat-2"
                                whileHover={{ scale: 1.1, rotate: -2 }}
                                animate={{ x: [0, -5, 0], y: [0, 5, 0] }}
                                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <div className="stat-icon">⭐</div>
                                <div className="stat-info">
                                    <span className="stat-value">4.9/5</span>
                                    <span className="stat-label">User Rating</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className="stat-card stat-3"
                                whileHover={{ scale: 1.1, rotate: 1 }}
                            >
                                <div className="stat-icon">🌿</div>
                                <div className="stat-info">
                                    <span className="stat-value">CO₂ Saved</span>
                                    <span className="stat-label">Today</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className="stat-card stat-4"
                                whileHover={{ scale: 1.1 }}
                            >
                                <div className="stat-icon live-dot">📍</div>
                                <div className="stat-info">
                                    <span className="stat-value">Live</span>
                                    <span className="stat-label">Tracking</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: How It Works */}
            <section className="how-it-works-section animated-bg">
                <div className="container py-5">
                    <motion.div
                        className="text-center mb-5"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title text-primary-green">How It Works</h2>
                        <p className="section-subtitle">Simple steps to start your journey</p>
                    </motion.div>

                    <div className="row g-4">
                        {/* For Passengers */}
                        <div className="col-md-6">
                            <motion.div
                                className="card h-100"
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="card-header">
                                    <h4 className="mb-0">🙋‍♂️ For Passengers</h4>
                                </div>
                                <div className="card-body">
                                    <ol className="steps-list">
                                        <li><strong>Sign Up:</strong> Create your account in minutes</li>
                                        <li><strong>Search Rides:</strong> Enter your route and find available rides</li>
                                        <li><strong>Book:</strong> Choose your driver and confirm booking</li>
                                        <li><strong>Pay Securely:</strong> Complete payment through our secure gateway</li>
                                        <li><strong>Travel:</strong> Enjoy your comfortable ride</li>
                                    </ol>
                                </div>
                            </motion.div>
                        </div>

                        {/* For Drivers */}
                        <div className="col-md-6">
                            <motion.div
                                className="card h-100"
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="card-header">
                                    <h4 className="mb-0">🚘 For Drivers</h4>
                                </div>
                                <div className="card-body">
                                    <ol className="steps-list">
                                        <li><strong>Register:</strong> Sign up and upload your documents</li>
                                        <li><strong>Get Verified:</strong> Wait for admin approval (24-48 hours)</li>
                                        <li><strong>Post Ride:</strong> Add your route, timing, and available seats</li>
                                        <li><strong>Accept Bookings:</strong> Review and confirm passenger requests</li>
                                        <li><strong>Earn Money:</strong> Complete rides and receive payments</li>
                                    </ol>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: Benefits for Drivers */}
            <section className="benefits-drivers-section">
                <div className="container py-5">
                    <motion.div
                        className="text-center mb-5"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title text-primary-green">Benefits for Drivers</h2>
                        <p className="section-subtitle">Turn your daily commute into earnings</p>
                    </motion.div>

                    <div className="row g-4">
                        <div className="col-md-4">
                            <motion.div
                                className="benefit-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="benefit-icon">💰</div>
                                <h4>Extra Income</h4>
                                <p>Earn money by sharing empty seats on routes you already travel</p>
                            </motion.div>
                        </div>
                        <div className="col-md-4">
                            <motion.div
                                className="benefit-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="benefit-icon">⛽</div>
                                <h4>Save on Fuel</h4>
                                <p>Reduce your travel costs by sharing fuel expenses with passengers</p>
                            </motion.div>
                        </div>
                        <div className="col-md-4">
                            <motion.div
                                className="benefit-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="benefit-icon">🤝</div>
                                <h4>Meet New People</h4>
                                <p>Build connections and make your commute more enjoyable</p>
                            </motion.div>
                        </div>
                        <div className="col-md-4">
                            <motion.div
                                className="benefit-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="benefit-icon">📱</div>
                                <h4>Easy Management</h4>
                                <p>Simple dashboard to manage rides, bookings, and earnings</p>
                            </motion.div>
                        </div>
                        <div className="col-md-4">
                            <motion.div
                                className="benefit-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="benefit-icon">🌍</div>
                                <h4>Eco-Friendly</h4>
                                <p>Reduce carbon footprint and contribute to a greener planet</p>
                            </motion.div>
                        </div>
                        <div className="col-md-4">
                            <motion.div
                                className="benefit-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="benefit-icon">⚡</div>
                                <h4>Flexible Schedule</h4>
                                <p>Post rides on your own schedule and choose your passengers</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: Benefits for Passengers */}
            <section className="benefits-passengers-section animated-bg">
                <div className="container py-5">
                    <motion.div
                        className="text-center mb-5"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title text-primary-green">Benefits for Passengers</h2>
                        <p className="section-subtitle">Travel smarter, not harder</p>
                    </motion.div>

                    <div className="row g-4">
                        <div className="col-md-4">
                            <motion.div
                                className="benefit-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="benefit-icon">💵</div>
                                <h4>Affordable Rides</h4>
                                <p>Save up to 70% compared to traditional taxi services</p>
                            </motion.div>
                        </div>
                        <div className="col-md-4">
                            <motion.div
                                className="benefit-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="benefit-icon">🚗</div>
                                <h4>Comfortable Travel</h4>
                                <p>Enjoy private car comfort at shared ride prices</p>
                            </motion.div>
                        </div>
                        <div className="col-md-4">
                            <motion.div
                                className="benefit-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="benefit-icon">✅</div>
                                <h4>Verified Drivers</h4>
                                <p>All drivers are background-checked and document-verified</p>
                            </motion.div>
                        </div>
                        <div className="col-md-4">
                            <motion.div
                                className="benefit-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="benefit-icon">📍</div>
                                <h4>Real-Time Tracking</h4>
                                <p>Track your ride in real-time for peace of mind</p>
                            </motion.div>
                        </div>
                        <div className="col-md-4">
                            <motion.div
                                className="benefit-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                            >
                                <div className="benefit-icon">🔒</div>
                                <h4>Secure Payments</h4>
                                <p>Industry-standard encryption for all transactions</p>
                            </motion.div>
                        </div>
                        <div className="col-md-4">
                            <motion.div
                                className="benefit-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="benefit-icon">⭐</div>
                                <h4>Rating System</h4>
                                <p>Choose drivers based on verified ratings and reviews</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5: Safety & Security Features */}
            <section className="safety-section">
                <div className="container py-5">
                    <motion.div
                        className="text-center mb-5"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title text-primary-green">Safety & Security</h2>
                        <p className="section-subtitle">Your safety is our top priority</p>
                    </motion.div>

                    <div className="row g-4 align-items-center">
                        <div className="col-md-6">
                            <motion.div
                                className="safety-features"
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="safety-feature">
                                    <div className="safety-icon">🛡️</div>
                                    <div>
                                        <h5>Document Verification</h5>
                                        <p>All drivers must upload and verify Aadhaar, license, RC, and insurance</p>
                                    </div>
                                </div>
                                <div className="safety-feature">
                                    <div className="safety-icon">👤</div>
                                    <div>
                                        <h5>Background Checks</h5>
                                        <p>Comprehensive background verification for all users</p>
                                    </div>
                                </div>
                                <div className="safety-feature">
                                    <div className="safety-icon">📞</div>
                                    <div>
                                        <h5>24/7 Support</h5>
                                        <p>Round-the-clock customer support for emergencies</p>
                                    </div>
                                </div>
                                <div className="safety-feature">
                                    <div className="safety-icon">🚨</div>
                                    <div>
                                        <h5>Emergency Button</h5>
                                        <p>One-tap emergency alert to authorities and contacts</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        <div className="col-md-6">
                            <motion.div
                                className="safety-image-placeholder"
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="safety-badge">
                                    <div className="badge-icon">🔐</div>
                                    <h3>100% Secure</h3>
                                    <p>Encrypted & Protected</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 6: Testimonials */}
            <section className="testimonials-section animated-bg">
                <div className="container py-5">
                    <motion.div
                        className="text-center mb-5"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="section-title text-primary-green">What Our Users Say</h2>
                        <p className="section-subtitle">Real experiences from real people</p>
                    </motion.div>

                    <div className="row g-4">
                        <div className="col-md-4">
                            <motion.div
                                className="testimonial-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="testimonial-avatar">👨‍💼</div>
                                <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                                <p className="testimonial-text">
                                    "I save over ₹5000 monthly on my daily commute. The drivers are professional and the app is super easy to use!"
                                </p>
                                <h5 className="testimonial-author">Rajesh Kumar</h5>
                                <p className="testimonial-role">Software Engineer, Bangalore</p>
                            </motion.div>
                        </div>
                        <div className="col-md-4">
                            <motion.div
                                className="testimonial-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="testimonial-avatar">👩‍🎓</div>
                                <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                                <p className="testimonial-text">
                                    "As a student, this platform has been a lifesaver. Affordable, safe, and I've made great friends during my rides!"
                                </p>
                                <h5 className="testimonial-author">Priya Sharma</h5>
                                <p className="testimonial-role">Student, Delhi</p>
                            </motion.div>
                        </div>
                        <div className="col-md-4">
                            <motion.div
                                className="testimonial-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="testimonial-avatar">👨‍🏫</div>
                                <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                                <p className="testimonial-text">
                                    "I earn an extra ₹8000 per month just by sharing my daily route. Great way to offset fuel costs!"
                                </p>
                                <h5 className="testimonial-author">Amit Patel</h5>
                                <p className="testimonial-role">Teacher, Mumbai</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 7: Contact & FAQ */}
            <section className="contact-faq-section">
                <div className="container py-5">
                    <div className="row g-4">
                        <div className="col-md-6">
                            <motion.div
                                className="card h-100"
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="card-header">
                                    <h3 className="mb-0">Contact Us</h3>
                                </div>
                                <div className="card-body">
                                    <div className="contact-item">
                                        <i className="fas fa-envelope text-primary-green"></i>
                                        <div>
                                            <h5>Email Support</h5>
                                            <a href="mailto:dilullucreations@gmail.com">dilullucreations@gmail.com</a>
                                            <p className="text-muted small">Response within 24 hours</p>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <i className="fas fa-clock text-primary-green"></i>
                                        <div>
                                            <h5>24/7 Support</h5>
                                            <p>We're always here to help</p>
                                        </div>
                                    </div>
                                    <div className="contact-item">
                                        <i className="fas fa-map-marker-alt text-primary-green"></i>
                                        <div>
                                            <h5>Coverage</h5>
                                            <p>Serving communities nationwide</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        <div className="col-md-6">
                            <motion.div
                                className="card h-100"
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="card-header">
                                    <h3 className="mb-0">Quick Solutions</h3>
                                </div>
                                <div className="card-body">
                                    <div className="faq-quick">
                                        <h5>❓ How do I get started?</h5>
                                        <p>Simply register, complete your profile, and start searching for rides or posting your own!</p>
                                    </div>
                                    <div className="faq-quick">
                                        <h5>❓ Is it safe?</h5>
                                        <p>Yes! All users are verified, and we have 24/7 support with emergency features.</p>
                                    </div>
                                    <div className="faq-quick">
                                        <h5>❓ How do payments work?</h5>
                                        <p>Secure online payments through our encrypted gateway. Drivers receive earnings within 3-5 days.</p>
                                    </div>
                                    <div className="text-center mt-4">
                                        <Link to="/faq" className="btn btn-primary">View All FAQs</Link>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
