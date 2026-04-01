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
jest.mock('../useBnrSubsidyRequests', () => ({
  applyFiltersToOptions: jest.fn(),
}));

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
    const mockResponse = { status: 200, data: {} };
    EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequests.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBulkCancelApprovedRequests(
      ['req-1', 'req-2'],
      'enterprise-1',
      false,
      [],
    ), {
      wrapper: wrapperFactory(queryClient),
    });

    expect(result.current.cancelButtonState).toBe('default');

    await act(async () => {
      await result.current.cancelApprovedRequests();
    });

    expect(EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequests).toHaveBeenCalledWith({
      enterpriseId: 'enterprise-1',
      subsidyRequestUUIDs: ['req-1', 'req-2'],
    });

    await waitFor(() => {
      expect(result.current.cancelButtonState).toBe('complete');
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: learnerCreditManagementQueryKeys.budget('policy-uuid'),
    });
  });

  it('handles failed cancellation by logging and setting error state', async () => {
    const error = new Error('Cancellation failed');
    EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequests.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useBulkCancelApprovedRequests(
      ['req-1'],
      'enterprise-1',
      false,
      [],
    ), {
      wrapper: wrapperFactory(queryClient),
    });

    await act(async () => {
      await result.current.cancelApprovedRequests();
    });

    await waitFor(() => {
      expect(result.current.cancelButtonState).toBe('error');
    });

    expect(logError).toHaveBeenCalledWith(error);
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });

  it('calls cancelAllApprovedBnrSubsidyRequests when cancelAll is true', async () => {
    const mockResponse = { status: 202, data: {} };
    EnterpriseAccessApiService.cancelAllApprovedBnrSubsidyRequests.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBulkCancelApprovedRequests(
      [],
      'enterprise-1',
      true,
      [],
    ), {
      wrapper: wrapperFactory(queryClient),
    });

    await act(async () => {
      await result.current.cancelApprovedRequests();
    });

    expect(EnterpriseAccessApiService.cancelAllApprovedBnrSubsidyRequests).toHaveBeenCalledWith({
      enterpriseId: 'enterprise-1',
      subsidyAccessPolicyId: 'policy-uuid',
      options: {},
    });
    expect(EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequests).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(result.current.cancelButtonState).toBe('complete');
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: learnerCreditManagementQueryKeys.budget('policy-uuid'),
    });
  });

  it('sets error state when cancelAll fails', async () => {
    const error = new Error('Cancel all failed');
    EnterpriseAccessApiService.cancelAllApprovedBnrSubsidyRequests.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useBulkCancelApprovedRequests(
      [],
      'enterprise-1',
      true,
      [],
    ), {
      wrapper: wrapperFactory(queryClient),
    });

    await act(async () => {
      await result.current.cancelApprovedRequests();
    });

    await waitFor(() => {
      expect(result.current.cancelButtonState).toBe('error');
    });

    expect(logError).toHaveBeenCalledWith(error);
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
  });
});
