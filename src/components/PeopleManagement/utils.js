import dayjs from 'dayjs';

/**
 * Formats provided dates for display
 *
 * @param {string} timestamp unformatted date timestamp
 * @returns Formatted date string for display.
 */
export default function formatDates(timestamp) {
  const DATE_FORMAT = 'MMMM DD, YYYY';
  return dayjs(timestamp).format(DATE_FORMAT);
}
