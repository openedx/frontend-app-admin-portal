import {
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import React from 'react';
import { renderWithRouter } from '../../test/testUtils';
import { SubscriptionContext } from '../SubscriptionData';

import MultipleSubscriptionsPage from '../MultipleSubscriptionsPage';

const defaultProps = {
  match: {
    params: {
      enterpriseSlug: 'sluggy',
    },
  },
};

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
    setErrors: () => {},
    errors: null,
  },
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
  it('displays a title', () => {
    renderWithRouter(<MultipleSubscriptionsPageWrapper {...defaultProps} />, {
      route: '/subscriptions/ABC123',
      path: '/subscriptions/:enterpriseSlug',
    });
    expect(screen.getByText('Cohorts')).toBeInTheDocument();
  });
});
