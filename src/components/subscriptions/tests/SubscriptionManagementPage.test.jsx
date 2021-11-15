import {
  screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import React from 'react';
import { Provider } from 'react-redux';

import moment from 'moment';
import {
  TEST_ENTERPRISE_CUSTOMER_SLUG, createMockStore,
} from './TestUtilities';
import SubscriptionManagementPage from '../SubscriptionManagementPage';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';
import { renderWithRouter } from '../../test/testUtils';
import * as hooks from '../data/hooks';

describe('SubscriptionManagementPage', () => {
  describe('multiple subscriptions', () => {
    const mockStore = createMockStore();
    const defaultSubscriptions = [
      {
        uuid: 'active',
        title: 'Enterprise A',
        startDate: moment().toISOString(),
        expirationDate: moment().add(3, 'days').toISOString(),
        licenses: {
          allocated: 10,
          total: 20,
        },
        showExpirationNotifications: true,
      },
      {
        uuid: 'expired',
        title: 'Enterprise B',
        startDate: moment().toISOString(),
        expirationDate: moment().subtract(3, 'days').toISOString(),
        licenses: {
          allocated: 11,
          total: 30,
        },
        showExpirationNotifications: true,
      },
    ];

    // eslint-disable-next-line react/prop-types
    const SubscriptionManagementPageWrapper = ({ subscriptions = defaultSubscriptions }) => {
      jest.spyOn(hooks, 'useSubscriptionData').mockImplementation(() => ({
        subscriptions: {
          count: 1,
          next: null,
          previous: null,
          results: subscriptions,
        },
        errors: {},
        setErrors: () => {},
        forceRefresh: () => {},
      }));

      return (
        <Provider store={mockStore}>
          <SubscriptionManagementPage />
        </Provider>
      );
    };

    it('renders the correct button text on subscription cards', () => {
      renderWithRouter(<SubscriptionManagementPageWrapper />,
        {
          route: `/${TEST_ENTERPRISE_CUSTOMER_SLUG}/admin/${ROUTE_NAMES.subscriptionManagement}`,
          path: `/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}`,
        });
      expect(screen.getByText('Manage learners'));
      expect(screen.getByText('View learners'));
    });
  });
});
