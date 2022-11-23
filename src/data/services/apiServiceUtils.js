import _ from 'lodash';

function generateFormattedStatusUrl(url, currentPage, options) {
  // pages index from 1 in backend, frontend components index from 0
  let pageToUse;
  if (currentPage) {
    pageToUse = currentPage + 1;
  }
  let queryParams = '';
  if (!_.isEmpty(options)) {
    queryParams = new URLSearchParams(options);
  }
  const paramString = `?${pageToUse ? `page=${pageToUse}` : ''}&${queryParams.toString()}`;
  return `${url}${paramString}`;
}

export default generateFormattedStatusUrl;
