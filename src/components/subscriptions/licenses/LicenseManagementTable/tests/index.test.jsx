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

const nonExpiredSubscriptionPlan = (
  { licenses } = {},
) => {
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
      ...licenses,
    },
    revocations: {
      applied: 0,
      remaining: 0,
    },
    daysUntilExpiration,
    agreementNetDaysUntilExpiration: daysUntilExpiration,
    hasMultipleSubscriptions: true,
    isRevocationCapEnabled: false,
  };
};

const expiredSubscriptionPlan = (
  { licenses } = {},
) => {
  const baseSubscriptionPlan = nonExpiredSubscriptionPlan();
  return {
    ...baseSubscriptionPlan,
    expirationDate: baseSubscriptionPlan.startDate,
    daysUntilExpiration: 0,
    agreementNetDaysUntilExpiration: 0,
    licenses: {
      ...baseSubscriptionPlan.licenses,
      ...licenses,
    },
  };
};

const generateUseSubscriptionData = (subscriptionPlan) => ({
  subscriptions: {
    count: 1,
    next: null,
    previous: null,
    results: [subscriptionPlan],
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

const generateUseSubscriptionUsers = (subscriptionUsers) => ({
  count: 0,
  next: null,
  previous: null,
  numPages: 1,
  results: subscriptionUsers,
});

const mockHooks = ({
  subscriptionPlan,
  subscriptionUsers,
}) => {
  jest.spyOn(hooks, 'useSubscriptionData').mockImplementation(() => generateUseSubscriptionData(subscriptionPlan));
  jest.spyOn(hooks, 'useSubscriptionUsersOverview').mockImplementation(() => [generateUseSubscriptionUsersOverview()]);
  jest.spyOn(hooks, 'useSubscriptionUsers').mockImplementation(() => [generateUseSubscriptionUsers(subscriptionUsers), () => {}]);
};

// eslint-disable-next-line react/prop-types
const tableWithContext = ({ subscriptionPlan }) => (
  <Provider store={store}>
    <ToastsContext.Provider value={{ addToast: () => {} }}>
      <SubscriptionData enterpriseId="foo">
        <SubscriptionDetailContextProvider
          subscription={subscriptionPlan}
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

  describe('zero state (no subscription users)', () => {
    it('renders zero state message', () => {
      const subscriptionPlan = nonExpiredSubscriptionPlan();
      mockHooks({
        subscriptionPlan,
        subscriptionUsers: [],
      });
      render(tableWithContext({
        subscriptionPlan,
      }));
      expect(screen.getByText('Get Started'));
    });
  });

  describe('with subscription users', () => {
    describe('expired', () => {
      const subscriptionPlan = expiredSubscriptionPlan({
        licenses: {
          total: 10,
          unassigned: 5,
        },
      });
      beforeEach(() => {
        mockHooks({
          subscriptionPlan,
          subscriptionUsers: [{
            activationDate: moment(),
            activationKey: 'test-activation-key',
            lastRemindDate: moment(),
            revokedDate: null,
            status: 'activated',
            subscriptionPlan: {},
            userEmail: 'edx@example.com',
            uuid: 'test-uuid',
          }],
        });
        expect(screen.queryByText('Get Started')).toBeFalsy();
      });

      it('does not allow selection of table rows', () => {
        render(tableWithContext({
          subscriptionPlan,
        }));
        expect(screen.queryByTitle('Toggle Row Selected')).toBeFalsy();
      });
    });

    describe('non-expired', () => {
      const subscriptionPlan = nonExpiredSubscriptionPlan({
        licenses: {
          total: 10,
          unassigned: 5,
        },
      });
      beforeEach(() => {
        mockHooks({
          subscriptionPlan,
          subscriptionUsers: [{
            activationDate: moment(),
            activationKey: 'test-activation-key',
            lastRemindDate: moment(),
            revokedDate: null,
            status: 'activated',
            subscriptionPlan: {},
            userEmail: 'edx@example.com',
            uuid: 'test-uuid',
          }],
        });
      });

      it('allows selection of table rows', () => {
        render(tableWithContext({
          subscriptionPlan,
        }));
        expect(screen.getByTitle('Toggle Row Selected'));
      });
    });
  });
});
