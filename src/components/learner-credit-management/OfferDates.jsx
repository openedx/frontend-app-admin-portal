import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { DATE_FORMAT } from './data/constants';

/**
 * Determines whether a timestamp is in the past based on the current date and time.
 * @param {string} date Timestamp string.
 * @returns True if timestamp is in the past, False if not.
 */
const isDatePast = timestamp => dayjs(timestamp).isBefore(dayjs());

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
    formattedDates = `${dayjs(start).format(DATE_FORMAT)} - ${dayjs(end).format(DATE_FORMAT)}`;
  } else if (start && !end) {
    const startLabel = isDatePast(start) ? 'Started' : 'Starts';
    formattedDates = `${startLabel} ${dayjs(start).format(DATE_FORMAT)}`;
  } else if (!start && end) {
    const endLabel = isDatePast(end) ? 'Ended' : 'Ends';
    formattedDates = `${endLabel} ${dayjs(end).format(DATE_FORMAT)}`;
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
