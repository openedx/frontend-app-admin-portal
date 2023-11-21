import { renderHook } from '@testing-library/react-hooks/dom';
import { waitFor, act } from '@testing-library/react';

import { logError } from '@edx/frontend-platform/logging';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import useRemindContentAssignments from './useRemindContentAssignments';

const TEST_ASSIGNMENT_CONFIGURATION_UUID = 'test-assignment-configuration-uuid';
const TEST_PENDING_ASSIGNMENT_UUID_1 = 'test-pending-assignment-uuid_1';
const TEST_PENDING_ASSIGNMENT_UUID_2 = 'test-pending-assignment-uuid_2';
const mockRefreshFn = jest.fn();
const mockTableInstance = {};

jest.mock('../../../../data/services/EnterpriseAccessApiService');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

describe('useRemindContentAssignments', () => {
  it('should send a post request to remind a single pending assignment', async () => {
    EnterpriseAccessApiService.remindContentAssignments.mockResolvedValueOnce({ status: 200 });
    const { result } = renderHook(() => useRemindContentAssignments(
      TEST_ASSIGNMENT_CONFIGURATION_UUID,
      mockRefreshFn,
      mockTableInstance,
      TEST_PENDING_ASSIGNMENT_UUID_1,
    ));

    expect(result.current).toEqual({
      remindContentAssignments: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
      setShowToast: expect.any(Function),
      showToast: false,
      toastMessage: '',
    });

    await waitFor(() => act(() => result.current.remindContentAssignments()));
    expect(
      EnterpriseAccessApiService.remindContentAssignments,
    ).toHaveBeenCalled();
    expect(logError).toBeCalledTimes(0);

    expect(result.current).toEqual({
      remindContentAssignments: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
      setShowToast: expect.any(Function),
      showToast: true,
      toastMessage: 'Reminder sent',
    });
  });

  it('should send a post request to remind multiple pending assignments', async () => {
    EnterpriseAccessApiService.remindContentAssignments.mockResolvedValueOnce({ status: 200 });
    const { result } = renderHook(() => useRemindContentAssignments(
      TEST_ASSIGNMENT_CONFIGURATION_UUID,
      mockRefreshFn,
      mockTableInstance,
      [TEST_PENDING_ASSIGNMENT_UUID_1, TEST_PENDING_ASSIGNMENT_UUID_2],
    ));

    expect(result.current).toEqual({
      remindContentAssignments: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
      setShowToast: expect.any(Function),
      showToast: false,
      toastMessage: '',
    });

    await waitFor(() => act(() => result.current.remindContentAssignments()));
    expect(
      EnterpriseAccessApiService.remindContentAssignments,
    ).toHaveBeenCalled();
    expect(logError).toBeCalledTimes(0);

    expect(result.current).toEqual({
      remindContentAssignments: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
      setShowToast: expect.any(Function),
      showToast: true,
      toastMessage: 'Reminders sent (2)',
    });
  });

  it('should handle error when fetching AI analytics summary data', async () => {
    const error = new Error('An error occurred');
    EnterpriseAccessApiService.remindContentAssignments.mockRejectedValueOnce(error);
    const { result } = renderHook(() => useRemindContentAssignments(
      TEST_ASSIGNMENT_CONFIGURATION_UUID,
      mockRefreshFn,
      mockTableInstance,
      [TEST_PENDING_ASSIGNMENT_UUID_1, TEST_PENDING_ASSIGNMENT_UUID_2],
    ));

    expect(result.current).toEqual({
      remindContentAssignments: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
      setShowToast: expect.any(Function),
      showToast: false,
      toastMessage: '',
    });

    await waitFor(() => act(() => result.current.remindContentAssignments()));

    expect(
      EnterpriseAccessApiService.remindContentAssignments,
    ).toHaveBeenCalled();
    expect(logError).toBeCalledTimes(1);

    expect(result.current).toEqual({
      remindContentAssignments: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
      setShowToast: expect.any(Function),
      showToast: false,
      toastMessage: '',
    });
  });
});
