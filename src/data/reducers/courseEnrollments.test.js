import courseEnrollments from './courseEnrollments';
import {
  FETCH_COURSE_ENROLLMENTS_REQUEST,
  FETCH_COURSE_ENROLLMENTS_SUCCESS,
  FETCH_COURSE_ENROLLMENTS_FAILURE,
  FETCH_CSV_REQUEST,
  FETCH_CSV_SUCCESS,
  FETCH_CSV_FAILURE,
} from '../constants/courseEnrollments';

const initialState = {
  enrollments: null,
  loading: false,
  error: null,
  csvLoading: false,
  csvError: null,
};

describe('courseEnrollments reducer', () => {
  it('has initial state', () => {
    expect(courseEnrollments(undefined, {})).toEqual(initialState);
  });

  it('updates state when requesting course enrollments', () => {
    const expected = {
      ...initialState,
      loading: true,
    };
    expect(courseEnrollments(undefined, {
      type: FETCH_COURSE_ENROLLMENTS_REQUEST,
    })).toEqual(expected);
  });

  it('updates state when successfully fetched enrollments', () => {
    const enrollmentsData = {
      count: 3,
      num_pages: 1,
      current_page: 1,
      results: [
        {
          id: 2,
          enterprise_id: 'ee5e6b3a-069a-4947-bb8d-d2dbc323396c',
          enterprise_name: 'Enterprise 1',
          lms_user_id: 11,
          enterprise_user_id: 1,
          course_id: 'edx/Open_DemoX/edx_demo_course',
          enrollment_created_timestamp: '2014-06-27T16:02:38Z',
          course_title: 'All about testing!',
        },
      ],
    };
    const expected = {
      ...initialState,
      enrollments: enrollmentsData,
    };
    expect(courseEnrollments(undefined, {
      type: FETCH_COURSE_ENROLLMENTS_SUCCESS,
      payload: { enrollments: enrollmentsData },
    })).toEqual(expected);
  });

  it('updates state when failing to fetch enrollments', () => {
    const error = Error('Network Request');
    const expected = {
      ...initialState,
      error,
    };
    expect(courseEnrollments(undefined, {
      type: FETCH_COURSE_ENROLLMENTS_FAILURE,
      payload: { error },
    })).toEqual(expected);
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
