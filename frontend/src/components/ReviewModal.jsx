import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, onSuccess, rideId, reviewerId, reviewedUserId, reviewedUserName, reviewerRole }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hover, setHover] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.warning('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            // Updated payload to match user request
            await axios.post('/api/reviews', {
                rideId,
                passengerId: reviewerId,
                driverId: reviewedUserId,
                rating,
                comment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Review submitted successfully');
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error(error.response?.data || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="review-modal-overlay">
                <motion.div
                    className="review-modal-content"
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                >
                    <div className="modal-header">
                        <h3>Rate Your Experience 🌟</h3>
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="rating-container">
                            <p>How was your ride?</p>
                            <div className="star-rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`star-btn ${star <= (hover || rating) ? 'active' : ''}`}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group mt-4">
                            <label>Add a comment (optional)</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                placeholder="Share your experience..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="modal-footer mt-4">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReviewModal;
