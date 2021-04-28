import { convertToSelectedRowsObject } from './helpers';

describe('convertToSelectedRowsObject', () => {
  it('creates an object has a property of the row id for each selected row with the value true', () => {
    const rows = [{ id: 'foo' }, { id: 'bar' }];
    const expected = { foo: true, bar: true };
    expect(convertToSelectedRowsObject(rows)).toEqual(expected);
  });
});
