import React from 'react';
import {
  render,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeclineSubsidyRequestModal from '../DeclineSubsidyRequestModal';

const TEST_ENTERPRISE_UUID = 'test-enterprise-uuid';
const TEST_COURSE_RUN_ID = 'edx+101';
const TEST_REQUEST_UUID = 'test-subsidy-request-uuid';

describe('<DeclineSubsidyRequestModal />', () => {
  const basicProps = {
    isOpen: true,
    subsidyRequest: {
      uuid: TEST_REQUEST_UUID,
      courseId: TEST_COURSE_RUN_ID,
      enterpriseCustomerUUID: TEST_ENTERPRISE_UUID,
    },
    declineRequestFn: jest.fn(),
    onSuccess: jest.fn(),
    onClose: jest.fn(),
    error: undefined,
  };

  it.each([{
    shouldNotifyLearner: true,
    shouldUnlinkLearnerFromEnterprise: false,
  }, {
    shouldNotifyLearner: false,
    shouldUnlinkLearnerFromEnterprise: true,
  }])('should call Enterprise Access API to decline the request and call onSuccess afterwards', async (
    { shouldNotifyLearner, shouldUnlinkLearnerFromEnterprise },
  ) => {
    const mockHandleSuccess = jest.fn();
    const mockDeclineRequestFn = jest.fn();

    const { getByTestId } = render(
      <DeclineSubsidyRequestModal
        {...basicProps}
        onSuccess={mockHandleSuccess}
        declineRequestFn={mockDeclineRequestFn}
      />,
    );

    if (!shouldNotifyLearner) {
      const notifyLearnerCheckbox = getByTestId('decline-subsidy-request-modal-notify-learner-checkbox');
      userEvent.click(notifyLearnerCheckbox);
    }

    if (shouldUnlinkLearnerFromEnterprise) {
      const unlinkLearnerCheckbox = getByTestId('decline-subsidy-request-modal-unlink-learner-checkbox');
      userEvent.click(unlinkLearnerCheckbox);
    }

    const declineBtn = getByTestId('decline-subsidy-request-modal-decline-btn');

    userEvent.click(declineBtn);
    await waitFor(() => {
      expect(mockDeclineRequestFn).toHaveBeenCalledWith({
        subsidyRequestUUIDS: [TEST_REQUEST_UUID],
        sendNotification: shouldNotifyLearner,
        enterpriseId: TEST_ENTERPRISE_UUID,
        unlinkUsersFromEnterprise: shouldUnlinkLearnerFromEnterprise,
      });

      expect(mockHandleSuccess).toHaveBeenCalled();
    });
  });

  it('should call onClose', async () => {
    const mockHandleClose = jest.fn();
    const { getByTestId } = render(
      <DeclineSubsidyRequestModal {...basicProps} onClose={mockHandleClose} />,
    );

    const closeBtn = getByTestId('decline-subsidy-request-modal-close-btn');
    userEvent.click(closeBtn);

    await waitFor(() => {
      expect(mockHandleClose).toHaveBeenCalled();
    });
  });

  it('should render alert if an error occured', async () => {
    const mockDeclineRequestFn = jest.fn().mockRejectedValue(new Error('something went wrong'));

    const { getByTestId } = render(
      <DeclineSubsidyRequestModal
        {...basicProps}
        declineRequestFn={mockDeclineRequestFn}
      />,
    );

    const declineBtn = getByTestId('decline-subsidy-request-modal-decline-btn');

    userEvent.click(declineBtn);

    await waitFor(() => {
      expect(mockDeclineRequestFn).toHaveBeenCalledWith({
        subsidyRequestUUIDS: [TEST_REQUEST_UUID],
        sendNotification: true,
        enterpriseId: TEST_ENTERPRISE_UUID,
        unlinkUsersFromEnterprise: false,
      });
      expect(getByTestId('decline-subsidy-request-modal-alert'));
    });
  });
});
