import {
  setSelectedRowsAction,
  deleteSelectedRowAction,
  SET_SELECTED_ROWS,
  DELETE_ROW,
  clearSelectionAction,
  CLEAR_SELECTION,
} from './actions';

describe('selectedRows actions', () => {
  it('setSelectedRows returns an action with rows and the correct type', () => {
    const rows = [{ id: 1 }];
    const result = setSelectedRowsAction(rows);
    expect(result).toEqual({ type: SET_SELECTED_ROWS, payload: rows });
  });
  it('deleteSelectedRow returns an action with an id and the correct type', () => {
    const result = deleteSelectedRowAction(2);
    expect(result).toEqual({
      type: DELETE_ROW,
      payload: 2,
    });
  });
  it('clearSelection returns and action with the correct type', () => {
    const result = clearSelectionAction();
    expect(result).toEqual({
      type: CLEAR_SELECTION,
    });
  });
});
