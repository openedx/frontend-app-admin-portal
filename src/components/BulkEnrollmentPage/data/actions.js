export const SET_SELECTED_ROWS = 'SET SELECTED ROWS';
export const setSelectedRowsAction = (rows) => ({
  type: SET_SELECTED_ROWS,
  rows,
});

export const DELETE_ROW = 'DELETE ROW';
export const deleteSelectedRowAction = (rowId) => ({
  type: DELETE_ROW,
  rowId,
});

export const ADD_ROW = 'ADD ROW';
export const addSelectedRowAction = (row) => ({
  type: ADD_ROW,
  row,
});

export const CLEAR_SELECTION = 'CLEAR SELECTION';
export const clearSelectionAction = () => ({
  type: CLEAR_SELECTION,
});
