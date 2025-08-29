import { logError } from '@edx/frontend-platform/logging';
import {
  FETCH_ENTERPRISE_BUDGETS_REQUEST,
  FETCH_ENTERPRISE_BUDGETS_SUCCESS,
  FETCH_ENTERPRISE_BUDGETS_FAILURE,
  CLEAR_ENTERPRISE_BUDGETS,
} from '../constants/enterpriseBudgets';
import EnterpriseDataApiService from '../services/EnterpriseDataApiService';

const fetchEnterpriseBudgetsRequest = () => ({ type: FETCH_ENTERPRISE_BUDGETS_REQUEST });
const fetchEnterpriseBudgetsSuccess = data => ({
  type: FETCH_ENTERPRISE_BUDGETS_SUCCESS,
  payload: { data },
});
const fetchEnterpriseBudgetsFailure = error => ({
  type: FETCH_ENTERPRISE_BUDGETS_FAILURE,
  payload: { error },
});

const fetchEnterpriseBudgets = enterpriseId => (
  (dispatch) => {
    dispatch(fetchEnterpriseBudgetsRequest());
    return EnterpriseDataApiService.fetchEnterpriseBudgets(enterpriseId)
      .then((response) => {
        dispatch(fetchEnterpriseBudgetsSuccess(response.data));
      })
      .catch((error) => {
        logError(error);
        dispatch(fetchEnterpriseBudgetsFailure(error));
      });
  }
);

const clearEnterpriseBudgets = () => dispatch => (dispatch({
  type: CLEAR_ENTERPRISE_BUDGETS,
}));

export {
  fetchEnterpriseBudgets,
  clearEnterpriseBudgets,
};
