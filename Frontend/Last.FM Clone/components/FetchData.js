import { useEffect, useState } from 'react';
import axios from 'axios';
import { string } from 'prop-types';

/** 
 * Custom React hook to fetch data from a URL at specified intervals with retry logic and optional callback processing.
 * Manages fetched data and status using React state.
 * @param {string} url - The URL to fetch data from.
 * @param {number} interval - The interval in milliseconds between fetch attempts (default is 10000 ms).
 * @param {Function} callback - An optional callback function to process the fetched data.
 * @returns {{ songData: any, jsonStatus: string }} - The fetched data and status message.
 */
const useFetchData = (url, interval = 10000, callback = null, file = string) => {
    const [songData, setSongData] = useState(null);
    const [jsonStatus, setJsonStatus] = useState('');

    console.log(`${file} has requested to check json`);

    useEffect(() => {
        let intervalId;
        let retries = 0;

        const fetchDataAndProcess = async () => {
            try {
                const response = await axios.get(url);
                const data = response.data;
                setSongData(data);
                setJsonStatus(data.message);

                if (data.status === 'success' && data.json_content && data.json_content.length > 0) {
                    clearInterval(intervalId);
                    if (callback) callback(data.json_content);
                }
            } catch (error) {
                // Retry
                if (retries < 5) { // Limit the number of retries
                    retries++;
                    intervalId = setTimeout(fetchDataAndProcess, interval * Math.pow(2, retries));
                } else {
                    clearInterval(intervalId);
                    console.error('Error fetching data:', error);
                    setJsonStatus('Failed to fetch data after multiple attempts');
                }
            }
        };

        intervalId = setTimeout(fetchDataAndProcess, interval);
        return () => clearInterval(intervalId);
    }, [url, interval, callback]);

    return { songData, jsonStatus };
};

export default useFetchData;