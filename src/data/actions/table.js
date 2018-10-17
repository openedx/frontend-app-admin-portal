import { orderBy } from 'lodash';
import { getPageOptionsFromUrl } from '../../utils';

import {
  PAGINATION_REQUEST,
  PAGINATION_SUCCESS,
  PAGINATION_FAILURE,
  SORT_REQUEST,
  SORT_SUCCESS,
  SORT_FAILURE,
  CLEAR_TABLE,
} from '../constants/table';

const paginationRequest = (tableId, options) => ({
  type: PAGINATION_REQUEST,
  payload: {
    tableId,
    options, // options passed for tracking purposes by beacon in data/store.js
  },
});

const paginationSuccess = (tableId, data, ordering) => ({
  type: PAGINATION_SUCCESS,
  payload: {
    tableId,
    data,
    ordering,
  },
});
const paginationFailure = (tableId, error) => ({
  type: PAGINATION_FAILURE,
  payload: {
    tableId,
    error,
  },
});

const sortRequest = (tableId, ordering) => ({
  type: SORT_REQUEST,
  payload: {
    tableId,
    ordering, // ordering passed for tracking purposes by beacon in data/store.js
  },
});

const sortSuccess = (tableId, ordering, data) => ({
  type: SORT_SUCCESS,
  payload: {
    tableId,
    ordering,
    data,
  },
});
const sortFailure = (tableId, error) => ({
  type: SORT_FAILURE,
  payload: {
    tableId,
    error,
  },
});

const paginateTable = (tableId, fetchMethod, pageNumber) => (
  (dispatch) => {
    const options = getPageOptionsFromUrl();
    if (pageNumber) {
      options.page = pageNumber;
    }
    dispatch(paginationRequest(tableId, options));
    return fetchMethod(options).then((response) => {
      dispatch(paginationSuccess(tableId, response.data, options.ordering));
    }).catch((error) => {
      // This endpoint returns a 404 if no data exists,
      // so we convert it to an empty response here.
      if (error.response.status === 404) {
        dispatch(paginationSuccess(tableId, { results: [] }, options.ordering));
        return;
      }
      dispatch(paginationFailure(tableId, error));
    });
  }
);

const sortData = (data, ordering) => {
  const direction = ordering && ordering.indexOf('-') !== -1 ? 'desc' : 'asc';
  const column = (ordering && ordering.replace('-', ''));

  // `parseKeyValue` adjusts the key's value into its appropriate data type to ensure
  // proper sorting and sort order (e.g., asc/desc). A numeric value (even if passed in
  // as a string) must be parsed as an actual numeric value. An empty value (e.g., null,
  // undefined) must be parsed as an empty string to ensure the empty values are forced
  // to the top in an ascending sort order.
  const parseKeyValue = (obj) => {
    const value = obj[column] || '';
    if (!Number.isNaN(value) && !Number.isNaN(parseFloat(value))) {
      return parseFloat(value);
    }
    return value;
  };
  return orderBy(data, parseKeyValue, [direction]);
};

const sortTable = (tableId, fetchMethod, ordering) => (
  (dispatch, getState) => {
    const tableState = getState().table[tableId];
    const options = {
      ...getPageOptionsFromUrl(),
      ordering,
    };
    dispatch(sortRequest(tableId, ordering));

    // If we can sort client-side because we have all of the data, do that
    if (tableState.data && tableState.data.num_pages === 1) {
      return dispatch(sortSuccess(tableId, ordering, {
        ...tableState.data,
        results: sortData(tableState.data.results, ordering),
      }));
    }

    return fetchMethod(options).then((response) => {
      dispatch(sortSuccess(tableId, ordering, response.data));
    }).catch((error) => {
      dispatch(sortFailure(tableId, error));
    });
  }
);

const clearTable = tableId => dispatch => (dispatch({
  type: CLEAR_TABLE,
  payload: {
    tableId,
  },
}));

export {
  paginateTable,
  sortTable,
  clearTable,
};
