import { renderHook } from '@testing-library/react-hooks/dom';
import { act, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { logError } from '@edx/frontend-platform/logging';

import EnterpriseAccessApiService from '../../../../data/services/EnterpriseAccessApiService';
import useRemindContentAssignments from './useRemindContentAssignments';
import { queryClient } from '../../../test/testUtils';
import { useBudgetId } from '..';

const TEST_ASSIGNMENT_CONFIGURATION_UUID = 'test-assignment-configuration-uuid';
const TEST_PENDING_ASSIGNMENT_UUID_1 = 'test-pending-assignment-uuid_1';
const TEST_PENDING_ASSIGNMENT_UUID_2 = 'test-pending-assignment-uuid_2';

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>{children}</QueryClientProvider>
);

jest.mock('../../../../data/services/EnterpriseAccessApiService');
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));
jest.mock('..', () => ({
  ...jest.requireActual('..'),
  useBudgetId: jest.fn(),
}));

describe('useRemindContentAssignments', () => {
  beforeEach(() => {
    useBudgetId.mockReturnValue({ subsidyAccessPolicyId: 'a52e6548-649f-4576-b73f-c5c2bee25e9c' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send a post request to remind a single pending assignment', async () => {
    EnterpriseAccessApiService.remindAssignments.mockResolvedValueOnce({ status: 200 });
    const { result } = renderHook(
      () => useRemindContentAssignments(
        TEST_ASSIGNMENT_CONFIGURATION_UUID,
        TEST_PENDING_ASSIGNMENT_UUID_1,
      ),
      { wrapper },
    );

    expect(result.current).toEqual({
      assignButtonState: 'default',
      remindContentAssignments: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });

    await waitFor(() => act(() => result.current.remindContentAssignments()));
    expect(
      EnterpriseAccessApiService.remindAssignments,
    ).toHaveBeenCalled();
    expect(logError).toBeCalledTimes(0);

    expect(result.current).toEqual({
      assignButtonState: 'complete',
      remindContentAssignments: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should send a post request to remind multiple pending assignments', async () => {
    EnterpriseAccessApiService.remindAssignments.mockResolvedValueOnce({ status: 200 });
    const { result } = renderHook(
      () => useRemindContentAssignments(
        TEST_ASSIGNMENT_CONFIGURATION_UUID,
        [TEST_PENDING_ASSIGNMENT_UUID_1, TEST_PENDING_ASSIGNMENT_UUID_2],
      ),
      { wrapper },
    );

    expect(result.current).toEqual({
      assignButtonState: 'default',
      remindContentAssignments: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });

    await waitFor(() => act(() => result.current.remindContentAssignments()));
    expect(
      EnterpriseAccessApiService.remindAssignments,
    ).toHaveBeenCalled();
    expect(logError).toBeCalledTimes(0);

    expect(result.current).toEqual({
      assignButtonState: 'complete',
      remindContentAssignments: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });

  it('should handle assignment reminder error', async () => {
    const error = new Error('An error occurred');
    EnterpriseAccessApiService.remindAssignments.mockRejectedValueOnce(error);
    const { result } = renderHook(
      () => useRemindContentAssignments(
        TEST_ASSIGNMENT_CONFIGURATION_UUID,
        [TEST_PENDING_ASSIGNMENT_UUID_1, TEST_PENDING_ASSIGNMENT_UUID_2],
      ),
      { wrapper },
    );

    expect(result.current).toEqual({
      assignButtonState: 'default',
      remindContentAssignments: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });

    await waitFor(() => act(() => result.current.remindContentAssignments()));

    expect(
      EnterpriseAccessApiService.remindAssignments,
    ).toHaveBeenCalled();
    expect(logError).toBeCalledTimes(1);

    expect(result.current).toEqual({
      assignButtonState: 'error',
      remindContentAssignments: expect.any(Function),
      close: expect.any(Function),
      isOpen: false,
      open: expect.any(Function),
    });
  });
});
