import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';

import useRemindApprovedRequest from '../useRemindApprovedRequest';
import useBudgetId from '../useBudgetId';
import EnterpriseAccessApiService from '../../../../../data/services/EnterpriseAccessApiService';
import { queryClient } from '../../../../test/testUtils';
import { learnerCreditManagementQueryKeys } from '../../constants';

jest.mock('../useBudgetId');
jest.mock('../../../../../data/services/EnterpriseAccessApiService');
jest.mock('@edx/frontend-platform/logging');

const mockSubsidyAccessPolicyId = 'test-policy-id';
const mockSubsidyRequestUUID = 'test-request-uuid';

let mockQueryClient;

const wrapper = ({ children }) => (
  <QueryClientProvider client={mockQueryClient}>
    {children}
  </QueryClientProvider>
);

describe('useRemindApprovedRequest', () => {
  let mockOnSuccess;
  let mockOnFailure;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSuccess = jest.fn();
    mockOnFailure = jest.fn();

    useBudgetId.mockReturnValue({
      subsidyAccessPolicyId: mockSubsidyAccessPolicyId,
    });

    mockQueryClient = queryClient();
    jest.spyOn(mockQueryClient, 'invalidateQueries');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return correct initial values', () => {
      const { result } = renderHook(
        () => useRemindApprovedRequest(
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      expect(result.current.remindButtonState).toBe('default');
      expect(result.current.isOpen).toBe(false);
      expect(typeof result.current.remindApprovedRequests).toBe('function');
      expect(typeof result.current.open).toBe('function');
      expect(typeof result.current.close).toBe('function');
    });
  });

  describe('modal toggle functionality', () => {
    it('should open modal when open is called', () => {
      const { result } = renderHook(
        () => useRemindApprovedRequest(
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should close modal when close is called', () => {
      const { result } = renderHook(
        () => useRemindApprovedRequest(
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('successful reminder', () => {
    const mockResponse = { data: { success: true } };

    beforeEach(() => {
      EnterpriseAccessApiService.remindApprovedBnrSubsidyRequest.mockResolvedValue(mockResponse);
    });

    it('should handle successful reminder flow', async () => {
      const { result } = renderHook(
        () => useRemindApprovedRequest(
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      let reminderPromise;

      act(() => {
        reminderPromise = result.current.remindApprovedRequests();
      });

      expect(result.current.remindButtonState).toBe('pending');

      await waitFor(async () => {
        const resolvedResult = await reminderPromise;
        expect(resolvedResult.success).toBe(true);
        expect(resolvedResult.response).toBe(mockResponse);
      });

      expect(result.current.remindButtonState).toBe('complete');
    });

    it('should call API service with correct parameters', async () => {
      const { result } = renderHook(
        () => useRemindApprovedRequest(
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      await act(async () => {
        await result.current.remindApprovedRequests();
      });

      expect(EnterpriseAccessApiService.remindApprovedBnrSubsidyRequest).toHaveBeenCalledWith({
        subsidyRequestUUID: mockSubsidyRequestUUID,
      });
    });

    it('should call onSuccess callback with response', async () => {
      const { result } = renderHook(
        () => useRemindApprovedRequest(
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      await act(async () => {
        await result.current.remindApprovedRequests();
      });

      expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse);
      expect(mockOnFailure).not.toHaveBeenCalled();
    });

    it('should invalidate relevant queries after successful reminder', async () => {
      const { result } = renderHook(
        () => useRemindApprovedRequest(
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      await act(async () => {
        await result.current.remindApprovedRequests();
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: learnerCreditManagementQueryKeys.budget(mockSubsidyAccessPolicyId),
      });
    });

    it('should work without onSuccess callback', async () => {
      const { result } = renderHook(
        () => useRemindApprovedRequest(
          mockSubsidyRequestUUID,
          null, // No onSuccess callback
          mockOnFailure,
        ),
        { wrapper },
      );

      await act(async () => {
        await result.current.remindApprovedRequests();
      });

      expect(result.current.remindButtonState).toBe('complete');
    });
  });

  describe('failed reminder', () => {
    const mockError = new Error('API Error');

    beforeEach(() => {
      EnterpriseAccessApiService.remindApprovedBnrSubsidyRequest.mockRejectedValue(mockError);
    });

    it('should handle failed reminder flow', async () => {
      const { result } = renderHook(
        () => useRemindApprovedRequest(
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      let reminderPromise;

      act(() => {
        reminderPromise = result.current.remindApprovedRequests();
      });

      expect(result.current.remindButtonState).toBe('pending');

      await waitFor(async () => {
        await expect(reminderPromise).rejects.toThrow('API Error');
      });

      expect(result.current.remindButtonState).toBe('error');
      expect(mockOnFailure).toHaveBeenCalledWith(mockError);
      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled();
    });
  });

  describe('button state transitions', () => {
    it('should transition through states correctly on success', async () => {
      EnterpriseAccessApiService.remindApprovedBnrSubsidyRequest.mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(
        () => useRemindApprovedRequest(
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      expect(result.current.remindButtonState).toBe('default');

      act(() => {
        result.current.remindApprovedRequests();
      });

      expect(result.current.remindButtonState).toBe('pending');

      await waitFor(() => {
        expect(result.current.remindButtonState).toBe('complete');
      });
    });

    it('should transition through states correctly on error', async () => {
      EnterpriseAccessApiService.remindApprovedBnrSubsidyRequest.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(
        () => useRemindApprovedRequest(
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      expect(result.current.remindButtonState).toBe('default');
      act(() => {
        result.current.remindApprovedRequests().catch(() => {});
      });

      expect(result.current.remindButtonState).toBe('pending');
      await waitFor(() => {
        expect(result.current.remindButtonState).toBe('error');
      });
    });
  });
});
