// hooks/useSorting.js
import { useState, useEffect } from 'react';

/**
 * Computes a timestamp representing a past date based on the input button value.
 * @param {string} button - A string representing the selected time range (e.g., '1-week', '1-month', '6-months', '1-year', 'alltime').
 * @returns {number} - A timestamp representing the past date based on the input time range.
 */
const calculateTimespan = (button) => {
  const currentDate = new Date().getTime();
  const millisecondsInDay = 24 * 60 * 60 * 1000;

  switch (button) {
    case '1-week':
      return currentDate - 7 * millisecondsInDay;
    case '1-month':
      return currentDate - 30 * millisecondsInDay;
    case '6-months':
      return currentDate - 6 * 30 * millisecondsInDay;
    case '1-year':
      return currentDate - 365 * millisecondsInDay;
    case 'alltime':
      return 0;
    default:
      return currentDate - 7 * millisecondsInDay; // Default to 1 week
  }
};

/**
 * A custom React hook that manages the state of a selected time range button and calculates the corresponding timespan in milliseconds.
 * @param {string} initialButton - A string representing the initial selected button, defaulting to '1-month'.
 * @returns {[string, number, function]} An array containing the current buttonSelected string, the calculated timespan in milliseconds, and the setButtonSelected function to update the selected button.
 */
function useSorting(initialButton = '1-month') {
  const [buttonSelected, setButtonSelected] = useState(initialButton);
  const [timespan, setTimespan] = useState(() => calculateTimespan(initialButton));

  useEffect(() => {
    setTimespan(calculateTimespan(buttonSelected));
  }, [buttonSelected]);

  return [buttonSelected, timespan, setButtonSelected];
}

export default useSorting;
