import dayjs from 'dayjs';

export function makePlural(num, string) {
  if (num > 1 || num === 0) {
    return `${num} ${string}s`;
  }
  return `${num} ${string}`;
}

export function formatDate(date) {
  return dayjs(date).format('MMM D, YYYY');
}
