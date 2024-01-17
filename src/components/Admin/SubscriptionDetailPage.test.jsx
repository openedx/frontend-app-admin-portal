/* eslint-disable react/jsx-no-constructed-context-values */
import React from 'react';
import PropTypes from 'prop-types';
import { render } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SubscriptionDetailPage } from './SubscriptionDetailPage';
import { SubsidyRequestsContext } from '../subsidy-requests';
import {
  generateSubscriptionPlan,
  mockSubscriptionHooks,
  MockSubscriptionContext,
} from '../subscriptions/tests/TestUtilities';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    subscriptionUUID: '28d4dcdc-c026-4c02-a263-82dd9c0d8b43',
  }),
}));

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
      <SubsidyRequestsContext.Provider value={initialSubsidyRequestContextValue}>
        <MockSubscriptionContext subscriptionPlan={subscriptionPlan}>
          <SubscriptionDetailPage
            enterpriseSlug={context.enterpriseSlug}
            match={context.match}
          />
        </MockSubscriptionContext>
      </SubsidyRequestsContext.Provider>
    </AppContextProvider>
  </IntlProvider>
);
SubscriptionDetailPageWrapper.propTypes = {
  context: PropTypes.shape({
    enterpriseSlug: PropTypes.string,
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
