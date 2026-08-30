import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import MapPicker from '../components/MapPicker';
import LocationSearch from '../components/LocationSearch';
import { reverseGeocode, fetchRoute, searchLocations } from '../utils/locationUtils';
import PaymentModal from '../components/PaymentModal';
import './SearchRide.css';

const STEPS = [
    { id: 1, title: 'From', description: 'Pickup' },
    { id: 2, title: 'To', description: 'Dropoff' },
    { id: 3, title: 'Stops', description: 'Intermediate' },
    { id: 4, title: 'Find', description: 'Available' },
    { id: 5, title: 'Book', description: 'Confirm' }
];

function SearchRide() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [source, setSource] = useState(null); // { latitude, longitude, address, shortAddress }
    const [destination, setDestination] = useState(null); // { latitude, longitude, address, shortAddress }
    const [pickupPoints, setPickupPoints] = useState([]); // [{ latitude, longitude, address, shortAddress }]
    const [availableRides, setAvailableRides] = useState([]);
    const [selectedRide, setSelectedRide] = useState(null);
    const [routeGeoJSON, setRouteGeoJSON] = useState(null);
    const [passengerSeats, setPassengerSeats] = useState(1);
    const [calculatingRoute, setCalculatingRoute] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [bookingReceipt, setBookingReceipt] = useState(null);

    // Update route preview
    useEffect(() => {
        const updateRoute = async () => {
            if (source && destination) {
                setCalculatingRoute(true);
                const points = [
                    { lat: source.latitude, lng: source.longitude },
                    ...pickupPoints.map(p => ({ lat: p.latitude, lng: p.longitude })),
                    { lat: destination.latitude, lng: destination.longitude }
                ];
                const routeData = await fetchRoute(points);
                if (routeData) setRouteGeoJSON(routeData.geometry);
                setCalculatingRoute(false);
            }
        };
        updateRoute();
    }, [source, destination, pickupPoints]);

    const handleMapClick = async (lat, lng) => {
        setLoading(true);
        const locationInfo = await reverseGeocode(lat, lng);
        setLoading(false);

        const newPoint = {
            latitude: lat,
            longitude: lng,
            address: locationInfo.fullAddress,
            shortAddress: locationInfo.shortAddress
        };

        if (currentStep === 1) {
            setSource(newPoint);
            toast.success("Source set! Next: Select Destination.");
            setCurrentStep(2);
        } else if (currentStep === 2) {
            setDestination(newPoint);
            toast.success("Destination set! Next: Add optional Pickup Points.");
            setCurrentStep(3);
        } else if (currentStep === 3) {
            if (pickupPoints.length >= 5) {
                toast.warning("Maximum 5 pickup points allowed.");
                return;
            }
            setPickupPoints([...pickupPoints, newPoint]);
            toast.success("Pickup point added!");
        }
    };

    const searchAvailableRides = async () => {
        setLoading(true);
        try {
            // Filter by address substring
            const res = await axios.get(`/api/rides/search?source=${encodeURIComponent(source.address)}&destination=${encodeURIComponent(destination.address)}`);
            setAvailableRides(res.data);
            setCurrentStep(4);
        } catch (error) {
            toast.error("Search failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRequestBooking = async () => {
        if (!user) {
            toast.error("Please login to book.");
            navigate('/login');
            return;
        }

        if (!selectedRide) {
            toast.error("No ride selected.");
            return;
        }

        if (passengerSeats < 1 || passengerSeats > selectedRide.availableSeats) {
            toast.error(`Invalid number of seats. Available: ${selectedRide.availableSeats}`);
            return;
        }

        setLoading(true);
        try {
            const bookingRes = await axios.post('/api/bookings', {
                ride: { id: selectedRide.id },
                passenger: { id: user.id },
                seatsBooked: passengerSeats
            });

            setBookingReceipt(bookingRes.data);
            toast.success("Booking request sent! Wait for driver approval.");
        } catch (error) {
            const errorMsg = error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message;
            toast.error(`Booking failed: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
            case 2:
                return (
                    <div className="wizard-step">
                        <div className="step-instruction mb-4">
                            <h4>{currentStep === 1 ? 'Starting Point' : 'Destination'}</h4>
                            <p>Enter an address or click on the map to choose your {currentStep === 1 ? 'pickup' : 'dropoff'} location.</p>
                        </div>

                        <div className="mb-4">
                            <LocationSearch
                                placeholder={currentStep === 1 ? "Search pickup location..." : "Search dropoff location..."}
                                value={currentStep === 1 ? source?.shortAddress : destination?.shortAddress}
                                onSelect={(item) => {
                                    const locObj = { latitude: item.lat, longitude: item.lng, address: item.fullAddress, shortAddress: item.shortAddress };
                                    if (currentStep === 1) {
                                        setSource(locObj);
                                        toast.success("Source set!");
                                        setCurrentStep(2);
                                    } else {
                                        setDestination(locObj);
                                        toast.success("Destination set!");
                                        setCurrentStep(3);
                                    }
                                }}
                            />
                        </div>

                        <MapPicker
                            center={currentStep === 1 ? (source ? [source.latitude, source.longitude] : [17.3850, 78.4867]) : (destination ? [destination.latitude, destination.longitude] : [17.3850, 78.4867])}
                            markers={[
                                ...(source ? [{ latitude: source.latitude, longitude: source.longitude, type: 'source', label: source.address }] : []),
                                ...(destination ? [{ latitude: destination.latitude, longitude: destination.longitude, type: 'destination', label: destination.address }] : [])
                            ].map(m => ({ lat: m.latitude, lng: m.longitude, type: m.type, label: m.label }))}
                            onMapClick={handleMapClick}
                        />
                    </div>
                );
            case 3:
                return (
                    <div className="wizard-step">
                        <div className="step-instruction mb-4">
                            <h4>Add Pickup Points (Optional)</h4>
                            <p>Enter addresses or click on the map to add pickup points along your route ({pickupPoints.length}/5 selected).</p>
                        </div>

                        <div className="mb-4">
                            <LocationSearch
                                placeholder="Search pickup point..."
                                onSelect={(item) => {
                                    if (pickupPoints.length >= 5) {
                                        toast.warning("Maximum 5 pickup points allowed.");
                                        return;
                                    }
                                    setPickupPoints([...pickupPoints, { latitude: item.lat, longitude: item.lng, address: item.fullAddress, shortAddress: item.shortAddress }]);
                                    toast.success("Pickup point added!");
                                }}
                            />
                        </div>

                        <MapPicker
                            markers={[
                                { latitude: source.latitude, longitude: source.longitude, type: 'source', label: source.address },
                                { latitude: destination.latitude, longitude: destination.longitude, type: 'destination', label: destination.address },
                                ...pickupPoints.map(p => ({ latitude: p.latitude, longitude: p.longitude, type: 'pickup', label: p.address }))
                            ].map(m => ({ lat: m.latitude, lng: m.longitude, type: m.type, label: m.label }))}
                            onMapClick={handleMapClick}
                            routeGeoJSON={routeGeoJSON}
                        />
                        <div className="pickup-summary-grid mt-4">
                            {[0, 1, 2, 3, 4].map(i => (
                                <div key={i} className={`pickup-box border rounded p-2 ${pickupPoints[i] ? 'bg-light border-success' : 'border-dashed'}`}>
                                    {pickupPoints[i] ? (
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="small text-truncate" style={{ maxWidth: '80%' }}>{pickupPoints[i].address}</span>
                                            <button className="btn btn-sm text-danger p-0" onClick={() => setPickupPoints(pickupPoints.filter((_, idx) => idx !== i))}>×</button>
                                        </div>
                                    ) : <span className="text-muted small">Point #{i + 1} empty</span>}
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-center">
                            <button className="btn btn-primary px-5 py-2 fw-bold" disabled={calculatingRoute} onClick={searchAvailableRides}>
                                {calculatingRoute ? 'Calculating...' : 'Search Available Rides'}
                            </button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="wizard-step">
                        <div className="step-instruction mb-4">
                            <h4>Available Rides</h4>
                            <p>Showing rides matches from {source?.address.substring(0, 20)}... to {destination?.address.substring(0, 20)}...</p>
                        </div>
                        <div className="ride-results-list">
                            {availableRides.map((ride, index) => (
                                <div
                                    key={ride.id}
                                    className={`ride-card-modern ${selectedRide?.id === ride.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedRide(ride)}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="driver-info">
                                        <div className="driver-avatar">{ride.driver.name.charAt(0)}</div>
                                        <div className="ms-3">
                                            <h6 className="mb-0 fw-bold">{ride.driver.name}</h6>
                                            <div className="d-flex align-items-center">
                                                <span className="text-warning small me-1">
                                                    ⭐ {ride.driver.averageRating?.toFixed(1) || '0.0'}
                                                </span>
                                                <span className="text-muted tiny">({ride.driver.totalReviews || 0} Reviews)</span>
                                            </div>
                                            <span className="text-muted tiny">DRIVER • ID: #{ride.id}</span>
                                        </div>
                                    </div>
                                    <div className="ride-route my-3">
                                        <div className="dot start"></div>
                                        <div className="line"></div>
                                        <div className="dot end"></div>
                                        <div className="route-texts">
                                            <span className="text-truncate fw-500">{ride.source.address}</span>
                                            <span className="text-truncate fw-500">{ride.destination.address}</span>
                                        </div>
                                    </div>
                                    <div className="ride-meta d-flex justify-content-between align-items-center">
                                        <div className="fare-box">
                                            <span className="d-block text-muted tiny text-uppercase fw-bold">Price</span>
                                            <span className="fs-5 fw-bold text-primary">₹{ride.pricePerSeat}</span>
                                        </div>
                                        <div className="seats-info text-end">
                                            <span className={`badge ${ride.availableSeats > 0 ? 'bg-soft-success text-success' : 'bg-soft-danger text-danger'}`}>
                                                {ride.availableSeats} seats left
                                            </span>
                                            <span className="d-block text-muted tiny mt-1">📅 {new Date(ride.departureTime).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {availableRides.length === 0 && (
                                <div className="text-center py-5">
                                    <div className="fs-1 mb-3">🔍</div>
                                    <h5>No matching rides found</h5>
                                    <p className="text-muted">Try a different route or check back later.</p>
                                    <button className="btn btn-outline-primary mt-3" onClick={() => setCurrentStep(1)}>New Search</button>
                                </div>
                            )}
                        </div>
                        {selectedRide && (
                            <div className="mt-4 text-center">
                                <button className="btn btn-primary px-5 fw-bold" onClick={() => setCurrentStep(5)}>Review & Book Selected</button>
                            </div>
                        )}
                    </div>
                );
            case 5:
                return (
                    <div className="wizard-step">
                        <div className="step-instruction mb-4">
                            <h4>Review Your Booking</h4>
                            <p>Confirm the details and choose your seats.</p>
                        </div>
                        <div className="booking-summary-card card p-4 shadow-sm">
                            <div className="row">
                                <div className="col-md-7">
                                    <h5 className="mb-4">Ride Details</h5>
                                    <div className="mb-3">
                                        <label className="text-muted small text-uppercase fw-bold">From</label>
                                        <p className="fw-500">{selectedRide.source.address}</p>
                                    </div>
                                    <div className="mb-3">
                                        <label className="text-muted small text-uppercase fw-bold">To</label>
                                        <p className="fw-500">{selectedRide.destination.address}</p>
                                    </div>
                                    <div className="row">
                                        <div className="col-6 mb-3">
                                            <label className="text-muted small text-uppercase fw-bold">Departure</label>
                                            <p className="fw-500">{new Date(selectedRide.departureTime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                        </div>
                                        <div className="col-6 mb-3">
                                            <label className="text-muted small text-uppercase fw-bold">Driver</label>
                                            <p className="fw-500">{selectedRide.driver.name}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-5 border-start">
                                    <h5 className="mb-4">Fare Breakdown</h5>
                                    <div className="form-group mb-4">
                                        <label className="form-label">How many seats?</label>
                                        <input type="number" className="form-control" min="1" max={selectedRide.availableSeats} value={passengerSeats} onChange={(e) => setPassengerSeats(parseInt(e.target.value))} />
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Price per seat:</span>
                                        <span>₹{selectedRide.pricePerSeat}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Seats selected:</span>
                                        <span>× {passengerSeats}</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between text-success fs-4 fw-bold">
                                        <span>Total Fare:</span>
                                        <span>₹{selectedRide.pricePerSeat * passengerSeats}</span>
                                    </div>
                                    <button className="btn btn-primary w-100 mt-4 py-3 fw-bold" onClick={handleRequestBooking} disabled={loading}>
                                        {loading ? 'Processing...' : 'Request Booking'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {bookingReceipt && (
                            <div className="receipt-overlay">
                                <div className="receipt-container card shadow-lg p-4">
                                    <div className="text-center mb-4">
                                        <div className="display-4 text-primary mb-2">📩</div>
                                        <h3 className="fw-bold">Request Sent!</h3>
                                        <p className="text-muted">Wait for driver to approve your booking</p>
                                    </div>
                                    <div className="receipt-details border-top pt-3">
                                        <div className="row g-2 mb-3">
                                            <div className="col-12">
                                                <small className="text-muted d-block">Booking ID</small>
                                                <span className="fw-bold">#BK-{bookingReceipt?.id || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <small className="text-muted d-block">Route</small>
                                            <p className="mb-0 small">
                                                {bookingReceipt?.ride?.source?.address || 'N/A'} → {bookingReceipt?.ride?.destination?.address || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Seats Booked:</span>
                                            <span className="fw-bold">{bookingReceipt?.seatsBooked || passengerSeats}</span>
                                        </div>
                                    </div>
                                    <div className="d-grid gap-2 mt-4">
                                        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
                                        <button className="btn btn-outline-secondary" onClick={() => setBookingReceipt(null)}>Close</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="search-ride-wizard-container">
            <div className="search-ride-card">
                <div className="wizard-header text-center mb-5">
                    <h2 className="fw-bold">Find Your Ride</h2>
                    <div className="wizard-steps-indicator d-flex justify-content-center mt-4">
                        {STEPS.map(step => (
                            <div key={step.id} className={`step-dot ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'done' : ''}`}>
                                <div className="dot-circle">{currentStep > step.id ? '✓' : step.id}</div>
                                <span className="dot-label">{step.title}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="wizard-body">
                    {renderStepContent()}
                </div>

                {currentStep > 1 && currentStep < 4 && (
                    <div className="mt-4 pt-3 border-top">
                        <button className="btn btn-link text-decoration-none text-muted" onClick={() => setCurrentStep(currentStep - 1)}>
                            ← Back to previous step
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchRide;
