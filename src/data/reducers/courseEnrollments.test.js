import courseEnrollments from './courseEnrollments';
import {
  FETCH_COURSE_ENROLLMENTS_REQUEST,
  FETCH_COURSE_ENROLLMENTS_SUCCESS,
  FETCH_COURSE_ENROLLMENTS_FAILURE,
} from '../constants/courseEnrollments';

const initialState = {
  enrollments: {},
  loading: false,
  error: null,
};

describe('courseEnrollments reducer', () => {
  it('has initial state', () => {
    expect(courseEnrollments(undefined, {})).toEqual(initialState);
  });

  it('updates fetch enrollments request state', () => {
    const expected = {
      ...initialState,
      loading: true,
    };
    expect(courseEnrollments(undefined, {
      type: FETCH_COURSE_ENROLLMENTS_REQUEST,
    })).toEqual(expected);
  });

  it('updates fetch enrollments success state', () => {
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

  it('updates fetch enrollments failure state', () => {
    const error = Error('Network Requqest');
    const expected = {
      ...initialState,
      error,
    };
    expect(courseEnrollments(undefined, {
      type: FETCH_COURSE_ENROLLMENTS_FAILURE,
      payload: { error },
    })).toEqual(expected);
  });
});
