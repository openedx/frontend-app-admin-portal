import { renderHook } from '@testing-library/react-hooks/dom';
import { waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import LicenseManagerApiService from '../../../../data/services/LicenseManagerAPIService';
import { useSubscriptionUsersOverview } from '../../data/hooks';

const TEST_SUBSCRIPTION_PLAN_UUID = 'test-plan-uuid-1';

jest.mock('../../../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true,
  default: {
    fetchSubscriptionUsersOverview: jest.fn(),
  },
}));

describe('useSubscriptionUsersOverview', () => {
  const mockResponse = {
    data: [
      { status: 'activated', count: 10 },
      { status: 'assigned', count: 5 },
      { status: 'revoked', count: 1 },
    ],
  };
  const mockExpectedOverview = {
    all: 16,
    activated: 10,
    assigned: 5,
    revoked: 1,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('without search argument', async () => {
    const mockPromiseResolve = Promise.resolve(mockResponse);
    LicenseManagerApiService.fetchSubscriptionUsersOverview.mockReturnValue(mockPromiseResolve);

    const args = {
      subscriptionUUID: TEST_SUBSCRIPTION_PLAN_UUID,
      search: null,
      errors: {},
      setErrors: jest.fn(),
    };
    const { result } = renderHook(() => useSubscriptionUsersOverview(args));

    await waitFor(() => {
      expect(LicenseManagerApiService.fetchSubscriptionUsersOverview).toHaveBeenCalledTimes(1);
      expect(LicenseManagerApiService.fetchSubscriptionUsersOverview).toHaveBeenCalledWith(
        TEST_SUBSCRIPTION_PLAN_UUID,
        {},
      );
      expect(result.current[0]).toStrictEqual(
        expect.objectContaining(mockExpectedOverview),
      );
    });
  });

  test('with search argument', async () => {
    const mockPromiseResolve = Promise.resolve(mockResponse);
    LicenseManagerApiService.fetchSubscriptionUsersOverview.mockReturnValue(mockPromiseResolve);

    const args = {
      subscriptionUUID: TEST_SUBSCRIPTION_PLAN_UUID,
      search: 'query',
      errors: {},
      setErrors: jest.fn(),
    };

    const { result } = renderHook(() => useSubscriptionUsersOverview(args));

    await waitFor(() => {
      expect(LicenseManagerApiService.fetchSubscriptionUsersOverview).toHaveBeenCalledTimes(1);
      expect(LicenseManagerApiService.fetchSubscriptionUsersOverview).toHaveBeenCalledWith(
        TEST_SUBSCRIPTION_PLAN_UUID,
        { search: 'query' },
      );
      expect(result.current[0]).toStrictEqual(
        expect.objectContaining(mockExpectedOverview),
      );
    });
  });
});
