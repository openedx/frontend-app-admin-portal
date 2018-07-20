import moment from 'moment';
import { isNaN, omitBy } from 'lodash';

const formatTimestamp = ({ timestamp, format = 'MMMM D, YYYY' }) => {
  if (timestamp) {
    return moment(timestamp).format(format);
  }
  return null;
};

const formatTableOptions = options => omitBy({
  ...options,
  page: parseInt(options.page, 10),
  page_size: parseInt(options.page_size, 10),
}, isNaN);

export {
  formatTableOptions,
  formatTimestamp,
};
