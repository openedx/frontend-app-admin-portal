import selectedRowsReducer from './reducer';
import {
  setSelectedRowsAction,
  deleteSelectedRowAction,
  clearSelectionAction,
} from './actions';

describe('selectedRowsReducer', () => {
  it('can set rows when there are no selected rows', () => {
    const selectedRows = [];
    const newSelectedRows = [{ id: 2 }, { id: 3 }];
    expect(selectedRowsReducer(
      selectedRows,
      setSelectedRowsAction(newSelectedRows),
    )).toEqual(newSelectedRows);
  });
  it('can set selected rows', () => {
    const selectedRows = [{ id: 1 }];
    const newSelectedRows = [{ id: 2 }, { id: 3 }];
    const expected = [{ id: 2 }, { id: 3 }];
    const result = selectedRowsReducer(
      selectedRows,
      setSelectedRowsAction(newSelectedRows),
    );
    expect(result).toEqual(expected);
  });
  it('can delete a row', () => {
    const selectedRows = [{ id: 2 }, { id: 3 }];
    const expected = [{ id: 3 }];
    const result = selectedRowsReducer(
      selectedRows,
      deleteSelectedRowAction(2),
    );
    expect(result).toEqual(expected);
  });
  test.each(
    [
      [[{ id: 'foo' }]],
      [[{ id: 'foo' }, { id: 'bar' }]],
      [[]],
    ],
  )('can clear all rows %#', (selectedRows) => {
    const result = selectedRowsReducer(
      selectedRows,
      clearSelectionAction(),
    );
    expect(result).toEqual([]);
  });
  it('handles unknown action', () => {
    const reducerState = { id: 'foo' };
    expect(selectedRowsReducer(
      reducerState,
      { type: 'unknown' },
    )).toEqual(reducerState);
  });
});
