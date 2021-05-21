import {
  setSelectedRowsAction, deleteSelectedRowAction, SET_SELECTED_ROWS, DELETE_ROW, clearSelectionAction, CLEAR_SELECTION,
  addSelectedRowAction, ADD_ROW,
} from './actions';

describe('selectedRows actions', () => {
  it('setSelectedRows returns an action with rows and the correct type', () => {
    const rows = [{ id: 1 }];
    const result = setSelectedRowsAction(rows);
    expect(result).toEqual({ type: SET_SELECTED_ROWS, rows });
  });
  it('deleteSelectedRow returns an action with an id and the correct type', () => {
    const result = deleteSelectedRowAction(2);
    expect(result).toEqual({
      type: DELETE_ROW,
      rowId: 2,
    });
  });
  it('clearSelection returns and action with the correct type', () => {
    const result = clearSelectionAction();
    expect(result).toEqual({
      type: CLEAR_SELECTION,
    });
  });
  it('addSelectedRow returns and action with the type and the row', () => {
    const row = { id: 1 };
    const result = addSelectedRowAction(row);
    expect(result).toEqual({
      type: ADD_ROW,
      row,
    });
  });
});
