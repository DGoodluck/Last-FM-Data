import { groupBy, map, flatten, uniq } from 'lodash';
import * as d3 from 'd3';

/**
 * Processes an array of song data to prepare it for a line chart.
 * @param {Array} data - An array of objects where each object represents a song with properties like `Date` and `Artist`.
 * @returns {Array} - An array of trace objects for plotting.
 */
export const processData = (data) => {
    // Convert dates to JavaScript Date objects
    const transformedData = data.map(song => ({
        ...song,
        date: new Date(song.Date)
    }));

    // Group data by month (using year-month format)
    const groupedData = transformedData.reduce((acc, song) => {
        const key = `${song.date.getFullYear()}-${String(song.date.getMonth() + 1).padStart(2, '0')}`;
        acc[key] = acc[key] || [];
        acc[key].push(song);
        return acc;
    }, {});

    // Extract unique artists and months
    const allArtists = [...new Set(data.map(song => song.Artist))];
    const months = Object.keys(groupedData).sort();

    // Create traces for each artist
    const traces = allArtists.map(artist => {
        const artistData = months.map(month => {
            const artistCount = groupedData[month].filter(song => song.Artist === artist).length;
            return artistCount;
        });

        return {
            x: months,
            y: artistData,
            type: 'scatter',
            mode: 'lines+markers',
            name: artist
        };
    });

    return traces;
};

/**
 * Processes song data to generate a clock chart visualization.
 * @param {Array} data - An array of song objects, each containing a `Date` property.
 * @returns {Object} An object containing `data` and `layout` properties for rendering a Plotly polar bar chart.
 */
export const processClockData = (data) => {
    // Transform data to include JavaScript Date objects
    const transformedData = data.map(song => ({
        ...song,
        date: new Date(song.Date)
    }));

    // Count the number of songs for each hour of the day
    const countsByHour = Array(24).fill(0);
    transformedData.forEach(song => {
        const hour = song.date.getHours();
        countsByHour[hour] += 1;
    });

    // Prepare data for the chart
    const r = countsByHour;
    const theta = countsByHour.map((_, hour) => (hour * 15) - 7.5);
    const width = Array(24).fill(15);

    // Generate tick labels for the clock chart
    const ticktexts = Array.from({ length: 24 }, (_, i) => (i % 3 === 0 ? `${i}:00` : ''));

    // Construct data object for Plotly
    const clockData = [{
        r,
        theta,
        width,
        marker: {
            color: r,
            colorscale: 'reds',
            line: {
                color: "white",
                width: 2
            }
        },
        type: 'barpolar',
        opacity: 0.8
    }];

    // Construct layout object for Plotly
    const layout = {
        template: 'plotly_dark',
        autosize: false,
        width: 1300,
        height: 600,
        plot_bgcolor: "rgba(0,0,0,0)",
        paper_bgcolor: "rgba(0,0,0,0)",
        font: {
            color: '#fff'
        },
        polar: {
            hole: 0.4,
            bgcolor: 'rgb(223, 223,223)',
            radialaxis: {
                showticklabels: false,
                ticks: '',
                linewidth: 2,
                linecolor: 'white',
                showgrid: false,
            },
            angularaxis: {
                tickvals: Array.from({ length: 24 }, (_, i) => i * 15),
                ticktext: ticktexts,
                showline: true,
                direction: 'clockwise',
                period: 24,
                linecolor: 'white',
                gridcolor: 'white',
                showticklabels: true,
                ticks: ''
            }
        }
    };

    return { data: clockData, layout };
};
