import React from 'react';
import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  breakpoints,
  ResponsiveContext,
} from '@openedx/paragon';
import { axe } from 'jest-axe';
import { renderWithRouter } from '../../test/testUtils';
import SubscriptionCard from '../SubscriptionCard';
import {
  CANCELED, ENDED, FREE_TRIAL_BADGE, SELF_SERVICE_TRIAL,
} from '../data/constants';
import { SubscriptionContext } from '../SubscriptionData';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

const defaultSubscription = {
  uuid: 'ided',
  title: 'Select something',
  startDate: '2021-04-13',
  expirationDate: '2024-04-13',
  planType: 'Subscription',
};
const defaultProps = {
  subscription: defaultSubscription,
  licenses: {
    assigned: 5,
    unassigned: 2,
    activated: 3,
    allocated: 10,
    total: 20,
  },
};

const trialSubscription = {
  uuid: 'trial-uuid',
  title: 'Trial Plan',
  startDate: '2020-03-13',
  expirationDate: '2025-04-13',
  planType: SELF_SERVICE_TRIAL,
};
const trialProps = {
  subscription: trialSubscription,
  licenses: {
    assigned: 5,
    unassigned: 2,
    activated: 3,
    allocated: 10,
    total: 20,
  },
};

const endedTrialSubscription = {
  uuid: 'trial-uuid',
  title: 'Trial Plan',
  startDate: '1999-03-13',
  expirationDate: '1999-04-13',
  planType: SELF_SERVICE_TRIAL,
};
const endedTrialProps = {
  subscription: endedTrialSubscription,
  licenses: {
    assigned: 5,
    unassigned: 2,
    activated: 3,
    allocated: 10,
    total: 20,
  },
};

// normalized context shape (as produced by normalizeStripeInfo in hooks.js)
const mockStripeInfoActive = {
  invoiceAmountDue: 2000,
  currency: 'usd',
  canceledDate: null,
  isCanceled: false,
  renewedSubscriptionPlanUuid: null,
};

const mockStripeInfoCanceled = {
  invoiceAmountDue: null,
  currency: null,
  canceledDate: '2027-01-29T14:24:33Z',
  isCanceled: false,
  renewedSubscriptionPlanUuid: null,
};

const responsiveContextValue = { width: breakpoints.extraSmall.maxWidth };

// Pin "now" to a fixed date so tests don't silently break as real time passes
// (e.g. trial expiration dates in fixtures becoming stale) and so relative-date
// assertions are exact. Specific date strings still parse via real dayjs.
jest.mock('dayjs', () => {
  const actualDayjs = jest.requireActual('dayjs');
  const mock = (date) => {
    if (date) {
      return actualDayjs(date);
    }
    return actualDayjs('2020-01-01T00:00:00.000Z');
  };
  // Forward extend so dayjs plugins loaded at module init don't throw.
  mock.extend = actualDayjs.extend.bind(actualDayjs);
  return mock;
});

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
}));

jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useStripeBillingPortalSession: jest.fn().mockReturnValue({
    stripeUrl: 'https://docs.stripe.com/',
    loadingSession: false,
  }),
}));

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const initialStoreState = {
  portalConfiguration: {
    enterpriseId: 'enterpriseUUID',
  },
};

const SubscriptionCardWrapper = ({
  initialState = initialStoreState,
  stripeInfoByUuid = {},
  ...props
}) => {
  const store = getMockStore({ ...initialState });
  const contextValue = {
    setErrors: jest.fn(),
    stripeInfoByUuid,
    suppressedSubscriptionUuids: new Set(),
  };
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <SubscriptionContext.Provider value={contextValue}>
          <SubscriptionCard {...props} />
        </SubscriptionContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

describe('SubscriptionCard', () => {
  it('has no accessibility violations', async () => {
    const { container } = renderWithRouter(
      <SubscriptionCardWrapper
        {...defaultProps}
        stripeInfoByUuid={{ [defaultSubscription.uuid]: mockStripeInfoActive }}
      />,
    );
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('displays subscription information', () => {
    renderWithRouter(
      <SubscriptionCardWrapper
        {...defaultProps}
        stripeInfoByUuid={{ [defaultSubscription.uuid]: mockStripeInfoActive }}
      />,
    );
    const { title } = defaultSubscription;
    expect(screen.getByText(title));
  });

  it.each([
    [dayjs().add(1, 'days').toISOString(), '1 day'],
    [dayjs().add(3, 'days').toISOString(), '3 days'],
    [dayjs().add(1, 'hours').toISOString(), '1 hour'],
    [dayjs().add(3, 'hours').toISOString(), '3 hours'],
  ])('displays days until plan starts text if there are no actions and the plan is scheduled', (startDate, expectedText) => {
    renderWithRouter(
      <ResponsiveContext.Provider value={responsiveContextValue}>
        <SubscriptionCardWrapper
          {...defaultProps}
          stripeInfoByUuid={{ [defaultSubscription.uuid]: mockStripeInfoActive }}
          subscription={{
            ...defaultSubscription,
            startDate,
          }}
        />
      </ResponsiveContext.Provider>,
    );
    expect(screen.getByText(`Plan begins in ${expectedText}`));
  });

  it('displays actions', () => {
    const mockCreateActions = jest.fn(() => ([{
      variant: 'primary',
      to: '/',
      buttonText: 'action 1',
    }]));
    renderWithRouter(
      <SubscriptionCardWrapper
        {...defaultProps}
        stripeInfoByUuid={{ [defaultSubscription.uuid]: mockStripeInfoActive }}
        createActions={mockCreateActions}
      />,
    );
    expect(mockCreateActions).toHaveBeenCalledWith(defaultSubscription);
    expect(screen.getByText('action 1'));
  });

  it('displays trial subscription with additional subtitle and button', () => {
    renderWithRouter(
      <SubscriptionCardWrapper
        {...trialProps}
        stripeInfoByUuid={{ [trialSubscription.uuid]: mockStripeInfoActive }}
      />,
    );
    expect(screen.getByText(FREE_TRIAL_BADGE));
    // Trial expiration date
    expect(screen.getByText('April 13, 2025'));
    // Future invoice cost
    expect(screen.getByText('$2,000 USD'));

    const billingLink = screen.getByText('Manage subscription');
    expect(billingLink).toBeInTheDocument();
    // Verify it's a link to the billing page (now using native billing management instead of Stripe portal)
    expect(billingLink).toHaveAttribute('href', '/enterpriseUUID/admin/billing');
  });

  it('does not render trial subtitle for an expired trial ', () => {
    renderWithRouter(
      <SubscriptionCardWrapper
        {...endedTrialProps}
        stripeInfoByUuid={{ [endedTrialSubscription.uuid]: mockStripeInfoActive }}
      />,
    );
    expect(screen.getByText(FREE_TRIAL_BADGE));
    expect(screen.getByText(ENDED));
    expect(screen.queryByText('Your 14-day free trial will conclude')).not.toBeInTheDocument();
  });

  it('renders canceled trial messaging when subscription is canceled', () => {
    renderWithRouter(
      <SubscriptionCardWrapper
        {...trialProps}
        stripeInfoByUuid={{ [trialSubscription.uuid]: mockStripeInfoCanceled }}
      />,
    );

    // Check for Canceled and Free Trial badge
    expect(screen.getByText(CANCELED)).toBeInTheDocument();
    expect(screen.getByText(FREE_TRIAL_BADGE)).toBeInTheDocument();

    expect(screen.getByText(/Your plan is scheduled to end on/i)).toBeInTheDocument();
    expect(screen.getByText('January 29, 2027')).toBeInTheDocument();

    // Ensure the active-trial billing warning is NOT shown
    expect(screen.queryByText('Your 14-day free trial will conclude')).not.toBeInTheDocument();
  });
});
