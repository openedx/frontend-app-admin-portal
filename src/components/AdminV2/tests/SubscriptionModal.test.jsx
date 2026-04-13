import React from 'react';
import { render } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { axe } from 'jest-axe';
import {
  generateSubscriptionPlan,
  mockSubscriptionHooks,
  MockSubscriptionContext,
} from '../../subscriptions/tests/TestUtilities';

import SubsriptionModal from '../SubscriptionModal';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

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
  it('has no accessibility violations', async () => {
    const { container } = render(<EmbeddedSubscriptionWrapper />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders without crashing', () => {
    mockSubscriptionHooks(subscriptionPlan);
    render(<EmbeddedSubscriptionWrapper />);
  });
});
