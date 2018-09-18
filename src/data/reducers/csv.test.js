import csv from './csv';
import {
  FETCH_CSV_REQUEST,
  FETCH_CSV_SUCCESS,
  FETCH_CSV_FAILURE,
  CLEAR_CSV,
} from '../constants/csv';

describe('csv reducer', () => {
  it('sets loading state when fetching csv', () => {
    const expected = {
      'csv-1': {
        csvLoading: true,
        csvError: null,
      },
    };
    expect(csv(undefined, {
      type: FETCH_CSV_REQUEST,
      payload: {
        csvId: 'csv-1',
      },
    })).toEqual(expected);
  });

  it('removes loading state when successfully fetching csv', () => {
    const expected = {
      'csv-1': {
        csvLoading: false,
        csvError: null,
      },
    };
    expect(csv(undefined, {
      type: FETCH_CSV_SUCCESS,
      payload: {
        csvId: 'csv-1',
      },
    })).toEqual(expected);
  });

  it('updates state when error fetching csv', () => {
    const expected = {
      'csv-1': {
        csvLoading: false,
        csvError: 'test error',
      },
    };
    expect(csv(undefined, {
      type: FETCH_CSV_FAILURE,
      payload: {
        csvId: 'csv-1',
        error: 'test error',
      },
    })).toEqual(expected);
  });

  it('clears state with clearCsv', () => {
    const expected = {
      'csv-1': {
        csvLoading: false,
        csvError: null,
      },
    };
    expect(csv(undefined, {
      type: CLEAR_CSV,
      payload: {
        csvId: 'csv-1',
      },
    })).toEqual(expected);
  });
});
