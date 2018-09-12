import courseEnrollments from './courseEnrollments';
import {
  FETCH_CSV_REQUEST,
  FETCH_CSV_SUCCESS,
  FETCH_CSV_FAILURE,
} from '../constants/courseEnrollments';

const initialState = {
  csvLoading: false,
  csvError: null,
};

describe('courseEnrollments reducer', () => {
  it('has initial state', () => {
    expect(courseEnrollments(undefined, {})).toEqual(initialState);
  });

  it('sets loading state when fetching enrollment csv', () => {
    const expected = {
      ...initialState,
      csvLoading: true,
    };
    expect(courseEnrollments(undefined, {
      type: FETCH_CSV_REQUEST,
    })).toEqual(expected);
  });

  it('removes loading state when successfully fetching enrollment csv', () => {
    const expected = {
      ...initialState,
      csvLoading: false,
    };
    expect(courseEnrollments(undefined, {
      type: FETCH_CSV_SUCCESS,
    })).toEqual(expected);
  });

  it('updates state when error fetching enrollment csv', () => {
    const expected = {
      ...initialState,
      loading: false,
      csvError: 'test error',
    };
    expect(courseEnrollments(undefined, {
      type: FETCH_CSV_FAILURE,
      payload: { error: 'test error' },
    })).toEqual(expected);
  });
});
