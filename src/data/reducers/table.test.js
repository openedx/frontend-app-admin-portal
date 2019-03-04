import tableReducer from './table';
import {
  PAGINATION_REQUEST,
  PAGINATION_SUCCESS,
  PAGINATION_FAILURE,
  CLEAR_TABLE,
} from '../constants/table';

describe('table reducer', () => {
  it('has initial state of empty object', () => {
    expect(tableReducer(undefined, {})).toEqual({});
  });

  it('PAGINATION_REQUEST sets loading and error state', () => {
    const expected = {
      'table-1': {
        loading: true,
        error: null,
      },
    };
    expect(tableReducer(undefined, {
      type: PAGINATION_REQUEST,
      payload: {
        tableId: 'table-1',
      },
    })).toEqual(expected);
  });

  it('PAGINATION_SUCCESS sets data for the table', () => {
    const expectedData = {
      count: 330,
      current_page: 1,
      num_pages: 7,
      results: [{}, {}],
    };
    const expected = {
      'table-1': {
        loading: false,
        ordering: null,
        data: expectedData,
      },
    };
    expect(tableReducer(undefined, {
      type: PAGINATION_SUCCESS,
      payload: {
        tableId: 'table-1',
        ordering: null,
        data: expectedData,
      },
    })).toEqual(expected);
  });

  it('PAGINATION_FAILURE sets error state', () => {
    const expected = {
      'table-1': {
        loading: false,
        error: new Error('test error'),
      },
    };
    expect(tableReducer(undefined, {
      type: PAGINATION_FAILURE,
      payload: {
        tableId: 'table-1',
        error: new Error('test error'),
      },
    })).toEqual(expected);
  });

  it('CLEAR_TABLE clears out the tables data', () => {
    const initialState = {
      'table-1': {
        data: [{}, {}],
      },
    };
    const expected = {
      'table-1': {
        error: null,
        ordering: null,
        data: null,
      },
    };
    expect(tableReducer(initialState, {
      type: CLEAR_TABLE,
      payload: {
        tableId: 'table-1',
      },
    })).toEqual(expected);
  });
});
