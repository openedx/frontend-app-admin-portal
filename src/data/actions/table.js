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

const sortRequest = tableId => ({
  type: SORT_REQUEST,
  payload: { tableId },
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

const paginateTable = (tableId, fetchMethod, options) => (
  (dispatch) => {
    dispatch(paginationRequest(tableId));
    return fetchMethod(options).then((response) => {
      dispatch(paginationSuccess(tableId, response.data));
    }).catch((error) => {
      dispatch(paginationFailure(tableId, error));
    });
  }
);

const sortTable = (tableId, fetchMethod, options) => (
  (dispatch) => {
    dispatch(sortRequest(tableId));
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
