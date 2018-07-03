import {
  FETCH_DASHBOARD_ANALYTICS_REQUEST,
  FETCH_DASHBOARD_ANALYTICS_SUCCESS,
  FETCH_DASHBOARD_ANALYTICS_FAILURE,
} from '../constants/dashboardAnalytics';
import EnterpriseDataApiService from '../services/EnterpriseDataApiService';

const fetchDashboardAnalyticsRequest = () => ({ type: FETCH_DASHBOARD_ANALYTICS_REQUEST });
const fetchDashboardAnalyticsSuccess = data => ({
  type: FETCH_DASHBOARD_ANALYTICS_SUCCESS,
  payload: { data },
});
const fetchDashboardAnalyticsFailure = error => ({
  type: FETCH_DASHBOARD_ANALYTICS_FAILURE,
  payload: { error },
});

const fetchDashboardAnalytics = enterpriseId => (
  (dispatch) => {
    dispatch(fetchDashboardAnalyticsRequest());
    return EnterpriseDataApiService.fetchDashboardAnalytics(enterpriseId)
      .then((response) => {
        dispatch(fetchDashboardAnalyticsSuccess(response.data));
      })
      .catch((error) => {
        dispatch(fetchDashboardAnalyticsFailure(error));
      });
  }
);

export default fetchDashboardAnalytics;
