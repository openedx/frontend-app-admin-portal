import React from 'react';
import { mount } from 'enzyme';

import { createMemoryHistory } from 'history';
import { Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as hooks from './hooks/licenseManagerHooks';
import { ToastsContext } from '../Toasts';
import {
  ASSIGNED, TAB_LICENSED_USERS, TAB_PENDING_USERS, TAB_REVOKED_USERS,
} from './constants';
import SubscriptionManagementPage from './SubscriptionManagementPage';

const mockStore = configureMockStore([thunk]);
const store = mockStore({
  authentication: {
    username: 'edx',
    roles: ['enterprise_admin:*'],
  },
  userAccount: {
    loaded: true,
    isActive: true,
  },
  portalConfiguration: {
    enterpriseSlug: 'test-enterprise',
    enterpriseId: 'test-enterprise-id',
    enableSubscriptionManagementScreen: true,
    enableCodeManagementScreen: true,
  },
});

const initialHistory = createMemoryHistory({
  initialEntries: ['/'],
});

/* eslint-disable react/prop-types */
const ManagementPageWithContext = () => (
  <Router history={initialHistory}>
    <Provider store={store}>
      <ToastsContext.Provider value={{ addToast: () => {} }}>
        <Route
          exact
          path="/test-enterprise/admin/subscriptions"
        >
          <SubscriptionManagementPage
            enterpriseSlug="test-enterprise"
            enterpriseId="a test id"
          />
        </Route>
      </ToastsContext.Provider>
    </Provider>
  </Router>
);

/* eslint-enable react/prop-types */

describe('SubscriptionManagementPage', () => {
  let mockLoadSubscriptionData = {};
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadSubscriptionData = {
      fetch: jest.fn(),
      data: {
        subscriptions: {
          pageCount: 1,
          next: null,
          previous: null,
          results: [{
            title: 'a subscription',
            uuid: '28d4dcdc-c026-4c02-a263-82dd9c0d8b43',
            startDate: '2020-12-08',
            expirationDate: '2025-12-08',
            enterpriseCustomerUuid: 'b5f07fee-1b34-458f-b672-19b55fc1bd10',
            enterpriseCatalogUuid: 'ff7acb5e-584a-4e5f-bacc-33a9995794f9',
            isActive: true,
            licenses: {
              total: 10,
              allocated: 0,
            },
            revocations: {
              applied: 0,
              remaining: 1,
            },
            daysUntilExpiration: 1826,
          },
          ],
        },
        overview: {},
        subscriptionUsers: {
          numPages: 1, next: null, previous: null, results: [],
        },
      },
      isLoading: false,
      hasSubscription: true,
    };
  });

  test('displays the zero state on the default All Users tab with no allocations', () => {
    jest.spyOn(hooks, 'useSubscriptionData').mockImplementation(() => mockLoadSubscriptionData);

    const wrapper = mount(<ManagementPageWithContext />);
    expect(wrapper.find('SubscriptionZeroStateMessaging').exists()).toBeTruthy();
  });

  test('does not display the zero state on All Users tab when there are allocations', () => {
    mockLoadSubscriptionData.data.subscriptionUsers = {
      numPages: 1, next: null, previous: null, results: [{ userEmail: 'user@email.com', lastRemindDate: '12-07-2020', status: ASSIGNED }],
    };

    jest.spyOn(hooks, 'useSubscriptionData').mockImplementation(() => mockLoadSubscriptionData);

    const wrapper = mount(<ManagementPageWithContext />);
    expect(wrapper.find('SubscriptionZeroStateMessaging').exists()).toBeFalsy();
  });

  const testTab = (tab) => {
    jest.spyOn(hooks, 'useSubscriptionData').mockImplementation(() => mockLoadSubscriptionData);

    const wrapper = mount(<ManagementPageWithContext />);
    wrapper.find(`#navigation-${tab}`).simulate('click');
    wrapper.update();
    expect(wrapper.find('SubscriptionZeroStateMessaging').exists()).toBeFalsy();
  };

  [TAB_PENDING_USERS, TAB_REVOKED_USERS, TAB_LICENSED_USERS].forEach((tab) => {
    test(`does not display the zero state on ${tab} with no allocations`, () => {
      testTab(tab);
    });

    test(`does not display the zero state on ${tab} with allocations`, () => {
      mockLoadSubscriptionData.data.subscriptionUsers = {
        numPages: 1, next: null, previous: null, results: [{ userEmail: 'user@email.com', lastRemindDate: '12-07-2020', status: ASSIGNED }],
      };
      testTab(tab);
    });
  });
});
