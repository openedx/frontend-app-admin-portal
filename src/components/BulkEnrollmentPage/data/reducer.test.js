import selectedRowsReducer from './reducer';
import {
  setSelectedRowsAction, deleteSelectedRowAction, clearSelectionAction, addSelectedRowAction,
} from './actions';

describe('selectedRowsReducer', () => {
  it('can set rows when there are no selected rows', () => {
    const selectedRows = [];
    const newSelectedRows = [{ id: 2 }, { id: 3 }];
    expect(selectedRowsReducer(selectedRows, setSelectedRowsAction(newSelectedRows))).toEqual(newSelectedRows);
  });
  it('can add selected rows', () => {
    const selectedRows = [{ id: 1 }];
    const newSelectedRows = [{ id: 2 }, { id: 3 }];
    const expected = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(selectedRowsReducer(selectedRows, setSelectedRowsAction(newSelectedRows))).toEqual(expected);
  });
  it('dedupes added rows', () => {
    const selectedRows = [{ id: 1 }];
    const newSelectedRows = [{ id: 2 }, { id: 3 }, { id: 1 }];
    const expected = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(selectedRowsReducer(selectedRows, setSelectedRowsAction(newSelectedRows))).toEqual(expected);
  });
  it('can delete a row', () => {
    const selectedRows = [{ id: 2 }, { id: 3 }];
    const expected = [{ id: 3 }];
    const result = selectedRowsReducer(selectedRows, deleteSelectedRowAction(2));
    expect(result).toEqual(expected);
  });
  test.each(
    [
      [[{ id: 'foo' }]],
      [[{ id: 'foo' }, { id: 'bar' }]],
      [[]],
    ],
  )('can clear all rows %#', (selectedRows) => {
    const result = selectedRowsReducer(selectedRows, clearSelectionAction());
    expect(result).toEqual([]);
  });
  test.each(
    [
      [[{ id: 'foo' }]],
      [[{ id: 'foo' }, { id: 'bar' }]],
      [[]],
    ],
  )('can add one row %#', (selectedRows) => {
    const newRow = { id: '1235' };
    const result = selectedRowsReducer(selectedRows, addSelectedRowAction(newRow));
    expect(result).toEqual([...selectedRows, newRow]);
  });
});
