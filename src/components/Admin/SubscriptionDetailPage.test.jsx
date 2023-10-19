/* eslint-disable react/jsx-no-constructed-context-values */
import React from 'react';
import PropTypes from 'prop-types';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SubscriptionDetailPage } from './SubscriptionDetailPage';
import { SubsidyRequestsContext } from '../subsidy-requests';
import {
  generateSubscriptionPlan,
  mockSubscriptionHooks,
  MockSubscriptionContext,
} from '../subscriptions/tests/TestUtilities';

const subscriptionPlan = generateSubscriptionPlan({
  licenses: {
    allocated: 1,
    revoked: 0,
    total: 10,
  },
}, 2, 10);

// eslint-disable-next-line no-console
console.error = jest.fn();

const defaultAppContext = {
  enterpriseSlug: 'test-enterprise',
  enterpriseConfig: {
    slug: 'test-enterprise',
  },
  match: {
    subscription: {
      uuid: '1234',
    },
    params: {
      subscriptionUUID: '28d4dcdc-c026-4c02-a263-82dd9c0d8b43',
    },
    loadingSubscription: false,
  },
};

const initialSubsidyRequestContextValue = {
  subsidyRequestConfiguration: {
    isRequestSubsidyEnabled: true,
  },
};

const AppContextProvider = ({ children }) => (
  <AppContext.Provider value={defaultAppContext}>
    {children}
  </AppContext.Provider>
);

const SubscriptionDetailPageWrapper = ({ context = defaultAppContext }) => (
  <IntlProvider locale="en">
    <AppContextProvider>
      <MemoryRouter initialEntries={['/test-enterprise/admin/subscriptions/1234']}>
        <SubsidyRequestsContext.Provider value={initialSubsidyRequestContextValue}>
          <MockSubscriptionContext subscriptionPlan={subscriptionPlan}>
            <SubscriptionDetailPage
              enterpriseSlug={context.enterpriseSlug}
              match={context.match}
            />
          </MockSubscriptionContext>
        </SubsidyRequestsContext.Provider>
      </MemoryRouter>
    </AppContextProvider>
  </IntlProvider>
);
SubscriptionDetailPageWrapper.propTypes = {
  context: PropTypes.shape({
    enterpriseSlug: PropTypes.string,
    match: PropTypes.shape({
      subscription: PropTypes.shape({
        uuid: PropTypes.string,
      }),
      params: PropTypes.shape({
        subscriptionUUID: PropTypes.string,
      }),
      loadingSubscription: PropTypes.bool,
    }),
  }).isRequired,
};

describe('SubscriptionDetailPage', () => {
  it('renders the SubscriptionDetailPage component', () => {
    mockSubscriptionHooks(subscriptionPlan);
    render(<SubscriptionDetailPageWrapper />);

    expect(document.querySelector('h2').textContent).toEqual(
      'Get Started',
    );
  });
});
