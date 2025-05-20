import { AnyAction } from 'redux';
import {
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST,
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS,
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_FAILURE,
  SET_ONBOARDING_TOUR_DISMISSED,
} from '../constants/enterpriseCustomerAdmin';

/**
 * Interface for EnterpriseCustomerAdmin state
 */
export interface EnterpriseCustomerAdminState {
  loading: boolean;
  errors: any;
  error?: any;
  completedTourFlows: string[];
  enterpriseCustomerUser: any | null;
  lastLogin: string | null;
  onboardingTourCompleted: boolean;
  onboardingTourDismissed: boolean;
  uuid: string | null;
}

/**
 * Interface for EnterpriseCustomerAdmin data received from API
 */
interface EnterpriseCustomerAdminData {
  completed_tour_flows: string[];
  enterprise_customer_user: any;
  last_login: string | null;
  onboarding_tour_completed: boolean;
  onboarding_tour_dismissed: boolean;
  uuid: string | null;
}

const initialState: EnterpriseCustomerAdminState = {
  loading: true,
  errors: null,
  completedTourFlows: [],
  enterpriseCustomerUser: null,
  lastLogin: null,
  // The following is set to true, since until we load the user,
  // we don't want to randomly show the onboarding tour.
  onboardingTourCompleted: true,
  onboardingTourDismissed: true,
  uuid: null,
};

const enterpriseCustomerAdmin = (
  state: EnterpriseCustomerAdminState = initialState,
  action: AnyAction,
): EnterpriseCustomerAdminState => {
  switch (action.type) {
    case FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS: {
      const data = action.payload.data as EnterpriseCustomerAdminData;
      return {
        ...state,
        loading: false,
        error: null,
        completedTourFlows: data.completed_tour_flows,
        enterpriseCustomerUser: data.enterprise_customer_user,
        lastLogin: data.last_login,
        onboardingTourCompleted: data.onboarding_tour_completed,
        onboardingTourDismissed: data.onboarding_tour_dismissed,
        uuid: data.uuid,
      };
    }
    case FETCH_ENTERPRISE_CUSTOMER_ADMIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error,
      };
    case SET_ONBOARDING_TOUR_DISMISSED:
      return {
        ...state,
        onboardingTourDismissed: action.payload.dismissed,
      };
    default:
      return state;
  }
};

export default enterpriseCustomerAdmin;
