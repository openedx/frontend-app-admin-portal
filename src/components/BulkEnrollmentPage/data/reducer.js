import { SET_SELECTED_ROWS, DELETE_ROW } from './actions';

const selectedRowsReducer = (state = [], action) => {
  switch (action.type) {
    case SET_SELECTED_ROWS:
      return action.rows;
    case DELETE_ROW:
      return state.filter((row) => row.id !== action.rowId);
    default:
      return state;
  }
};

export default selectedRowsReducer;
