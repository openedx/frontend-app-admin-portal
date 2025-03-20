import { CLEAR_SELECTION, DELETE_ROW, SET_SELECTED_ROWS } from './constants';
import { Action } from './types';

export const setSelectedRowsAction = (selectedRowIds) => ({
  type: SET_SELECTED_ROWS,
  payload: selectedRowIds,
} as Action);

export const deleteSelectedRowAction = (rowId) => ({
  type: DELETE_ROW,
  payload: rowId,
} as Action);

export const clearSelectionAction = () => ({
  type: CLEAR_SELECTION,
} as Action);
