import { useState, useEffect, useRef, useCallback } from 'react';
import uploadIcon from 'C:\\Users\\Dayshaun Goodluck\\Python\\Python Projects\\My Music Data\\Frontend\\Last.FM Clone\\src\\assets\\icons8-upload-48.png';
import Alert from '@mui/material/Alert';
import { useDispatch, useSelector } from 'react-redux'; // Import Redux hooks
import { fetchJsonData } from '../../src/data';
import './Header.css';
import { useFetchImage } from '../../components/FetchImage';

function Header() {
  const dispatch = useDispatch(); // Initialize useDispatch hook
  const jsonData = useSelector((state) => state.jsonData.data); // Access JSON data from Redux store
  const fetchStatus = useSelector((state) => state.jsonData.status); // Access fetch status from Redux store
  const [file, setFile] = useState('');
  const [alert, setAlert] = useState(false);
  const [firstSongDate, setFirstSongDate] = useState(null);
  const [coverArtUrl, setCoverArtUrl] = useState('');
  const [fetchCompleted, setFetchCompleted] = useState(false);
  const titleRef = useRef(null);
  const fetchImage = useFetchImage();

  useEffect(() => {
    if (file !== '') {
      fileValidation();
    }
  }, [file]);

  function handleOnChange(e) {
    const target = e.target;
    if (target.files.length > 0) {
      const file = target.files[0];
      setFile(file);
    } else {
      setFile('');
    }
  }

  async function fileValidation() {
    let filename = String(file['name']);
    if (filename.endsWith('.csv')) {
      if (titleRef.current) {
        titleRef.current.textContent = `File Uploaded: ${filename}`;
      }
      setAlert(false);
      await uploadFile(file);
    } else {
      setAlert(true);
      setFile('');
    }
  }

  async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5173/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const firstSong = useCallback((jsonSongData) => {
    if (jsonSongData && jsonSongData.json_content && Array.isArray(jsonSongData.json_content) && jsonSongData.json_content.length > 0) {  
      const artist = jsonSongData.json_content[0].Artist;
      const album = jsonSongData.json_content[0].Album;
      if (!fetchCompleted) {
        fetchImage(`${artist}-${album}`, artist, 'album')
          .then(url => {
            setCoverArtUrl(url);
          })
          .catch(error => {
            console.error('Error fetching image:', error);
          });
        setFetchCompleted(true);
      }
  
      const oldestDateElement = [...jsonSongData.json_content].reverse()[0];
      const oldestDate = new Date(oldestDateElement.Date).getTime();
      setFirstSongDate(new Date(oldestDate));
    } else {
      console.error('No valid data received');
    }
  }, [fetchCompleted, fetchImage]);
  
  
  

  useEffect(() => {
    if (!fetchCompleted && jsonData) {
      firstSong(jsonData);
    }
  }, [jsonData, fetchCompleted, firstSong]);

  useEffect(() => {
    if (fetchStatus === 'idle') {
      dispatch(fetchJsonData('http://localhost:5173/check-json'));
    }
  }, [dispatch, fetchStatus]);
  

  return (
    <div className='app__header'>
      <div className='app__header__image'>
        {coverArtUrl ? (
          <img src={coverArtUrl} alt="Album Cover" />
        ) : (
          <div>Loading cover art...</div>
        )}
        <h2>
          Scrobbling since {firstSongDate ? `${firstSongDate.toLocaleDateString()}` : 'Loading...'} • Scrobbled {jsonData && jsonData.json_content ? jsonData.json_content.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 'Loading...'} Times
        </h2>
      </div>
      <h3 ref={titleRef} className='app_header__upload_title'>Upload your CSV File</h3>
      <div>
        {alert && <Alert severity="error">File upload is not a CSV</Alert>}
      </div>
      <div className='app__header__upload'>
        <img src={uploadIcon} alt="Upload CSV" />
        <form method="POST" encType="multipart/form-data">
          <input type="file" id="myFile" name="filename" onChange={handleOnChange} />
        </form>
      </div>
    </div>
  );
}

export default Header;
