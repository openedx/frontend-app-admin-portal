import React from 'react';
import {
  screen,
  render,
  cleanup,
} from '@testing-library/react';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import moment from 'moment';
import { ToastsContext } from '../../../../Toasts';
import SubscriptionDetailContextProvider from '../../../SubscriptionDetailContextProvider';
import SubscriptionData from '../../../SubscriptionData';

import LicenseManagementTable from '../index';
import * as hooks from '../../../data/hooks';

const mockStore = configureMockStore();
const store = mockStore({
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
  },
});

const subscriptionPlan = () => {
  const startDate = moment().subtract(1, 'days');
  const daysUntilExpiration = 2;
  return {
    title: 'Foo',
    uuid: 'bar',
    startDate: startDate.format(),
    expirationDate: startDate.add(daysUntilExpiration, 'days').format(),
    enterpriseCustomerUuid: 'foo',
    enterpriseCatalogUuid: 'foo',
    isActive: true,
    licenses: {
      total: 10,
      allocated: 0,
      unassigned: 10,
    },
    revocations: {
      total: 10,
      allocated: 0,
      applied: 0,
      remaining: 0,
    },
    daysUntilExpiration,
    agreementNetDaysUntilExpiration: daysUntilExpiration,
    hasMultipleSubscriptions: true,
    isRevocationCapEnabled: false,
  };
};

const generateUseSubscriptionData = () => ({
  subscriptions: {
    count: 1,
    next: null,
    previous: null,
    results: [subscriptionPlan()],
  },
  errors: {},
  setErrors: () => {},
  forceRefresh: () => {},
  loading: false,
});

const generateUseSubscriptionUsersOverview = () => ({
  activated: 0,
  all: 0,
  assigned: 0,
  revoked: 0,
  unassigned: 0,
});

const generateUseSubscriptionUsers = () => ({
  count: 0,
  next: null,
  previous: null,
  numPages: 1,
  results: [],
});

const mockHooks = () => {
  jest.spyOn(hooks, 'useSubscriptionData').mockImplementation(() => generateUseSubscriptionData());
  jest.spyOn(hooks, 'useSubscriptionUsersOverview').mockImplementation(() => [generateUseSubscriptionUsersOverview()]);
  jest.spyOn(hooks, 'useSubscriptionUsers').mockImplementation(() => [generateUseSubscriptionUsers(), () => {}]);
};

const tableWithContext = () => (
  <Provider store={store}>
    <ToastsContext.Provider value={{ addToast: () => {} }}>
      <SubscriptionData enterpriseId="foo">
        <SubscriptionDetailContextProvider
          subscription={subscriptionPlan()}
        >
          <LicenseManagementTable />
        </SubscriptionDetailContextProvider>
      </SubscriptionData>
    </ToastsContext.Provider>
  </Provider>
);

describe('<LicenseManagementTable />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders zero state message', () => {
    mockHooks();
    render(tableWithContext());
    expect(screen.getByText('Get Started')).toBeTruthy();
  });
});
