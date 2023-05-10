import {
  SET_SELECTED_ROWS,
  DELETE_ROW,
  CLEAR_SELECTION,
} from './actions';

// eslint-disable-next-line @typescript-eslint/default-param-last
const selectedRowsReducer = (state = [], action) => {
  switch (action.type) {
    case SET_SELECTED_ROWS:
      return action.payload;
    case DELETE_ROW:
      return state.filter(row => row.id !== action.payload);
    case CLEAR_SELECTION:
      return [];
    default:
      return state;
  }
};

export default selectedRowsReducer;
