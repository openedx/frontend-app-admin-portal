import React from 'react';
import {
  cleanup, render, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { legacy_configureStore as configureMockStore } from 'redux-mock-store';
import { Provider } from 'react-redux';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import LicenseManagementTableActionColumn from '../LicenseManagementTableActionColumn';
import { ACTIVATED, ASSIGNED, REVOKED } from '../../../data/constants';
import { SUBSCRIPTION_TABLE_EVENTS } from '../../../../../eventTracking';
import { TEST_ENTERPRISE_CUSTOMER_UUID, TEST_SUBSCRIPTION_PLAN_UUID } from '../../../tests/TestUtilities';

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const mockStore = configureMockStore();
const store = mockStore({
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
  },
});

const email = 'foo@test.edx.org';
const assignedTestUser = { status: ASSIGNED, email };
const activatedTestUser = { status: ACTIVATED, email };
const revokedTestUser = { status: REVOKED, email };
const fooTestUser = { status: 'foo', email };

const basicProps = {
  user: assignedTestUser,
  onRemindSuccess: () => {},
  onRevokeSuccess: () => {},
  subscription: {
    uuid: TEST_SUBSCRIPTION_PLAN_UUID,
    enterpriseCustomerUuid: TEST_ENTERPRISE_CUSTOMER_UUID,
    expirationDate: dayjs().add(1, 'days').format(),
    isRevocationCapEnabled: false,
    revocations: {
      applied: 0,
      remaining: 10,
    },
  },
};

const LicenseManagementTableActionColumnWithContext = (props) => (
  <IntlProvider locale="en">
    <Provider store={store}>
      <LicenseManagementTableActionColumn {...props} />
    </Provider>
  </IntlProvider>
);

describe('<LicenseManagementTableActionColumn />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  const testDialogClosed = async (user) => {
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(screen.queryByRole('dialog')).toBeFalsy();
  };

  describe('renders buttons when', () => {
    it(`user status ${ASSIGNED}`, () => {
      render(<LicenseManagementTableActionColumnWithContext {...basicProps} />);
      expect(screen.getAllByRole('button').length).toBe(2);
      expect(screen.getByTitle('Remind learner')).toBeTruthy();
      expect(screen.getByTitle('Revoke license')).toBeTruthy();
    });

    it(`user status ${ACTIVATED}`, () => {
      const props = { ...basicProps, user: activatedTestUser };
      render(<LicenseManagementTableActionColumnWithContext {...props} />);
      expect(screen.getAllByRole('button').length).toBe(1);
      expect(screen.queryByTitle('Remind learner')).toBeFalsy();
      expect(screen.queryByTitle('Revoke license')).toBeTruthy();
    });

    it(`user status ${REVOKED}`, () => {
      const props = { ...basicProps, user: revokedTestUser };
      render(<LicenseManagementTableActionColumnWithContext {...props} />);
      expect(screen.queryAllByRole('button').length).toBe(0);
      expect(screen.queryByTitle('Remind learner')).toBeFalsy();
      expect(screen.queryByTitle('Revoke license')).toBeFalsy();
    });

    it('user status undefined', () => {
      const props = { ...basicProps, user: fooTestUser };
      render(<LicenseManagementTableActionColumnWithContext {...props} />);
      expect(screen.queryAllByRole('button').length).toBe(0);
      expect(screen.queryByTitle('Remind learner')).toBeFalsy();
      expect(screen.queryByTitle('Revoke license')).toBeFalsy();
    });
  });

  it('opens and closes revoke modal', async () => {
    const user = userEvent.setup();
    render(<LicenseManagementTableActionColumnWithContext {...basicProps} />);
    expect(screen.queryByRole('dialog')).toBeFalsy();
    // Open dialog
    const revokeButton = screen.getByTitle('Revoke license');
    await user.click(revokeButton);
    expect(screen.getByRole('dialog')).toBeTruthy();
    // Event is sent when open
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.REVOKE_ROW_CLICK,
    );
    // Close dialog
    await testDialogClosed(user);
    // Event is sent when cancel
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.REVOKE_ROW_CANCEL,
    );
  });

  it('opens and closes remind modal', async () => {
    const user = userEvent.setup();
    render(<LicenseManagementTableActionColumnWithContext {...basicProps} />);
    expect(screen.queryByRole('dialog')).toBeFalsy();
    // Open dialog
    const remindButton = screen.getByTitle('Remind learner');
    await user.click(remindButton);
    expect(screen.getByRole('dialog')).toBeTruthy();
    // Event is sent when open
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.REMIND_ROW_CLICK,
    );
    // Close dialog
    await testDialogClosed(user);
    // Event is sent when cancel
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      TEST_ENTERPRISE_CUSTOMER_UUID,
      SUBSCRIPTION_TABLE_EVENTS.REMIND_ROW_CANCEL,
    );
  });
});
