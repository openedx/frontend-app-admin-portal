import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  MockSubscriptionContext,
  generateSubscriptionPlan,
  generateSubscriptionUser,
  mockSubscriptionHooks,
} from '../../../subscriptions/tests/TestUtilities';

import LicenseManagementTable from '.';
import { ASSIGNED, REVOKED } from '../../../subscriptions/data/constants';

const mockStore = configureMockStore();
const store = mockStore({
  forceRefresh: jest.fn(),
});

const defaultSubscriptionPlan = generateSubscriptionPlan(
  {
    licenses: {
      total: 1,
      allocated: 1,
      unassigned: 0,
    },
  },
);

const LicenseManagementTableWrapper = ({ subscriptionPlan, ...props }) => (
  <IntlProvider locale="en">
    <Provider store={store}>
      <MockSubscriptionContext subscriptionPlan={defaultSubscriptionPlan}>
        <LicenseManagementTable
          subscriptionUUID="123"
          {...props}
        />
      </MockSubscriptionContext>
    </Provider>
  </IntlProvider>
);
LicenseManagementTableWrapper.propTypes = {
  subscriptionPlan: PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    enterpriseCustomerName: PropTypes.string.isRequired,
    enterpriseCustomerUuid: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    expirationDate: PropTypes.string.isRequired,
    licenses: PropTypes.shape({
      total: PropTypes.number.isRequired,
      allocated: PropTypes.number.isRequired,
      unassigned: PropTypes.number.isRequired,
    }).isRequired,
    revocationDate: PropTypes.string,
  }).isRequired,
};

const usersSetup = (
  status1 = 'assigned',
  status2 = 'activated',
  status3 = 'revoked',
  status4 = 'assigned',
) => {
  const refreshFunctions = mockSubscriptionHooks(defaultSubscriptionPlan, [
    generateSubscriptionUser({ status: status1 }),
    generateSubscriptionUser({ status: status2 }),
    generateSubscriptionUser({ status: status3 }),
    generateSubscriptionUser({ status: status4 }),
  ]);
  return refreshFunctions;
};

describe('<LicenseManagementTable />', () => {
  it('renders the license management table', () => {
    usersSetup();
    render(<LicenseManagementTableWrapper subscriptionPlan={defaultSubscriptionPlan} />);

    // Revoke a license
    screen.getByLabelText('Revoke license').click(); // Click on the revoke license button
    screen.getByLabelText('Revoke License').click(); // Confirm license revocation

    // Check Pagination
    screen.getByLabelText('Next, Page 2').click();
    screen.getByLabelText('Previous, Page 1').click();
  });

  it('displays correct message for revoked users', () => {
    const mockRevokedDate = '2025-03-15T12:00:00Z';
    const revokedUser = generateSubscriptionUser({
      status: REVOKED,
      revokedDate: mockRevokedDate,
    });

    mockSubscriptionHooks(defaultSubscriptionPlan, [revokedUser]);

    render(<LicenseManagementTableWrapper subscriptionPlan={defaultSubscriptionPlan} />);

    expect(screen.getByText(/Revoked:/)).toBeInTheDocument();
  });

  it('displays correct message for assigned (invited) users', () => {
    const mockLastRemindDate = '2025-04-01T09:30:00Z';
    const assignedUser = generateSubscriptionUser({
      status: ASSIGNED,
      lastRemindDate: mockLastRemindDate,
    });

    mockSubscriptionHooks(defaultSubscriptionPlan, [assignedUser]);

    render(<LicenseManagementTableWrapper subscriptionPlan={defaultSubscriptionPlan} />);

    expect(screen.getByText(/Invited:/)).toBeInTheDocument();
  });

  it('does not render actions for users with unknown status', () => {
    const unknown = generateSubscriptionUser({
      userEmail: 'activated@edx.com',
      status: 'unknown',
      activationDate: '2025-05-01T10:00:00Z',
    });

    mockSubscriptionHooks(defaultSubscriptionPlan, [unknown]);

    render(<LicenseManagementTableWrapper subscriptionPlan={defaultSubscriptionPlan} />);

    expect(screen.queryByText(/Unknown:/)).not.toBeInTheDocument();
  });
});
