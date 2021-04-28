import selectedRowsReducer from './reducer';
import { setSelectedRowsAction, deleteSelectedRowAction } from './actions';

describe('selectedRowsReducer', () => {
  it('can set rows', () => {
    const selectedRows = [{ id: 1 }];
    const newSelectedRows = [{ id: 2 }, { id: 3 }];
    expect(selectedRowsReducer(selectedRows, setSelectedRowsAction(newSelectedRows))).toEqual(newSelectedRows);
  });
  it('can delete a row', () => {
    const selectedRows = [{ id: 2 }, { id: 3 }];
    const expected = [{ id: 3 }];
    const result = selectedRowsReducer(selectedRows, deleteSelectedRowAction(2));
    expect(result).toEqual(expected);
  });
});
