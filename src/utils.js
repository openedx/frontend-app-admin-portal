import moment from 'moment';
import Cookies from 'universal-cookie';
import qs from 'query-string';

import history from './data/history';

const formatTimestamp = ({ timestamp, format = 'MMMM D, YYYY' }) => {
  if (timestamp) {
    return moment(timestamp).format(format);
  }
  return null;
};

const formatPassedTimestamp = (timestamp) => {
  if (timestamp) {
    return formatTimestamp({ timestamp });
  }
  return 'Has not passed';
};

const formatPercentage = ({ decimal, numDecimals = 1 }) => (
  decimal ? `${parseFloat((decimal * 100).toFixed(numDecimals))}%` : ''
);

const getAccessToken = () => {
  const cookies = new Cookies();
  return cookies.get('access_token');
};

const updateUrl = (data) => {
  if (data) {
    history.push(`?${qs.stringify({
      page: data.page !== 1 ? data.page : undefined,
      ordering: data.ordering,
      search: data.search,
    })}`);
  }
};

const removeTrailingSlash = path => path.replace(/\/$/, '');

export {
  formatPercentage,
  formatPassedTimestamp,
  formatTimestamp,
  getAccessToken,
  removeTrailingSlash,
  updateUrl,
};
