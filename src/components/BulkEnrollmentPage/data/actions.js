export const SET_SELECTED_ROWS = 'SET SELECTED ROWS';
export const setSelectedRowsAction = (selectedRowIds) => ({
  type: SET_SELECTED_ROWS,
  payload: selectedRowIds,
});

export const DELETE_ROW = 'DELETE ROW';
export const deleteSelectedRowAction = (rowId) => ({
  type: DELETE_ROW,
  payload: rowId,
});

export const CLEAR_SELECTION = 'CLEAR SELECTION';
export const clearSelectionAction = () => ({
  type: CLEAR_SELECTION,
});
