import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SubsidyRequestsContext } from '../subsidy-requests';
import {
  generateSubscriptionPlan,
  mockSubscriptionHooks,
  MockSubscriptionContext,
} from '../subscriptions/tests/TestUtilities';

import EmbeddedSubscription from './EmbeddedSubscription';

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
      <MemoryRouter initialEntries={['/test-enterprise/admin/subscriptions/1234']}>
        <SubsidyRequestsContext.Provider value={initialSubsidyRequestContextValue}>
          <MockSubscriptionContext subscriptionPlan={subscriptionPlan}>
            <EmbeddedSubscription />
          </MockSubscriptionContext>
        </SubsidyRequestsContext.Provider>
      </MemoryRouter>
    </AppContextProvider>
  </IntlProvider>
);

describe('EmbeddedSubscription', () => {
  it('renders without crashing', () => {
    mockSubscriptionHooks(subscriptionPlan);
    render(<EmbeddedSubscriptionWrapper />);
  });
});
