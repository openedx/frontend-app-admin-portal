import LmsApiService from '../services/LmsApiService';

import {
  FETCH_PORTAL_CONFIGURATION_REQUEST,
  FETCH_PORTAL_CONFIGURATION_SUCCESS,
  FETCH_PORTAL_CONFIGURATION_FAILURE,
  CLEAR_PORTAL_CONFIGURATION,
} from '../constants/portalConfiguration';

const fetchPortalConfigurationRequest = () => ({ type: FETCH_PORTAL_CONFIGURATION_REQUEST });
const fetchPortalConfigurationSuccess = data => ({
  type: FETCH_PORTAL_CONFIGURATION_SUCCESS,
  payload: { data },
});
const fetchPortalConfigurationFailure = error => ({
  type: FETCH_PORTAL_CONFIGURATION_FAILURE,
  payload: { error },
});
const clearPortalConfigurationEvent = () => ({ type: CLEAR_PORTAL_CONFIGURATION });

const fetchPortalConfiguration = enterpriseSlug => (
  (dispatch) => {
    dispatch(fetchPortalConfigurationRequest());

    return LmsApiService.fetchPortalConfiguration(enterpriseSlug)
      .then((response) => {
        dispatch(fetchPortalConfigurationSuccess(response.data));
      })
      .catch((error) => {
        dispatch(fetchPortalConfigurationFailure(error));
      });
  }
);

const clearPortalConfiguration = () => (
  (dispatch) => {
    dispatch(clearPortalConfigurationEvent());
  }
);

export {
  fetchPortalConfiguration,
  clearPortalConfiguration,
};
