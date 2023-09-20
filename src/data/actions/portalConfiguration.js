import { logError } from '@edx/frontend-platform/logging';
import {
  FETCH_PORTAL_CONFIGURATION_REQUEST,
  FETCH_PORTAL_CONFIGURATION_SUCCESS,
  FETCH_PORTAL_CONFIGURATION_FAILURE,
  CLEAR_PORTAL_CONFIGURATION,
  UPDATE_PORTAL_CONFIGURATION,
} from '../constants/portalConfiguration';
import LmsApiService from '../services/LmsApiService';

const fetchPortalConfigurationRequest = () => ({
  type: FETCH_PORTAL_CONFIGURATION_REQUEST,
});

const fetchPortalConfigurationSuccess = response => ({
  type: FETCH_PORTAL_CONFIGURATION_SUCCESS,
  payload: {
    data: response.data,
    enterpriseFeatures: response.enterpriseFeatures,
  },
});

const fetchPortalConfigurationFailure = error => ({
  type: FETCH_PORTAL_CONFIGURATION_FAILURE,
  payload: { error },
});

const updatePortalConfigurationEvent = data => ({
  type: UPDATE_PORTAL_CONFIGURATION,
  payload: { data },
});

const clearPortalConfigurationEvent = () => ({ type: CLEAR_PORTAL_CONFIGURATION });

const fetchPortalConfiguration = slug => (
  (dispatch) => {
    dispatch(fetchPortalConfigurationRequest());
    return LmsApiService.fetchEnterpriseBySlug(slug)
      .then((response) => {
        console.log('fetchPortalConfiguration!!!', response);
        dispatch(fetchPortalConfigurationSuccess(response));
      })
      .catch((error) => {
        logError(error);
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
  updatePortalConfigurationEvent,
};
