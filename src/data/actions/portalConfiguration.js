import LmsApiService from '../services/LmsApiService';

import {
  FETCH_PORTAL_CONFIGURATION_REQUEST,
  FETCH_PORTAL_CONFIGURATION_SUCCESS,
  FETCH_PORTAL_CONFIGURATION_FAILURE,
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

export default fetchPortalConfiguration;
