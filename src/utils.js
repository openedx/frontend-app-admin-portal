import moment from 'moment';
import omitBy from 'lodash/omitBy';
import Cookies from 'universal-cookie';

const formatTimestamp = ({ timestamp, format = 'MMMM D, YYYY' }) => {
  if (timestamp) {
    return moment(timestamp).format(format);
  }
  return null;
};

const formatPercentage = ({ decimal, numDecimals = 1 }) => (
  decimal ? `${parseFloat((decimal * 100).toFixed(numDecimals))}%` : ''
);

const formatTableOptions = options => omitBy({
  ...options,
  page: parseInt(options.page, 10),
  page_size: parseInt(options.page_size, 10),
}, Number.isNaN);

const getAccessToken = () => {
  const cookies = new Cookies();
  return cookies.get('access_token');
};

export {
  formatTableOptions,
  formatTimestamp,
  formatPercentage,
  getAccessToken,
};
