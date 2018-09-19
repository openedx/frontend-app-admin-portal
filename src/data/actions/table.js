import qs from 'query-string';
import { orderBy } from 'lodash';

import { updateUrl } from '../../utils';
import history from '../../data/history';
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
    options,
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
    ordering,
  },
});

const sortSuccess = (tableId, data) => ({
  type: SORT_SUCCESS,
  payload: {
    tableId,
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

const fetchOptions = (tableState) => {
  // Fetch options are determined:
  // 1. If the redux state is already set, we use those
  // 2. If redux state for this table is not set, we check the querystring to allow deep linking
  // 3. Otherwise we use default values
  //
  // TODO: this will not support multiple tables paging on a single page. Will need to prefix url
  // params with table id (or some other mechanism) if this becomes a feature requirement
  const defaults = {
    pageSize: 50,
    page: 1,
    ordering: undefined,
  };

  if (!tableState) {
    const query = qs.parse(history.location.search);
    return {
      pageSize: query.page_size || defaults.pageSize,
      page: query.page || defaults.page,
      ordering: query.ordering || defaults.ordering,
    };
  }
  return {
    pageSize: tableState.pageSize || defaults.pageSize,
    page: tableState.page || defaults.page,
    ordering: tableState.ordering || defaults.ordering,
  };
};

const paginateTable = (tableId, fetchMethod, fetchParams, pageNumber) => (
  (dispatch, getState) => {
    const tableState = getState().table[tableId];
    const options = {
      ...fetchOptions(tableState),
      ...fetchParams,
      page: pageNumber,
    };
    updateUrl(options);
    dispatch(paginationRequest(tableId, options));
    return fetchMethod(options).then((response) => {
      console.log('response.data', response.data);
      dispatch(paginationSuccess(tableId, response.data, options.ordering));
    }).catch((error) => {
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

const sortTable = (tableId, fetchMethod, sortOptions) => (
  (dispatch, getState) => {
    // Paragon Table's onSort passing in options: key, direction
    // Our Api is expecting single orderField
    const ordering = sortOptions.direction === 'desc' ? `-${sortOptions.key}` : sortOptions.key;
    const tableState = getState().table[tableId];
    const options = {
      ...fetchOptions(tableState),
      ordering,
    };
    updateUrl(options);
    dispatch(sortRequest(tableId, ordering));

    // If we can sort client-side because we have all of the data, do that
    if (tableState.data && tableState.data.num_pages === 1) {
      return dispatch(sortSuccess(tableId, {
        ...tableState.data,
        results: sortData(tableState.data.results, ordering),
      }));
    }

    return fetchMethod(options).then((response) => {
      dispatch(sortSuccess(tableId, response.data));
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
