import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPicker.css';

// Fix for default marker icons in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons based on type
const createIcon = (color) => {
    return new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

const icons = {
    source: createIcon('green'),
    destination: createIcon('red'),
    pickup: createIcon('gold'),
    default: createIcon('blue')
};

const MapPicker = ({
    center = [17.3850, 78.4867],
    zoom = 12,
    markers = [],
    routeGeoJSON = null,
    onMapClick,
    canSelect = true,
    height = '400px'
}) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const markersLayerRef = useRef(L.layerGroup());
    const routeLayerRef = useRef(null);

    useEffect(() => {
        if (!mapInstance.current && mapRef.current) {
            // Initialize Map
            mapInstance.current = L.map(mapRef.current).setView(center, zoom);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance.current);

            markersLayerRef.current.addTo(mapInstance.current);

            // Click Event
            mapInstance.current.on('click', (e) => {
                if (canSelect && onMapClick) {
                    onMapClick(e.latlng.lat, e.latlng.lng);
                }
            });
        }

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []); // Only on mount

    // Update markers
    useEffect(() => {
        if (mapInstance.current) {
            markersLayerRef.current.clearLayers();
            const validMarkers = markers.filter(m => m && m.lat && m.lng);

            validMarkers.forEach(mrk => {
                const marker = L.marker([mrk.lat, mrk.lng], {
                    icon: icons[mrk.type] || icons.default
                }).addTo(markersLayerRef.current);

                if (mrk.label) {
                    marker.bindPopup(`<b>${mrk.type ? mrk.type.toUpperCase() : 'Point'}</b><br/>${mrk.label}`);
                }
            });

            // Auto-bounds
            if (validMarkers.length > 1) {
                const bounds = L.latLngBounds(validMarkers.map(m => [m.lat, m.lng]));
                mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
            } else if (validMarkers.length === 1) {
                mapInstance.current.setView([validMarkers[0].lat, validMarkers[0].lng]);
            }
        }
    }, [markers]);

    // Update Route
    useEffect(() => {
        if (mapInstance.current) {
            if (routeLayerRef.current) {
                mapInstance.current.removeLayer(routeLayerRef.current);
            }
            if (routeGeoJSON) {
                routeLayerRef.current = L.geoJSON(routeGeoJSON, {
                    style: {
                        color: '#4a90e2',
                        weight: 5,
                        opacity: 0.8
                    }
                }).addTo(mapInstance.current);
            }
        }
    }, [routeGeoJSON]);

    return (
        <div
            ref={mapRef}
            className={`map-container-wrapper ${canSelect ? 'selectable' : ''}`}
            style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd' }}
        />
    );
};

export default MapPicker;
