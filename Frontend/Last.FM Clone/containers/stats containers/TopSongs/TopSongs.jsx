import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import './TopSongs.css';
import Tile from '../../../components/Tile';
import { useFetchImage } from '../../../components/FetchImage';

function TopSongs({ timespan }) {
  const [songsData, setSongsData] = useState([]);
  const [songImageUrls, setSongImageUrls] = useState({});
  const jsonData = useSelector((state) => state.jsonData.data);
  const fetchImage = useFetchImage();

  const fetchSongImage = useCallback(async (songs) => {
    const newSongImageUrls = { ...songImageUrls };

    await Promise.all(songs.map(async ({ Song, Artist }) => {
      if (!newSongImageUrls[Song]) {
        try {
          const url = await fetchImage(Song, Artist, 'song');
          newSongImageUrls[Song] = url;
        } catch (error) {
          console.error("Error fetching song image:", error);
        }
      }
    }));

    // Update state only if there are new URLs
    if (Object.keys(newSongImageUrls).length > Object.keys(songImageUrls).length) {
      setSongImageUrls(newSongImageUrls);
    }
  }, [fetchImage, songImageUrls]);

  const mostPlayed = useCallback(() => {
    if (Array.isArray(jsonData?.json_content) && jsonData.json_content.length > 0) {
      const filteredSongs = jsonData.json_content.filter(song => song.Date >= timespan);

      const groupSong = filteredSongs.reduce((acc, item) => {
        const songKey = `${item.Title} - ${item.Artist}`;
        acc[songKey] = (acc[songKey] || 0) + 1;
        return acc;
      }, {});

      const groupArray = Object.entries(groupSong).map(([songKey, count]) => {
        const [Song, Artist] = songKey.split(' - ');
        return { Song, Artist, Plays: count };
      });

      const topTenSongs = groupArray.sort((a, b) => b.Plays - a.Plays).slice(0, 10);

      setSongsData(topTenSongs);
      fetchSongImage(topTenSongs);
    }
  }, [timespan, jsonData, fetchSongImage]);

  useEffect(() => {
    if (jsonData && timespan) {
      mostPlayed();
    }
  }, [jsonData, timespan, mostPlayed]);

  return (
    <div className='app__topsongs'>
      <h2 className='app__topsongs_h2'>Top Songs</h2>
      {songsData.map((song, index) => {
        const coverUrl = songImageUrls[song.Song] || '';
        return (
          <div className='app__topsongs_tile-wrapper' key={index}>
            <Tile 
              cover={coverUrl} 
              detail={`${index + 1}. ${song.Song} (${song.Plays} plays)`} 
            />
          </div>
        );
      })}
    </div>
  );
}

TopSongs.propTypes = {
  timespan: PropTypes.string.isRequired,
};

export default TopSongs;