import React from 'react';
import { mount } from 'enzyme';

import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as hooks from '../data/hooks';
import { ToastsContext } from '../../Toasts';
import {
  ASSIGNED,
  TAB_LICENSED_USERS,
  TAB_PENDING_USERS,
  TAB_REVOKED_USERS,
} from '../data/constants';
import SubscriptionDetailContextProvider from '../SubscriptionDetailContextProvider';
import SubscriptionData from '../SubscriptionData';
import LicenseAllocationDetails from './LicenseAllocationDetails';

// Testing constants
const ENTERPRISE_CUSTOMER_SLUG = 'test-enterprise';
const ENTERPRISE_CUSTOMER_UUID = 'b5f07fee-1b34-458f-b672-19b55fc1bd10';
const ENTERPRISE_CUSTOMER_CATALOG_UUID = 'ff7acb5e-584a-4e5f-bacc-33a9995794f9';
const SUBSCRIPTION_PLAN_TITLE = 'Test Subscription Plan';
const SUBSCRIPTION_PLAN_UUID = '28d4dcdc-c026-4c02-a263-82dd9c0d8b43';
const SUBSCRIPTION_PLAN_ZERO_STATE = {
  licenses: {
    total: 10,
    allocated: 0,
  },
  overview: {
    activated: 0,
    all: 10,
    assigned: 0,
    revoked: 0,
    unassigned: 10,
  },
  users: [],
};
const SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE = {
  licenses: {
    total: 10,
    allocated: 1,
  },
  overview: {
    activated: 0,
    all: 10,
    assigned: 1,
    revoked: 0,
    unassigned: 9,
  },
  users: [
    {
      uuid: 'fc4ad414-9dcb-4ab5-8095-810518d997de',
      status: ASSIGNED,
      userEmail: 'user@test.ch',
      activationDate: '2020-12-08',
      lastRemindDate: '2020-12-08',
    },
  ],
};
const subscriptionPlan = (state) => ({
  title: SUBSCRIPTION_PLAN_TITLE,
  uuid: SUBSCRIPTION_PLAN_UUID,
  startDate: '2020-12-08',
  expirationDate: '2025-12-08',
  enterpriseCustomerUuid: ENTERPRISE_CUSTOMER_UUID,
  enterpriseCatalogUuid: ENTERPRISE_CUSTOMER_CATALOG_UUID,
  isActive: true,
  licenses: state.licenses,
  revocations: {
    applied: 0,
    remaining: 1,
  },
  daysUntilExpiration: 1826,
});

const mockUseSubscriptionData = (state) => ({
  subscriptions: {
    count: 1,
    next: null,
    previous: null,
    results: [subscriptionPlan(state)],
  },
  errors: {},
  setErrors: () => null,
  forceRefresh: () => null,
});

const mockUseSubscriptionUsers = (state) => ({
  count: state.users.length,
  next: null,
  previous: null,
  numPages: state.users.length > 0 ? 1 : undefined,
  results: state.users,
});

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
    enterpriseSlug: ENTERPRISE_CUSTOMER_SLUG,
    enterpriseId: ENTERPRISE_CUSTOMER_UUID,
    enableSubscriptionManagementScreen: true,
  },
});

const initialHistory = createMemoryHistory({
  initialEntries: ['/'],
});

/* eslint-disable react/prop-types */
const LicenseAllocationDetailsWithContext = ({ state }) => (
  <Router history={initialHistory}>
    <Provider store={store}>
      <ToastsContext.Provider value={{ addToast: () => {} }}>
        <SubscriptionData enterpriseId={ENTERPRISE_CUSTOMER_UUID}>
          <SubscriptionDetailContextProvider subscription={subscriptionPlan(state)} hasMultipleSubscriptions={false}>
            <LicenseAllocationDetails />
          </SubscriptionDetailContextProvider>
        </SubscriptionData>
      </ToastsContext.Provider>
    </Provider>
  </Router>
);
/* eslint-enable react/prop-types */

const mockHooksAndMount = (state) => {
  jest.spyOn(hooks, 'useSubscriptionData').mockImplementation(() => mockUseSubscriptionData(state));
  jest.spyOn(hooks, 'useSubscriptionUsersOverview').mockImplementation(() => state.overview);
  jest.spyOn(hooks, 'useSubscriptionUsers').mockImplementation(() => mockUseSubscriptionUsers(state));
  return mount(<LicenseAllocationDetailsWithContext state={state} />);
};

describe('SubscriptionZeroStateMessaging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays the zero state on the default All Users tab with no allocations', () => {
    const wrapper = mockHooksAndMount(SUBSCRIPTION_PLAN_ZERO_STATE);
    expect(wrapper.find('SubscriptionZeroStateMessaging').exists()).toBeTruthy();
  });

  test('does not display the zero state on All Users tab when there are allocations', () => {
    const wrapper = mockHooksAndMount(SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE);
    expect(wrapper.find('SubscriptionZeroStateMessaging').exists()).toBeFalsy();
  });

  const testTab = (tab, state) => {
    const wrapper = mockHooksAndMount(state);
    wrapper.find(`#navigation-${tab}`).simulate('click');
    wrapper.update();
    expect(wrapper.find('SubscriptionZeroStateMessaging').exists()).toBeFalsy();
  };

  [TAB_PENDING_USERS, TAB_REVOKED_USERS, TAB_LICENSED_USERS].forEach((tab) => {
    test(`does not display the zero state on ${tab} with no allocations`, () => {
      testTab(tab, SUBSCRIPTION_PLAN_ZERO_STATE);
    });

    test(`does not display the zero state on ${tab} with allocations`, () => {
      testTab(tab, SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE);
    });
  });
});
