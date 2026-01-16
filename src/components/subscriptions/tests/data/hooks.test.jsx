import { renderHook, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import LicenseManagerApiService from '../../../../data/services/LicenseManagerAPIService';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { useStripeSubscriptionPlanInfo, useSubscriptionUsersOverview } from '../../data/hooks';

const TEST_SUBSCRIPTION_PLAN_UUID = 'test-plan-uuid-1';

jest.mock('../../../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true,
  default: {
    fetchSubscriptionUsersOverview: jest.fn(),
  },
}));

jest.mock('../../../../data/services/EnterpriseAccessApiService', () => ({
  __esModule: true,
  default: {
    fetchStripeEvent: jest.fn(),
  },
}));

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));

jest.mock('../../../../utils', () => ({
  camelCaseObject: jest.fn(obj => obj), // just return as-is for simplicity
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

describe('useStripeSubscriptionPlanInfo', () => {
  const TEST_PLAN_UUID = 'test-plan-uuid-1';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('fetches StripeEventSummary successfully for trial plan', async () => {
    const mockResponse = {
      data: {
        upcoming_invoice_amount_due: 15000,
        currency: 'usd',
        canceled_date: null,
      },
    };

    EnterpriseAccessApiService.fetchStripeEvent.mockResolvedValue(mockResponse);

    const setErrors = jest.fn();

    const { result } = renderHook(() => useStripeSubscriptionPlanInfo({
      uuid: TEST_PLAN_UUID,
      setErrors,
    }));

    await waitFor(() => {
      expect(EnterpriseAccessApiService.fetchStripeEvent).toHaveBeenCalledTimes(1);
      expect(result.current.invoiceAmount).toBe(150);
      expect(result.current.currency).toBe('usd');
      expect(result.current.canceledDate).toBe(null);
      expect(result.current.loadingStripeSummary).toBe(false);
      expect(setErrors).not.toHaveBeenCalled();
    });
  });

  test('fetches StripeEventSummary with cancellation information ', async () => {
    const mockResponse = {
      data: {
        upcoming_invoice_amount_due: null,
        currency: null,
        canceled_date: '2025-09-15T19:56:09Z',
      },
    };

    EnterpriseAccessApiService.fetchStripeEvent.mockResolvedValue(mockResponse);

    const setErrors = jest.fn();

    const { result } = renderHook(() => useStripeSubscriptionPlanInfo({
      uuid: TEST_PLAN_UUID,
      setErrors,
    }));

    await waitFor(() => {
      expect(EnterpriseAccessApiService.fetchStripeEvent).toHaveBeenCalledTimes(1);
      expect(result.current.invoiceAmount).toBe(0);
      expect(result.current.currency).toBe(null);
      expect(result.current.canceledDate).toBe('2025-09-15T19:56:09Z');
      expect(result.current.loadingStripeSummary).toBe(false);
      expect(setErrors).not.toHaveBeenCalled();
    });
  });
});
