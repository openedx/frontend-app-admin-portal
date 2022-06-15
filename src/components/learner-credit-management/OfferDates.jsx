import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

export const DATE_FORMAT = 'MMMM D, YYYY';

/**
 * Determines whether a timestamp is in the past based on the current date and time.
 * @param {string} date Timestamp string.
 * @returns True if timestamp is in the past, False if not.
 */
const isDatePast = timestamp => moment(timestamp).isBefore(moment());

/**
 * Formats provided dates for display, handling when `start` and/or
 * `end` is not provided.
 *
 * @param {string} start Start timestamp
 * @param {string} end End timestamp
 * @returns Formatted date string for display.
 */
const formatDates = (start, end) => {
  let formattedDates = null;
  if (start && end) {
    formattedDates = `${moment(start).format(DATE_FORMAT)} - ${moment(end).format(DATE_FORMAT)}`;
  } else if (start && !end) {
    const startLabel = isDatePast(start) ? 'Started' : 'Starts';
    formattedDates = `${startLabel} ${moment(start).format(DATE_FORMAT)}`;
  } else if (!start && end) {
    const endLabel = isDatePast(end) ? 'Ended' : 'Ends';
    formattedDates = `${endLabel} ${moment(end).format(DATE_FORMAT)}`;
  }
  return formattedDates;
};

const OfferDates = ({ start, end }) => {
  const formattedDates = formatDates(start, end);
  if (!formattedDates) {
    return null;
  }

  return (
    <div>
      <span data-testid="formatted-dates" className="lead">
        {formattedDates}
      </span>
    </div>
  );
};

OfferDates.propTypes = {
  start: PropTypes.string,
  end: PropTypes.string,
};

OfferDates.defaultProps = {
  start: undefined,
  end: undefined,
};

export default OfferDates;
