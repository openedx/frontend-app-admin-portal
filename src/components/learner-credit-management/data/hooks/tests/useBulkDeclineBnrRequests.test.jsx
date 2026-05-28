import { useParams } from 'react-router-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { logError } from '@edx/frontend-platform/logging';

import EnterpriseAccessApiService from '../../../../../data/services/EnterpriseAccessApiService';
import useBulkDeclineBnrRequests from '../useBulkDeclineBnrRequests';
import { learnerCreditManagementQueryKeys } from '../../constants';
import { queryClient } from '../../../../test/testUtils';

const TEST_ENTERPRISE_ID = 'test-enterprise-id';
const TEST_SUBSIDY_ACCESS_POLICY_ID = 'a52e6548-649f-4576-b73f-c5c2bee25e9c';
const TEST_REQUEST_UUIDS = ['uuid-1', 'uuid-2'];

let testQueryClient;
const wrapper = ({ children }) => (
  <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
);

jest.mock('../../../../../data/services/EnterpriseAccessApiService');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

describe('useBulkDeclineBnrRequests', () => {
  beforeEach(() => {
    testQueryClient = queryClient();
    useParams.mockReturnValue({
      budgetId: TEST_SUBSIDY_ACCESS_POLICY_ID,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return default state on initial render', () => {
    const { result } = renderHook(
      () => useBulkDeclineBnrRequests(TEST_ENTERPRISE_ID),
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

  it('should call declineAllBnrSubsidyRequests when entire table is selected', async () => {
    EnterpriseAccessApiService.declineAllBnrSubsidyRequests.mockResolvedValueOnce({
      status: 202,
      data: {
        declined: ['uuid-1', 'uuid-2'],
        non_declinable: [],
      },
    });
    const { result } = renderHook(
      () => useBulkDeclineBnrRequests(TEST_ENTERPRISE_ID, [], true),
      { wrapper },
    );

    await waitFor(() => result.current.declineBnrRequests());

    expect(
      EnterpriseAccessApiService.declineAllBnrSubsidyRequests,
    ).toHaveBeenCalledWith({
      enterpriseId: TEST_ENTERPRISE_ID,
      subsidyAccessPolicyId: TEST_SUBSIDY_ACCESS_POLICY_ID,
      declineReason: undefined,
    });
    expect(EnterpriseAccessApiService.bulkDeclineBnrSubsidyRequests).not.toHaveBeenCalled();
    expect(logError).toBeCalledTimes(0);

    expect(result.current).toEqual({
      declineButtonState: 'complete',
      declineBnrRequests: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should forward declineReason to declineAllBnrSubsidyRequests when entire table is selected', async () => {
    EnterpriseAccessApiService.declineAllBnrSubsidyRequests.mockResolvedValueOnce({
      status: 202,
      data: { declined: ['uuid-1', 'uuid-2'], non_declinable: [] },
    });
    const { result } = renderHook(
      () => useBulkDeclineBnrRequests(TEST_ENTERPRISE_ID, [], true),
      { wrapper },
    );

    await waitFor(() => result.current.declineBnrRequests('Budget exhausted'));

    expect(
      EnterpriseAccessApiService.declineAllBnrSubsidyRequests,
    ).toHaveBeenCalledWith({
      enterpriseId: TEST_ENTERPRISE_ID,
      subsidyAccessPolicyId: TEST_SUBSIDY_ACCESS_POLICY_ID,
      declineReason: 'Budget exhausted',
    });
  });

  it('should call bulkDeclineBnrSubsidyRequests with selected UUIDs when specific rows are selected', async () => {
    EnterpriseAccessApiService.bulkDeclineBnrSubsidyRequests.mockResolvedValueOnce({
      status: 200,
      data: { declined: TEST_REQUEST_UUIDS, non_declinable: [] },
    });
    const { result } = renderHook(
      () => useBulkDeclineBnrRequests(TEST_ENTERPRISE_ID, TEST_REQUEST_UUIDS, false),
      { wrapper },
    );

    await waitFor(() => result.current.declineBnrRequests());

    expect(
      EnterpriseAccessApiService.bulkDeclineBnrSubsidyRequests,
    ).toHaveBeenCalledWith({
      enterpriseId: TEST_ENTERPRISE_ID,
      subsidyAccessPolicyId: TEST_SUBSIDY_ACCESS_POLICY_ID,
      subsidyRequestUUIDs: TEST_REQUEST_UUIDS,
      declineReason: undefined,
    });
    expect(EnterpriseAccessApiService.declineAllBnrSubsidyRequests).not.toHaveBeenCalled();
    expect(logError).toBeCalledTimes(0);

    expect(result.current).toEqual({
      declineButtonState: 'complete',
      declineBnrRequests: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should forward declineReason to bulkDeclineBnrSubsidyRequests for subset of rows', async () => {
    EnterpriseAccessApiService.bulkDeclineBnrSubsidyRequests.mockResolvedValueOnce({
      status: 200,
      data: { declined: TEST_REQUEST_UUIDS, non_declinable: [] },
    });
    const { result } = renderHook(
      () => useBulkDeclineBnrRequests(TEST_ENTERPRISE_ID, TEST_REQUEST_UUIDS, false),
      { wrapper },
    );

    await waitFor(() => result.current.declineBnrRequests('Outside policy scope'));

    expect(
      EnterpriseAccessApiService.bulkDeclineBnrSubsidyRequests,
    ).toHaveBeenCalledWith({
      enterpriseId: TEST_ENTERPRISE_ID,
      subsidyAccessPolicyId: TEST_SUBSIDY_ACCESS_POLICY_ID,
      subsidyRequestUUIDs: TEST_REQUEST_UUIDS,
      declineReason: 'Outside policy scope',
    });
  });

  it('should handle decline error and not invalidate queries on full failure', async () => {
    const error = new Error('An error occurred');
    EnterpriseAccessApiService.declineAllBnrSubsidyRequests.mockRejectedValueOnce(error);
    const invalidateSpy = jest.spyOn(testQueryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useBulkDeclineBnrRequests(TEST_ENTERPRISE_ID, [], true),
      { wrapper },
    );

    await waitFor(async () => {
      try {
        await result.current.declineBnrRequests();
      } catch (e) {
        // Expected to throw
      }
    });

    expect(EnterpriseAccessApiService.declineAllBnrSubsidyRequests).toHaveBeenCalled();
    expect(logError).toBeCalledTimes(1);
    expect(invalidateSpy).not.toHaveBeenCalled();

    expect(result.current).toEqual({
      declineButtonState: 'error',
      declineBnrRequests: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('throws and still invalidates queries on partial failure (entire table)', async () => {
    EnterpriseAccessApiService.declineAllBnrSubsidyRequests.mockResolvedValueOnce({
      status: 200,
      data: {
        declined: ['uuid-1'],
        non_declinable: ['uuid-2'],
      },
    });
    const invalidateSpy = jest.spyOn(testQueryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useBulkDeclineBnrRequests(TEST_ENTERPRISE_ID, [], true),
      { wrapper },
    );

    let caught;
    await waitFor(async () => {
      try {
        await result.current.declineBnrRequests();
      } catch (e) {
        caught = e;
      }
    });

    expect(caught).toBeInstanceOf(Error);
    expect(caught.message).toBe('1 request(s) could not be declined');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: learnerCreditManagementQueryKeys.budget(TEST_SUBSIDY_ACCESS_POLICY_ID),
    });
    expect(logError).toHaveBeenCalledTimes(1);
    expect(result.current.declineButtonState).toBe('error');
  });

  it('throws and still invalidates queries on partial failure (subset of rows)', async () => {
    EnterpriseAccessApiService.bulkDeclineBnrSubsidyRequests.mockResolvedValueOnce({
      status: 200,
      data: {
        declined: ['uuid-1'],
        non_declinable: ['uuid-2'],
      },
    });
    const invalidateSpy = jest.spyOn(testQueryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useBulkDeclineBnrRequests(TEST_ENTERPRISE_ID, TEST_REQUEST_UUIDS, false),
      { wrapper },
    );

    let caught;
    await waitFor(async () => {
      try {
        await result.current.declineBnrRequests();
      } catch (e) {
        caught = e;
      }
    });

    expect(caught).toBeInstanceOf(Error);
    expect(caught.message).toBe('1 request(s) could not be declined');
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: learnerCreditManagementQueryKeys.budget(TEST_SUBSIDY_ACCESS_POLICY_ID),
    });
    expect(logError).toHaveBeenCalledTimes(1);
    expect(result.current.declineButtonState).toBe('error');
  });

  it('throws when subsidyAccessPolicyId is missing', async () => {
    useParams.mockReturnValue({ budgetId: undefined });

    const { result } = renderHook(
      () => useBulkDeclineBnrRequests(TEST_ENTERPRISE_ID, TEST_REQUEST_UUIDS, false),
      { wrapper },
    );

    await expect(result.current.declineBnrRequests()).rejects.toThrow(
      'subsidyAccessPolicyId is required to decline BNR requests',
    );
    expect(EnterpriseAccessApiService.bulkDeclineBnrSubsidyRequests).not.toHaveBeenCalled();
    expect(EnterpriseAccessApiService.declineAllBnrSubsidyRequests).not.toHaveBeenCalled();
  });

  it('should toggle modal open state', async () => {
    const { result } = renderHook(
      () => useBulkDeclineBnrRequests(TEST_ENTERPRISE_ID),
      { wrapper },
    );

    expect(result.current.isOpen).toBe(false);

    await waitFor(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    await waitFor(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });
});
