// components/Sorting.js
import './Sorting.css';
import PropTypes from 'prop-types';


/**
 * Renders a set of buttons for different time periods. Each button triggers a sorting change based on the selected time period.
 * @param {Object} props - The props object
 * @param {string} props.buttonSelected - The currently selected sorting button
 * @param {Function} props.onSortingChange - The function to handle sorting change
 * @returns {JSX.Element} Buttons for different time periods with the selected button highlighted
 */
function Sorting({ buttonSelected, onSortingChange }) {
  const timePeriods = ['1-week', '1-month', '6-months', '1-year', 'alltime'];

  const formatTimePeriod = (period) => {
    return period.replace('-', ' ').replace('months', 'Months').replace('year', 'Year').replace('week', 'Week').replace('alltime', 'All Time');
  };

  return (
    <div className='app__sorting'>
      <div className='app__sorting_wrapper'>
        {timePeriods.map((button) => (
          <div key={button} className={`app__sorting_${button}`}>
            <button
              type="button"
              className={`app__sorting_${button}_button`}
              style={{ background: buttonSelected === button ? 'red' : 'none' }}
              onClick={() => onSortingChange(button)}
            >
              {formatTimePeriod(button)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

Sorting.propTypes = {
  buttonSelected: PropTypes.string.isRequired,
  onSortingChange: PropTypes.func.isRequired,
};

export default Sorting;
