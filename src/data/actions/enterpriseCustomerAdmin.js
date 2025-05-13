import { logError } from '@edx/frontend-platform/logging';
import {
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST,
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS,
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_FAILURE,
  DISMISS_ONBOARDING_TOUR_SUCCESS,
  DISMISS_ONBOARDING_TOUR_FAILURE,
  SET_ONBOARDING_TOUR_DISMISSED,
} from '../constants/enterpriseCustomerAdmin';
import LmsApiService from '../services/LmsApiService';

const fetchLoggedInEnterpriseAdminRequest = () => ({
  type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST,
});

const fetchLoggedInEnterpriseAdminSuccess = response => ({
  type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS,
  payload: {
    data: response.data?.results?.[0],
  },
});

const fetchLoggedInEnterpriseAdminFailure = error => ({
  type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_FAILURE,
  payload: { error },
});

const dismissOnboardingTourSuccess = () => ({
  type: DISMISS_ONBOARDING_TOUR_SUCCESS,
});

const dismissOnboardingTourFailure = error => ({
  type: DISMISS_ONBOARDING_TOUR_FAILURE,
  payload: { error },
});

const setOnboardingTourDismissed = (dismissed) => ({
  type: SET_ONBOARDING_TOUR_DISMISSED,
  payload: { dismissed },
});

const dismissOnboardingTour = () => (
  async (dispatch) => {
    try {
      // TODO: Implement the backend API for dismissing the onboarding tour.
      // Right now this will cause a 404 error and jump to the catch and finally blocks.
      const response = await LmsApiService.postOnboardingTourDismissed({ value: true });
      dispatch(dismissOnboardingTourSuccess(response));
    } catch (error) {
      logError(error);
      dispatch(dismissOnboardingTourFailure(error));
    } finally {
      dispatch(setOnboardingTourDismissed(true));
    }
  }
);

const fetchLoggedInEnterpriseAdmin = () => (
  async (dispatch) => {
    try {
      dispatch(fetchLoggedInEnterpriseAdminRequest());
      const response = await LmsApiService.fetchLoggedInEnterpriseAdminProfile();
      dispatch(fetchLoggedInEnterpriseAdminSuccess(response));
    } catch (error) {
      logError(error);
      dispatch(fetchLoggedInEnterpriseAdminFailure(error));
    }
  }
);

export {
  fetchLoggedInEnterpriseAdmin,
  dismissOnboardingTour,
};
