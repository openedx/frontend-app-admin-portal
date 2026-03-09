import { renderHook, act } from '@testing-library/react';
import useSuccessfulBulkApprovalToastContextValue from '../useSuccessfulBulkApprovalToastContextValue';

describe('useSuccessfulBulkApprovalToastContextValue', () => {
  it('should return default closed state', () => {
    const { result } = renderHook(() => useSuccessfulBulkApprovalToastContextValue());

    expect(result.current.isSuccessfulBulkApprovalToastOpen).toBe(false);
    expect(result.current.successfulBulkApprovalToastMessage).toBe('Request approved');
  });

  it('should open toast and display single request message', () => {
    const { result } = renderHook(() => useSuccessfulBulkApprovalToastContextValue());

    act(() => {
      result.current.displayToastForBulkApproval(1);
    });

    expect(result.current.isSuccessfulBulkApprovalToastOpen).toBe(true);
    expect(result.current.successfulBulkApprovalToastMessage).toBe('Request approved');
  });

  it('should open toast and display plural message for multiple requests', () => {
    const { result } = renderHook(() => useSuccessfulBulkApprovalToastContextValue());

    act(() => {
      result.current.displayToastForBulkApproval(5);
    });

    expect(result.current.isSuccessfulBulkApprovalToastOpen).toBe(true);
    expect(result.current.successfulBulkApprovalToastMessage).toBe('Requests approved (5)');
  });

  it('should close toast when closeToastForBulkApproval is called', () => {
    const { result } = renderHook(() => useSuccessfulBulkApprovalToastContextValue());

    act(() => {
      result.current.displayToastForBulkApproval(3);
    });

    expect(result.current.isSuccessfulBulkApprovalToastOpen).toBe(true);

    act(() => {
      result.current.closeToastForBulkApproval();
    });

    expect(result.current.isSuccessfulBulkApprovalToastOpen).toBe(false);
  });

  it('should update message when displaying different counts', () => {
    const { result } = renderHook(() => useSuccessfulBulkApprovalToastContextValue());

    act(() => {
      result.current.displayToastForBulkApproval(1);
    });

    expect(result.current.successfulBulkApprovalToastMessage).toBe('Request approved');

    act(() => {
      result.current.displayToastForBulkApproval(10);
    });

    expect(result.current.successfulBulkApprovalToastMessage).toBe('Requests approved (10)');
  });

  it('should return memoized context value', () => {
    const { result, rerender } = renderHook(() => useSuccessfulBulkApprovalToastContextValue());

    const firstValue = result.current;
    rerender();
    const secondValue = result.current;

    // Context value should be memoized (same reference if state hasn't changed)
    expect(firstValue).toEqual(secondValue);
  });

  it('should handle boundary case of exactly 2 requests (plural)', () => {
    const { result } = renderHook(() => useSuccessfulBulkApprovalToastContextValue());

    act(() => {
      result.current.displayToastForBulkApproval(2);
    });

    expect(result.current.successfulBulkApprovalToastMessage).toBe('Requests approved (2)');
  });
});
