import dayjs from 'dayjs';

/**
 * Formats provided dates for display
 *
 * @param {string} timestamp unformatted date timestamp
 * @returns Formatted date string for display.
 */
export function formatDates(timestamp) {
  const DATE_FORMAT = 'MMMM DD, YYYY';
  return dayjs(timestamp).format(DATE_FORMAT);
}

export function jsonToCsv(data) {
  let csv = '';
  const headers = Object.keys(data[0]);
  csv += `${headers.join(',')}\n`;

  data.forEach((row) => {
    const rows = headers.map(header => row[header]).join(',');
    csv += `${rows}\n`;
  });
  return csv;
}
