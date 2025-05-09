import React from 'react';
import { render } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  generateSubscriptionPlan,
  mockSubscriptionHooks,
  MockSubscriptionContext,
} from '../../subscriptions/tests/TestUtilities';

import SubsriptionModal from '../SubscriptionModal';
import { SubsidyRequestsContext } from '../../subsidy-requests';

const subscriptionPlan = generateSubscriptionPlan({
  licenses: {
    allocated: 1,
    revoked: 0,
    total: 10,
  },
}, 2, 10);

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

const AppContextProvider = ({ children }) => (
  <AppContext.Provider value={defaultAppContext}>
    {children}
  </AppContext.Provider>
);

const initialSubsidyRequestContextValue = {
  subsidyRequestConfiguration: {
    isRequestSubsidyEnabled: true,
  },
};

const EmbeddedSubscriptionWrapper = () => (
  <IntlProvider locale="en">
    <AppContextProvider>
      <SubsidyRequestsContext.Provider value={initialSubsidyRequestContextValue}>
        <MockSubscriptionContext subscriptionPlan={subscriptionPlan}>
          <SubsriptionModal />
        </MockSubscriptionContext>
      </SubsidyRequestsContext.Provider>
    </AppContextProvider>
  </IntlProvider>
);

describe('EmbeddedSubscription', () => {
  it('renders without crashing', () => {
    mockSubscriptionHooks(subscriptionPlan);
    render(<EmbeddedSubscriptionWrapper />);
  });
});
