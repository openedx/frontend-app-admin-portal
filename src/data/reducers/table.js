import {
  PAGINATION_REQUEST,
  PAGINATION_SUCCESS,
  PAGINATION_FAILURE,
  SORT_REQUEST,
  SORT_SUCCESS,
  SORT_FAILURE,
  CLEAR_TABLE,
} from '../constants/table';

// Tables state will be a map of tableId to that tables state
// This helper handles the state update for a table
const updateTable = (state, tableId, updatedTableState) => ({
  ...state,
  [tableId]: {
    ...state[tableId],
    ...updatedTableState,
  },
});

const tableReducer = (state = {}, action) => {
  switch (action.type) {
    case PAGINATION_REQUEST:
      return updateTable(state, action.payload.tableId, {
        loading: true,
        error: null,
      });
    case PAGINATION_SUCCESS:
      return updateTable(state, action.payload.tableId, {
        loading: false,
        ordering: action.payload.ordering,
        data: action.payload.data,
      });
    case PAGINATION_FAILURE:
      return updateTable(state, action.payload.tableId, {
        loading: false,
        error: action.payload.error,
      });
    case SORT_REQUEST:
      return updateTable(state, action.payload.tableId, {
        loading: true,
        error: null,
      });
    case SORT_SUCCESS:
      return updateTable(state, action.payload.tableId, {
        loading: false,
        error: null,
        ordering: action.payload.ordering,
        data: action.payload.data,
      });
    case SORT_FAILURE:
      return updateTable(state, action.payload.tableId, {
        loading: false,
        error: action.payload.error,
      });
    case CLEAR_TABLE:
      return updateTable(state, action.payload.tableId, {
        error: null,
        ordering: null,
        data: null,
      });
    default:
      return state;
  }
};

export default tableReducer;
