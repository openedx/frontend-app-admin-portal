import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { renderWithRouter } from '../../test/testUtils';
import { DEFAULT_LEAD_TEXT, SELF_SERVICE_PAID } from '../data/constants';
import MultipleSubscriptionsPicker from '../MultipleSubscriptionPicker';
import EnterpriseAccessApiService from '../../../data/services/EnterpriseAccessApiService';

const firstCatalogUuid = 'catalogID1';
const firstEnterpriseUuid = 'ided';
const defaultProps = {
  enterpriseSlug: 'sluggy',
  subscriptions: [
    {
      uuid: firstEnterpriseUuid,
      title: 'Enterprise A',
      startDate: '2021-04-13',
      expirationDate: '2024-04-13',
      enterpriseCatalogUuid: firstCatalogUuid,
      licenses: {
        allocated: 10,
        total: 20,
      },
    },
    {
      uuid: 'anotherid',
      title: 'Enterprise B',
      startDate: '2021-03-13',
      expirationDate: '2024-10-13',
      enterpriseCatalogUuid: 'catalogID2',
      licenses: {
        allocated: 11,
        total: 30,
      },
    },
  ],
};

const subsProps = {
  enterpriseSlug: 'sluggy',
  subscriptions: [
    {
      uuid: firstEnterpriseUuid,
      title: 'Enterprise A',
      startDate: '2021-04-13',
      expirationDate: '2024-04-13',
      enterpriseCatalogUuid: firstCatalogUuid,
      planType: SELF_SERVICE_PAID,
      licenses: {
        allocated: 10,
        total: 20,
      },
    },
  ],
};

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  getLocale: () => 'en',
}));

jest.mock('../../../data/services/EnterpriseAccessApiService', () => ({
  fetchStripeBillingPortalSession: jest.fn(),
}));

jest.mock('../data/hooks', () => ({
  ...jest.requireActual('../data/hooks'),
  useStripeSubscriptionPlanInfo: jest.fn().mockReturnValue({
    invoiceAmount: '2000',
    currency: 'usd',
    canceledDate: null,
    loadingStripeSummary: false,
  }),
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

const MultipleSubscriptionsWrapper = ({ ...props }) => {
  const store = getMockStore({ ...initialStoreState });
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <MultipleSubscriptionsPicker {...props} />
      </Provider>
    </IntlProvider>
  );
};

describe('MultipleSubscriptionsPicker', () => {
  it('displays a title', () => {
    renderWithRouter(<MultipleSubscriptionsWrapper {...defaultProps} />);
    expect(screen.getByText('Plans')).toBeInTheDocument();
  });
  it('displays default lead text by default', () => {
    renderWithRouter(<MultipleSubscriptionsWrapper {...defaultProps} />);
    expect(screen.getByText(DEFAULT_LEAD_TEXT)).toBeInTheDocument();
  });
  it('displays an alternate lead text', () => {
    const leadText = 'Lead me in';
    renderWithRouter(<MultipleSubscriptionsWrapper {...defaultProps} leadText={leadText} />);
    expect(screen.getByText(leadText)).toBeInTheDocument();
  });
  it('does not display button to stripe portal without self-service subscription', () => {
    renderWithRouter(<MultipleSubscriptionsWrapper {...defaultProps} />);
    expect(screen.queryByText('Manage subscription')).not.toBeInTheDocument();
  });
  it('displays Manage subscription button to Stripe portal', () => {
    EnterpriseAccessApiService.fetchStripeBillingPortalSession.mockReturnValue({
      data: {
        url: 'https://fake-stripe-url.com',
      },
    });
    const spy = jest.spyOn(EnterpriseAccessApiService, 'fetchStripeBillingPortalSession');
    renderWithRouter(<MultipleSubscriptionsWrapper {...subsProps} />);
    const stripeButton = screen.getByText('Manage subscription');
    expect(stripeButton).toBeInTheDocument();
    stripeButton.click();
    expect(spy).toHaveBeenCalledWith('enterpriseUUID');
  });
  it('displays a subscription card for each subscription', () => {
    renderWithRouter(<MultipleSubscriptionsWrapper {...defaultProps} />);
    defaultProps.subscriptions.forEach((subscription) => {
      expect(screen.getByText(subscription.title)).toBeInTheDocument();
    });
  });
});
