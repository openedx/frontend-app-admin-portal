import {
  screen,
  cleanup,
  render,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

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
        <SubscriptionManagementContext detailState={{
          ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
          licenses: {
            allocated: 1,
            total: 1,
          },
        }}
        >
          <SubscriptionDetails {...defaultProps} />
        </SubscriptionManagementContext>,
      );
      expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT));
    });

    it('should be rendered if there are revoked licenses', () => {
      render(
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
        </SubscriptionManagementContext>,
      );

      expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT));
    });

    it('should not be rendered if the subscription has expired', () => {
      render(
        <SubscriptionManagementContext detailState={{
          ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
          daysUntilExpiration: 0,
        }}
        >
          <SubscriptionDetails {...defaultProps} />
        </SubscriptionManagementContext>,
      );
      expect(screen.queryByText(INVITE_LEARNERS_BUTTON_TEXT)).not.toBeInTheDocument();
    });

    it('should not be disabled if the subscription is not locked for renewal processing', () => {
      render(
        <SubscriptionManagementContext detailState={SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE}>
          <SubscriptionDetails {...defaultProps} />
        </SubscriptionManagementContext>,
      );
      expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT)).not.toBeDisabled();
    });

    it('should be disabled if the subscription is locked for renewal processing', () => {
      render(
        <SubscriptionManagementContext detailState={{
          ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
          isLockedForRenewalProcessing: true,
        }}
        >
          <SubscriptionDetails {...defaultProps} />
        </SubscriptionManagementContext>,
      );
      expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT)).toBeDisabled();
    });

    it('Inviting learners should refresh learner data', async () => {
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
        <MockSubscriptionContext
          subscriptionPlan={subscriptionPlan}
        >
          <SubscriptionDetails {...defaultProps} />
        </MockSubscriptionContext>
        ,
      );

      // Click invite button
      const inviteButton = screen.getByText(INVITE_LEARNERS_BUTTON_TEXT);
      await act(async () => { userEvent.click(inviteButton); });
      expect(forceRefreshSubscription).toHaveBeenCalled();
      expect(forceRefreshUsersOverview).toHaveBeenCalled();
      expect(forceRefreshUsers).toHaveBeenCalled();
    });
  });

  describe('purchase date', () => {
    it('should not show purchase date if there are no prior renewals', () => {
      render(
        <SubscriptionManagementContext detailState={{
          ...SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
          prior_renewals: [],
        }}
        >
          <SubscriptionDetails {...defaultProps} />
        </SubscriptionManagementContext>,
      );
      expect(screen.queryByText(PURCHASE_DATE)).not.toBeInTheDocument();
    });

    it('should show purchase date if there are prior renewals', () => {
      render(
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
        </SubscriptionManagementContext>,
      );
      expect(screen.queryByText(PURCHASE_DATE)).toBeInTheDocument();
    });
  });
});
