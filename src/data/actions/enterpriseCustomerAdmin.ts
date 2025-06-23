import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { logError } from '@edx/frontend-platform/logging';
import {
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST,
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS,
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_FAILURE,
  DISMISS_ONBOARDING_TOUR_SUCCESS,
  DISMISS_ONBOARDING_TOUR_FAILURE,
  SET_ONBOARDING_TOUR_DISMISSED,
} from '../constants/enterpriseCustomerAdmin';
import LmsApiService, { EnterpriseAdminResponse } from '../services/LmsApiService';

const fetchLoggedInEnterpriseAdminRequest = (): AnyAction => ({
  type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST,
});

const fetchLoggedInEnterpriseAdminSuccess = (response: EnterpriseAdminResponse): AnyAction => ({
  type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS,
  payload: {
    data: response.data?.results?.[0],
  },
});

const fetchLoggedInEnterpriseAdminFailure = (error: Error): AnyAction => ({
  type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_FAILURE,
  payload: { error },
});

const dismissOnboardingTourSuccess = (): AnyAction => ({
  type: DISMISS_ONBOARDING_TOUR_SUCCESS,
});

const dismissOnboardingTourFailure = (error: Error): AnyAction => ({
  type: DISMISS_ONBOARDING_TOUR_FAILURE,
  payload: { error },
});

const setOnboardingTourDismissed = (dismissed: boolean): AnyAction => ({
  type: SET_ONBOARDING_TOUR_DISMISSED,
  payload: { dismissed },
});

const toggleOnboardingTourDismissal = (value: boolean, adminUuid: string) => (
  async (dispatch: ThunkDispatch<{}, {}, AnyAction>): Promise<void> => {
    try {
      await LmsApiService.postOnboardingTourDismissed({ value, adminUuid });
      dispatch(dismissOnboardingTourSuccess());
    } catch (error) {
      logError(error);
      dispatch(dismissOnboardingTourFailure(error as Error));
    } finally {
      dispatch(setOnboardingTourDismissed(value));
    }
  }
);

const dismissOnboardingTour = (adminUuid:string) => toggleOnboardingTourDismissal(true, adminUuid);
const reopenOnboardingTour = (adminUuid:string) => toggleOnboardingTourDismissal(false, adminUuid);

const fetchLoggedInEnterpriseAdmin = () => (
  async (dispatch: ThunkDispatch<{}, {}, AnyAction>): Promise<void> => {
    try {
      dispatch(fetchLoggedInEnterpriseAdminRequest());
      const response = await LmsApiService.fetchLoggedInEnterpriseAdminProfile();
      dispatch(fetchLoggedInEnterpriseAdminSuccess(response));
    } catch (error) {
      logError(error);
      dispatch(fetchLoggedInEnterpriseAdminFailure(error as Error));
    }
  }
);

export {
  fetchLoggedInEnterpriseAdmin,
  dismissOnboardingTour,
  reopenOnboardingTour,
};
