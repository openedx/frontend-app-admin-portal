import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import { logError } from '@edx/frontend-platform/logging';

import useCancelApprovedRequest from '../useCancelApprovedRequest';
import useBudgetId from '../useBudgetId';
import EnterpriseAccessApiService from '../../../../../data/services/EnterpriseAccessApiService';
import { queryClient } from '../../../../test/testUtils';
import { learnerCreditManagementQueryKeys } from '../../constants';

jest.mock('../useBudgetId');
jest.mock('../../../../../data/services/EnterpriseAccessApiService');
jest.mock('@edx/frontend-platform/logging');

const mockSubsidyAccessPolicyId = 'test-policy-id';
const mockEnterpriseId = 'test-enterprise-id';
const mockSubsidyRequestUUID = 'test-request-uuid';

let mockQueryClient;

const wrapper = ({ children }) => (
  <QueryClientProvider client={mockQueryClient}>
    {children}
  </QueryClientProvider>
);

describe('useCancelApprovedRequest', () => {
  let mockOnSuccess;
  let mockOnFailure;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSuccess = jest.fn();
    mockOnFailure = jest.fn();

    // Mock useBudgetId
    useBudgetId.mockReturnValue({
      subsidyAccessPolicyId: mockSubsidyAccessPolicyId,
    });

    // Create a fresh queryClient for each test and spy on it
    mockQueryClient = queryClient();
    jest.spyOn(mockQueryClient, 'invalidateQueries');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return correct initial values', () => {
      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      expect(result.current.cancelButtonState).toBe('default');
      expect(result.current.isOpen).toBe(false);
      expect(typeof result.current.cancelApprovedRequest).toBe('function');
      expect(typeof result.current.open).toBe('function');
      expect(typeof result.current.close).toBe('function');
    });
  });

  describe('modal toggle functionality', () => {
    it('should open modal when open is called', () => {
      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
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
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      // First open the modal
      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);

      // Then close it
      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('successful cancellation', () => {
    const mockResponse = { data: { success: true } };

    beforeEach(() => {
      EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequest.mockResolvedValue(mockResponse);
    });

    it('should handle successful cancellation flow', async () => {
      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      let cancellationPromise;

      act(() => {
        cancellationPromise = result.current.cancelApprovedRequest();
      });

      // Should be pending immediately
      expect(result.current.cancelButtonState).toBe('pending');

      await waitFor(async () => {
        const resolvedResult = await cancellationPromise;
        expect(resolvedResult.success).toBe(true);
        expect(resolvedResult.response).toBe(mockResponse);
      });

      // Should be complete after success
      expect(result.current.cancelButtonState).toBe('complete');
    });

    it('should call API service with correct parameters', async () => {
      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      await act(async () => {
        await result.current.cancelApprovedRequest();
      });

      expect(EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequest).toHaveBeenCalledWith({
        enterpriseId: mockEnterpriseId,
        subsidyRequestUUID: mockSubsidyRequestUUID,
      });
    });

    it('should call onSuccess callback with response', async () => {
      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      await act(async () => {
        await result.current.cancelApprovedRequest();
      });

      expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse);
      expect(mockOnFailure).not.toHaveBeenCalled();
    });

    it('should invalidate relevant queries after successful cancellation', async () => {
      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      await act(async () => {
        await result.current.cancelApprovedRequest();
      });

      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: learnerCreditManagementQueryKeys.budget(mockSubsidyAccessPolicyId),
      });
    });

    it('should work without onSuccess callback', async () => {
      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          null, // No onSuccess callback
          mockOnFailure,
        ),
        { wrapper },
      );

      await act(async () => {
        await result.current.cancelApprovedRequest();
      });

      expect(result.current.cancelButtonState).toBe('complete');
    });
  });

  describe('failed cancellation', () => {
    const mockError = new Error('API Error');

    beforeEach(() => {
      EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequest.mockRejectedValue(mockError);
    });

    it('should handle failed cancellation flow', async () => {
      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      let cancellationPromise;

      act(() => {
        cancellationPromise = result.current.cancelApprovedRequest();
      });

      // Should be pending immediately
      expect(result.current.cancelButtonState).toBe('pending');

      await waitFor(async () => {
        await expect(cancellationPromise).rejects.toThrow('API Error');
      });

      // Should be error after failure
      expect(result.current.cancelButtonState).toBe('error');
    });

    it('should call onFailure callback with error', async () => {
      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      await act(async () => {
        try {
          await result.current.cancelApprovedRequest();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(mockOnFailure).toHaveBeenCalledWith(mockError);
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should log error when cancellation fails', async () => {
      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      await act(async () => {
        try {
          await result.current.cancelApprovedRequest();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(logError).toHaveBeenCalledWith(mockError);
    });

    it('should re-throw error for modal handling', async () => {
      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      await expect(
        act(async () => {
          await result.current.cancelApprovedRequest();
        }),
      ).rejects.toThrow('API Error');
    });

    it('should work without onFailure callback', async () => {
      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          null, // No onFailure callback
        ),
        { wrapper },
      );

      await act(async () => {
        try {
          await result.current.cancelApprovedRequest();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.cancelButtonState).toBe('error');
    });

    it('should not invalidate queries on failure', async () => {
      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      await act(async () => {
        try {
          await result.current.cancelApprovedRequest();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled();
    });
  });

  describe('button state transitions', () => {
    it('should transition through states correctly on success', async () => {
      EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequest.mockResolvedValue({ data: { success: true } });

      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      // Initial state
      expect(result.current.cancelButtonState).toBe('default');

      // Start cancellation
      act(() => {
        result.current.cancelApprovedRequest();
      });

      // Should be pending
      expect(result.current.cancelButtonState).toBe('pending');

      // Wait for completion
      await waitFor(() => {
        expect(result.current.cancelButtonState).toBe('complete');
      });
    });

    it('should transition through states correctly on error', async () => {
      EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequest.mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      expect(result.current.cancelButtonState).toBe('default');
      act(() => {
        result.current.cancelApprovedRequest().catch(() => {
          // Handle rejection
        });
      });

      expect(result.current.cancelButtonState).toBe('pending');
      await waitFor(() => {
        expect(result.current.cancelButtonState).toBe('error');
      });
    });
  });

  describe('hook dependencies', () => {
    it('should update when subsidyAccessPolicyId changes', () => {
      useBudgetId.mockReturnValue({
        subsidyAccessPolicyId: 'initial-policy-id',
      });

      const { result, rerender } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      const initialCancelFunction = result.current.cancelApprovedRequest;

      // Change the subsidyAccessPolicyId
      useBudgetId.mockReturnValue({
        subsidyAccessPolicyId: 'new-policy-id',
      });

      rerender();

      // Function should be recreated due to dependency change
      expect(result.current.cancelApprovedRequest).not.toBe(initialCancelFunction);
    });

    it('should update when enterpriseId changes', () => {
      const { result, rerender } = renderHook(
        ({ enterpriseId }) => useCancelApprovedRequest(
          enterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        {
          wrapper,
          initialProps: { enterpriseId: 'initial-enterprise-id' },
        },
      );

      const initialCancelFunction = result.current.cancelApprovedRequest;

      // Change the enterpriseId
      rerender({ enterpriseId: 'new-enterprise-id' });

      // Function should be recreated due to dependency change
      expect(result.current.cancelApprovedRequest).not.toBe(initialCancelFunction);
    });

    it('should update when subsidyRequestUUID changes', () => {
      const { result, rerender } = renderHook(
        ({ subsidyRequestUUID }) => useCancelApprovedRequest(
          mockEnterpriseId,
          subsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        {
          wrapper,
          initialProps: { subsidyRequestUUID: 'initial-request-uuid' },
        },
      );

      const initialCancelFunction = result.current.cancelApprovedRequest;

      // Change the subsidyRequestUUID
      rerender({ subsidyRequestUUID: 'new-request-uuid' });

      // Function should be recreated due to dependency change
      expect(result.current.cancelApprovedRequest).not.toBe(initialCancelFunction);
    });
  });

  describe('multiple cancellation attempts', () => {
    it('should handle multiple cancellation attempts', async () => {
      EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequest
        .mockResolvedValueOnce({ data: { success: true } });

      const { result } = renderHook(
        () => useCancelApprovedRequest(
          mockEnterpriseId,
          mockSubsidyRequestUUID,
          mockOnSuccess,
          mockOnFailure,
        ),
        { wrapper },
      );

      // First cancellation
      await act(async () => {
        await result.current.cancelApprovedRequest();
      });

      expect(result.current.cancelButtonState).toBe('complete');
      expect(EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequest).toHaveBeenCalledTimes(1);

      // Reset the mock for the second attempt
      EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequest
        .mockResolvedValueOnce({ data: { success: true } });

      // Second cancellation attempt
      await act(async () => {
        await result.current.cancelApprovedRequest();
      });

      expect(result.current.cancelButtonState).toBe('complete');
      expect(EnterpriseAccessApiService.cancelApprovedBnrSubsidyRequest).toHaveBeenCalledTimes(2);
    });
  });
});
