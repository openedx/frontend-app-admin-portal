import {
  PAGINATION_REQUEST,
  PAGINATION_SUCCESS,
  PAGINATION_FAILURE,
  SORT_REQUEST,
  SORT_SUCCESS,
  SORT_FAILURE,
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
        sortBy: action.payload.sortBy,
      });
    case SORT_SUCCESS:
      return updateTable(state, action.payload.tableId, {
        loading: false,
        error: null,
        data: action.payload.data,
      });
    case SORT_FAILURE:
      return updateTable(state, action.payload.tableId, {
        loading: false,
        error: action.payload.error,
      });
    default:
      return state;
  }
};

export default tableReducer;
