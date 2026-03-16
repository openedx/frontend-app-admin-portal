import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';

import useBulkRemindApprovedRequests from '../useBulkRemindApprovedRequests';
import useBudgetId from '../useBudgetId';
import EnterpriseAccessApiService from '../../../../../data/services/EnterpriseAccessApiService';
import { queryClient } from '../../../../test/testUtils';
import { learnerCreditManagementQueryKeys } from '../../constants';

jest.mock('../useBudgetId');
jest.mock('../../../../../data/services/EnterpriseAccessApiService');
jest.mock('@edx/frontend-platform/logging');

const mockSubsidyAccessPolicyId = 'test-policy-id';
const mockSubsidyRequestUUIDs = ['test-request-uuid-1', 'test-request-uuid-2'];
const mockEnterpriseId = 'test-enterprise-id';

const defaultParams = {
  subsidyRequestUuids: mockSubsidyRequestUUIDs,
  enterpriseId: mockEnterpriseId,
};

let mockQueryClient;

const wrapper = ({ children }) => (
  <QueryClientProvider client={mockQueryClient}>
    {children}
  </QueryClientProvider>
);

const renderUseBulkRemindApprovedRequests = (overrides = {}) => renderHook(
  () => useBulkRemindApprovedRequests({ ...defaultParams, ...overrides }),
  { wrapper },
);

describe('useBulkRemindApprovedRequests', () => {
  let mockOnSuccess;
  let mockOnFailure;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSuccess = jest.fn();
    mockOnFailure = jest.fn();
    useBudgetId.mockReturnValue({ subsidyAccessPolicyId: mockSubsidyAccessPolicyId });
    mockQueryClient = queryClient();
    jest.spyOn(mockQueryClient, 'invalidateQueries');
  });

  it('returns correct initial state', () => {
    const { result } = renderUseBulkRemindApprovedRequests();

    expect(result.current).toMatchObject({
      remindButtonState: 'default',
      isOpen: false,
    });
    expect(typeof result.current.remindApprovedRequests).toBe('function');
    expect(typeof result.current.open).toBe('function');
    expect(typeof result.current.close).toBe('function');
  });

  it('toggles modal open/close state', () => {
    const { result } = renderUseBulkRemindApprovedRequests();

    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);

    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
  });

  describe('bulk remind specific requests', () => {
    beforeEach(() => {
      EnterpriseAccessApiService.remindApprovedBnrSubsidyRequests.mockResolvedValue({ status: 200 });
    });

    it('calls API, transitions state, calls onSuccess, and invalidates queries', async () => {
      const { result } = renderUseBulkRemindApprovedRequests({ onSuccess: mockOnSuccess });

      expect(result.current.remindButtonState).toBe('default');

      act(() => { result.current.remindApprovedRequests(); });
      expect(result.current.remindButtonState).toBe('pending');

      await waitFor(() => expect(result.current.remindButtonState).toBe('complete'));

      expect(EnterpriseAccessApiService.remindApprovedBnrSubsidyRequests).toHaveBeenCalledWith({
        enterpriseId: mockEnterpriseId,
        subsidyRequestUuids: mockSubsidyRequestUUIDs,
      });
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: learnerCreditManagementQueryKeys.budget(mockSubsidyAccessPolicyId),
      });
    });
  });

  describe('remind all requests', () => {
    const tableFilters = [{ id: 'learnerRequestState', value: ['waiting'] }];

    beforeEach(() => {
      EnterpriseAccessApiService.remindAllApprovedBnrSubsidyRequests.mockResolvedValue({ status: 202 });
    });

    it('calls remindAll API with filters when remindAll is true', async () => {
      const { result } = renderUseBulkRemindApprovedRequests({ remindAll: true, tableFilters });

      await act(async () => { await result.current.remindApprovedRequests(); });

      expect(EnterpriseAccessApiService.remindAllApprovedBnrSubsidyRequests).toHaveBeenCalledWith({
        enterpriseId: mockEnterpriseId,
        subsidyAccessPolicyId: mockSubsidyAccessPolicyId,
        options: expect.any(Object),
      });
      expect(EnterpriseAccessApiService.remindApprovedBnrSubsidyRequests).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    const mockError = new Error('API Error');

    beforeEach(() => {
      EnterpriseAccessApiService.remindApprovedBnrSubsidyRequests.mockRejectedValue(mockError);
    });

    it('sets error state, calls onFailure, and does not invalidate queries', async () => {
      const { result } = renderUseBulkRemindApprovedRequests({ onFailure: mockOnFailure });

      expect(result.current.remindButtonState).toBe('default');

      act(() => { result.current.remindApprovedRequests(); });
      expect(result.current.remindButtonState).toBe('pending');

      await waitFor(() => expect(result.current.remindButtonState).toBe('error'));

      expect(mockOnFailure).toHaveBeenCalledWith(mockError);
      expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled();
    });
  });
});
