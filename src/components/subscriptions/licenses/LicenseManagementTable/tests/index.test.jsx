import React from 'react';
import {
  screen,
  render,
  cleanup,
  act,
  fireEvent,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import moment from 'moment';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { ToastsContext } from '../../../../Toasts';
import SubscriptionDetailContextProvider from '../../../SubscriptionDetailContextProvider';
import SubscriptionData from '../../../SubscriptionData';
import {
  TEST_ENTERPRISE_CUSTOMER_UUID,
} from '../../../tests/TestUtilities';
import LicenseManagementTable from '../index';
import * as hooks from '../../../data/hooks';
import { SUBSCRIPTION_TABLE_EVENTS } from '../../../../../eventTracking';
import { DEBOUNCE_TIME_MILLIS } from '../../../../../algoliaUtils';
import { PAGE_SIZE } from '../../../data/constants';
import LicenseManagerApiService from '../../../../../data/services/LicenseManagerAPIService';

const mockStore = configureMockStore();
const store = mockStore({
  portalConfiguration: {
    enterpriseId: TEST_ENTERPRISE_CUSTOMER_UUID,
  },
});

jest.useFakeTimers('modern');

jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../../../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true,
  default: {
    licenseBulkRevoke: jest.fn(),
    licenseRemind: jest.fn(),
  },
}));

const generateSubscriptionUser = ({
  uuid = 'test-uuid',
  userEmail = 'edx@example.com',
  status = 'activated',
}) => ({
  activationDate: moment(),
  activationKey: 'test-activation-key',
  lastRemindDate: moment(),
  revokedDate: null,
  status,
  userEmail,
  uuid,
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
    enterpriseCustomerUuid: TEST_ENTERPRISE_CUSTOMER_UUID,
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

const forceRefreshSubscription = jest.fn();
const generateUseSubscriptionData = (subscriptionPlan) => ({
  subscriptions: {
    count: 1,
    next: null,
    previous: null,
    results: [subscriptionPlan],
  },
  errors: {},
  setErrors: () => {},
  forceRefresh: forceRefreshSubscription,
  loading: false,
});

const forceRefreshUsersOverview = jest.fn();
const generateUseSubscriptionUsersOverview = () => ({
  activated: 0,
  all: 0,
  assigned: 0,
  revoked: 0,
  unassigned: 0,
});

const forceRefreshUsers = jest.fn();
const generateUseSubscriptionUsers = (subscriptionUsers) => ({
  count: 0,
  next: null,
  previous: null,
  numPages: 2,
  results: subscriptionUsers,
});

const mockHooks = ({
  subscriptionPlan,
  subscriptionUsers,
}) => {
  jest.spyOn(hooks, 'useSubscriptionData').mockImplementation(() => generateUseSubscriptionData(subscriptionPlan));
  jest.spyOn(hooks, 'useSubscriptionUsersOverview').mockImplementation(() => [generateUseSubscriptionUsersOverview(), forceRefreshUsersOverview]);
  jest.spyOn(hooks, 'useSubscriptionUsers').mockImplementation(() => [generateUseSubscriptionUsers(subscriptionUsers), forceRefreshUsers]);
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

const singleUserSetup = (status = 'assigned') => {
  const subscriptionPlan = nonExpiredSubscriptionPlan({
    licenses: {
      total: 1,
      allocated: 1,
      unassigned: 0,
    },
  });
  mockHooks({
    subscriptionPlan,
    subscriptionUsers: [generateSubscriptionUser({ status })],
  });
  render(tableWithContext({ subscriptionPlan }));
};

describe('<LicenseManagementTable />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  beforeEach(cleanup);

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

  describe('sends events', () => {
    const subscriptionPlan = nonExpiredSubscriptionPlan();
    const users = [];
    for (let n = 0; n < PAGE_SIZE + 10; n++) {
      users.push(generateSubscriptionUser({
        uuid: `uuid-${n}`,
        userEmail: `${n}@edx.org`,
        status: 'assigned',
      }));
    }
    afterEach(() => {
      cleanup();
      jest.clearAllMocks();
    });
    beforeEach(() => {
      mockHooks({
        subscriptionPlan,
        subscriptionUsers: users,
      });
    });
    it('when clicking status filters', async () => {
      render(tableWithContext({
        subscriptionPlan,
      }));

      // click status checkbox
      const activeCheckBox = screen.getByText('Active');
      await act(async () => {
        userEvent.click(activeCheckBox);
        // filter debounce
        jest.advanceTimersByTime(DEBOUNCE_TIME_MILLIS);
      });

      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        TEST_ENTERPRISE_CUSTOMER_UUID,
        SUBSCRIPTION_TABLE_EVENTS.FILTER_STATUS,
        { applied_filters: 'activated' },
      );
    });
    it('when typing in to email filter', async () => {
      render(tableWithContext({
        subscriptionPlan,
      }));
      const emailInput = screen.getByPlaceholderText('Search Email address');
      // type in 'foo' to email input
      fireEvent.change(emailInput, { target: { value: 'foo' } });

      act(() => {
        jest.advanceTimersByTime(DEBOUNCE_TIME_MILLIS);
      });

      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        TEST_ENTERPRISE_CUSTOMER_UUID,
        SUBSCRIPTION_TABLE_EVENTS.FILTER_EMAIL,
      );
    });

    it('when changing to the page', async () => {
      render(tableWithContext({
        subscriptionPlan,
      }));
      const nextPageButton = screen.getByText('Next');
      await act(async () => {
        userEvent.click(nextPageButton);
        // filter debounce
        jest.advanceTimersByTime(DEBOUNCE_TIME_MILLIS);
      });
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        TEST_ENTERPRISE_CUSTOMER_UUID,
        SUBSCRIPTION_TABLE_EVENTS.PAGINATION_NEXT,
        { page: 1 },
      );
      const prevPageButton = screen.getByText('Previous');
      await act(async () => {
        userEvent.click(prevPageButton);
        // filter debounce
        jest.advanceTimersByTime(DEBOUNCE_TIME_MILLIS);
      });
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        TEST_ENTERPRISE_CUSTOMER_UUID,
        SUBSCRIPTION_TABLE_EVENTS.PAGINATION_PREVIOUS,
        { page: 0 },
      );
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledTimes(2);
    });
  });

  describe('refreshes data', () => {
    it('revoking a user', async () => {
      singleUserSetup();
      // Open revoke dialog by clicking in row button
      const revokeButton = screen.getByTitle('Revoke license');
      await act(async () => { userEvent.click(revokeButton); });
      expect(screen.queryByRole('dialog')).toBeTruthy();
      // Clicks submit and closes dialog
      const mockPromiseResolve = Promise.resolve({ data: {} });
      LicenseManagerApiService.licenseBulkRevoke.mockReturnValue(mockPromiseResolve);
      const revokeSubmitButton = screen.getByText('Revoke (1)');
      await act(async () => { userEvent.click(revokeSubmitButton); });
      expect(screen.queryByRole('dialog')).toBeFalsy();
      // Test all data should have been refreshed
      expect(forceRefreshSubscription).toHaveBeenCalledTimes(1);
      expect(forceRefreshUsers).toHaveBeenCalledTimes(1);
      expect(forceRefreshUsersOverview).toHaveBeenCalledTimes(1);
    });
    it('reminding a user', async () => {
      singleUserSetup();
      // Open remind dialog by clicking in row button
      const remindButton = screen.getByTitle('Remind learner');
      await act(async () => { userEvent.click(remindButton); });
      expect(screen.queryByRole('dialog')).toBeTruthy();
      // Clicks submit and closes dialog
      const mockPromiseResolve = Promise.resolve({ data: {} });
      LicenseManagerApiService.licenseRemind.mockReturnValue(mockPromiseResolve);
      const remindSubmitButton = screen.getByText('Remind (1)');
      await act(async () => { userEvent.click(remindSubmitButton); });
      expect(screen.queryByRole('dialog')).toBeFalsy();
      // Test user data should have been refreshed
      expect(forceRefreshUsers).toHaveBeenCalledTimes(1);
    });
  });
});
