import React from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { MemoryRouter } from 'react-router-dom';
import {
  MockSubscriptionContext,
  generateSubscriptionPlan,
  generateSubscriptionUser,
  mockSubscriptionHooks,
} from '../../../subscriptions/tests/TestUtilities';

import LicenseManagementTable from '.';

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
    <MemoryRouter>
      <Provider store={store}>
        <MockSubscriptionContext subscriptionPlan={defaultSubscriptionPlan}>
          <LicenseManagementTable
            subscriptionUUID="123"
            {...props}
          />
        </MockSubscriptionContext>
      </Provider>
    </MemoryRouter>
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
    generateSubscriptionUser({ status1 }),
    generateSubscriptionUser({ status2 }),
    generateSubscriptionUser({ status3 }),
    generateSubscriptionUser({ status4 }),
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
});
