import React from 'react';
import { Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { createMemoryHistory } from 'history';

import PropTypes from 'prop-types';
import SubscriptionData from '../SubscriptionData';
import { ASSIGNED } from '../data/constants';
import { ToastsContext } from '../../Toasts';
import SubscriptionDetailContextProvider from '../SubscriptionDetailContextProvider';
import * as hooks from '../data/hooks';

export const TEST_ENTERPRISE_CUSTOMER_SLUG = 'test-enterprise';
const TEST_ENTERPRISE_CUSTOMER_UUID = 'b5f07fee-1b34-458f-b672-19b55fc1bd10';
const TEST_ENTERPRISE_CUSTOMER_CATALOG_UUID = 'ff7acb5e-584a-4e5f-bacc-33a9995794f9';
const TEST_SUBSCRIPTION_PLAN_TITLE = 'Test Subscription Plan';
const TEST_SUBSCRIPTION_PLAN_UUID = '28d4dcdc-c026-4c02-a263-82dd9c0d8b43';

export const SUBSCRIPTION_PLAN_ZERO_STATE = {
  daysUntilExpiration: 240,
  agreementNetDaysUntilExpiration: 240,
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
  showExpirationNotifications: true,
  priorRenewals: [],
  isLockedForRenewalProcessing: false,
};
export const SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE = {
  daysUntilExpiration: 240,
  agreementNetDaysUntilExpiration: 240,
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
  showExpirationNotifications: true,
  priorRenewals: [],
  isLockedForRenewalProcessing: false,
};

const subscriptionPlan = (state) => {
  const {
    priorRenewals,
    daysUntilExpiration,
    licenses,
    showExpirationNotifications,
    agreementNetDaysUntilExpiration,
    isLockedForRenewalProcessing,
  } = state;

  return ({
    title: TEST_SUBSCRIPTION_PLAN_TITLE,
    uuid: TEST_SUBSCRIPTION_PLAN_UUID,
    startDate: '2020-12-08',
    expirationDate: '2025-12-08',
    enterpriseCustomerUuid: TEST_ENTERPRISE_CUSTOMER_UUID,
    enterpriseCatalogUuid: TEST_ENTERPRISE_CUSTOMER_CATALOG_UUID,
    isActive: true,
    licenses,
    revocations: {
      applied: 0,
      remaining: 1,
    },
    daysUntilExpiration,
    showExpirationNotifications,
    agreementNetDaysUntilExpiration,
    priorRenewals,
    isLockedForRenewalProcessing,
  });
};

export const DEFAULT_STORE_STATE = {
  authentication: {
    username: 'edx',
    roles: ['enterprise_admin:*'],
  },
  userAccount: {
    loaded: true,
    isActive: true,
  },
  portalConfiguration: {
    enterpriseSlug: TEST_ENTERPRISE_CUSTOMER_SLUG,
    enterpriseId: TEST_ENTERPRISE_CUSTOMER_UUID,
    enableSubscriptionManagementScreen: true,
    enableCodeManagementScreen: true,
  },
};

export const createMockStore = (state) => {
  const mockStore = configureMockStore([thunk]);

  return mockStore({
    ...DEFAULT_STORE_STATE,
    // override any previously set fields with ``state`` argument
    ...state,
  });
};

const initialHistory = createMemoryHistory({
  initialEntries: ['/'],
});

export const mockUseSubscriptionData = (state) => ({
  subscriptions: {
    count: 1,
    next: null,
    previous: null,
    results: [subscriptionPlan(state)],
  },
  errors: {},
  setErrors: () => {},
  forceRefresh: () => {},
});

export const mockUseSubscriptionUsers = (state) => [
  {
    count: state.users.length,
    next: null,
    previous: null,
    numPages: 1,
    results: state.users,
  },
  () => {},
  false,
];

export const SubscriptionManagementContext = ({ children, detailState, store }) => {
  jest.spyOn(hooks, 'useSubscriptionData').mockImplementation(() => mockUseSubscriptionData(detailState));
  jest.spyOn(hooks, 'useSubscriptionUsersOverview').mockImplementation(() => [detailState.overview, () => {}]);
  jest.spyOn(hooks, 'useSubscriptionUsers').mockImplementation(() => mockUseSubscriptionUsers(detailState));
  return (
    <Router history={initialHistory}>
      <Provider store={store}>
        <ToastsContext.Provider value={{ addToast: () => {} }}>
          <SubscriptionData enterpriseId={TEST_ENTERPRISE_CUSTOMER_UUID}>
            <SubscriptionDetailContextProvider
              subscription={subscriptionPlan(detailState)}
              hasMultipleSubscriptions={false}
            >
              {children}
            </SubscriptionDetailContextProvider>
          </SubscriptionData>
        </ToastsContext.Provider>
      </Provider>
    </Router>
  );
};

SubscriptionManagementContext.propTypes = {
  children: PropTypes.node.isRequired,
  detailState: PropTypes.shape({
    daysUntilExpiration: PropTypes.number.isRequired,
    licenses: PropTypes.shape({
      total: PropTypes.number.isRequired,
      allocated: PropTypes.number.isRequired,
    }).isRequired,
    showExpirationNotifications: PropTypes.bool.isRequired,
    overview: PropTypes.shape({
      activated: PropTypes.number.isRequired,
      all: PropTypes.number.isRequired,
      assigned: PropTypes.number.isRequired,
      revoked: PropTypes.number.isRequired,
      unassigned: PropTypes.number.isRequired,
    }).isRequired,
    users: PropTypes.arrayOf(PropTypes.shape({
      uuid: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      userEmail: PropTypes.string.isRequired,
      activationDate: PropTypes.string.isRequired,
      lastRemindDate: PropTypes.string.isRequired,
    })).isRequired,
    priorRenewals: PropTypes.arrayOf(
      PropTypes.shape({
        priorSubscriptionPlanStartDate: PropTypes.string.isRequired,
        priorSubscriptionPlanId: PropTypes.string.isRequired,
        renewedSubscriptionPlanId: PropTypes.string.isRequired,
        renewedSubscriptionPlanStartDate: PropTypes.string.isRequired,
      }),
    ),
  }).isRequired,
  store: PropTypes.shape(),
};

SubscriptionManagementContext.defaultProps = {
  store: createMockStore(),
};
