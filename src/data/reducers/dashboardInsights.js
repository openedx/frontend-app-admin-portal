import {
  FETCH_DASHBOARD_INSIGHTS_REQUEST,
  FETCH_DASHBOARD_INSIGHTS_SUCCESS,
  FETCH_DASHBOARD_INSIGHTS_FAILURE,
  CLEAR_DASHBOARD_INSIGHTS,
} from '../constants/dashboardInsights';

const initialState = {
  loading: false,
  error: null,
  insights: null,
};

const dashboardInsights = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_DASHBOARD_INSIGHTS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_DASHBOARD_INSIGHTS_SUCCESS:
      return {
        ...state,
        loading: false,
        insights: action.payload.data,
      };
    case FETCH_DASHBOARD_INSIGHTS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        insights: null,
      };
    case CLEAR_DASHBOARD_INSIGHTS:
      return {
        ...state,
        loading: false,
        error: null,
        insights: null,
      };
    default:
      return state;
  }
};

export default dashboardInsights;
