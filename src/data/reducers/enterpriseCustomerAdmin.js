import {
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST,
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS,
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_FAILURE,
  SET_ONBOARDING_TOUR_DISMISSED,
} from '../constants/enterpriseCustomerAdmin';

const initialState = {
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

const enterpriseCustomerAdmin = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        completedTourFlows: action.payload.data.completed_tour_flows,
        enterpriseCustomerUser: action.payload.data.enterprise_customer_user,
        lastLogin: action.payload.data.last_login,
        onboardingTourCompleted: action.payload.data.onboarding_tour_completed,
        onboardingTourDismissed: action.payload.data.onboarding_tour_dismissed,
        uuid: action.payload.data.uuid,
      };
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
