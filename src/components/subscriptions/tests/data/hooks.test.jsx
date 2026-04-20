import { renderHook, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { logError } from '@edx/frontend-platform/logging';

import LicenseManagerApiService from '../../../../data/services/LicenseManagerAPIService';
import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import {
  useStripeSubscriptionPlanInfo,
  useSubscriptionUsersOverview,
  useStripeEventsBySubscription,
} from '../../data/hooks';

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
        is_canceled: false,
        renewed_subscription_plan_uuid: null,
      },
    };

    EnterpriseAccessApiService.fetchStripeEvent.mockResolvedValue(mockResponse);

    const setErrors = jest.fn();

    const { result } = renderHook(() => useStripeSubscriptionPlanInfo({
      subPlanUuid: TEST_PLAN_UUID,
      setErrors,
    }));

    await waitFor(() => {
      expect(EnterpriseAccessApiService.fetchStripeEvent).toHaveBeenCalledTimes(1);
      expect(result.current.invoiceAmount).toBe(150);
      expect(result.current.currency).toBe('usd');
      expect(result.current.canceledDate).toBe(null);
      expect(result.current.isCanceled).toBe(false);
      expect(result.current.renewedSubscriptionPlanUuid).toBe(null);
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
        is_canceled: false,
        renewed_subscription_plan_uuid: null,
      },
    };

    EnterpriseAccessApiService.fetchStripeEvent.mockResolvedValue(mockResponse);

    const setErrors = jest.fn();

    const { result } = renderHook(() => useStripeSubscriptionPlanInfo({
      subPlanUuid: TEST_PLAN_UUID,
      setErrors,
    }));

    await waitFor(() => {
      expect(EnterpriseAccessApiService.fetchStripeEvent).toHaveBeenCalledTimes(1);
      expect(result.current.invoiceAmount).toBe(null);
      expect(result.current.currency).toBe(null);
      expect(result.current.canceledDate).toBe('2025-09-15T19:56:09Z');
      expect(result.current.isCanceled).toBe(false);
      expect(result.current.renewedSubscriptionPlanUuid).toBe(null);
      expect(result.current.loadingStripeSummary).toBe(false);
      expect(setErrors).not.toHaveBeenCalled();
    });
  });

  test('fetches StripeEventSummary with isCanceled=true and renewedSubscriptionPlanUuid set', async () => {
    const mockResponse = {
      data: {
        upcoming_invoice_amount_due: null,
        currency: null,
        canceled_date: null,
        is_canceled: true,
        renewed_subscription_plan_uuid: 'renewed-plan-uuid',
      },
    };

    EnterpriseAccessApiService.fetchStripeEvent.mockResolvedValue(mockResponse);

    const setErrors = jest.fn();

    const { result } = renderHook(() => useStripeSubscriptionPlanInfo({
      subPlanUuid: TEST_PLAN_UUID,
      setErrors,
    }));

    await waitFor(() => {
      expect(result.current.isCanceled).toBe(true);
      expect(result.current.renewedSubscriptionPlanUuid).toBe('renewed-plan-uuid');
      expect(result.current.loadingStripeSummary).toBe(false);
    });
  });

  test('fetches StripeEventSummary with 404 error ', async () => {
    EnterpriseAccessApiService.fetchStripeEvent.mockResolvedValue({ status: 404 });

    const setErrors = jest.fn();

    const { result } = renderHook(() => useStripeSubscriptionPlanInfo({
      subPlanUuid: TEST_PLAN_UUID,
      setErrors,
    }));

    await waitFor(() => {
      expect(EnterpriseAccessApiService.fetchStripeEvent).toHaveBeenCalledTimes(1);
      expect(result.current.invoiceAmount).toBe(null);
      expect(result.current.currency).toBe(null);
      expect(result.current.canceledDate).toBe(null);
      expect(result.current.isCanceled).toBe(false);
      expect(result.current.renewedSubscriptionPlanUuid).toBe(null);
      expect(result.current.loadingStripeSummary).toBe(false);
      // doesn't return an error if it's 404, just null values
      expect(setErrors).not.toHaveBeenCalled();
    });
  });
});

describe('useStripeEventsBySubscription', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  const makeSubscriptions = (uuids) => ({
    results: uuids.map(uuid => ({ uuid })),
  });

  test('fetches Stripe info for all subscriptions in parallel', async () => {
    const uuid1 = 'uuid-1';
    const uuid2 = 'uuid-2';
    EnterpriseAccessApiService.fetchStripeEvent.mockImplementation(uuid => Promise.resolve({
      data: {
        upcoming_invoice_amount_due: 5000,
        currency: 'usd',
        canceled_date: null,
        is_canceled: false,
        renewed_subscription_plan_uuid: null,
        uuid,
      },
    }));

    const setErrors = jest.fn();
    const subscriptions = makeSubscriptions([uuid1, uuid2]);
    const { result } = renderHook(() => useStripeEventsBySubscription({
      subscriptions,
      setErrors,
    }));

    await waitFor(() => {
      expect(EnterpriseAccessApiService.fetchStripeEvent).toHaveBeenCalledTimes(2);
      expect(result.current.stripeInfoByUuid).toHaveProperty(uuid1);
      expect(result.current.stripeInfoByUuid).toHaveProperty(uuid2);
      expect(result.current.loadingStripeInfo).toBe(false);
    });
  });

  test('sets loadingStripeInfo=false and clears stripeInfoByUuid when subscriptions is empty', async () => {
    const setErrors = jest.fn();
    const { result } = renderHook(() => useStripeEventsBySubscription({
      subscriptions: { results: [] },
      setErrors,
    }));

    await waitFor(() => {
      expect(result.current.loadingStripeInfo).toBe(false);
      expect(result.current.stripeInfoByUuid).toEqual({});
      expect(EnterpriseAccessApiService.fetchStripeEvent).not.toHaveBeenCalled();
    });
  });

  test('resets loadingStripeInfo to true when subscriptions changes and a new fetch begins', async () => {
    const uuid1 = 'uuid-reload-1';
    const uuid2 = 'uuid-reload-2';
    const stripeResponseUuid2 = {
      data: {
        upcoming_invoice_amount_due: 0,
        currency: 'usd',
        canceled_date: null,
        is_canceled: false,
        renewed_subscription_plan_uuid: null,
        uuid: uuid2,
      },
    };
    const stripeResponseUuid1 = {
      data: {
        upcoming_invoice_amount_due: 100,
        currency: 'usd',
        canceled_date: null,
        is_canceled: false,
        renewed_subscription_plan_uuid: null,
        uuid: uuid1,
      },
    };

    let resolveFirst;
    EnterpriseAccessApiService.fetchStripeEvent
      .mockImplementationOnce(() => new Promise(resolve => { resolveFirst = resolve; }))
      .mockResolvedValue(stripeResponseUuid2);

    const setErrors = jest.fn();
    let subscriptions = { results: [{ uuid: uuid1 }] };
    const { result, rerender } = renderHook(
      ({ subs }) => useStripeEventsBySubscription({ subscriptions: subs, setErrors }),
      { initialProps: { subs: subscriptions } },
    );

    // While first fetch is in-flight, loadingStripeInfo should be true
    expect(result.current.loadingStripeInfo).toBe(true);

    // Resolve first fetch so the hook settles
    resolveFirst(stripeResponseUuid1);
    await waitFor(() => expect(result.current.loadingStripeInfo).toBe(false));

    // Re-render with new subscriptions — loadingStripeInfo must go back to true
    subscriptions = { results: [{ uuid: uuid2 }] };
    rerender({ subs: subscriptions });
    expect(result.current.loadingStripeInfo).toBe(true);

    await waitFor(() => expect(result.current.loadingStripeInfo).toBe(false));
  });

  test('computes suppressedSubscriptionUuids when isCanceled=true (tested via useSubscriptionData integration)', async () => {
    // This test verifies the raw stripeInfoByUuid data from the hook
    const trialUuid = 'trial-uuid';
    const renewedUuid = 'renewed-uuid';
    EnterpriseAccessApiService.fetchStripeEvent.mockResolvedValue({
      data: {
        upcoming_invoice_amount_due: null,
        currency: null,
        canceled_date: null,
        is_canceled: true,
        renewed_subscription_plan_uuid: renewedUuid,
      },
    });

    const setErrors = jest.fn();
    const subscriptions = makeSubscriptions([trialUuid]);
    const { result } = renderHook(() => useStripeEventsBySubscription({
      subscriptions,
      setErrors,
    }));

    await waitFor(() => {
      expect(result.current.stripeInfoByUuid[trialUuid]).toMatchObject({
        isCanceled: true,
        renewedSubscriptionPlanUuid: renewedUuid,
      });
      expect(result.current.loadingStripeInfo).toBe(false);
    });
  });

  test('sets STRIPE_EVENT_SUMMARY error and loadingStripeInfo=false when fetchAll rejects', async () => {
    const syncError = new Error('Unexpected sync error');
    // Throwing synchronously inside the map causes fetchAll() to reject, triggering .catch
    EnterpriseAccessApiService.fetchStripeEvent.mockImplementation(() => { throw syncError; });

    const setErrors = jest.fn();
    const subscriptions = makeSubscriptions(['uuid-1']);
    const { result } = renderHook(() => useStripeEventsBySubscription({
      subscriptions,
      setErrors,
    }));

    await waitFor(() => {
      expect(logError).toHaveBeenCalledWith(syncError);
      expect(setErrors).toHaveBeenCalledTimes(1);
      expect(result.current.loadingStripeInfo).toBe(false);
    });
  });

  test('logs error and sets STRIPE_EVENT_SUMMARY when one fetchStripeEvent rejects asynchronously (partial success)', async () => {
    const networkError = new Error('Network error');
    const uuid1 = 'uuid-success';
    const uuid2 = 'uuid-fail';
    const successResponse = {
      data: {
        upcoming_invoice_amount_due: 5000,
        currency: 'usd',
        canceled_date: null,
        is_canceled: false,
        renewed_subscription_plan_uuid: null,
      },
    };
    EnterpriseAccessApiService.fetchStripeEvent
      .mockResolvedValueOnce(successResponse)
      .mockRejectedValueOnce(networkError);

    const setErrors = jest.fn();
    const subscriptions = makeSubscriptions([uuid1, uuid2]);
    const { result } = renderHook(() => useStripeEventsBySubscription({
      subscriptions,
      setErrors,
    }));

    await waitFor(() => {
      // The successful fetch is preserved
      expect(result.current.stripeInfoByUuid[uuid1]).not.toBeNull();
      // The failed fetch is stored as null
      expect(result.current.stripeInfoByUuid).toHaveProperty(uuid2, null);
      // The rejection is logged
      expect(logError).toHaveBeenCalledWith(networkError);
      // The error state is set exactly once
      expect(setErrors).toHaveBeenCalledTimes(1);
      expect(result.current.loadingStripeInfo).toBe(false);
    });
  });

  test('stores null for subscriptions when API returns no data (e.g. 404)', async () => {
    const uuid1 = 'uuid-no-data';
    EnterpriseAccessApiService.fetchStripeEvent.mockResolvedValue({ status: 404 });

    const setErrors = jest.fn();
    const subscriptions = makeSubscriptions([uuid1]);
    const { result } = renderHook(() => useStripeEventsBySubscription({
      subscriptions,
      setErrors,
    }));

    await waitFor(() => {
      // 404 response has no .data, so uuid1 is stored as null (key present, value null)
      // This allows SubscriptionCard to detect the fetch completed (not still loading)
      expect(result.current.stripeInfoByUuid).toHaveProperty(uuid1, null);
      expect(result.current.loadingStripeInfo).toBe(false);
    });
  });
});
