import { useCallback, useState, useEffect } from 'react';
import './Patterns.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJsonData } from '../../../src/data';
import Plot from 'react-plotly.js';
import { processData, processClockData } from '../../../components/ProcessCharts';

function Patterns() {
  const [plotData, setPlotData] = useState([]);
  const [polarData, setPolarData] = useState({ data: null, layout: null });
  const [lineChartReady, setLineChartReady] = useState(false);
  const [originalPlotData, setOriginalPlotData] = useState([]);
  const jsonData = useSelector((state) => state.jsonData.data);
  const dispatch = useDispatch();

  const handleData = useCallback((data) => {
    const clockData = processClockData(data);
    setPolarData(clockData);
    setLineChartReady(false);

    setTimeout(() => {
      const lineData = processData(data);
      setPlotData(lineData);
      setOriginalPlotData(lineData); // Save the original data
      setLineChartReady(true);
    }, 0); // Adjust the delay if necessary
  }, []);

  const recents = useCallback((jsonSongData) => {
    if (Array.isArray(jsonSongData.json_content) && jsonSongData.json_content.length > 0) {
      handleData(jsonSongData.json_content);
    }
  }, [handleData]);

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

  const handleLegendClick = useCallback((e) => {
    const clickedArtist = e.data[e.curveNumber].name;
    const updatedPlotData = plotData.map(trace => {
      if (trace.name === clickedArtist) {
        return { ...trace, visible: 'true' };
      } else {
        return { ...trace, visible: trace.visible === 'legendonly' ? true : 'legendonly' };
      }
    });
    setPlotData(updatedPlotData);
    return false; // Prevent the default behavior
  }, [plotData]);

  return (
    <div className='app__patterns'>
      <h2 className='app__patterns_h2'>Patterns</h2>
      <div className='app__patterns_plot'>
        {lineChartReady && plotData && (
          <>
            <h2>Plays by Month</h2>
            <Plot
              data={plotData}
              layout={{
                template: 'plotly_dark',
                autosize: false,
                width: 1600,
                height: 700,
                plot_bgcolor: "rgba(0,0,0,0)",
                paper_bgcolor: "rgba(0,0,0,0)",
                yaxis: { title: 'Plays' },
                font: { color: '#fff' },
                legend: {
                  traceorder: 'normal',
                  font: { color: '#fff' },
                  tracegroupbuttons: 'scroll',
                }
              }}
              onLegendClick={handleLegendClick}
            />
          </>
        )}
        <h2>Scrobble Clock</h2>
        {polarData.data && polarData.layout && (
          <Plot className='scrobbleclock'
          data={polarData.data}
          layout={polarData.layout} />
        )}
      </div>
    </div>
  );
}

export default Patterns;
