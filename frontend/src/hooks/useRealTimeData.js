import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for real-time data polling
 * @param {string} url - API endpoint
 * @param {number} interval - Polling interval in ms (default 15s)
 * @returns {object} - { data, loading, error, refresh }
 */
const useRealTimeData = (url, interval = 3000) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!url || url.includes('undefined')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        fetchData();
        const pollInterval = setInterval(fetchData, interval);
        return () => clearInterval(pollInterval);
    }, [fetchData, interval]);

    return { data, loading, error, refresh: fetchData };
};

export default useRealTimeData;
