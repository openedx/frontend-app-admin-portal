import {
  SET_SELECTED_ROWS,
  DELETE_ROW,
  CLEAR_SELECTION,
} from './actions';

export type SelectedRow = {
  id: unknown;
  values?: {
    userEmail?: string;
  };
};

export type State = SelectedRow[];

export type Action =
  | { type: typeof SET_SELECTED_ROWS, payload: SelectedRow[] }
  | { type: typeof DELETE_ROW, payload: unknown }
  | { type: typeof CLEAR_SELECTION };

const selectedRowsReducer = (state: State = [], action: Action) => {
  switch (action.type) {
    case SET_SELECTED_ROWS:
      return action.payload;
    case DELETE_ROW:
      return state.filter((row) => row.id !== action.payload);
    case CLEAR_SELECTION:
      return [];
    default:
      return state;
  }
};

export default selectedRowsReducer;
