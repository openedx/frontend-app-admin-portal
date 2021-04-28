import {
  setSelectedRowsAction, deleteSelectedRowAction, SET_SELECTED_ROWS, DELETE_ROW,
} from './actions';

describe('selectedRows action', () => {
  it('returns an action with rows and the correct type', () => {
    const rows = [{ id: 1 }];
    const result = setSelectedRowsAction(rows);
    expect(result).toEqual({ type: SET_SELECTED_ROWS, rows });
  });
  it('returns an action with an id and the correct type', () => {
    const result = deleteSelectedRowAction(2);
    expect(result).toEqual({
      type: DELETE_ROW,
      id: 2,
    });
  });
});
