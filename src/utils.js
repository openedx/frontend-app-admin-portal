import moment from 'moment';
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

const updateUrl = (queryOptions) => {
  if (!queryOptions) {
    return;
  }
  const currentQuery = qs.parse(window.location.search);

  // Apply any updates passed in over the current query. This requires consumers to explicitly
  // pass in parameters they want to remove, such as resetting the page when sorting, but ensures
  // that we bring forward all other params such as feature flags
  const newQuery = {
    ...currentQuery,
    ...queryOptions,
  };

  // Because we show page 1 by default, theres no reason to set the url to page=1
  if (newQuery.page === 1) {
    newQuery.page = undefined;
  }

  const newQueryString = `?${qs.stringify(newQuery)}`;
  if (newQueryString !== window.location.search) {
    history.push(newQueryString);
  }
};

// Returns an object containing pagination options (page_size, page, ordering) based on the current
// window location's query string, or, if not set in the window location uses defaults values.
const getPageOptionsFromUrl = () => {
  // TODO: this will not support multiple tables paging on a single page. Will need to prefix url
  // params with table id (or some other mechanism) if this becomes a feature requirement
  const defaults = {
    pageSize: 50,
    page: 1,
    ordering: undefined,
  };
  const query = qs.parse(window.location.search);
  return {
    page_size: parseInt(query.page_size, 10) || defaults.pageSize,
    page: parseInt(query.page, 10) || defaults.page,
    ordering: query.ordering || defaults.ordering,
  };
};

const removeTrailingSlash = path => path.replace(/\/$/, '');

const isRoutePublic = path => /^\/public.*$/.test(path);

const isTriggerKey = ({ triggerKeys, action, key }) => (
  triggerKeys[action].indexOf(key) > -1
);

export {
  formatPercentage,
  formatPassedTimestamp,
  formatTimestamp,
  removeTrailingSlash,
  updateUrl,
  getPageOptionsFromUrl,
  isRoutePublic,
  isTriggerKey,
};
