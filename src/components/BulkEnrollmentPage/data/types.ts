import { CLEAR_SELECTION, DELETE_ROW, SET_SELECTED_ROWS } from './constants';

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
