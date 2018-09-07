import {
  PAGINATION_REQUEST,
  PAGINATION_SUCCESS,
  PAGINATION_FAILURE,
  SORT_REQUEST,
  SORT_SUCCESS,
  SORT_FAILURE,
} from '../constants/table';

const paginationRequest = tableId => ({
  type: PAGINATION_REQUEST,
  payload: { tableId },
});

const paginationSuccess = (tableId, data) => ({
  type: PAGINATION_SUCCESS,
  payload: {
    tableId,
    data,
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

const fetchOptions = tableState => ({
  page_size: tableState ? tableState.pageSize : 50,
  page: tableState ? tableState.page : 1,
  ordering: tableState ? tableState.ordering : null,
});

const paginateTable = (tableId, fetchMethod, pageNumber) => (
  (dispatch, getState) => {
    const options = {
      ...fetchOptions(getState().table[tableId]),
      page: pageNumber,
    };
    dispatch(paginationRequest(tableId));
    return fetchMethod(options).then((response) => {
      dispatch(paginationSuccess(tableId, response.data));
    }).catch((error) => {
      dispatch(paginationFailure(tableId, error));
    });
  }
);

const sortTable = (tableId, fetchMethod, sortOptions) => (
  (dispatch, getState) => {
    // Paragon Table's onSort passing in options: key, direction
    // Our Api is expecting single orderField
    const ordering = sortOptions.direction === 'desc' ? `-${sortOptions.key}` : sortOptions.key;
    const options = {
      ...fetchOptions(getState().table[tableId]),
      ordering,
    };
    dispatch(sortRequest(tableId, ordering));
    return fetchMethod(options).then((response) => {
      dispatch(sortSuccess(tableId, response.data));
    }).catch((error) => {
      dispatch(sortFailure(tableId, error));
    });
  }
);

export {
  paginateTable,
  sortTable,
};
