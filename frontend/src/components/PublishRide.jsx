import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LocationSearch from './LocationSearch';
import RouteMapPanel from './RouteMapPanel';
import './PublishRide.css';

const PublishRide = ({ onSuccess }) => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [vehicles, setVehicles] = useState([]);

    const [formData, setFormData] = useState({
        source: null,
        destination: null,
        departureDate: '',
        departureTime: '',
        vehicleId: '',
        availableSeats: 4,
        priceType: 'AUTO', // FIXED or AUTO
        fixedPrice: 10,
        pickupPoints: [], // Dynamic array of { shortAddress, fullAddress, lat, lng }
        dropPoints: []
    });

    const [calculatedPrice, setCalculatedPrice] = useState({ distance: 0, pricePerSeat: 0 });

    useEffect(() => {
        if (user?.id) {
            axios.get(`/api/vehicles/user/${user.id}`)
                .then(res => {
                    setVehicles(res.data);
                    if (res.data.length > 0) {
                        setFormData(prev => ({ ...prev, vehicleId: res.data[0].id }));
                    }
                })
                .catch(err => console.error("Error fetching vehicles:", err));
        }
    }, [user?.id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationSelect = (type, location) => {
        setFormData(prev => ({ ...prev, [type]: location }));
    };

    const handleAddWaypoint = (type) => {
        if (formData[type].length >= 3) {
            toast.warn(`Maximum 3 ${type === 'pickupPoints' ? 'pickups' : 'drops'} allowed`);
            return;
        }
        setFormData(prev => ({
            ...prev,
            [type]: [...prev[type], null]
        }));
    };

    const handleWaypointChange = (type, index, location) => {
        const list = [...formData[type]];
        list[index] = location;
        setFormData(prev => ({ ...prev, [type]: list }));
    };

    const handleRemoveWaypoint = (type, index) => {
        const list = [...formData[type]];
        list.splice(index, 1);
        setFormData(prev => ({ ...prev, [type]: list }));
    };

    const handlePriceChange = (data) => {
        setCalculatedPrice(data);
    };

    const validateStep1 = () => {
        if (!formData.source || !formData.destination) {
            toast.error("Please select start and destination cities");
            return false;
        }
        if (!formData.departureDate || !formData.departureTime) {
            toast.error("Please select departure date and time");
            return false;
        }
        if (!formData.vehicleId) {
            toast.error("Please select a vehicle");
            return false;
        }
        if (formData.priceType === 'FIXED' && (formData.fixedPrice < 10)) {
            toast.error("Fixed price must be at least ₹10");
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        const emptyPickup = formData.pickupPoints.some(p => p === null);
        const emptyDrop = formData.dropPoints.some(d => d === null);
        if (emptyPickup || emptyDrop) {
            toast.error("Please fill or remove empty waypoint fields");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateStep2()) return;

        setLoading(true);
        try {
            const finalPrice = formData.priceType === 'FIXED' ? formData.fixedPrice : calculatedPrice.pricePerSeat;
            
            const payload = {
                source: {
                    latitude: formData.source.lat,
                    longitude: formData.source.lng,
                    address: formData.source.fullAddress
                },
                destination: {
                    latitude: formData.destination.lat,
                    longitude: formData.destination.lng,
                    address: formData.destination.fullAddress
                },
                pickupPoints: formData.pickupPoints.map(p => ({
                    location: { latitude: p.lat, longitude: p.lng, address: p.fullAddress }
                })),
                dropPoints: formData.dropPoints.map(d => ({
                    location: { latitude: d.lat, longitude: d.lng, address: d.fullAddress }
                })),
                departureTime: `${formData.departureDate}T${formData.departureTime}`,
                availableSeats: parseInt(formData.availableSeats),
                totalSeats: parseInt(formData.availableSeats),
                priceType: formData.priceType,
                pricePerSeat: parseFloat(finalPrice),
                distance: calculatedPrice.distance,
                driver: { id: user.id },
                vehicle: { id: parseInt(formData.vehicleId) }
            };

            await axios.post('/api/rides', payload);
            toast.success("Ride published successfully!");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Publish error:", error);
            const errorMsg = error.response?.data?.message || 
                             (typeof error.response?.data === 'string' ? error.response.data : null) || 
                             error.message;
            toast.error("Failed to publish ride: " + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="publish-ride-container">
            <div className="form-panel card border-0 shadow-sm p-4">
                <div className="wizard-stepper mb-4 d-flex">
                    <div className={`step-indicator ${step === 1 ? 'active' : 'completed'}`} onClick={() => setStep(1)}>
                        1. Route & Pricing
                    </div>
                    <div className={`step-indicator ${step === 2 ? 'active' : ''}`} onClick={() => step === 2 || validateStep1() ? setStep(2) : null}>
                        2. Waypoints
                    </div>
                </div>

                {step === 1 ? (
                    <div className="step-content">
                        <div className="mb-3">
                            <label className="form-label small fw-bold">Driver Name</label>
                            <input type="text" className="form-control bg-light" value={user?.name || ''} readOnly />
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <LocationSearch 
                                    label="Starting City" 
                                    placeholder="Enter source..."
                                    value={formData.source?.shortAddress || ''}
                                    onSelect={(loc) => handleLocationSelect('source', loc)}
                                />
                            </div>
                            <div className="col-md-6">
                                <LocationSearch 
                                    label="Destination City" 
                                    placeholder="Enter destination..."
                                    value={formData.destination?.shortAddress || ''}
                                    onSelect={(loc) => handleLocationSelect('destination', loc)}
                                />
                            </div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Departure Date</label>
                                <input type="date" name="departureDate" className="form-control" value={formData.departureDate} onChange={handleInputChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Departure Time</label>
                                <input type="time" name="departureTime" className="form-control" value={formData.departureTime} onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Select Vehicle</label>
                                <select name="vehicleId" className="form-select" value={formData.vehicleId} onChange={handleInputChange}>
                                    <option value="">Select vehicle</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.vehicleModel} ({v.vehicleNumber})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold">Available Seats</label>
                                <input type="number" name="availableSeats" className="form-control" min="1" max="8" value={formData.availableSeats} onChange={handleInputChange} />
                            </div>
                        </div>

                        <div className="pricing-section p-3 bg-light rounded-3 mb-4">
                            <label className="form-label small fw-bold d-block mb-2">Price Type</label>
                            <div className="d-flex gap-3 mb-3">
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="priceType" id="autoPrice" value="AUTO" checked={formData.priceType === 'AUTO'} onChange={handleInputChange} />
                                    <label className="form-check-label small" htmlFor="autoPrice">🔘 Auto Calculate</label>
                                </div>
                                <div className="form-check">
                                    <input className="form-check-input" type="radio" name="priceType" id="fixedPrice" value="FIXED" checked={formData.priceType === 'FIXED'} onChange={handleInputChange} />
                                    <label className="form-check-label small" htmlFor="fixedPrice">🔘 Fixed Price</label>
                                </div>
                            </div>
                            {formData.priceType === 'FIXED' && (
                                <div className="fixed-price-input animation-fade">
                                    <label className="form-label tiny fw-bold">Price per Seat (₹)</label>
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text">₹</span>
                                        <input type="number" name="fixedPrice" className="form-control" min="10" value={formData.fixedPrice} onChange={handleInputChange} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="btn btn-primary w-100 py-2 fw-bold" onClick={() => validateStep1() && setStep(2)}>
                            Next: Add Waypoints →
                        </button>
                    </div>
                ) : (
                    <div className="step-content">
                        <div className="alert alert-info py-2 px-3 small border-0 mb-3" style={{ background: '#e3f2fd', color: '#0d47a1' }}>
                            💡 Waypoints are optional. You can skip this step.
                        </div>
                        
                        <div className="row g-4 mb-4">
                            <div className="col-6">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <p className="small fw-bold text-primary mb-0">Pickup Points</p>
                                    <button className="btn btn-outline-primary btn-xs py-0 px-2" onClick={() => handleAddWaypoint('pickupPoints')}>+ Add</button>
                                </div>
                                <div className="waypoint-list">
                                    {formData.pickupPoints.map((p, i) => (
                                        <div key={`p-${i}`} className="position-relative mb-2">
                                            <LocationSearch 
                                                placeholder={`Pickup ${i + 1}`}
                                                value={p?.shortAddress || ''}
                                                onSelect={(loc) => handleWaypointChange('pickupPoints', i, loc)}
                                            />
                                            <button className="btn-remove-waypoint" onClick={() => handleRemoveWaypoint('pickupPoints', i)}>✕</button>
                                        </div>
                                    ))}
                                    {formData.pickupPoints.length === 0 && <p className="tiny text-muted italic">No pickups added</p>}
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <p className="small fw-bold text-orange mb-0" style={{ color: '#fd7e14' }}>Drop Points</p>
                                    <button className="btn btn-outline-warning btn-xs py-0 px-2 text-orange" style={{ borderColor: '#fd7e14', color: '#fd7e14' }} onClick={() => handleAddWaypoint('dropPoints')}>+ Add</button>
                                </div>
                                <div className="waypoint-list">
                                    {formData.dropPoints.map((d, i) => (
                                        <div key={`d-${i}`} className="position-relative mb-2">
                                            <LocationSearch 
                                                placeholder={`Drop ${i + 1}`}
                                                value={d?.shortAddress || ''}
                                                onSelect={(loc) => handleWaypointChange('dropPoints', i, loc)}
                                            />
                                            <button className="btn-remove-waypoint" onClick={() => handleRemoveWaypoint('dropPoints', i)}>✕</button>
                                        </div>
                                    ))}
                                    {formData.dropPoints.length === 0 && <p className="tiny text-muted italic">No drops added</p>}
                                </div>
                            </div>
                        </div>

                        <div className="d-flex gap-2 mt-auto">
                            <button className="btn btn-outline-secondary flex-grow-1" onClick={() => setStep(1)}>Back</button>
                            <button className="btn btn-success flex-grow-2 py-2 fw-bold" onClick={handleSubmit} disabled={loading}>
                                {loading ? 'Publishing...' : '🚀 Publish Ride'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="map-panel">
                <RouteMapPanel 
                    source={formData.source}
                    destination={formData.destination}
                    pickupPoints={formData.pickupPoints}
                    dropPoints={formData.dropPoints}
                    seats={formData.availableSeats}
                    priceType={formData.priceType}
                    fixedPrice={formData.fixedPrice}
                    onPriceChange={handlePriceChange}
                />
            </div>
        </div>
    );
};

export default PublishRide;
