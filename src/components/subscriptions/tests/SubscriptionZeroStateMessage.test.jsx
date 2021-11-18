import {
  screen,
  render,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import React from 'react';
import SubscriptionZeroStateMessage from '../SubscriptionZeroStateMessage';
import {
  SubscriptionManagementContext,
  SUBSCRIPTION_PLAN_ZERO_STATE,
  generateSubscriptionPlan,
  mockSubscriptionHooks,
  MockSubscriptionContext,
} from './TestUtilities';
import {
  INVITE_LEARNERS_BUTTON_TEXT,
} from '../buttons/InviteLearnersButton';

jest.mock('../buttons/InviteLearnersButton');

describe('SubscriptionZeroStateMessage', () => {
  it('should enable the invite learners button if the subscription is active', () => {
    render(
      <SubscriptionManagementContext detailState={{
        ...SUBSCRIPTION_PLAN_ZERO_STATE,
        daysUntilExpiration: 1,
      }}
      >
        <SubscriptionZeroStateMessage />
      </SubscriptionManagementContext>,
    );

    expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT)).toHaveProperty('disabled', false);
  });

  it('should disable the invite learners button if the subscription has expired', () => {
    render(
      <SubscriptionManagementContext detailState={{
        ...SUBSCRIPTION_PLAN_ZERO_STATE,
        daysUntilExpiration: 0,
      }}
      >
        <SubscriptionZeroStateMessage />
      </SubscriptionManagementContext>,
    );

    expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT)).toHaveProperty('disabled', true);
  });

  it('Inviting learners should refresh learner data', async () => {
    const subscriptionPlan = generateSubscriptionPlan();
    const {
      forceRefreshSubscription,
      forceRefreshUsersOverview,
      forceRefreshUsers,
    } = mockSubscriptionHooks(subscriptionPlan);
    render(
      <MockSubscriptionContext
        subscriptionPlan={subscriptionPlan}
      >
        <SubscriptionZeroStateMessage />
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
