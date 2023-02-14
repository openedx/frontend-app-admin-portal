import React from 'react';
import PropTypes from 'prop-types';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import { SubscriptionDetailContext } from '../subscriptions/SubscriptionDetailContextProvider';
import SubscriptionDetails from './SubscriptionDetails';
import { SubscriptionContext } from '../subscriptions/SubscriptionData';

const mockStore = configureMockStore();
const defaultStore = mockStore({
  forceRefresh: jest.fn(),
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise-slug',
  },
});

const defaultSubscriptionContextValue = {
  forceRefresh: jest.fn(),
};

const defaultSubscriptionDetailContextValue = {
  startDate: '2021-01-01',
  expirationDate: '2021-12-31',
  subscription: {
    uuid: 'test-uuid',
    licenses: {
      allocated: 3,
      revoked: 1,
      unassigned: 1,
      total: 5,
      showToast: true,
    },
    daysUntilExpiration: 10,
    shouldShowInviteLearnersButton: true,
    isLockedForRenewalProcessing: false,
    forceRefreshDetailView: jest.fn(),
  },
  overview: {
    unassigned: 1,
  },
};

const SubscriptionDetailsWrapper = ({
  initialSubscriptionDetailContextValue = defaultSubscriptionDetailContextValue,
}) => (
  <IntlProvider locale="en">
    <Provider store={defaultStore}>
      <MemoryRouter>
        <SubscriptionDetailContext.Provider
          value={initialSubscriptionDetailContextValue}
        >
          <SubscriptionContext.Provider
            value={defaultSubscriptionContextValue}
          >
            <SubscriptionDetails />
          </SubscriptionContext.Provider>
        </SubscriptionDetailContext.Provider>
      </MemoryRouter>
    </Provider>
  </IntlProvider>
);

SubscriptionDetailsWrapper.propTypes = {
  initialSubscriptionDetailContextValue: PropTypes.shape({
    startDate: PropTypes.string,
    expirationDate: PropTypes.string,
    subscription: PropTypes.shape({
      licenses: PropTypes.shape({
        allocated: PropTypes.number,
        total: PropTypes.number,
        revoked: PropTypes.number,
        showToast: PropTypes.bool,
      }),
      isLockedForRenewalProcessing: PropTypes.bool,
      daysUntilExpiration: PropTypes.number,
    }),
    forceRefreshDetailView: PropTypes.func,
  }).isRequired,
};

describe('SubscriptionDetails', () => {
  it('renders correctly', () => {
    render(<SubscriptionDetailsWrapper
      initialSubscriptionDetailContextValue={defaultSubscriptionDetailContextValue}
    />);

    const manageLearnersButton = screen.getByText('Manage All Learners');
    manageLearnersButton.click();

    const inviteLearnersButton = screen.getByText('Invite learners');
    inviteLearnersButton.click();
  });
});
