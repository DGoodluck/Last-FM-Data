// src/components/App.js
import './App.css';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Header, SubHeader, RecentSongs, Sorting, TopArtists, TopSongs, TopAlbums, Patterns, Footer } from '../containers';
import { fetchJsonData } from './data';
import useSorting from '../components/UseSorting';

/**
 * Main component of the application responsible for rendering various subcomponents.
 * Manages state for the selected sorting button and timespan.
 * @returns {JSX.Element} JSX fragment containing the rendered components of the application.
 */
function App() {
  const [buttonSelected, timespan, setButtonSelected] = useSorting();
  const dispatch = useDispatch();
  const jsonDataStatus = useSelector((state) => state.jsonData.status);

  useEffect(() => {
    if (jsonDataStatus === 'idle') {
      dispatch(fetchJsonData('http://localhost:5173/check-json'));
    }
  }, [jsonDataStatus, dispatch]);

  return (
    <>
      <Header />
      <SubHeader />
      <RecentSongs />
      <Sorting buttonSelected={buttonSelected} onSortingChange={setButtonSelected} />
      <TopArtists timespan={timespan} />
      <TopSongs timespan={timespan} />
      <TopAlbums timespan={timespan} />
      <Patterns />
      <Footer />
    </>
  );
}

export default App;
