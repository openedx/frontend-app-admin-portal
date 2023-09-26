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

export function formatCurrency(currency) {
  const currencyUS = Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  });

  return currencyUS.format(currency);
}
