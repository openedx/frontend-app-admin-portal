/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import moment from 'moment';
import { screen, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom/extend-expect';

import {
  TEST_ENTERPRISE_CUSTOMER_SLUG, createMockStore,
} from './TestUtilities';
import SubscriptionManagementPage from '../SubscriptionManagementPage';
import { ROUTE_NAMES } from '../../EnterpriseApp/constants';
import { renderWithRouter } from '../../test/testUtils';
import * as hooks from '../data/hooks';
import { SubsidyRequestsContext } from '../../subsidy-requests';
import { SUBSIDY_REQUESTS_TYPES } from '../../SubsidyRequestManagementTable/data/constants';

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
          activated: 5,
          assigned: 5,
          allocated: 10,
          total: 20,
          unassigned: 10,
        },
        showExpirationNotifications: true,
      },
      {
        uuid: 'expired',
        title: 'Enterprise B',
        startDate: moment().toISOString(),
        expirationDate: moment().subtract(3, 'days').toISOString(),
        licenses: {
          activated: 6,
          assigned: 5,
          allocated: 11,
          total: 30,
          unassigned: 10,
        },
        showExpirationNotifications: true,
      },
    ];
    const defaultSubsidyRequestsState = {
      subsidyRequestConfiguration: {
        subsidyType: SUBSIDY_REQUESTS_TYPES.licenses,
        subsidyRequestsEnabled: false,
      },
      subsidyRequestsCounts: { subscriptionLicenses: 0 },

    };

    function SubscriptionManagementPageWrapper({
      subscriptions = defaultSubscriptions,
      subsidyRequestsState = defaultSubsidyRequestsState,
    }) {
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
          <IntlProvider locale="en">
            <SubsidyRequestsContext.Provider value={subsidyRequestsState}>
              <SubscriptionManagementPage />
            </SubsidyRequestsContext.Provider>
          </IntlProvider>
        </Provider>
      );
    }

    it('renders the correct button text on subscription cards', () => {
      renderWithRouter(<SubscriptionManagementPageWrapper />, {
        route: `/${TEST_ENTERPRISE_CUSTOMER_SLUG}/admin/${ROUTE_NAMES.subscriptionManagement}`,
        path: `/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}`,
      });
      waitFor(() => {
        expect(screen.getByText('Manage learners'));
        expect(screen.getByText('View learners'));
      });
    });
  });
});
