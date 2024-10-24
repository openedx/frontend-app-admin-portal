import _ from 'lodash';
import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

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

/**
 * Recursive function to fetch all results, traversing a paginated API response. The
 * response and the list of results are already camelCased.
 *
 * @param {string} url Request URL
 * @param {Array} [results] Array of results.
 * @returns Array of all results for authenticated user.
 */
export async function fetchPaginatedData(url, results = []) {
  const response = await getAuthenticatedHttpClient().get(url);
  const responseData = camelCaseObject(response.data);
  const resultsCopy = [...results];
  resultsCopy.push(...responseData.results);
  if (responseData.next) {
    return fetchPaginatedData(responseData.next, resultsCopy);
  }
  return {
    results: resultsCopy,
    response: responseData,
  };
}

export default generateFormattedStatusUrl;
