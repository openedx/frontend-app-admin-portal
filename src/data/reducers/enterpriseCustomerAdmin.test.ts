import enterpriseCustomerAdmin, { EnterpriseCustomerAdminState } from './enterpriseCustomerAdmin';
import {
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST,
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS,
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_FAILURE,
  SET_ONBOARDING_TOUR_DISMISSED,
} from '../constants/enterpriseCustomerAdmin';

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

const adminUserData = {
  completed_tour_flows: ['dashboard', 'reporting'],
  enterprise_customer_user: {
    id: 123,
    user_id: 456,
    user_email: 'test@example.com',
  },
  last_login: '2023-05-18T15:30:00Z',
  onboarding_tour_completed: false,
  onboarding_tour_dismissed: false,
  uuid: 'test-admin-uuid',
};

describe('enterpriseCustomerAdmin reducer', () => {
  it('has initial state', () => {
    expect(enterpriseCustomerAdmin(undefined, { type: 'UNKNOWN_ACTION' })).toEqual(initialState);
  });

  it('handles FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST', () => {
    const prevState = {
      ...initialState,
      loading: false,
      error: new Error('Previous error'),
    };

    const expected = {
      ...prevState,
      loading: true,
      error: null,
    };

    expect(enterpriseCustomerAdmin(prevState, {
      type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST,
    })).toEqual(expected);
  });

  it('handles FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS', () => {
    const prevState = {
      ...initialState,
      loading: true,
      error: new Error('Previous error'),
    };

    const expected = {
      ...prevState,
      loading: false,
      error: null,
      completedTourFlows: adminUserData.completed_tour_flows,
      enterpriseCustomerUser: adminUserData.enterprise_customer_user,
      lastLogin: adminUserData.last_login,
      onboardingTourCompleted: adminUserData.onboarding_tour_completed,
      onboardingTourDismissed: adminUserData.onboarding_tour_dismissed,
      uuid: adminUserData.uuid,
    };

    expect(enterpriseCustomerAdmin(prevState, {
      type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS,
      payload: { data: adminUserData },
    })).toEqual(expected);
  });

  it('handles FETCH_ENTERPRISE_CUSTOMER_ADMIN_FAILURE', () => {
    const prevState = {
      ...initialState,
      loading: true,
    };

    const error = new Error('Failed to fetch admin data');

    const expected = {
      ...prevState,
      loading: false,
      error,
    };

    expect(enterpriseCustomerAdmin(prevState, {
      type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_FAILURE,
      payload: { error },
    })).toEqual(expected);
  });

  it('handles SET_ONBOARDING_TOUR_DISMISSED when dismissing the tour', () => {
    const prevState = {
      ...initialState,
      onboardingTourDismissed: false,
    };

    const expected = {
      ...prevState,
      onboardingTourDismissed: true,
    };

    expect(enterpriseCustomerAdmin(prevState, {
      type: SET_ONBOARDING_TOUR_DISMISSED,
      payload: { dismissed: true },
    })).toEqual(expected);
  });

  it('handles SET_ONBOARDING_TOUR_DISMISSED when reopening the tour', () => {
    const prevState = {
      ...initialState,
      onboardingTourDismissed: true,
    };

    const expected = {
      ...prevState,
      onboardingTourDismissed: false,
    };

    expect(enterpriseCustomerAdmin(prevState, {
      type: SET_ONBOARDING_TOUR_DISMISSED,
      payload: { dismissed: false },
    })).toEqual(expected);
  });
});
