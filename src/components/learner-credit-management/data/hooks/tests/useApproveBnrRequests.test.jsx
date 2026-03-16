import { useParams } from 'react-router-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { logError } from '@edx/frontend-platform/logging';

import EnterpriseAccessApiService from '../../../../../data/services/EnterpriseAccessApiService';
import useApproveBnrRequests from '../useApproveBnrRequests';
import { queryClient } from '../../../../test/testUtils';

const TEST_ENTERPRISE_ID = 'test-enterprise-id';
const TEST_SUBSIDY_ACCESS_POLICY_ID = 'a52e6548-649f-4576-b73f-c5c2bee25e9c';
const TEST_REQUEST_UUIDS = ['uuid-1', 'uuid-2'];

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
      () => useApproveBnrRequests(TEST_ENTERPRISE_ID),
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

  it('should call approveAllBnrSubsidyRequests when entire table is selected', async () => {
    EnterpriseAccessApiService.approveAllBnrSubsidyRequests.mockResolvedValueOnce({
      status: 202,
      data: {
        approved: ['uuid-1', 'uuid-2'],
        failed: [],
      },
    });
    const { result } = renderHook(
      () => useApproveBnrRequests(TEST_ENTERPRISE_ID, [], true),
      { wrapper },
    );

    await waitFor(() => result.current.approveBnrRequests());

    expect(
      EnterpriseAccessApiService.approveAllBnrSubsidyRequests,
    ).toHaveBeenCalledWith({
      enterpriseId: TEST_ENTERPRISE_ID,
      subsidyAccessPolicyId: TEST_SUBSIDY_ACCESS_POLICY_ID,
    });
    expect(EnterpriseAccessApiService.approveBnrSubsidyRequest).not.toHaveBeenCalled();
    expect(logError).toBeCalledTimes(0);

    expect(result.current).toEqual({
      approveButtonState: 'complete',
      approveBnrRequests: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should call approveBnrSubsidyRequest with selected UUIDs when specific rows are selected', async () => {
    EnterpriseAccessApiService.approveBnrSubsidyRequest.mockResolvedValueOnce({
      status: 200,
    });
    const { result } = renderHook(
      () => useApproveBnrRequests(TEST_ENTERPRISE_ID, TEST_REQUEST_UUIDS, false),
      { wrapper },
    );

    await waitFor(() => result.current.approveBnrRequests());

    expect(
      EnterpriseAccessApiService.approveBnrSubsidyRequest,
    ).toHaveBeenCalledWith({
      enterpriseId: TEST_ENTERPRISE_ID,
      subsidyAccessPolicyId: TEST_SUBSIDY_ACCESS_POLICY_ID,
      subsidyRequestUUIDs: TEST_REQUEST_UUIDS,
    });
    expect(EnterpriseAccessApiService.approveAllBnrSubsidyRequests).not.toHaveBeenCalled();
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
    EnterpriseAccessApiService.approveAllBnrSubsidyRequests.mockRejectedValueOnce(
      error,
    );
    const { result } = renderHook(
      () => useApproveBnrRequests(TEST_ENTERPRISE_ID, [], true),
      { wrapper },
    );

    await waitFor(async () => {
      try {
        await result.current.approveBnrRequests();
      } catch (e) {
        // Expected to throw
      }
    });

    expect(
      EnterpriseAccessApiService.approveAllBnrSubsidyRequests,
    ).toHaveBeenCalled();
    expect(logError).toBeCalledTimes(1);

    expect(result.current).toEqual({
      approveButtonState: 'error',
      approveBnrRequests: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should handle partial failure with error_message from response', async () => {
    const partialFailureResponse = {
      status: 422,
      data: {
        approved: ['uuid-1'],
        failed: ['uuid-2'],
        error_message: 'Allocation failed for some requests',
      },
    };
    EnterpriseAccessApiService.approveAllBnrSubsidyRequests.mockResolvedValueOnce(
      partialFailureResponse,
    );
    const { result } = renderHook(
      () => useApproveBnrRequests(TEST_ENTERPRISE_ID, [], true),
      { wrapper },
    );

    await waitFor(async () => {
      try {
        await result.current.approveBnrRequests();
      } catch (e) {
        // Expected to throw due to partial failure
        expect(e.message).toBe('Allocation failed for some requests');
      }
    });

    expect(
      EnterpriseAccessApiService.approveAllBnrSubsidyRequests,
    ).toHaveBeenCalledWith({
      enterpriseId: TEST_ENTERPRISE_ID,
      subsidyAccessPolicyId: TEST_SUBSIDY_ACCESS_POLICY_ID,
    });
    expect(logError).toHaveBeenCalledTimes(1);

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
      () => useApproveBnrRequests(TEST_ENTERPRISE_ID),
      { wrapper },
    );

    expect(result.current.isOpen).toBe(false);

    await waitFor(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    await waitFor(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });
});
