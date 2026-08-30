import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import MapPicker from '../components/MapPicker';
import LocationSearch from '../components/LocationSearch';
import { reverseGeocode, fetchRoute, searchLocations } from '../utils/locationUtils';
import './PostRide.css';

const STEPS = [
    { id: 1, title: 'Route', description: 'Start & Goal' },
    { id: 2, title: 'Pickups', description: 'Intermediate stops' },
    { id: 3, title: 'Details', description: 'Seats & Fare' },
    { id: 4, title: 'Review', description: 'Confirm & Post' }
];

function PostRide() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [vehiclesLoading, setVehiclesLoading] = useState(false);
    const [vehiclesError, setVehiclesError] = useState(null);

    // Ride state
    const [source, setSource] = useState(null); // { latitude, longitude, address, shortAddress }
    const [destination, setDestination] = useState(null); // { latitude, longitude, address, shortAddress }
    const [pickupPoints, setPickupPoints] = useState([null, null, null, null]); // Exactly 4 slots as requested
    const [routeGeoJSON, setRouteGeoJSON] = useState(null);
    const [calculatingDistance, setCalculatingDistance] = useState(false);
    const [rideDetails, setRideDetails] = useState({
        departureDate: '',
        departureTime: '',
        availableSeats: 1,
        basePrice: 0,
        distanceKm: 0,
        vehicleId: '',
        driverName: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Driver'
    });

    // Fetch driver's vehicles
    const fetchVehicles = (userId) => {
        setVehiclesLoading(true);
        setVehiclesError(null);
        axios.get(`/api/vehicles/user/${userId}`)
            .then(res => {
                setVehicles(res.data);
                if (res.data.length > 0) {
                    setRideDetails(prev => ({ ...prev, vehicleId: res.data[0].id.toString() }));
                }
                setVehiclesLoading(false);
            })
            .catch(err => {
                console.error('Error fetching vehicles:', err);
                setVehiclesError('Could not load vehicles. Please check your connection.');
                setVehiclesLoading(false);
            });
    };

    useEffect(() => {
        if (user && user.id) {
            fetchVehicles(user.id);
        }
    }, [user?.id]);

    // Update route when source, destination or pickups change
    useEffect(() => {
        const updateRoute = async () => {
            if (source && destination) {
                setCalculatingDistance(true);
                const points = [
                    { lat: source.latitude, lng: source.longitude },
                    ...pickupPoints.filter(p => p !== null).map(p => ({ lat: p.latitude, lng: p.longitude })),
                    { lat: destination.latitude, lng: destination.longitude }
                ];
                const routeData = await fetchRoute(points);
                if (routeData) {
                    setRouteGeoJSON(routeData.geometry);
                    setRideDetails(prev => ({ ...prev, distanceKm: routeData.distanceKm }));
                } else {
                    // Permanently removed distance notification as requested
                    setRideDetails(prev => ({ ...prev, distanceKm: 0 }));
                }
                setCalculatingDistance(false);
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
            if (!source) {
                setSource(newPoint);
                toast.info("Source selected. Now click to select Destination.");
            } else if (!destination) {
                setDestination(newPoint);
                toast.success("Route path generated!");
            } else {
                setSource(newPoint);
                setDestination(null);
                setRouteGeoJSON(null);
            }
        } else if (currentStep === 2) {
            // Find first empty slot
            const emptyIdx = pickupPoints.findIndex(p => p === null);
            if (emptyIdx === -1) {
                toast.warning("All 4 pickup slots are filled. Clear one to add another.");
                return;
            }
            const newPickups = [...pickupPoints];
            newPickups[emptyIdx] = newPoint;
            setPickupPoints(newPickups);
            toast.success(`Pickup point ${emptyIdx + 1} added!`);
        }
    };

    const handleDetailChange = (e) => {
        const { name, value } = e.target;
        setRideDetails({ ...rideDetails, [name]: value });
    };

    const handleNext = () => {
        if (currentStep === 1 && (!source || !destination)) {
            toast.error("Please select both source and destination on the map.");
            return;
        }
        if (currentStep === 3) {
            if (!rideDetails.departureDate || !rideDetails.departureTime || !rideDetails.vehicleId || rideDetails.basePrice <= 0) {
                toast.error("Please fill all mandatory ride details.");
                return;
            }
        }
        setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        console.log("Submit button clicked. Current state:", { source, destination, rideDetails, user });

        if (!source || !destination) {
            console.error("Submission blocked: Source or Destination missing");
            toast.error("Source and destination must be set before posting the ride.");
            return;
        }

        if (!user || !user.id) {
            console.error("Submission blocked: User not logged in or missing ID");
            toast.error("User session expired. Please log in again.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                source: {
                    latitude: source.latitude,
                    longitude: source.longitude,
                    address: source.address
                },
                destination: {
                    latitude: destination.latitude,
                    longitude: destination.longitude,
                    address: destination.address
                },
                pickupPoints: pickupPoints.filter(p => p !== null).map(p => ({
                    location: {
                        latitude: p.latitude,
                        longitude: p.longitude,
                        address: p.address
                    }
                })),
                departureTime: `${rideDetails.departureDate}T${rideDetails.departureTime}`,
                availableSeats: parseInt(rideDetails.availableSeats),
                totalSeats: parseInt(rideDetails.availableSeats),
                pricePerSeat: parseFloat(rideDetails.basePrice),
                distance: parseFloat(rideDetails.distanceKm || 0),
                driver: { id: user.id },
                vehicle: { id: parseInt(rideDetails.vehicleId) }
            };

            await axios.post('/api/rides', payload);
            setLoading(false);
            setShowSuccessModal(true);
        } catch (error) {
            setLoading(false);
            console.error("Ride submission failed. Axios Error:", error);
            const errorMsg = error.response?.data?.message ||
                (typeof error.response?.data === 'string' ? error.response.data : null) ||
                error.message;
            toast.error("Failed to post ride: " + errorMsg);
        }
    };

    const removePickup = (index) => {
        const newPickups = [...pickupPoints];
        newPickups[index] = null;
        setPickupPoints(newPickups);
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="wizard-step">
                        <div className="step-instruction">
                            <h4>Set Your Route</h4>
                            <p>Enter addresses or click on the map to set your source and destination.</p>
                        </div>

                        <div className="row mb-4">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <LocationSearch
                                    label="Starting Point (Source)"
                                    placeholder="Search for a place..."
                                    value={source?.shortAddress}
                                    onSelect={(item) => setSource({ latitude: item.lat, longitude: item.lng, address: item.fullAddress, shortAddress: item.shortAddress })}
                                />
                            </div>
                            <div className="col-md-6">
                                <LocationSearch
                                    label="Destination"
                                    placeholder="Search for a place..."
                                    value={destination?.shortAddress}
                                    onSelect={(item) => setDestination({ latitude: item.lat, longitude: item.lng, address: item.fullAddress, shortAddress: item.shortAddress })}
                                />
                            </div>
                        </div>

                        <MapPicker
                            center={source ? [source.latitude, source.longitude] : [17.3850, 78.4867]}
                            markers={[
                                ...(source ? [{ latitude: source.latitude, longitude: source.longitude, type: 'source', label: source.address }] : []),
                                ...(destination ? [{ latitude: destination.latitude, longitude: destination.longitude, type: 'destination', label: destination.address }] : [])
                            ].map(m => ({ lat: m.latitude, lng: m.longitude, type: m.type, label: m.label }))}
                            onMapClick={handleMapClick}
                            routeGeoJSON={routeGeoJSON}
                        />
                    </div>
                );
            case 2:
                const placeholders = [
                    "Pickup 1 (e.g., Landmark, Main Road...)",
                    "Pickup 2 (e.g., Bus Stop, Mall...)",
                    "Pickup 3 (e.g., Metro Station, Square...)",
                    "Pickup 4 (e.g., Gas Station, Park...)"
                ];
                return (
                    <div className="wizard-step">
                        <div className="step-instruction">
                            <h4>Pickup Points</h4>
                            <p>Enter up to 4 stops along your route or click on the map.</p>
                        </div>

                        <div className="row g-3 mb-4">
                            {pickupPoints.map((p, i) => (
                                <div key={i} className="col-md-6">
                                    <div className="d-flex align-items-end gap-2">
                                        <div className="flex-grow-1">
                                            <LocationSearch
                                                label={`Pickup Point ${i + 1}`}
                                                placeholder={placeholders[i]}
                                                value={p?.shortAddress || ""}
                                                onSelect={(item) => {
                                                    const updated = [...pickupPoints];
                                                    updated[i] = {
                                                        latitude: item.lat,
                                                        longitude: item.lng,
                                                        address: item.fullAddress,
                                                        shortAddress: item.shortAddress
                                                    };
                                                    setPickupPoints(updated);
                                                }}
                                            />
                                        </div>
                                        {p && (
                                            <button
                                                className="btn btn-outline-danger btn-sm mb-1"
                                                onClick={() => removePickup(i)}
                                                title="Clear"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <MapPicker
                            markers={[
                                { latitude: source.latitude, longitude: source.longitude, type: 'source', label: source.address },
                                { latitude: destination.latitude, longitude: destination.longitude, type: 'destination', label: destination.address },
                                ...pickupPoints.filter(p => p !== null).map(p => ({ latitude: p.latitude, longitude: p.longitude, type: 'pickup', label: p.address }))
                            ].map(m => ({ lat: m.latitude, lng: m.longitude, type: m.type, label: m.label }))}
                            onMapClick={handleMapClick}
                            routeGeoJSON={routeGeoJSON}
                        />
                    </div>
                );
            case 3:
                return (
                    <div className="wizard-step">
                        <div className="step-instruction">
                            <h4>Ride Details</h4>
                            <p>Set your schedule and seat pricing.</p>
                        </div>
                        <div className="details-grid">
                            <div className="form-group mb-3">
                                <label className="form-label fw-bold">Departure Date</label>
                                <input type="date" className="form-control shadow-sm" name="departureDate" value={rideDetails.departureDate} onChange={handleDetailChange} required />
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label fw-bold">Departure Time</label>
                                <input type="time" className="form-control shadow-sm" name="departureTime" value={rideDetails.departureTime} onChange={handleDetailChange} required />
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label fw-bold">Available Seats</label>
                                <input type="number" className="form-control shadow-sm" min="1" max="8" name="availableSeats" value={rideDetails.availableSeats} onChange={handleDetailChange} required />
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label fw-bold">Base Price per Seat (₹)</label>
                                <input type="number" className="form-control shadow-sm" min="0" name="basePrice" value={rideDetails.basePrice} onChange={handleDetailChange} required />
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label fw-bold">Select Vehicle</label>
                                <select className="form-select shadow-sm" name="vehicleId" value={rideDetails.vehicleId} onChange={handleDetailChange} required>
                                    <option value="">Select a vehicle</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.vehicleModel} ({v.vehicleNumber})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group mb-3">
                                <label className="form-label fw-bold">Driver Display Name</label>
                                <input type="text" className="form-control shadow-sm" name="driverName" value={rideDetails.driverName} onChange={handleDetailChange} placeholder="Enter your name..." required />
                            </div>
                        </div>

                        {/* Removed distance-display-alert as requested */}

                        <div className="fare-summary card p-3 bg-light mt-4">
                            <div className="d-flex justify-content-between mb-2">
                                <span>Price per seat:</span>
                                <span className="fw-bold">₹{rideDetails.basePrice}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Total seats:</span>
                                <span className="fw-bold">{rideDetails.availableSeats}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between text-primary fs-5">
                                <span>Total Potential Fare:</span>
                                <span className="fw-bold">₹{rideDetails.basePrice * rideDetails.availableSeats}</span>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="wizard-step review-step">
                        <div className="step-instruction">
                            <h4>Review Your Ride</h4>
                            <p>Please double check all the details before publishing.</p>
                        </div>
                        <div className="review-container card shadow-sm border-0 rounded-4 overflow-hidden">
                            <div className="review-map border-bottom" style={{ height: '300px' }}>
                                <MapPicker
                                    markers={[
                                        { latitude: source?.latitude, longitude: source?.longitude, type: 'source', label: source?.address },
                                        { latitude: destination?.latitude, longitude: destination?.longitude, type: 'destination', label: destination?.address },
                                        ...pickupPoints.filter(p => p !== null).map(p => ({ latitude: p.latitude, longitude: p.longitude, type: 'pickup', label: p.address }))
                                    ].filter(m => m.latitude && m.longitude).map(m => ({ lat: m.latitude, lng: m.longitude, type: m.type, label: m.label }))}
                                    canSelect={false}
                                    routeGeoJSON={routeGeoJSON}
                                    height="100%"
                                />
                            </div>
                            <div className="review-content p-4 bg-white">
                                <div className="row g-4">
                                    <div className="col-md-7">
                                        <h6 className="text-secondary text-uppercase tiny fw-bold mb-3">Route & Stops 📍</h6>
                                        <div className="route-summary p-3 bg-light rounded-3 mb-3">
                                            <div className="d-flex mb-2">
                                                <div className="me-2">🟢</div>
                                                <div><strong>From:</strong> <span className="small text-muted">{source?.address}</span></div>
                                            </div>
                                            <div className="d-flex">
                                                <div className="me-2">🏁</div>
                                                <div><strong>To:</strong> <span className="small text-muted">{destination?.address}</span></div>
                                            </div>
                                        </div>

                                        {pickupPoints.filter(p => p !== null).length > 0 && (
                                            <div className="mt-4">
                                                <h6 className="text-secondary text-uppercase tiny fw-bold mb-2">Intermediate Pickups</h6>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {pickupPoints.filter(p => p !== null).map((p, idx) => (
                                                        <span key={idx} className="badge bg-white text-dark border p-2 small fw-normal">
                                                            {idx + 1}. {p.shortAddress || p.address.split(',')[0]}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-5">
                                        <h6 className="text-secondary text-uppercase tiny fw-bold mb-3">Ride Info 💳</h6>
                                        <div className="p-3 border rounded-3 bg-light mb-3">
                                            <p className="mb-2 d-flex justify-content-between">
                                                <span>📅 Date:</span> <strong>{rideDetails.departureDate}</strong>
                                            </p>
                                            <p className="mb-2 d-flex justify-content-between">
                                                <span>⏰ Time:</span> <strong>{rideDetails.departureTime}</strong>
                                            </p>
                                            <p className="mb-2 d-flex justify-content-between">
                                                <span>🚗 Vehicle:</span> <strong>{vehicles.find(v => v.id.toString() === rideDetails.vehicleId.toString())?.vehicleModel}</strong>
                                            </p>
                                            <p className="mb-0 d-flex justify-content-between">
                                                <span>👤 Driver:</span> <strong>{rideDetails.driverName}</strong>
                                            </p>
                                        </div>
                                        <div className="p-3 bg-success-subtle text-success rounded-3 border border-success-subtle">
                                            <div className="d-flex justify-content-between h5 mb-0">
                                                <span>Total Price:</span>
                                                <strong>₹{rideDetails.basePrice * rideDetails.availableSeats}</strong>
                                            </div>
                                            <small className="d-block text-end">₹{rideDetails.basePrice} × {rideDetails.availableSeats} seats</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="post-ride-wizard-container">

            {/* ✅ Success Modal Popup */}
            {showSuccessModal && (
                <div className="success-modal-overlay">
                    <div className="success-modal-box">
                        <div className="success-modal-icon">✅</div>
                        <h2 className="success-modal-title">POSTED SUCCESSFULLY!</h2>
                        <p className="success-modal-msg">Your ride has been published and is now live for passengers to book.</p>
                        <button
                            className="btn btn-success px-5 py-2 fw-bold success-modal-btn"
                            onClick={() => navigate('/driver-dashboard')}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            )}

            <div className="post-ride-card-wide">
                <div className="wizard-header">
                    <h2 className="mb-4">Post a New Ride</h2>
                    <div className="wizard-progress-bar">
                        {STEPS.map(step => (
                            <div key={step.id} className={`progress-segment ${currentStep >= step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}>
                                <div className="segment-icon">{currentStep > step.id ? '✓' : step.id}</div>
                                <div className="segment-info">
                                    <span className="segment-title">{step.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="wizard-body mt-4">
                    {renderStepContent()}
                </div>

                <div className="wizard-footer d-flex justify-content-between mt-5 pt-3 border-top">
                    <button
                        className="btn btn-outline-secondary px-4"
                        onClick={currentStep === 1 ? () => navigate('/driver-dashboard') : handleBack}
                        disabled={loading}
                    >
                        {currentStep === 1 ? 'Cancel' : 'Back'}
                    </button>

                    {currentStep < 4 ? (
                        <button className="btn btn-primary px-5 fw-bold" onClick={handleNext} disabled={loading || (currentStep < 3 && calculatingDistance)}>
                            {calculatingDistance && currentStep < 3 ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>Wait...</>
                            ) : 'Next Step →'}
                        </button>
                    ) : (
                        <button className="btn btn-success px-5 fw-bold" onClick={handleSubmit} disabled={loading}>
                            {loading ? (
                                <><span className="spinner-border spinner-border-sm me-2"></span>Publishing...</>
                            ) : 'Confirm & Publish Ride'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

}

export default PostRide;
