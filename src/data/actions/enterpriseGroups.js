import { logError } from '@edx/frontend-platform/logging';
import {
  FETCH_ENTERPRISE_GROUPS_REQUEST,
  FETCH_ENTERPRISE_GROUPS_SUCCESS,
  FETCH_ENTERPRISE_GROUPS_FAILURE,
  CLEAR_ENTERPRISE_GROUPS,
} from '../constants/enterpriseGroups';
import EnterpriseDataApiService from '../services/EnterpriseDataApiService';

const fetchEnterpriseGroupsRequest = () => ({ type: FETCH_ENTERPRISE_GROUPS_REQUEST });
const fetchEnterpriseGroupsSuccess = data => ({
  type: FETCH_ENTERPRISE_GROUPS_SUCCESS,
  payload: { data },
});
const fetchEnterpriseGroupsFailure = error => ({
  type: FETCH_ENTERPRISE_GROUPS_FAILURE,
  payload: { error },
});

const fetchEnterpriseGroups = enterpriseId => (
  (dispatch) => {
    dispatch(fetchEnterpriseGroupsRequest());
    return EnterpriseDataApiService.fetchEnterpriseGroups(enterpriseId)
      .then((response) => {
        dispatch(fetchEnterpriseGroupsSuccess(response.data));
      })
      .catch((error) => {
        logError(error);
        dispatch(fetchEnterpriseGroupsFailure(error));
      });
  }
);

const clearEnterpriseGroups = () => dispatch => (dispatch({
  type: CLEAR_ENTERPRISE_GROUPS,
}));

export {
  fetchEnterpriseGroups,
  clearEnterpriseGroups,
};
