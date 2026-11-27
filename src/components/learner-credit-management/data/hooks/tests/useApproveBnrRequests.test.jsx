import { useParams } from 'react-router-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { logError } from '@edx/frontend-platform/logging';

import EnterpriseAccessApiService from '../../../../../data/services/EnterpriseAccessApiService';
import useApproveBnrRequests from '../useApproveBnrRequests';
import { queryClient } from '../../../../test/testUtils';

const TEST_ENTERPRISE_ID = 'test-enterprise-id';
const TEST_SUBSIDY_ACCESS_POLICY_ID = 'a52e6548-649f-4576-b73f-c5c2bee25e9c';
const TEST_REQUEST_UUID_1 = 'test-request-uuid-1';
const TEST_REQUEST_UUID_2 = 'test-request-uuid-2';

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

describe('useApproveBnrRequests', () => {
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
      () => useApproveBnrRequests(
        TEST_ENTERPRISE_ID,
        [TEST_REQUEST_UUID_1],
      ),
      { wrapper },
    );

    expect(result.current).toEqual({
      approveButtonState: 'default',
      approveBnrRequests: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should send a post request to approve a single request', async () => {
    EnterpriseAccessApiService.approveBnrSubsidyRequest.mockResolvedValueOnce({ status: 200 });
    const { result } = renderHook(
      () => useApproveBnrRequests(
        TEST_ENTERPRISE_ID,
        [TEST_REQUEST_UUID_1],
      ),
      { wrapper },
    );

    await waitFor(() => result.current.approveBnrRequests());

    expect(EnterpriseAccessApiService.approveBnrSubsidyRequest).toHaveBeenCalledWith({
      enterpriseId: TEST_ENTERPRISE_ID,
      subsidyAccessPolicyId: TEST_SUBSIDY_ACCESS_POLICY_ID,
      subsidyRequestUUIDs: [TEST_REQUEST_UUID_1],
    });
    expect(logError).toBeCalledTimes(0);

    expect(result.current).toEqual({
      approveButtonState: 'complete',
      approveBnrRequests: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should send a post request to approve multiple requests', async () => {
    EnterpriseAccessApiService.approveBnrSubsidyRequest.mockResolvedValueOnce({ status: 200 });
    const { result } = renderHook(
      () => useApproveBnrRequests(
        TEST_ENTERPRISE_ID,
        [TEST_REQUEST_UUID_1, TEST_REQUEST_UUID_2],
      ),
      { wrapper },
    );

    await waitFor(() => result.current.approveBnrRequests());

    expect(EnterpriseAccessApiService.approveBnrSubsidyRequest).toHaveBeenCalledWith({
      enterpriseId: TEST_ENTERPRISE_ID,
      subsidyAccessPolicyId: TEST_SUBSIDY_ACCESS_POLICY_ID,
      subsidyRequestUUIDs: [TEST_REQUEST_UUID_1, TEST_REQUEST_UUID_2],
    });
    expect(logError).toBeCalledTimes(0);

    expect(result.current).toEqual({
      approveButtonState: 'complete',
      approveBnrRequests: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should handle approval error', async () => {
    const error = new Error('An error occurred');
    EnterpriseAccessApiService.approveBnrSubsidyRequest.mockRejectedValueOnce(error);
    const { result } = renderHook(
      () => useApproveBnrRequests(
        TEST_ENTERPRISE_ID,
        [TEST_REQUEST_UUID_1],
      ),
      { wrapper },
    );

    await waitFor(async () => {
      try {
        await result.current.approveBnrRequests();
      } catch (e) {
        // Expected to throw
      }
    });

    expect(EnterpriseAccessApiService.approveBnrSubsidyRequest).toHaveBeenCalled();
    expect(logError).toBeCalledTimes(1);

    expect(result.current).toEqual({
      approveButtonState: 'error',
      approveBnrRequests: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should toggle modal open state', async () => {
    const { result } = renderHook(
      () => useApproveBnrRequests(
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
