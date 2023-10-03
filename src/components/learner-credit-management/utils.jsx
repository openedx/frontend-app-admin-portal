import dayjs from 'dayjs';

// eslint-disable-next-line import/prefer-default-export
export function formatDate(date) {
  return dayjs(date).format('MMM D, YYYY');
}
