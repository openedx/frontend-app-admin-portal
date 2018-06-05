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

const courseEnrollments = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_COURSE_ENROLLMENTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_COURSE_ENROLLMENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        enrollments: action.payload.enrollments,
      };
    case FETCH_COURSE_ENROLLMENTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        enrollments: {},
      };
    default:
      return state;
  }
};

export default courseEnrollments;
