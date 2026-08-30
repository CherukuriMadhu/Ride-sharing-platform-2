import React, { useState, useEffect } from 'react';
import MapPicker from './MapPicker';
import { fetchRoute } from '../utils/locationUtils';

const RouteMapPanel = ({ source, destination, pickupPoints, dropPoints, seats, priceType, fixedPrice, onPriceChange }) => {
    const [routeGeoJSON, setRouteGeoJSON] = useState(null);
    const [distance, setDistance] = useState(0);
    const [loading, setLoading] = useState(false);

    const baseFare = 50.00;
    const pricePerKm = 12.00;

    useEffect(() => {
        const updateRoute = async () => {
            if (source && destination) {
                setLoading(true);
                const points = [
                    { lat: source.lat, lng: source.lng },
                    ...pickupPoints.filter(p => p && p.lat).map(p => ({ lat: p.lat, lng: p.lng })),
                    ...dropPoints.filter(p => p && p.lat).map(p => ({ lat: p.lat, lng: p.lng })),
                    { lat: destination.lat, lng: destination.lng }
                ];
                const data = await fetchRoute(points);
                if (data) {
                    setRouteGeoJSON(data.geometry);
                    const dist = parseFloat(data.distanceKm);
                    setDistance(dist);
                    
                    if (onPriceChange) {
                        const pps = (baseFare + (dist * pricePerKm)).toFixed(2);
                        onPriceChange({
                            distance: dist,
                            pricePerSeat: parseFloat(pps)
                        });
                    }
                } else {
                     setRouteGeoJSON(null);
                     setDistance(0);
                }
                setLoading(false);
            } else {
                setRouteGeoJSON(null);
                setDistance(0);
            }
        };
        updateRoute();
    }, [source, destination, pickupPoints, dropPoints, onPriceChange]);

    const activePricePerSeat = priceType === 'FIXED' ? (fixedPrice || 0) : (baseFare + (distance * pricePerKm));
    const totalPotentialEarning = (seats * activePricePerSeat).toFixed(2);

    const markers = [
        ...(source ? [{ ...source, type: 'source', label: 'Start: ' + source.shortAddress }] : []),
        ...(destination ? [{ ...destination, type: 'destination', label: 'Destination: ' + destination.shortAddress }] : []),
        ...pickupPoints.filter(p => p && p.lat).map((p, i) => ({ ...p, type: 'default', label: `Pickup ${i + 1}: ` + p.shortAddress })), // default icon is blue
        ...dropPoints.filter(p => p && p.lat).map((p, i) => ({ ...p, type: 'pickup', label: `Drop ${i + 1}: ` + p.shortAddress })) // pickup icon is gold/orange
    ];

    return (
        <div className="route-map-panel card border-0 shadow-sm p-3 h-100 d-flex flex-column">
            <h5 className="fw-bold mb-3">Route Overview Map</h5>
            <div className="flex-grow-1 mb-3" style={{ minHeight: '300px', position: 'relative' }}>
                <MapPicker 
                    markers={markers}
                    routeGeoJSON={routeGeoJSON}
                    canSelect={false}
                    height="100%"
                />
                {loading && (
                    <div className="position-absolute top-50 start-50 translate-middle bg-white p-2 rounded shadow-sm" style={{ zIndex: 1000 }}>
                        <span className="spinner-border spinner-border-sm me-2"></span> Calculating Route...
                    </div>
                )}
            </div>

            <div className="price-distribution-panel p-3 bg-light rounded-4">
                <h6 className="fw-bold text-muted mb-3">Price Distribution</h6>
                
                <div className="d-flex justify-content-between mb-2">
                    <span className="small">{priceType === 'FIXED' ? 'Fixed Price (Driver)' : 'Base Fare'}</span>
                    <span className="fw-bold text-dark">₹{priceType === 'FIXED' ? parseFloat(fixedPrice).toFixed(2) : baseFare.toFixed(2)}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                    <span className="small">Price per km</span>
                    <span className="fw-bold text-dark">{priceType === 'FIXED' ? 'Fixed by Driver' : `₹${pricePerKm.toFixed(2)}/km`}</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2 pt-2 border-top">
                    <span className="small">Estimated Distance</span>
                    <span className="fw-bold text-dark">{distance} km</span>
                </div>
                
                <div className="d-flex justify-content-between mb-2">
                    <span className="small">Price per Seat (Est.)</span>
                    <span className="fw-bold text-primary">₹{parseFloat(activePricePerSeat).toFixed(2)}</span>
                </div>
                
                <div className="d-flex justify-content-between mt-3 pt-3 border-top border-2">
                    <span className="fw-bold">Total Possible Earning</span>
                    <span className="fw-bold h4 mb-0" style={{ color: '#ff8c00' }}>₹{totalPotentialEarning}</span>
                </div>
            </div>
        </div>
    );
};

export default RouteMapPanel;
