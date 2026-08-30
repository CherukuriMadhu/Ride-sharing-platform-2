import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="container py-3">
                <div className="row">
                    {/* About Section */}
                    <div className="col-md-6 mb-3">
                        <h5 className="text-dark mb-3 fw-bold">Smart Ride Sharing</h5>
                        <p className="text-muted">
                            Your trusted platform for safe, affordable, and eco-friendly ride sharing and carpooling.
                        </p>
                        <div className="social-links mt-3">
                            <a href="#" className="social-icon"><i className="fab fa-facebook"></i></a>
                            <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
                            <a href="#" className="social-icon"><i className="fab fa-instagram"></i></a>
                            <a href="#" className="social-icon"><i className="fab fa-linkedin"></i></a>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="col-md-6 mb-3">
                        <h5 className="text-dark mb-3 fw-bold">Contact Us</h5>
                        <div className="contact-info">
                            <p className="text-muted">
                                <i className="fas fa-envelope me-2"></i>
                                <a href="mailto:dilullucreations@gmail.com" className="text-muted">
                                    dilullucreations@gmail.com
                                </a>
                            </p>
                            <p className="text-muted">
                                <i className="fas fa-phone me-2"></i>
                                Available 24/7
                            </p>
                            <p className="text-muted">
                                <i className="fas fa-map-marker-alt me-2"></i>
                                Serving communities nationwide
                            </p>
                        </div>
                    </div>
                </div>

                <hr className="my-3" />

                <div className="row">
                    <div className="col-md-6 text-center text-md-start">
                        <p className="text-muted mb-0 small">
                            &copy; {new Date().getFullYear()} Smart Ride Sharing System. All rights reserved.
                        </p>
                    </div>
                    <div className="col-md-6 text-center text-md-end">
                        <p className="text-muted mb-0 small">
                            Built with ❤️ for sustainable transportation
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
