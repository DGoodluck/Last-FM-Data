import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJsonData } from '../../../src/data'; 
import './SubHeader.css';

/**
 * React component that fetches song data from a specified URL, calculates the time difference between the current time and the last song's timestamp,
 * and displays this information in a subheader.
 */
function SubHeader() {
    const dispatch = useDispatch();
    const jsonData = useSelector((state) => state.jsonData.data);
    const fetchStatus = useSelector((state) => state.jsonData.status);
    const [lastSongTime, setLastSongTime] = useState(null);
    const [lastSongDate, setLastSongDate] = useState(null);

    const timeCalc = useCallback((jsonSongData) => {
        if (Array.isArray(jsonSongData.json_content) && jsonSongData.json_content.length > 0) {
            const latestDate = new Date(jsonSongData.json_content[0].Date || jsonSongData.json_content[0].date || jsonSongData.json_content[0].DATE);
            if (!isNaN(latestDate.getTime())) {
                setLastSongDate(latestDate.toLocaleString());
                const currentDate = new Date();
                const diff = Math.round((currentDate - latestDate) / (1000 * 60 * 60));
                setLastSongTime(diff);
            } else {
                console.error('Invalid date format found in song data:', jsonSongData);
            }
        } else {
            console.error('No valid song data received:', jsonSongData);
        }
    }, []);
    

    useEffect(() => {
        if (fetchStatus === 'idle') {
            dispatch(fetchJsonData('http://localhost:5173/check-json'));
        }
    }, [dispatch, fetchStatus]);

    useEffect(() => {
        if (fetchStatus === 'succeeded') {
            timeCalc(jsonData);
        }
    }, [jsonData, fetchStatus, timeCalc]);

    return (
        <div className='app__subheader'>
            <div className='app__subheader_last-played'>
                {lastSongTime !== null && (
                    <p>Last Scrobble {lastSongDate} • {lastSongTime}h ago</p>
                )}
            </div>
        </div>
    );
}

export default SubHeader;
