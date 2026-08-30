import { useState, useEffect, useRef } from 'react';

import './LocationSearch.css';
import axios from 'axios';

const LocationSearch = ({ placeholder, onSelect, value, label }) => {
    const [query, setQuery] = useState(value || '');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const suggestionsRef = useRef(null);

    useEffect(() => {
        setQuery(value || '');
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchTimeoutRef = useRef(null);
    const abortControllerRef = useRef(null); // Added abortControllerRef
    const [error, setError] = useState(null);

    const handleSearch = (e) => {
        const val = e.target.value;
        setQuery(val);
        setError(null);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (abortControllerRef.current) abortControllerRef.current.abort(); // Abort previous request

        if (val.length >= 3) {
            // Pre-clear suggestions to show loading state immediately
            setSuggestions([]);
            setShowSuggestions(true);

            searchTimeoutRef.current = setTimeout(async () => {
                setLoading(true);
                const controller = new AbortController(); // Create new AbortController
                abortControllerRef.current = controller; // Store it in ref

                try {
                    // Replaced searchLocations with direct axios call
                    const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                        params: {
                            q: val,
                            format: 'json',
                            addressdetails: 1,
                            limit: 5,
                            countrycodes: 'in'
                        },
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                        },
                        signal: controller.signal // Pass signal to axios
                    });

                    const results = response.data.map(item => ({
                        fullAddress: item.display_name,
                        shortAddress: item.address?.suburb || item.address?.neighbourhood || item.address?.road || item.address?.city || item.address?.town || item.name || 'Search Result',
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lon)
                    }));

                    setSuggestions(results);
                } catch (err) {
                    if (err.name !== 'AbortError') { // Handle AbortError
                        console.error("Search failed:", err);
                        setError("Could not load results. Please try again.");
                    }
                } finally {
                    if (!controller.signal.aborted) { // Only set loading to false if not aborted
                        setLoading(false);
                    }
                }
            }, 800); // Increased debounce to 800ms
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelect = (item) => {
        setQuery(item.shortAddress);
        setShowSuggestions(false);
        onSelect(item);
    };

    return (
        <div className="location-search-container">
            {label && <label className="form-label fw-bold">{label}</label>}
            <div className="search-input-group position-relative">
                <input
                    type="text"
                    className="form-control"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleSearch}
                    onFocus={() => query.length >= 3 && setShowSuggestions(true)}
                />
                {loading && <div className="search-spinner-inline"><div className="spinner-border spinner-border-sm text-primary"></div></div>}

                {showSuggestions && (
                    <ul className="suggestions-list shadow" ref={suggestionsRef}>
                        {loading && (
                            <li className="suggestion-item searching">Searching for "{query}"...</li>
                        )}
                        {!loading && error && (
                            <li className="suggestion-item error-item text-danger">{error}</li>
                        )}
                        {!loading && !error && suggestions.length > 0 && (
                            suggestions.map((item, index) => (
                                <li key={index} onClick={() => handleSelect(item)} className="suggestion-item">
                                    <span className="suggestion-icon">📍</span>
                                    <div className="suggestion-info">
                                        <div className="suggestion-name">{item.shortAddress}</div>
                                        <div className="suggestion-address">{item.fullAddress}</div>
                                    </div>
                                </li>
                            ))
                        )}
                        {!loading && !error && suggestions.length === 0 && query.length >= 3 && (
                            <li className="suggestion-item no-results">No results found for "{query}"</li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default LocationSearch;
