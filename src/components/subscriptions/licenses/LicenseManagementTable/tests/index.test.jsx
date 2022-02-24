import React from 'react';
import {
  screen,
  render,
  cleanup,
  act,
  fireEvent,
} from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import moment from 'moment';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';

import {
  TEST_ENTERPRISE_CUSTOMER_UUID,
  generateSubscriptionUser,
  mockSubscriptionHooks,
  MockSubscriptionContext,
  generateSubscriptionPlan,
} from '../../../tests/TestUtilities';
import LicenseManagementTable from '../index';
import { SUBSCRIPTION_TABLE_EVENTS } from '../../../../../eventTracking';
import { DEBOUNCE_TIME_MILLIS } from '../../../../../algoliaUtils';
import { PAGE_SIZE } from '../../../data/constants';
import LicenseManagerApiService from '../../../../../data/services/LicenseManagerAPIService';

jest.useFakeTimers('modern');

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

jest.mock('../../../../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true,
  default: {
    licenseBulkRevoke: jest.fn(),
    licenseBulkRemind: jest.fn(),
  },
}));

const expiredSubscriptionPlan = (
  { licenses } = {},
) => {
  const baseSubscriptionPlan = generateSubscriptionPlan();
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

// eslint-disable-next-line react/prop-types
const tableWithContext = ({ subscriptionPlan }) => (
  <MockSubscriptionContext subscriptionPlan={subscriptionPlan}>
    <LicenseManagementTable />
  </MockSubscriptionContext>
);

const singleUserSetup = (status = 'assigned') => {
  const subscriptionPlan = generateSubscriptionPlan({
    licenses: {
      total: 1,
      allocated: 1,
      unassigned: 0,
    },
  });
  const refreshFunctions = mockSubscriptionHooks(
    subscriptionPlan,
    [generateSubscriptionUser({ status })],
  );
  render(tableWithContext({ subscriptionPlan }));
  return refreshFunctions;
};

describe('<LicenseManagementTable />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  describe('loading', () => {
    it('renders initially loading state', () => {
      const subscriptionPlan = generateSubscriptionPlan();
      mockSubscriptionHooks(subscriptionPlan, [], true);
      render(tableWithContext({
        subscriptionPlan,
      }));
      // assert that the spinner is shown (`isLoading` is properly passed to `DataTable`)
      // expect(screen.getByRole('Status'));
    });
  });

  describe('zero state (no subscription users)', () => {
    it('renders zero state message', () => {
      const subscriptionPlan = generateSubscriptionPlan();
      mockSubscriptionHooks(subscriptionPlan, []);
      render(tableWithContext({
        subscriptionPlan,
      }));
      expect(screen.getByText('Get Started'));
      expect(screen.getByText('No results found'));
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
        mockSubscriptionHooks(
          subscriptionPlan,
          [{
            activationDate: moment(),
            activationKey: 'test-activation-key',
            lastRemindDate: moment(),
            revokedDate: null,
            status: 'activated',
            subscriptionPlan: {},
            userEmail: 'edx@example.com',
            uuid: 'test-uuid',
          }],
        );
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
      const subscriptionPlan = generateSubscriptionPlan({
        licenses: {
          total: 10,
          unassigned: 5,
        },
      });
      beforeEach(() => {
        mockSubscriptionHooks(
          subscriptionPlan,
          [generateSubscriptionUser({})],
        );
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
    const subscriptionPlan = generateSubscriptionPlan();
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
      mockSubscriptionHooks(subscriptionPlan, users);
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
      const nextPageButton = screen.getByLabelText('next page', { exact: false });
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
      const prevPageButton = screen.getByLabelText('previous page', { exact: false });
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
      const {
        forceRefreshSubscription,
        forceRefreshUsers,
        forceRefreshUsersOverview,
      } = singleUserSetup();
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
      const {
        forceRefreshUsers,
      } = singleUserSetup();
      // Open remind dialog by clicking in row button
      const remindButton = screen.getByTitle('Remind learner');
      await act(async () => { userEvent.click(remindButton); });
      expect(screen.queryByRole('dialog')).toBeTruthy();
      // Clicks submit and closes dialog
      const mockPromiseResolve = Promise.resolve({ data: {} });
      LicenseManagerApiService.licenseBulkRemind.mockReturnValue(mockPromiseResolve);
      const remindSubmitButton = screen.getByText('Remind (1)');
      await act(async () => { userEvent.click(remindSubmitButton); });
      expect(screen.queryByRole('dialog')).toBeFalsy();
      // Test user data should have been refreshed
      expect(forceRefreshUsers).toHaveBeenCalledTimes(1);
    });
  });
});
