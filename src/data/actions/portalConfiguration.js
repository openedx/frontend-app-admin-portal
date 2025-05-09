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

/**
 * fetchInParallel
 *
 * Takes multiple fetch functions that can be passed like this:
 * [async () => someFetchRequest()]
 *
 * Returns a Promise after all fetch functions have been run in parallel
 * and returned with success or error.
 */
const fetchInParallel = async (fetchFunctions) => {
  const promises = fetchFunctions.map(fn => fn());
  return Promise.allSettled(promises);
};

const fetchPortalConfiguration = slug => (
  (dispatch) => {
    dispatch(fetchPortalConfigurationRequest());
    // TODO: modify to simultaneously fetch enterprise-customer-admin
    const fetchFunctions = [
      async () => LmsApiService.fetchEnterpriseBySlug(slug),
      async () => LmsApiService.fetchLoggedInEnterpriseAdminProfile(),
    ];
    return fetchInParallel(fetchFunctions)
      .then((responses) => {
        const portalConfigurationResponse = responses[0].value;
        for (const res of responses) { console.log('response: ', res); }
        dispatch(fetchPortalConfigurationSuccess(portalConfigurationResponse));
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
