/* eslint-disable react/prop-types */
import React from 'react';
import { Provider } from 'react-redux';
import dayjs from 'dayjs';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { MemoryRouter, Routes, Route } from 'react-router-dom';
import {
  TEST_ENTERPRISE_CUSTOMER_SLUG, createMockStore,
} from './TestUtilities';
import SubscriptionManagementPage from '../SubscriptionManagementPage';
import { ROUTE_NAMES } from '../../EnterpriseApp/data/constants';
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
        startDate: dayjs().toISOString(),
        expirationDate: dayjs().add(3, 'days').toISOString(),
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
        startDate: dayjs().toISOString(),
        expirationDate: dayjs().subtract(3, 'days').toISOString(),
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

    const SubscriptionManagementPageWrapper = ({
      subscriptions = defaultSubscriptions,
      subsidyRequestsState = defaultSubsidyRequestsState,
    }) => {
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
              <MemoryRouter initialEntries={[`/${TEST_ENTERPRISE_CUSTOMER_SLUG}/admin/${ROUTE_NAMES.subscriptionManagement}`]}>
                <Routes>
                  <Route
                    path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}/*`}
                    element={<SubscriptionManagementPage />}
                  />
                </Routes>
              </MemoryRouter>
            </SubsidyRequestsContext.Provider>
          </IntlProvider>
        </Provider>
      );
    };

    it('renders the correct button text on subscription cards', async () => {
      render(<SubscriptionManagementPageWrapper />);
      expect(screen.getByText('Manage learners'));
      expect(screen.getByText('View learners'));
    });
  });
});
