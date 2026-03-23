import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';

import useBulkCancelApprovedRequests from '../useBulkCancelApprovedRequests';
import EnterpriseAccessApiService from '../../../../../data/services/EnterpriseAccessApiService';
import { learnerCreditManagementQueryKeys } from '../../constants';

jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
}));

jest.mock('../../../../../data/services/EnterpriseAccessApiService');

jest.mock('../useBudgetId', () => jest.fn(() => ({ subsidyAccessPolicyId: 'policy-uuid' })));

const wrapperFactory = (queryClient) => function Wrapper({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useBulkCancelApprovedRequests', () => {
  let queryClient;
  let invalidateQueriesSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient();
    invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries');
  });

  it('cancels approved requests successfully and invalidates budget query', async () => {
    const mockResponse = { status: 200 };
    const onSuccess = jest.fn();
    EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequests.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBulkCancelApprovedRequests({
      subsidyRequestUUIDs: ['req-1', 'req-2'],
      enterpriseId: 'enterprise-1',
      onSuccess,
    }), {
      wrapper: wrapperFactory(queryClient),
    });

    expect(result.current.cancelButtonState).toBe('default');

    let mutationResult;
    await act(async () => {
      mutationResult = await result.current.cancelApprovedRequests();
    });

    expect(EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequests).toHaveBeenCalledWith({
      enterpriseId: 'enterprise-1',
      subsidyRequestUUIDs: ['req-1', 'req-2'],
    });
    expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    expect(mutationResult).toEqual({ success: true, response: mockResponse });

    await waitFor(() => {
      expect(result.current.cancelButtonState).toBe('complete');
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: learnerCreditManagementQueryKeys.budget('policy-uuid'),
    });
  });

  it('handles failed cancellation by logging, setting error state, and calling onFailure', async () => {
    const error = new Error('Cancellation failed');
    const onFailure = jest.fn();
    EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequests.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useBulkCancelApprovedRequests({
      subsidyRequestUUIDs: ['req-1'],
      enterpriseId: 'enterprise-1',
      onFailure,
    }), {
      wrapper: wrapperFactory(queryClient),
    });

    await act(async () => {
      await expect(result.current.cancelApprovedRequests()).rejects.toThrow('Cancellation failed');
    });

    await waitFor(() => {
      expect(result.current.cancelButtonState).toBe('error');
    });

    expect(logError).toHaveBeenCalledWith(error);
    expect(onFailure).toHaveBeenCalledWith(error);
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it('handles partial failures by calling onPartialFailure with failed and successful UUIDs', async () => {
    const onPartialFailure = jest.fn();
    const onSuccess = jest.fn();
    const mockResponse = {
      status: 200,
      data: {
        failed_request_uuids: ['req-2'],
      },
    };
    EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequests.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBulkCancelApprovedRequests({
      subsidyRequestUUIDs: ['req-1', 'req-2'],
      enterpriseId: 'enterprise-1',
      onPartialFailure,
      onSuccess,
    }), {
      wrapper: wrapperFactory(queryClient),
    });

    let mutationResult;
    await act(async () => {
      mutationResult = await result.current.cancelApprovedRequests();
    });

    expect(onPartialFailure).toHaveBeenCalledWith({
      failedUUIDs: ['req-2'],
      successfulUUIDs: ['req-1'],
    });
    expect(onSuccess).toHaveBeenCalledWith(mockResponse);
    expect(mutationResult).toEqual({ success: true, response: mockResponse });
  });
});
