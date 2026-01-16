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
import { renderWithRouter } from '../../test/testUtils';
import SubscriptionCard from '../SubscriptionCard';
import {
  CANCELED, ENDED, FREE_TRIAL_BADGE, SELF_SERVICE_TRIAL,
} from '../data/constants';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';
import { useStripeSubscriptionPlanInfo } from '../data/hooks';

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

const mockSubPlanInfoActive = {
  invoiceAmount: '2000',
  currency: 'usd',
  canceledDate: null,
  loadingStripeSummary: false,
};

const mockSubPlanInfoCanceled = {
  invoiceAmount: null,
  currency: null,
  canceledDate: '2027-01-29T14:24:33Z',
  loadingStripeSummary: false,
};

const responsiveContextValue = { width: breakpoints.extraSmall.maxWidth };

jest.mock('dayjs', () => (date) => {
  if (date) {
    return jest.requireActual('dayjs')(date);
  }
  return jest.requireActual('dayjs')('2020-01-01T00:00:00.000Z');
});

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
}));

jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useStripeSubscriptionPlanInfo: jest.fn(),
  useStripeBillingPortalSession: jest.fn().mockReturnValue({
    stripeUrl: 'https://docs.stripe.com/',
    loadingSession: false,
  }),
}));

jest.mock('../../../data/services/EnterpriseAccessApiService', () => ({
  fetchStripeBillingPortalSession: jest.fn(),
}));

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const initialStoreState = {
  portalConfiguration: {
    enterpriseId: 'enterpriseUUID',
  },
};

const SubscriptionCardWrapper = ({ initialState = initialStoreState, ...props }) => {
  const store = getMockStore({ ...initialState });
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <SubscriptionCard {...props} />
      </Provider>
    </IntlProvider>
  );
};

describe('SubscriptionCard', () => {
  it('displays subscription information', () => {
    useStripeSubscriptionPlanInfo.mockReturnValue(mockSubPlanInfoActive);
    renderWithRouter(<SubscriptionCardWrapper {...defaultProps} />);
    const { title } = defaultSubscription;
    expect(screen.getByText(title));
  });

  it.each([
    [dayjs().add(1, 'days').toISOString(), '1 day'],
    [dayjs().add(3, 'days').toISOString(), '3 days'],
    [dayjs().add(1, 'hours').toISOString(), '1 hour'],
    [dayjs().add(3, 'hours').toISOString(), '3 hours'],
  ])('displays days until plan starts text if there are no actions and the plan is scheduled', (startDate, expectedText) => {
    useStripeSubscriptionPlanInfo.mockReturnValue(mockSubPlanInfoActive);
    renderWithRouter(
      <ResponsiveContext.Provider value={responsiveContextValue}>
        <SubscriptionCardWrapper
          {...defaultProps}
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
    useStripeSubscriptionPlanInfo.mockReturnValue(mockSubPlanInfoActive);
    const mockCreateActions = jest.fn(() => ([{
      variant: 'primary',
      to: '/',
      buttonText: 'action 1',
    }]));
    renderWithRouter(
      <SubscriptionCardWrapper
        {...defaultProps}
        createActions={mockCreateActions}
      />,
    );
    expect(mockCreateActions).toHaveBeenCalledWith(defaultSubscription);
    expect(screen.getByText('action 1'));
  });

  it('displays trial subscription with additional subtitle and button', () => {
    useStripeSubscriptionPlanInfo.mockReturnValue(mockSubPlanInfoActive);
    EnterpriseAccessApiService.fetchStripeBillingPortalSession.mockReturnValue({
      data: {
        url: 'https://fake-stripe-url.com',
      },
    });
    renderWithRouter(
      <SubscriptionCardWrapper {...trialProps} />,
    );
    expect(screen.getByText(FREE_TRIAL_BADGE));
    // Trial expiration date
    expect(screen.getByText('April 13, 2025'));
    // Future invoice cost
    expect(screen.getByText('2000 USD'));

    const spy = jest.spyOn(EnterpriseAccessApiService, 'fetchStripeBillingPortalSession');
    const hyperlink = screen.getByText('Manage subscription');
    expect(hyperlink).toBeInTheDocument();
    hyperlink.click();
    expect(spy).toHaveBeenCalledWith('enterpriseUUID');
  });

  it('does not render trial subtitle for an expired trial ', () => {
    useStripeSubscriptionPlanInfo.mockReturnValue(mockSubPlanInfoActive);
    renderWithRouter(
      <SubscriptionCardWrapper {...endedTrialProps} />,
    );
    expect(screen.getByText(FREE_TRIAL_BADGE));
    expect(screen.getByText(ENDED));
    expect(screen.queryByText('Your 14-day free trial will conclude')).not.toBeInTheDocument();
  });

  it('renders canceled trial messaging when subscription is canceled', () => {
    useStripeSubscriptionPlanInfo.mockReturnValue(mockSubPlanInfoCanceled);
    renderWithRouter(
      <SubscriptionCardWrapper {...trialProps} />,
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
