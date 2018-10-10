import {
  FETCH_DASHBOARD_ANALYTICS_REQUEST,
  FETCH_DASHBOARD_ANALYTICS_SUCCESS,
  FETCH_DASHBOARD_ANALYTICS_FAILURE,
  CLEAR_DASHBOARD_ANALYTICS,
} from '../constants/dashboardAnalytics';

const initialState = {
  loading: false,
  error: null,
  enrolled_learners: null,
  number_of_users: null,
  active_learners: null,
  course_completions: null,
  last_updated_date: null,
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
        number_of_users: action.payload.data.number_of_users,
        active_learners: action.payload.data.active_learners,
        course_completions: action.payload.data.course_completions,
        last_updated_date: action.payload.data.last_updated_date,
      };
    case FETCH_DASHBOARD_ANALYTICS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        enrolled_learners: null,
        number_of_users: null,
        active_learners: null,
        course_completions: null,
        last_updated_date: null,
      };
    case CLEAR_DASHBOARD_ANALYTICS:
      return {
        ...state,
        loading: false,
        error: null,
        enrolled_learners: null,
        number_of_users: null,
        active_learners: null,
        course_completions: null,
        last_updated_date: null,
      };
    default:
      return state;
  }
};

export default dashboardAnalytics;
