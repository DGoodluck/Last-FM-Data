import { useState, useCallback, useEffect } from 'react';
import './RecentSongs.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJsonData } from '../../../src/data';
import Tile from '../../../components/Tile';
import { useFetchImage } from '../../../components/FetchImage';

function RecentSongs() {
  const [songsData, setSongsData] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [fetchCompleted, setFetchCompleted] = useState(false);
  const fetchImage = useFetchImage();
  const jsonData = useSelector((state) => state.jsonData.data);
  const dispatch = useDispatch();

  const fetchImages = useCallback((songsData) => {
    const promises = songsData.slice(0, 50).map((song) => {
      const identifier = `${song.Artist}-${song.Album}`;
      return fetchImage(identifier, song.Artist, 'album')
       .then((url) => {
          setImageUrls((prevUrls) => ({...prevUrls, [identifier]: url }));
        })
       .catch((error) => {
          console.error("Error fetching image:", error);
        });
    });
  
    Promise.all(promises).then(() => {
      setFetchCompleted(true);
    });
  }, [fetchImage]);

  const recents = useCallback((jsonSongData) => {
    if (!fetchCompleted) {
      if (Array.isArray(jsonSongData.json_content) && jsonSongData.json_content.length > 0) {
        const recentSongs = jsonSongData.json_content.slice(0, 50);
        setSongsData(recentSongs);
        fetchImages(recentSongs);
      }
    }
  }, [fetchCompleted, fetchImages]);

  useEffect(() => {
    if (!jsonData) {
      dispatch(fetchJsonData('http://localhost:5173/check-json'));
    }
  }, [jsonData, dispatch]);

  useEffect(() => {
    if (jsonData) {
      recents(jsonData);
    }
  }, [jsonData, recents]);

  return (
    <div className='app__recentsongs'>
      <h2 className='app__recentsongs_h2'>Recent Songs</h2>
      {songsData.map((song, index) => {
        const identifier = `${song.Artist}-${song.Album}`;
        const imageUrl = imageUrls[identifier] || '';
        return (
          <div className='app__recentsongs_tile-wrapper' key={index}>
            <Tile
              cover={imageUrl}
              detail={`${index + 1}. ${song.Title} \n ${song.Artist}`}
            />
          </div>
        );
      })}
    </div>
  );
}

export default RecentSongs;
