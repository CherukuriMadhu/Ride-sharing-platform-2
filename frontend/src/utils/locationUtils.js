import axios from 'axios';

// Get address from coordinates using Nominatim API (OpenStreetMap)
export const reverseGeocode = async (lat, lng) => {
    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
            params: {
                format: 'json',
                lat: lat,
                lon: lng,
                zoom: 18,
                addressdetails: 1
            },

        });

        if (response.data && response.data.display_name) {
            // Simplify address
            const { address } = response.data;
            const shortAddress = address?.suburb || address?.neighbourhood || address?.road || address?.city || address?.town || response.data.name || 'Selected Location';
            const fullAddress = response.data.display_name;
            return { shortAddress, fullAddress, lat, lng };
        }
        return { shortAddress: 'Unknown Location', fullAddress: 'Unknown Location', lat, lng };
    } catch (error) {
        console.error("Geocoding error:", error);
        return { shortAddress: 'Error loading address', fullAddress: 'Error loading address', lat, lng };
    }
};

// Fetch route geometry between multiple points using OSRM API
export const fetchRoute = async (points) => {
    // points should be an array of {lat, lng}
    if (points.length < 2) return null;

    // OSRM expects coordinates as lon,lat
    const coordinatesString = points.map(p => `${p.lng},${p.lat}`).join(';');

    try {
        const response = await axios.get(`https://router.project-osrm.org/route/v1/driving/${coordinatesString}`, {
            params: {
                overview: 'full',
                geometries: 'geojson'
            }
        });

        if (response.data && response.data.routes && response.data.routes.length > 0) {
            const route = response.data.routes[0];
            return {
                geometry: route.geometry, // GeoJSON
                distanceKm: (route.distance / 1000).toFixed(2),
                durationMin: Math.round(route.duration / 60)
            };
        }
        return null;
    } catch (error) {
        console.error("Routing error:", error);
        return null;
    }
};
// Search for locations using Nominatim API
export const searchLocations = async (query) => {
    if (!query || query.length < 3) return [];

    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
                q: query,
                format: 'json',
                addressdetails: 1,
                limit: 5,
                countrycodes: 'in' // Prioritize India
            }
        });

        return response.data.map(item => ({
            fullAddress: item.display_name,
            shortAddress: item.address?.suburb || item.address?.neighbourhood || item.address?.road || item.address?.city || item.address?.town || item.name || 'Search Result',
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
        }));
    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
};
