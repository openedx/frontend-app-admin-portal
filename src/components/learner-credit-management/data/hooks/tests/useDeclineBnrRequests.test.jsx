import { useParams } from 'react-router-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { logError } from '@edx/frontend-platform/logging';

import EnterpriseAccessApiService from '../../../../../data/services/EnterpriseAccessApiService';
import useDeclineBnrRequests from '../useDeclineBnrRequests';
import { queryClient } from '../../../../test/testUtils';

const TEST_ENTERPRISE_ID = 'test-enterprise-id';
const TEST_SUBSIDY_ACCESS_POLICY_ID = 'a52e6548-649f-4576-b73f-c5c2bee25e9c';
const TEST_REQUEST_UUID_1 = 'test-request-uuid-1';
const TEST_REQUEST_UUID_2 = 'test-request-uuid-2';
const TEST_DECLINE_REASON = 'Course not approved for this budget';

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>{children}</QueryClientProvider>
);

jest.mock('../../../../../data/services/EnterpriseAccessApiService');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

describe('useDeclineBnrRequests', () => {
  beforeEach(() => {
    useParams.mockReturnValue({
      budgetId: TEST_SUBSIDY_ACCESS_POLICY_ID,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return default state on initial render', () => {
    const { result } = renderHook(
      () => useDeclineBnrRequests(
        TEST_ENTERPRISE_ID,
        [TEST_REQUEST_UUID_1],
      ),
      { wrapper },
    );

    expect(result.current).toEqual({
      declineButtonState: 'default',
      declineBnrRequests: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should send a post request to decline a single request', async () => {
    EnterpriseAccessApiService.declineBnrSubsidyRequest.mockResolvedValueOnce({ status: 200 });
    const { result } = renderHook(
      () => useDeclineBnrRequests(
        TEST_ENTERPRISE_ID,
        [TEST_REQUEST_UUID_1],
      ),
      { wrapper },
    );

    await waitFor(() => result.current.declineBnrRequests(TEST_DECLINE_REASON));

    expect(EnterpriseAccessApiService.declineBnrSubsidyRequest).toHaveBeenCalledWith({
      enterpriseId: TEST_ENTERPRISE_ID,
      subsidyRequestUUID: TEST_REQUEST_UUID_1,
      sendNotification: true,
      declineReason: TEST_DECLINE_REASON,
    });
    expect(logError).toBeCalledTimes(0);

    expect(result.current).toEqual({
      declineButtonState: 'complete',
      declineBnrRequests: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should send post requests to decline multiple requests sequentially', async () => {
    EnterpriseAccessApiService.declineBnrSubsidyRequest.mockResolvedValue({ status: 200 });
    const { result } = renderHook(
      () => useDeclineBnrRequests(
        TEST_ENTERPRISE_ID,
        [TEST_REQUEST_UUID_1, TEST_REQUEST_UUID_2],
      ),
      { wrapper },
    );

    await waitFor(() => result.current.declineBnrRequests(TEST_DECLINE_REASON));

    // Should have been called twice, once for each request
    expect(EnterpriseAccessApiService.declineBnrSubsidyRequest).toHaveBeenCalledTimes(2);
    expect(EnterpriseAccessApiService.declineBnrSubsidyRequest).toHaveBeenNthCalledWith(1, {
      enterpriseId: TEST_ENTERPRISE_ID,
      subsidyRequestUUID: TEST_REQUEST_UUID_1,
      sendNotification: true,
      declineReason: TEST_DECLINE_REASON,
    });
    expect(EnterpriseAccessApiService.declineBnrSubsidyRequest).toHaveBeenNthCalledWith(2, {
      enterpriseId: TEST_ENTERPRISE_ID,
      subsidyRequestUUID: TEST_REQUEST_UUID_2,
      sendNotification: true,
      declineReason: TEST_DECLINE_REASON,
    });
    expect(logError).toBeCalledTimes(0);

    expect(result.current).toEqual({
      declineButtonState: 'complete',
      declineBnrRequests: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should stop processing if one request fails (atomic behavior)', async () => {
    const error = new Error('An error occurred');
    // First request succeeds, second fails
    EnterpriseAccessApiService.declineBnrSubsidyRequest
      .mockResolvedValueOnce({ status: 200 })
      .mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => useDeclineBnrRequests(
        TEST_ENTERPRISE_ID,
        [TEST_REQUEST_UUID_1, TEST_REQUEST_UUID_2],
      ),
      { wrapper },
    );

    await waitFor(async () => {
      try {
        await result.current.declineBnrRequests(TEST_DECLINE_REASON);
      } catch (e) {
        // Expected to throw
      }
    });

    // Should have been called twice - first succeeded, second failed
    expect(EnterpriseAccessApiService.declineBnrSubsidyRequest).toHaveBeenCalledTimes(2);
    expect(logError).toBeCalledTimes(1);

    expect(result.current).toEqual({
      declineButtonState: 'error',
      declineBnrRequests: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should handle decline error on first request', async () => {
    const error = new Error('An error occurred');
    EnterpriseAccessApiService.declineBnrSubsidyRequest.mockRejectedValueOnce(error);
    const { result } = renderHook(
      () => useDeclineBnrRequests(
        TEST_ENTERPRISE_ID,
        [TEST_REQUEST_UUID_1, TEST_REQUEST_UUID_2],
      ),
      { wrapper },
    );

    await waitFor(async () => {
      try {
        await result.current.declineBnrRequests(TEST_DECLINE_REASON);
      } catch (e) {
        // Expected to throw
      }
    });

    // Should only be called once since first request failed
    expect(EnterpriseAccessApiService.declineBnrSubsidyRequest).toHaveBeenCalledTimes(1);
    expect(logError).toBeCalledTimes(1);

    expect(result.current).toEqual({
      declineButtonState: 'error',
      declineBnrRequests: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should toggle modal open state', async () => {
    const { result } = renderHook(
      () => useDeclineBnrRequests(
        TEST_ENTERPRISE_ID,
        [TEST_REQUEST_UUID_1],
      ),
      { wrapper },
    );

    expect(result.current.isOpen).toBe(false);

    await waitFor(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    await waitFor(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });
});
