import PropTypes from 'prop-types';

function Tile({ cover, detail }) {
    return (
        <div className='app__recentsongs_tile'>
            <div className='app__recentsongs_tile-album'><img src={cover} alt="Cover Art" /></div>
            <div className='app__recentsongs_tile-detail'>{detail}</div>
        </div>
    )
}

Tile.propTypes = {
    cover: PropTypes.string.isRequired,
    detail: PropTypes.node.isRequired,
};

export default Tile;