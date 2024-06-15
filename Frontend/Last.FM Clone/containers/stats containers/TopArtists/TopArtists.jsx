import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import './TopArtists.css';
import Tile from '../../../components/Tile';
import { useFetchImage } from '../../../components/FetchImage';

function TopArtists({ timespan }) {
  const [songsData, setSongsData] = useState([]);
  const [artistImageUrls, setArtistImageUrls] = useState({});
  const jsonData = useSelector((state) => state.jsonData.data);
  const fetchImage = useFetchImage();

  const fetchArtistImage = useCallback((artists) => {
    const promises = artists.map((artist) => {
      if (!artistImageUrls[artist]) { // Check if image URL for artist already exists
        return fetchImage(artist, '', 'artist')
         .then((url) => {
            setArtistImageUrls((prevUrls) => ({...prevUrls, [artist]: url }));
          })
         .catch((error) => {
            console.error("Error fetching artist image:", error);
          });
      }
      return Promise.resolve(); // Resolve immediately if image URL already exists
    });
  
    Promise.all(promises)
     .then(() => {
          console.log("All artist images fetched.");
      })
     .catch((error) => {
          console.error("Failed to fetch some artist images:", error);
      });
  }, [artistImageUrls]); // Removed fetchImage from dependencies

  const mostPlayed = useCallback(() => {
    if (Array.isArray(jsonData.json_content) && jsonData.json_content.length > 0) {
      const filteredSongs = jsonData.json_content.filter(song => song.Date >= timespan);

      const groupArtist = filteredSongs.reduce((acc, item) => {
        acc[item.Artist] = (acc[item.Artist] || 0) + 1;
        return acc;
      }, {});

      const groupArray = Object.entries(groupArtist).map(([artist, count]) => ({ Artist: artist, Plays: count }));
      const topTenArtists = groupArray.sort((a, b) => b.Plays - a.Plays).slice(0, 10);

      setSongsData(topTenArtists);
      fetchArtistImage(topTenArtists.map(artist => artist.Artist));
    }
  }, [timespan, jsonData, setSongsData, fetchArtistImage]);

  useEffect(() => {
    if (jsonData && timespan) {
      mostPlayed();
    }
  }, [jsonData, timespan, mostPlayed]);

  return (
    <div className='app__topartists'>
      <h2 className='app__topartists_h2'>Top Artists</h2>
      {songsData.map((artist, index) => {
        const coverUrl = artistImageUrls[artist.Artist] || '';
        return (
          <div className='app__topartists_tile-wrapper' key={index}>
            <Tile
              cover={coverUrl}
              detail={`${index + 1}. ${artist.Artist} (${artist.Plays} plays)`}
            />
          </div>
        );
      })}
    </div>
  );
}

export default TopArtists;
