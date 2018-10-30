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

const customSort = (dataToSort, orderField) => {
  const sortByOptions = (obj1, obj2) => {
    let a = obj1[orderField] || '';
    let b = obj2[orderField] || '';
    // if both are strings
    if (typeof a === 'string' && typeof b === 'string') {
      // if both are dates
      if (!Number.isNaN(Date.parse(a)) && !Number.isNaN(Date.parse(b))) {
        a = new Date(a).getTime();
        b = new Date(b).getTime();
        if (a > b) {
          return 1;
        }
        if (a < b) {
          return -1;
        }
        return 0;
      }
      // if A is a date and B is not
      if (!Number.isNaN(Date.parse(a)) && Number.isNaN(Date.parse(b))) {
        return 1;
      }
      // if B is a date and A is not
      if (Number.isNaN(Date.parse(a)) && !Number.isNaN(Date.parse(b))) {
        return -1;
      }
      // if neither is a date
      return a.localeCompare(b);
    }
    // Everything else (numbers. we should not mix datatypes within columns)
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  };
  return dataToSort.sort(sortByOptions);
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
      const isDesc = ordering.startsWith('-');
      const orderField = isDesc ? ordering.substring(1) : ordering;
      let result = customSort(tableState.data.results, orderField);
      result = isDesc ? result.reverse() : result;
      return dispatch(sortSuccess(tableId, ordering, {
        ...tableState.data,
        results: result,
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
