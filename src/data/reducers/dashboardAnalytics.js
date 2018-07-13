import {
  FETCH_DASHBOARD_ANALYTICS_REQUEST,
  FETCH_DASHBOARD_ANALYTICS_SUCCESS,
  FETCH_DASHBOARD_ANALYTICS_FAILURE,
} from '../constants/dashboardAnalytics';

const initialState = {
  loading: false,
  error: null,
  enrolled_learners: null,
  active_learners: null,
  course_completions: null,
};

const dashboardAnalytics = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_DASHBOARD_ANALYTICS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_DASHBOARD_ANALYTICS_SUCCESS:
      return {
        ...state,
        loading: false,
        enrolled_learners: action.payload.data.enrolled_learners,
        active_learners: action.payload.data.active_learners,
        course_completions: action.payload.data.course_completions,
      };
    case FETCH_DASHBOARD_ANALYTICS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        enrolled_learners: null,
        active_learners: null,
        course_completions: null,
      };
    default:
      return state;
  }
};

export default dashboardAnalytics;
