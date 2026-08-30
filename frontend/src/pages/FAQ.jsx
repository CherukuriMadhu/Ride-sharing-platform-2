import { useState } from 'react';
import { motion } from 'framer-motion';
import './InfoPages.css';

function FAQ() {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqs = [
        {
            category: 'General',
            questions: [
                {
                    q: 'What is Smart Ride Sharing?',
                    a: 'Smart Ride Sharing is a platform that connects drivers with empty seats to passengers looking for affordable rides. It promotes carpooling and sustainable transportation.'
                },
                {
                    q: 'How do I create an account?',
                    a: 'Click on "Register" and choose your role (Driver or Passenger). Complete the 4-step registration process with your personal details, address, education, and documents.'
                },
                {
                    q: 'Is the platform free to use?',
                    a: 'Registration is free. Passengers pay for rides, and drivers earn money by sharing their empty seats. A small service fee is applied to each transaction.'
                }
            ]
        },
        {
            category: 'For Drivers',
            questions: [
                {
                    q: 'What documents do I need to register as a driver?',
                    a: 'You need to upload your Aadhaar or PAN card, driving license, vehicle RC, and insurance documents. All documents must be valid and will be verified by our admin team.'
                },
                {
                    q: 'How long does admin approval take?',
                    a: 'Admin approval typically takes 24-48 hours. You will receive an email notification once your account is approved.'
                },
                {
                    q: 'How do I post a ride?',
                    a: 'After approval, go to "Post Ride", enter your route details, departure time, available seats, and price per seat. Your ride will be submitted for admin approval before going live.'
                },
                {
                    q: 'When do I receive my earnings?',
                    a: 'Earnings are transferred to your registered bank account within 3-5 business days after ride completion.'
                }
            ]
        },
        {
            category: 'For Passengers',
            questions: [
                {
                    q: 'How do I search for rides?',
                    a: 'Use the "Search Rides" feature to enter your source and destination. You can filter by departure time, price, and driver ratings.'
                },
                {
                    q: 'How do I book a ride?',
                    a: 'Select a ride from search results, review driver details, choose number of seats, and proceed to payment. You will receive a booking confirmation via email.'
                },
                {
                    q: 'Can I cancel my booking?',
                    a: 'Yes, you can cancel at least 2 hours before departure for a full refund. Cancellations within 2 hours may incur a cancellation fee.'
                },
                {
                    q: 'How do I contact my driver?',
                    a: 'After booking confirmation, you can contact your driver through the in-app messaging system or phone number provided.'
                }
            ]
        },
        {
            category: 'Safety & Security',
            questions: [
                {
                    q: 'How do you ensure safety?',
                    a: 'All drivers undergo document verification and background checks. We also have a rating system, real-time ride tracking, and 24/7 support.'
                },
                {
                    q: 'What if I face an issue during the ride?',
                    a: 'Use the emergency button in the app to contact support immediately. You can also share your live location with trusted contacts.'
                },
                {
                    q: 'Are payments secure?',
                    a: 'Yes, we use industry-standard encryption and secure payment gateways. Your payment information is never stored on our servers.'
                }
            ]
        }
    ];

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

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
                    <h1 className="display-4 text-neon-green mb-3">Frequently Asked Questions</h1>
                    <p className="lead text-muted">Find answers to common questions</p>
                </motion.div>

                {faqs.map((category, catIndex) => (
                    <motion.div
                        key={catIndex}
                        className="mb-5"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 + catIndex * 0.1 }}
                    >
                        <h3 className="text-neon-green mb-4">{category.category}</h3>
                        <div className="accordion">
                            {category.questions.map((faq, qIndex) => {
                                const globalIndex = `${catIndex}-${qIndex}`;
                                const isActive = activeIndex === globalIndex;

                                return (
                                    <div key={qIndex} className="card mb-3">
                                        <div
                                            className="card-header"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => toggleFAQ(globalIndex)}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h5 className="mb-0">{faq.q}</h5>
                                                <i className={`fas fa-chevron-${isActive ? 'up' : 'down'} text-neon-green`}></i>
                                            </div>
                                        </div>
                                        {isActive && (
                                            <motion.div
                                                className="card-body"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <p className="text-muted mb-0">{faq.a}</p>
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}

                <motion.div
                    className="card mt-5"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <div className="card-body text-center p-5">
                        <h4 className="mb-3">Still have questions?</h4>
                        <p className="text-muted mb-4">
                            Can't find the answer you're looking for? Our support team is here to help.
                        </p>
                        <a href="mailto:dilullucreations@gmail.com" className="btn btn-primary">
                            Contact Support
                        </a>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default FAQ;
