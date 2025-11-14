import { renderHook, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import LicenseManagerApiService from '../../../../data/services/LicenseManagerAPIService';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import { useSubscriptionUsersOverview, useUpcomingInvoiceAmount } from '../../data/hooks';

import { TRIAL } from '../../data/constants';

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

describe('useUpcomingInvoiceAmount', () => {
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
      },
    };

    EnterpriseAccessApiService.fetchStripeEvent.mockResolvedValue(mockResponse);

    const setErrors = jest.fn();

    const { result } = renderHook(() => useUpcomingInvoiceAmount({
      uuid: TEST_PLAN_UUID,
      planType: TRIAL,
      setErrors,
    }));

    await waitFor(() => {
      expect(EnterpriseAccessApiService.fetchStripeEvent).toHaveBeenCalledTimes(1);
      expect(result.current.invoiceAmount).toBe(15000);
      expect(result.current.currency).toBe('usd');
      expect(result.current.loadingStripeSummary).toBe(false);
      expect(setErrors).not.toHaveBeenCalled();
    });
  });

  test('does not fetch StripeEventSummary for non-trial plan', async () => {
    const setErrors = jest.fn();

    const { result } = renderHook(() => useUpcomingInvoiceAmount({
      uuid: TEST_PLAN_UUID,
      planType: 'Subscription',
      setErrors,
    }));

    await waitFor(() => {
      expect(EnterpriseAccessApiService.fetchStripeEvent).not.toHaveBeenCalled();
      expect(result.current.invoiceAmount).toBe(null);
      expect(result.current.currency).toBe(null);
      // hook should still mark loadingStripeSummary as true initially,
      // but we expect it to remain true since no fetch was called
      expect(result.current.loadingStripeSummary).toBe(true);
    });
  });
});
