import React from 'react';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { axe } from 'jest-axe';
import DeclineSubsidyRequestModal from '../DeclineSubsidyRequestModal';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

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

  it('has no accessibility violations', async () => {
    const mockHandleSuccess = jest.fn();
    const mockDeclineRequestFn = jest.fn();
    const { container } = render(
      <IntlProvider locale="en">
        <DeclineSubsidyRequestModal
          {...basicProps}
          onSuccess={mockHandleSuccess}
          declineRequestFn={mockDeclineRequestFn}
        />
      </IntlProvider>,
    );
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it.each([{
    shouldNotifyLearner: true,
    shouldUnlinkLearnerFromEnterprise: false,
  }, {
    shouldNotifyLearner: false,
    shouldUnlinkLearnerFromEnterprise: true,
  }])('should call Enterprise Access API to decline the request and call onSuccess afterwards', async (
    { shouldNotifyLearner, shouldUnlinkLearnerFromEnterprise },
  ) => {
    const user = userEvent.setup();
    const mockHandleSuccess = jest.fn();
    const mockDeclineRequestFn = jest.fn();

    const { getByTestId } = render(
      <IntlProvider locale="en">
        <DeclineSubsidyRequestModal
          {...basicProps}
          onSuccess={mockHandleSuccess}
          declineRequestFn={mockDeclineRequestFn}
        />
      </IntlProvider>,
    );

    if (!shouldNotifyLearner) {
      const notifyLearnerCheckbox = getByTestId('decline-subsidy-request-modal-notify-learner-checkbox');
      await user.click(notifyLearnerCheckbox);
    }

    if (shouldUnlinkLearnerFromEnterprise) {
      const unlinkLearnerCheckbox = getByTestId('decline-subsidy-request-modal-unlink-learner-checkbox');
      await user.click(unlinkLearnerCheckbox);
    }

    const declineBtn = getByTestId('decline-subsidy-request-modal-decline-btn');

    await user.click(declineBtn);
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
    const user = userEvent.setup();
    const mockHandleClose = jest.fn();
    const { getByTestId } = render(
      <IntlProvider locale="en">

        <DeclineSubsidyRequestModal {...basicProps} onClose={mockHandleClose} />
      </IntlProvider>,
    );

    const closeBtn = getByTestId('decline-subsidy-request-modal-close-btn');
    await user.click(closeBtn);

    await waitFor(() => {
      expect(mockHandleClose).toHaveBeenCalled();
    });
  });

  it('should render alert if an error occurred', async () => {
    const user = userEvent.setup();
    const mockDeclineRequestFn = jest.fn().mockRejectedValue(new Error('something went wrong'));

    const { getByTestId } = render(
      <IntlProvider locale="en">
        <DeclineSubsidyRequestModal
          {...basicProps}
          declineRequestFn={mockDeclineRequestFn}
        />
      </IntlProvider>,
    );

    const declineBtn = getByTestId('decline-subsidy-request-modal-decline-btn');

    await user.click(declineBtn);

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
