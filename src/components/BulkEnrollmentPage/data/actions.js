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
