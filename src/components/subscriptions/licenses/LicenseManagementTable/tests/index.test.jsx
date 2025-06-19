import React from 'react';
import {
  screen,
  render,
  act,
  fireEvent, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';

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

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

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

const LicenseManagementTableWrapper = ({ subscriptionPlan, ...props }) => (
  <IntlProvider locale="en">
    <MockSubscriptionContext subscriptionPlan={subscriptionPlan}>
      <LicenseManagementTable {...props} />
    </MockSubscriptionContext>
  </IntlProvider>
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
  render(<LicenseManagementTableWrapper subscriptionPlan={subscriptionPlan} />);
  return refreshFunctions;
};

describe('<LicenseManagementTable />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loading', () => {
    it('renders initially loading state', async () => {
      const subscriptionPlan = generateSubscriptionPlan();
      mockSubscriptionHooks(subscriptionPlan, [], true);
      render(<LicenseManagementTableWrapper subscriptionPlan={subscriptionPlan} loadingUsers />);
      // assert that the spinner is shown (`isLoading` is properly passed to `DataTable`)
      await waitFor(() => expect(screen.getByText('loading')));
    });
  });

  describe('zero state (no subscription users)', () => {
    it('renders zero state message', () => {
      const subscriptionPlan = generateSubscriptionPlan();
      mockSubscriptionHooks(subscriptionPlan, []);
      render(<LicenseManagementTableWrapper subscriptionPlan={subscriptionPlan} />);
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
            activationDate: dayjs(),
            activationKey: 'test-activation-key',
            lastRemindDate: dayjs(),
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
        render(<LicenseManagementTableWrapper subscriptionPlan={subscriptionPlan} />);
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
        render(<LicenseManagementTableWrapper subscriptionPlan={subscriptionPlan} />);
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
    beforeEach(() => {
      jest.clearAllMocks();
      mockSubscriptionHooks(subscriptionPlan, users);
    });
    // TODO: Fix
    it.skip('when clicking status filters', async () => {
      const user = userEvent.setup();
      render(<LicenseManagementTableWrapper subscriptionPlan={subscriptionPlan} />);

      // click status checkbox
      const activeCheckBox = screen.getByText('Active');
      await user.click(activeCheckBox);
      // filter debounce
      act(() => {
        jest.advanceTimersByTime(DEBOUNCE_TIME_MILLIS);
      });
      await waitFor(() => {
        expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
          TEST_ENTERPRISE_CUSTOMER_UUID,
          SUBSCRIPTION_TABLE_EVENTS.FILTER_STATUS,
          { applied_filters: 'activated' },
        );
      });
    });
    it('when typing in to email filter', async () => {
      render(<LicenseManagementTableWrapper subscriptionPlan={subscriptionPlan} />);
      const emailInput = screen.getByPlaceholderText('Search email address');
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

    // TODO: Fix
    it.skip('when changing to the page', async () => {
      const user = userEvent.setup();
      render(<LicenseManagementTableWrapper subscriptionPlan={subscriptionPlan} />);
      const nextPageButton = screen.getByLabelText('next', { exact: false });
      await user.click(nextPageButton);
      // filter debounce
      await act(async () => {
        jest.advanceTimersByTime(DEBOUNCE_TIME_MILLIS);
      });
      expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
        TEST_ENTERPRISE_CUSTOMER_UUID,
        SUBSCRIPTION_TABLE_EVENTS.PAGINATION_NEXT,
        { page: 1 },
      );
      const prevPageButton = screen.getByLabelText('previous', { exact: false });
      await user.click(prevPageButton);
      // filter debounce
      await act(async () => {
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

  // TODO: Fix
  describe.skip('refreshes data', () => {
    it('revoking a user', async () => {
      const user = userEvent.setup();
      const {
        forceRefreshSubscription,
        forceRefreshUsers,
        forceRefreshUsersOverview,
      } = singleUserSetup();
      // Open revoke dialog by clicking in row button
      const revokeButton = screen.getByTitle('Revoke license');
      await user.click(revokeButton);
      expect(screen.queryByRole('dialog')).toBeTruthy();
      // Clicks submit and closes dialog
      const mockPromiseResolve = Promise.resolve({ data: {} });
      LicenseManagerApiService.licenseBulkRevoke.mockReturnValue(mockPromiseResolve);
      const revokeSubmitButton = screen.getByText('Revoke (1)');
      await user.click(revokeSubmitButton);
      expect(screen.queryByRole('dialog')).toBeFalsy();
      // Test all data should have been refreshed
      expect(forceRefreshSubscription).toHaveBeenCalledTimes(1);
      expect(forceRefreshUsers).toHaveBeenCalledTimes(1);
      expect(forceRefreshUsersOverview).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Licenses successfully revoked')).toBeTruthy();
    });
    it('reminding a user', async () => {
      const user = userEvent.setup();
      const {
        forceRefreshUsers,
      } = singleUserSetup();
      // Open remind dialog by clicking in row button
      const remindButton = screen.getByTitle('Remind learner');
      await user.click(remindButton);
      expect(screen.queryByRole('dialog')).toBeTruthy();
      // Clicks submit and closes dialog
      const mockPromiseResolve = Promise.resolve({ data: {} });
      LicenseManagerApiService.licenseBulkRemind.mockReturnValue(mockPromiseResolve);
      const remindSubmitButton = screen.getByText('Remind (1)');
      await user.click(remindSubmitButton);
      expect(screen.queryByRole('dialog')).toBeFalsy();
      // Test user data should have been refreshed
      expect(forceRefreshUsers).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Users successfully reminded')).toBeTruthy();
    });
  });
});
