# Last.FM Music Data Web Viewer

Visualize personal music listening data from Last.FM to gain insights into listening habits and preferences using this Web App.

![image](https://github.com/DGoodluck/Last-FM-Data/assets/89657388/6f31055b-83d5-48d8-bde5-e4c12e8aa5db)


## Instructions:

1. **Obtain Last.FM Listening History Data**: Place the downloaded CSV in the Form field and wait to see your data visualize.

    Data Download Link: [LastFM to CSV](https://benjaminbenben.com/lastfm-to-csv/)

3. Ensure you have the following installed:
    - Docker
    - Node.js and npm
    - Python and Pip

3. **Install Project**:

    - Clone Project:
        git clone DGoodluck/Last-FM-Data
        cd DGoodluck/Last-FM-Data
        
    - From root directory run with Docker Compose
        docker-compose up --build


## Data Analysis Steps:

1. **Data Loading and Cleaning**: The uploaded CSV is processed to remove any inconsistencies or missing values.

2. **Grouping**:
    - Your data is grouped by attributes like artist, album, and song title to provide aggregate insights.

3. **Visualization**:
    - Generate plots and visualizations using Plotly.
    - Explore monthly listening trends, most listened-to artists, albums, and songs.
    - Analyze differences in listening habits between different time periods.

4. **Insights**:
    - Monthly Listening Trends: Track how your music preferences evolve over time.
    - Top Artists, Albums, and Songs: Discover your most listened-to artists, albums, and songs.
    - Dynamic Sorting: Choose the timespan of which you would like the data to be shown.

## Additional Features:

- **Listening Patterns**: Visualization of listening patterns by day of the week and hour of the day by way of a heatmap.
- **Listening Clock**: Representation of scrobbles over 24 hours to identify peak listening times.
- **API Integration**: The backend uses the Deezer API to fetch album and artist images, enhancing the visual representation of your data.
- **Data Security**: Uploaded files are securely handled and stored within the application environment.
- **Responsive UI**: The frontend is designed to provide a seamless user experience across different devices.
  
  ![image](https://github.com/DGoodluck/Last-FM-Data/assets/89657388/4d8ede78-df4c-4cd8-b0e6-e709dea8be2d)


Input your data and gain deeper insights into your music listening habits!
