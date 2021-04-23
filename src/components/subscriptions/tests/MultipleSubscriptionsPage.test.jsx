import {
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import React from 'react';
import { renderWithRouter } from '../../test/testUtils';
import { SubscriptionContext } from '../SubscriptionData';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';

import MultipleSubscriptionsPage from '../MultipleSubscriptionsPage';

const fakeSlug = 'snail';
const defaultProps = {
  match: {
    params: {
      enterpriseSlug: fakeSlug,
    },
  },
};

// required for the expiration components
const fakeStore = {
  portalConfiguration: {
    enterpriseSlug: 'sluggo',
    enableCodeManagementScreen: false,
  },
};

const defaultSubscriptions = {
  data: {
    results: [
      {
        uuid: 'ided',
        title: 'Enterprise A',
        startDate: '2021-04-13',
        expirationDate: '2024-04-13',
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
        licenses: {
          allocated: 11,
          total: 30,
        },
      },
    ],
  },
  setErrors: () => {},
  errors: null,
};

const mockStore = configureMockStore([thunk]);

// eslint-disable-next-line react/prop-types
const MultipleSubscriptionsPageWrapper = ({ subscriptions = defaultSubscriptions, ...props }) => (
  <Provider store={mockStore(fakeStore)}>
    <SubscriptionContext.Provider value={subscriptions}>
      <MultipleSubscriptionsPage {...props} />
    </SubscriptionContext.Provider>
  </Provider>
);

describe('MultipleSubscriptionsPage', () => {
  it('displays a the MultipleSubscriptionPicker when there are multiple subscriptions', () => {
    renderWithRouter(<MultipleSubscriptionsPageWrapper {...defaultProps} />, {
      route: `/${fakeSlug}/admin/${ROUTE_NAMES.subscriptionManagement}`,
      path: `/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}`,
    });
    expect(screen.getByText('Cohorts')).toBeInTheDocument();
  });
  it('returns null if there are no subscriptions', () => {
    const subscriptions = { data: { results: [] } };
    renderWithRouter(<MultipleSubscriptionsPageWrapper subscriptions={subscriptions} {...defaultProps} />, {
      route: `/${fakeSlug}/admin/${ROUTE_NAMES.subscriptionManagement}`,
      path: `/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}`,
    });
    expect(screen.queryByText('Cohorts')).not.toBeInTheDocument();
  });
  it('redirects if there is only one subscription, default redirectPage', () => {
    const subsUuid = 'bestuuid';
    const subscriptions = {
      data: {
        results: [{
          uuid: subsUuid,
          title: 'Enterprise A',
          startDate: '2021-04-13',
          expirationDate: '2024-04-13',
          licenses: {
            allocated: 10,
            total: 20,
          },
        }],
      },
    };
    const { history } = renderWithRouter(
      <MultipleSubscriptionsPageWrapper subscriptions={subscriptions} {...defaultProps} />,
      {
        route: `/${fakeSlug}/admin/${ROUTE_NAMES.subscriptionManagement}`,
        path: `/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}`,
      },
    );
    expect(history.location.pathname).toEqual(`/${fakeSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${subsUuid}`);
  });
  it('redirects if there is only one subscription, custom redirect page', () => {
    const redirectPage = 'bulkenrollment';
    const subsUuid = 'bestuuid';
    const subscriptions = {
      data: {
        results: [{
          uuid: subsUuid,
          title: 'Enterprise A',
          startDate: '2021-04-13',
          expirationDate: '2024-04-13',
          licenses: {
            allocated: 10,
            total: 20,
          },
        }],
      },
    };
    const { history } = renderWithRouter(
      <MultipleSubscriptionsPageWrapper subscriptions={subscriptions} {...defaultProps} redirectPage={redirectPage} />,
      {
        route: `/${fakeSlug}/admin/${ROUTE_NAMES.subscriptionManagement}`,
        path: `/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}`,
      },
    );
    expect(history.location.pathname).toEqual(`/${fakeSlug}/admin/${redirectPage}/${subsUuid}`);
  });
});
