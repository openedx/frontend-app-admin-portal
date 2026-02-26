import {
  screen,
  cleanup,
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import React from 'react';
import SubscriptionDetails from '../SubscriptionDetails';
import {
  SubscriptionManagementContext,
  SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
  generateSubscriptionPlan,
  mockSubscriptionHooks,
  MockSubscriptionContext,
} from './TestUtilities';

import {
  INVITE_LEARNERS_BUTTON_TEXT,
} from '../buttons/InviteLearnersButton';

jest.mock('../buttons/InviteLearnersButton');

const defaultProps = {
  enterpriseSlug: 'sluggy',
};

const PURCHASE_DATE = 'Purchase Date';

describe('SubscriptionDetails', () => {
  afterEach(() => {
    cleanup();
  });

  describe('invite learners button', () => {
    it('should be rendered if there are allocated licenses', () => {
      render(
        <IntlProvider locale="en">
          <SubscriptionManagementContext detailState={{
            ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
            licenses: {
              allocated: 1,
              total: 1,
            },
          }}
          >
            <SubscriptionDetails {...defaultProps} />
          </SubscriptionManagementContext>
        </IntlProvider>,
      );
      expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT));
    });

    it('should be rendered if there are revoked licenses', () => {
      render(
        <IntlProvider locale="en">
          <SubscriptionManagementContext detailState={{
            ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
            licenses: {
              allocated: 0,
              revoked: 1,
              total: 1,
            },
          }}
          >
            <SubscriptionDetails {...defaultProps} />
          </SubscriptionManagementContext>
        </IntlProvider>,
      );

      expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT));
    });

    it('should not be rendered if the subscription has expired', () => {
      render(
        <IntlProvider locale="en">
          <SubscriptionManagementContext detailState={{
            ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
            daysUntilExpiration: 0,
          }}
          >
            <SubscriptionDetails {...defaultProps} />
          </SubscriptionManagementContext>
        </IntlProvider>,
      );
      expect(screen.queryByText(INVITE_LEARNERS_BUTTON_TEXT)).not.toBeInTheDocument();
    });

    it('should not be disabled if the subscription is not locked for renewal processing', () => {
      render(
        <IntlProvider locale="en">
          <SubscriptionManagementContext detailState={SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE}>
            <SubscriptionDetails {...defaultProps} />
          </SubscriptionManagementContext>
        </IntlProvider>,
      );
      expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT)).not.toBeDisabled();
    });

    it('should be disabled if the subscription is locked for renewal processing', () => {
      render(
        <IntlProvider locale="en">
          <SubscriptionManagementContext detailState={{
            ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
            isLockedForRenewalProcessing: true,
          }}
          >
            <SubscriptionDetails {...defaultProps} />
          </SubscriptionManagementContext>
        </IntlProvider>,
      );
      expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT)).toBeDisabled();
    });

    it('Inviting learners should refresh learner data', async () => {
      const user = userEvent.setup();
      const subscriptionPlan = generateSubscriptionPlan({
        licenses: {
          allocated: 1,
          revoked: 0,
          total: 10,
        },
      }, 10);
      const {
        forceRefreshSubscription,
        forceRefreshUsersOverview,
        forceRefreshUsers,
      } = mockSubscriptionHooks(subscriptionPlan);
      render(
        <IntlProvider locale="en">
          <MockSubscriptionContext
            subscriptionPlan={subscriptionPlan}
          >
            <SubscriptionDetails {...defaultProps} />
          </MockSubscriptionContext>
        </IntlProvider>
        ,
      );

      // Click invite button
      const inviteButton = screen.getByText(INVITE_LEARNERS_BUTTON_TEXT);
      await user.click(inviteButton);
      expect(forceRefreshSubscription).toHaveBeenCalled();
      expect(forceRefreshUsersOverview).toHaveBeenCalled();
      expect(forceRefreshUsers).toHaveBeenCalled();
      expect(screen.getByText('email addresses were previously', { exact: false })).toBeInTheDocument();
      expect(screen.getByText('email addresses were successfully', { exact: false })).toBeInTheDocument();
    });
  });
  describe('manage subscription button', () => {
    test.each([
      {
        label: 'self-service trial subscription',
        planType: 'self-service-trial',
        daysUntilExpiration: 240,
        allocatedLicenses: 0,
        expectManageSubscriptionButton: true,
        expectInviteLearnersButton: false,
      },
      {
        label: 'self-service paid subscription',
        planType: 'self-service-paid',
        daysUntilExpiration: 240,
        allocatedLicenses: 0,
        expectManageSubscriptionButton: true,
        expectInviteLearnersButton: false,
      },
      {
        label: 'regular subscription plan',
        planType: 'Subscription',
        daysUntilExpiration: 240,
        allocatedLicenses: 1,
        expectManageSubscriptionButton: false,
        expectInviteLearnersButton: true,
      },
      {
        label: 'self-service plan with allocated licenses',
        planType: 'self-service-trial',
        daysUntilExpiration: 240,
        allocatedLicenses: 1,
        expectManageSubscriptionButton: true,
        expectInviteLearnersButton: true,
      },
      {
        label: 'expired self-service plan',
        planType: 'self-service-paid',
        daysUntilExpiration: -1,
        allocatedLicenses: 0,
        expectManageSubscriptionButton: true,
        expectInviteLearnersButton: false,
      },
    ])('should render correctly for $label', ({
      planType,
      daysUntilExpiration,
      allocatedLicenses,
      expectManageSubscriptionButton,
      expectInviteLearnersButton,
    }) => {
      render(
        <IntlProvider locale="en">
          <SubscriptionManagementContext
            detailState={{
              ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
              planType,
              daysUntilExpiration,
              licenses: {
                ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE.licenses,
                allocated: allocatedLicenses,
              },
            }}
          >
            <SubscriptionDetails {...defaultProps} />
          </SubscriptionManagementContext>
        </IntlProvider>,
      );

      if (expectManageSubscriptionButton) {
        expect(screen.getByTestId('manage-subscription-button')).toBeInTheDocument();
      } else {
        expect(screen.queryByTestId('manage-subscription-button')).not.toBeInTheDocument();
      }

      if (expectInviteLearnersButton) {
        expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT)).toBeInTheDocument();
      } else {
        expect(screen.queryByText(INVITE_LEARNERS_BUTTON_TEXT)).not.toBeInTheDocument();
      }
    });
  });

  describe('purchase date', () => {
    it('should not show purchase date if there are no prior renewals', () => {
      render(
        <IntlProvider locale="en">
          <SubscriptionManagementContext detailState={{
            ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
            prior_renewals: [],
          }}
          >
            <SubscriptionDetails {...defaultProps} />
          </SubscriptionManagementContext>
        </IntlProvider>,
      );
      expect(screen.queryByText(PURCHASE_DATE)).not.toBeInTheDocument();
    });

    it('should show purchase date if there are prior renewals', () => {
      render(
        <IntlProvider locale="en">
          <SubscriptionManagementContext detailState={{
            ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
            priorRenewals: [
              {
                priorSubscriptionPlanStartDate: '2021-08-25',
                priorSubscriptionPlanId: '1',
                renewedSubscriptionPlanId: '2',
                renewedSubscriptionPlanStartDate: '2021-08-26',
              },
            ],
          }}
          >
            <SubscriptionDetails {...defaultProps} />
          </SubscriptionManagementContext>
        </IntlProvider>,
      );
      expect(screen.queryByText(PURCHASE_DATE)).toBeInTheDocument();
    });
  });
});
