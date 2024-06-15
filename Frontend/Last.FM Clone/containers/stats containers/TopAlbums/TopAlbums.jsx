import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import './TopAlbums.css';
import Tile from '../../../components/Tile';
import { useFetchImage } from '../../../components/FetchImage';

function TopAlbums({ timespan }) {
  const [songsData, setSongsData] = useState([]);
  const [songImageUrls, setSongImageUrls] = useState({});
  const jsonData = useSelector((state) => state.jsonData.data);
  const fetchImage = useFetchImage();

  const fetchAlbumImage = useCallback((albums) => {
    const promises = albums.map(({ Album, Artist }) => {
      if (!songImageUrls[Album]) {
        return fetchImage(Album, Artist, 'album')
          .then((url) => {
            setSongImageUrls((prevUrls) => ({ ...prevUrls, [Album]: url }));
          })
          .catch((error) => {
            console.error("Error fetching album image:", error);
          });
      }
      return Promise.resolve(); // Resolve immediately if image URL already exists
    });

    Promise.all(promises).then(() => {
      if (promises.every(p => p.state === "fulfilled")) { // Check if all promises have been fulfilled
        console.log("All album images fetched.");
      }
    });
  }, [fetchImage, songImageUrls]); // Add fetchImage and songImageUrls as dependencies

  const mostPlayed = useCallback(() => {
    if (Array.isArray(jsonData.json_content) && jsonData.json_content.length > 0) {
      const filteredAlbums = jsonData.json_content.filter(album => album.Date >= timespan);

      const groupAlbum = filteredAlbums.reduce((acc, item) => {
        const albumKey = `${item.Album} - ${item.Artist}`;
        acc[albumKey] = (acc[albumKey] || 0) + 1;
        return acc;
      }, {});

      const groupArray = Object.entries(groupAlbum).map(([albumKey, count]) => {
        const [Album, Artist] = albumKey.split(' - ');
        return { Album, Artist, Plays: count };
      });

      const topTenAlbums = groupArray.sort((a, b) => b.Plays - a.Plays).slice(0, 10);

      setSongsData(topTenAlbums);
      fetchAlbumImage(topTenAlbums);
    }
  }, [timespan, jsonData, fetchAlbumImage]);

  useEffect(() => {
    if (jsonData && timespan) {
      mostPlayed();
    }
  }, [jsonData, timespan, mostPlayed]);

  return (
    <div className='app__topalbums'>
      <h2 className='app__topalbums_h2'>Top Albums</h2>
      {songsData.map((album, index) => {
        const coverUrl = songImageUrls[album.Album] || '';
        return (
          <div className='app__topalbums_tile-wrapper' key={index}>
            <Tile 
              cover={coverUrl} 
              detail={`${index + 1}. ${album.Album} (${album.Plays} plays)`} 
            />
          </div>
        );
      })}
    </div>
  );
}

export default TopAlbums;
