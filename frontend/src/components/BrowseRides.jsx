import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import SkeletonLoader from './common/SkeletonLoader';
import './BrowseRides.css';

const BrowseRides = ({ rides, isSearching, onBook, userBookings, performSearch, searchSource, setSearchSource, searchDest, setSearchDest }) => {

    const getBookingStatusForRide = (rideId) => {
        const booking = userBookings?.find(b => b.ride?.id === rideId);
        return booking ? booking.status : null;
    };

    const renderSkeleton = () => (
        <div className="skeleton-feed">
            {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-card">
                    <div className="skeleton-header">
                        <div className="skeleton-avatar shim"></div>
                        <div className="skeleton-name-box">
                            <div className="skeleton-line-sm shim"></div>
                            <div className="skeleton-line-xs shim"></div>
                        </div>
                    </div>
                    <div className="skeleton-body">
                        <div className="skeleton-line-lg shim"></div>
                        <div className="skeleton-line-md shim"></div>
                    </div>
                    <div className="skeleton-footer shim"></div>
                </div>
            ))}
        </div>
    );

    return (
        <motion.div
            className="browse-rides-feed-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Sticky Search Bar */}
            <div className="search-bar-sticky">
                <div className="search-box-compact shadow-sm">
                    <div className="search-row">
                        <div className="search-input-group">
                            <span className="search-icon">📍</span>
                            <input
                                type="text"
                                placeholder="Source"
                                value={searchSource}
                                onChange={(e) => setSearchSource(e.target.value)}
                            />
                        </div>
                        <div className="search-divider"></div>
                        <div className="search-input-group">
                            <span className="search-icon">🏁</span>
                            <input
                                type="text"
                                placeholder="Destination"
                                value={searchDest}
                                onChange={(e) => setSearchDest(e.target.value)}
                            />
                        </div>
                        <button className="search-btn-primary" onClick={performSearch} disabled={isSearching}>
                            {isSearching ? <span className="spinner-border spinner-border-sm"></span> : "Find Rides 🔍"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Rides Feed */}
            <div className="rides-feed">
                {!rides ? (
                    renderSkeleton()
                ) : rides.length === 0 ? (
                    <div className="empty-feed">
                        <div className="empty-icon">🚗</div>
                        <h5>No rides available right now.</h5>
                        <p>Check back later or try a different search!</p>
                    </div>
                ) : (
                    rides.map(ride => {
                        const bookingStatus = getBookingStatusForRide(ride.id);
                        const isFull = ride.availableSeats <= 0;
                        const isBooked = !!bookingStatus;

                        return (
                            <motion.div
                                key={ride.id}
                                className="ride-post-card-social shadow-sm"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                            >
                                {/* Card Header */}
                                <div className="post-header">
                                    <div className="driver-profile">
                                        <div className="avatar-circle-sm">
                                            {(ride.driver?.name || 'D').charAt(0)}
                                        </div>
                                        <div className="driver-details">
                                            <div className="name-row">
                                                <span className="driver-name">{ride.driver?.name || 'Driver'}</span>
                                                <span className="verified-badge">Verified Driver ✅</span>
                                            </div>
                                            <span className="post-date text-muted">
                                                {new Date(ride.departureTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Card Body (Route) */}
                                <div className="post-body">
                                    <div className="route-main">
                                        <span className="city-name">{ride.source?.address?.split(',')[0]}</span>
                                        <span className="route-arrow">→</span>
                                        <span className="city-name">{ride.destination?.address?.split(',')[0]}</span>
                                    </div>

                                    {/* Waypoints */}
                                    {(ride.pickupPoints?.length > 0 || ride.dropPoints?.length > 0) && (
                                        <div className="waypoints-tags mt-2">
                                            {ride.pickupPoints?.map((p, idx) => (
                                                <span key={`p-${idx}`} className="waypoint-tag pickup">🔵 Pickup: {p.address?.split(',')[0]}</span>
                                            ))}
                                            {ride.dropPoints?.map((d, idx) => (
                                                <span key={`d-${idx}`} className="waypoint-tag drop">🟠 Drop: {d.address?.split(',')[0]}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Details Row */}
                                <div className="post-details">
                                    <div className="detail-item">
                                        <span className="icon">🪑</span>
                                        <span className="text">{ride.availableSeats} Seats Left</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="icon">💰</span>
                                        <span className="text">₹{ride.pricePerSeat} / seat</span>
                                    </div>
                                    {ride.driver?.vehicle && (
                                        <div className="detail-item">
                                            <span className="icon">🚘</span>
                                            <span className="text">{ride.driver.vehicle.brand} {ride.driver.vehicle.model}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action Button */}
                                <div className="post-action">
                                    {isBooked ? (
                                        <button className="btn-post btn-booked" disabled>Already Booked ✅</button>
                                    ) : isFull ? (
                                        <button className="btn-post btn-full" disabled>Fully Booked 🚫</button>
                                    ) : (
                                        <button
                                            className="btn-post btn-book"
                                            onClick={() => onBook(ride.id)}
                                        >
                                            Book Ride 🚀
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
};

export default BrowseRides;
