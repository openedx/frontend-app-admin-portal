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

export const getSelectedEmailsByRow = (selectedFlatRows) => {
  const emails = [];
  Object.keys(selectedFlatRows).forEach(key => {
    const { original } = selectedFlatRows[key];
    if (original.user !== null) {
      emails.push(original.user.email);
    }
  });
  return emails;
};
