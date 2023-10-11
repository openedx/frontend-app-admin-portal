import { logError } from '@edx/frontend-platform/logging';
import {
  FETCH_DASHBOARD_INSIGHTS_REQUEST,
  FETCH_DASHBOARD_INSIGHTS_SUCCESS,
  FETCH_DASHBOARD_INSIGHTS_FAILURE,
  CLEAR_DASHBOARD_INSIGHTS,
} from '../constants/dashboardInsights';
import EnterpriseDataApiService from '../services/EnterpriseDataApiService';

const fetchDashboardInsightsRequest = () => ({ type: FETCH_DASHBOARD_INSIGHTS_REQUEST });
const fetchDashboardInsightsSuccess = data => ({
  type: FETCH_DASHBOARD_INSIGHTS_SUCCESS,
  payload: { data },
});
const fetchDashboardInsightsFailure = error => ({
  type: FETCH_DASHBOARD_INSIGHTS_FAILURE,
  payload: { error },
});

const fetchDashboardInsights = enterpriseId => (
  (dispatch) => {
    dispatch(fetchDashboardInsightsRequest());
    return EnterpriseDataApiService.fetchDashboardInsights(enterpriseId)
      .then((response) => {
        dispatch(fetchDashboardInsightsSuccess(response.data));
      })
      .catch((error) => {
        logError(error);
        dispatch(fetchDashboardInsightsFailure(error));
      });
  }
);

const clearDashboardInsights = () => dispatch => (dispatch({
  type: CLEAR_DASHBOARD_INSIGHTS,
}));

export {
  fetchDashboardInsights,
  clearDashboardInsights,
};
