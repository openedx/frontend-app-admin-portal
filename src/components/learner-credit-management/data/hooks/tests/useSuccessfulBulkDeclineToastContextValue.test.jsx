import { renderHook, act } from '@testing-library/react';
import useSuccessfulBulkDeclineToastContextValue from '../useSuccessfulBulkDeclineToastContextValue';

describe('useSuccessfulBulkDeclineToastContextValue', () => {
  it('should return default closed state', () => {
    const { result } = renderHook(() => useSuccessfulBulkDeclineToastContextValue());

    expect(result.current.isSuccessfulBulkDeclineToastOpen).toBe(false);
    expect(result.current.successfulBulkDeclineToastMessage).toBe('Request declined');
  });

  it('should open toast and display single request message', () => {
    const { result } = renderHook(() => useSuccessfulBulkDeclineToastContextValue());

    act(() => {
      result.current.displayToastForBulkDecline(1);
    });

    expect(result.current.isSuccessfulBulkDeclineToastOpen).toBe(true);
    expect(result.current.successfulBulkDeclineToastMessage).toBe('Request declined');
  });

  it('should open toast and display plural message for multiple requests', () => {
    const { result } = renderHook(() => useSuccessfulBulkDeclineToastContextValue());

    act(() => {
      result.current.displayToastForBulkDecline(5);
    });

    expect(result.current.isSuccessfulBulkDeclineToastOpen).toBe(true);
    expect(result.current.successfulBulkDeclineToastMessage).toBe('Requests declined (5)');
  });

  it('should close toast when closeToastForBulkDecline is called', () => {
    const { result } = renderHook(() => useSuccessfulBulkDeclineToastContextValue());

    act(() => {
      result.current.displayToastForBulkDecline(3);
    });

    expect(result.current.isSuccessfulBulkDeclineToastOpen).toBe(true);

    act(() => {
      result.current.closeToastForBulkDecline();
    });

    expect(result.current.isSuccessfulBulkDeclineToastOpen).toBe(false);
  });

  it('should update message when displaying different counts', () => {
    const { result } = renderHook(() => useSuccessfulBulkDeclineToastContextValue());

    act(() => {
      result.current.displayToastForBulkDecline(1);
    });

    expect(result.current.successfulBulkDeclineToastMessage).toBe('Request declined');

    act(() => {
      result.current.displayToastForBulkDecline(10);
    });

    expect(result.current.successfulBulkDeclineToastMessage).toBe('Requests declined (10)');
  });

  it('should return memoized context value', () => {
    const { result, rerender } = renderHook(() => useSuccessfulBulkDeclineToastContextValue());

    const firstValue = result.current;
    rerender();
    const secondValue = result.current;

    expect(firstValue).toBe(secondValue);
  });

  it('should handle boundary case of exactly 2 requests (plural)', () => {
    const { result } = renderHook(() => useSuccessfulBulkDeclineToastContextValue());

    act(() => {
      result.current.displayToastForBulkDecline(2);
    });

    expect(result.current.successfulBulkDeclineToastMessage).toBe('Requests declined (2)');
  });
});
