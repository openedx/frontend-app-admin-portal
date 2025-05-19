import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import {
  fetchLoggedInEnterpriseAdmin,
  dismissOnboardingTour,
  reopenOnboardingTour,
} from './enterpriseCustomerAdmin';

import {
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST,
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS,
  FETCH_ENTERPRISE_CUSTOMER_ADMIN_FAILURE,
  DISMISS_ONBOARDING_TOUR_SUCCESS,
  DISMISS_ONBOARDING_TOUR_FAILURE,
  SET_ONBOARDING_TOUR_DISMISSED,
} from '../constants/enterpriseCustomerAdmin';

import LmsApiService from '../services/LmsApiService';

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('../services/LmsApiService', () => ({
  fetchLoggedInEnterpriseAdminProfile: jest.fn(),
  postOnboardingTourDismissed: jest.fn(),
}));

const mockStore = configureMockStore([thunk]);

describe('enterpriseCustomerAdmin actions', () => {
  let store: any;

  beforeEach(() => {
    store = mockStore();
    jest.clearAllMocks();
  });

  describe('fetchLoggedInEnterpriseAdmin', () => {
    const mockResponse = {
      data: {
        results: [
          {
            id: 1,
            user_id: 123,
            enterprise_customer_id: 'test-enterprise-id',
            role: 'admin',
          },
        ],
      },
    };

    it('dispatches success action after fetching enterprise admin profile', async () => {
      const expectedActions = [
        { type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST },
        {
          type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_SUCCESS,
          payload: {
            data: mockResponse.data.results[0],
          },
        },
      ];

      (LmsApiService.fetchLoggedInEnterpriseAdminProfile as jest.Mock).mockResolvedValue(mockResponse);

      await store.dispatch(fetchLoggedInEnterpriseAdmin());
      expect(store.getActions()).toEqual(expectedActions);
      expect(LmsApiService.fetchLoggedInEnterpriseAdminProfile).toHaveBeenCalledTimes(1);
    });

    it('dispatches failure action when fetching enterprise admin profile fails', async () => {
      const mockError = new Error('Failed to fetch admin profile');
      (LmsApiService.fetchLoggedInEnterpriseAdminProfile as jest.Mock).mockRejectedValue(mockError);

      const expectedActions = [
        { type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_REQUEST },
        {
          type: FETCH_ENTERPRISE_CUSTOMER_ADMIN_FAILURE,
          payload: { error: mockError },
        },
      ];

      await store.dispatch(fetchLoggedInEnterpriseAdmin());
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('onboarding tour actions', () => {
    describe('dismissOnboardingTour', () => {
      it('dispatches success action and sets dismissed state to true when API call succeeds', async () => {
        (LmsApiService.postOnboardingTourDismissed as jest.Mock).mockResolvedValue({});

        const expectedActions = [
          { type: DISMISS_ONBOARDING_TOUR_SUCCESS },
          {
            type: SET_ONBOARDING_TOUR_DISMISSED,
            payload: { dismissed: true },
          },
        ];

        await store.dispatch(dismissOnboardingTour());
        expect(LmsApiService.postOnboardingTourDismissed).toHaveBeenCalledWith({ value: true });
        expect(store.getActions()).toEqual(expectedActions);
      });

      it('dispatches failure action and still sets dismissed state to true when API call fails', async () => {
        const mockError = new Error('API not implemented');
        (LmsApiService.postOnboardingTourDismissed as jest.Mock).mockRejectedValue(mockError);

        const expectedActions = [
          {
            type: DISMISS_ONBOARDING_TOUR_FAILURE,
            payload: { error: mockError },
          },
          {
            type: SET_ONBOARDING_TOUR_DISMISSED,
            payload: { dismissed: true },
          },
        ];

        await store.dispatch(dismissOnboardingTour());
        expect(store.getActions()).toEqual(expectedActions);
      });
    });

    describe('reopenOnboardingTour', () => {
      it('dispatches success action and sets dismissed state to false when API call succeeds', async () => {
        (LmsApiService.postOnboardingTourDismissed as jest.Mock).mockResolvedValue({});

        const expectedActions = [
          { type: DISMISS_ONBOARDING_TOUR_SUCCESS },
          {
            type: SET_ONBOARDING_TOUR_DISMISSED,
            payload: { dismissed: false },
          },
        ];

        await store.dispatch(reopenOnboardingTour());
        expect(LmsApiService.postOnboardingTourDismissed).toHaveBeenCalledWith({ value: false });
        expect(store.getActions()).toEqual(expectedActions);
      });

      it('dispatches failure action and still sets dismissed state to false when API call fails', async () => {
        const mockError = new Error('API not implemented');
        (LmsApiService.postOnboardingTourDismissed as jest.Mock).mockRejectedValue(mockError);

        const expectedActions = [
          {
            type: DISMISS_ONBOARDING_TOUR_FAILURE,
            payload: { error: mockError },
          },
          {
            type: SET_ONBOARDING_TOUR_DISMISSED,
            payload: { dismissed: false },
          },
        ];

        await store.dispatch(reopenOnboardingTour());
        expect(store.getActions()).toEqual(expectedActions);
      });
    });
  });
});
