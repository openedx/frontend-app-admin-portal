import {
  screen,
  render,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
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
      <IntlProvider locale="en">
        <SubscriptionManagementContext detailState={{
          ...SUBSCRIPTION_PLAN_ZERO_STATE,
          daysUntilExpiration: 1,
        }}
        >
          <SubscriptionZeroStateMessage />
        </SubscriptionManagementContext>
      </IntlProvider>,

    );

    expect(screen.getByText(INVITE_LEARNERS_BUTTON_TEXT)).toHaveProperty('disabled', false);
  });

  it('should disable the invite learners button if the subscription has expired', () => {
    render(
      <IntlProvider locale="en">
        <SubscriptionManagementContext detailState={{
          ...SUBSCRIPTION_PLAN_ZERO_STATE,
          daysUntilExpiration: 0,
        }}
        >
          <SubscriptionZeroStateMessage />
        </SubscriptionManagementContext>
      </IntlProvider>,
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
      <IntlProvider locale="en">
        <MockSubscriptionContext
          subscriptionPlan={subscriptionPlan}
        >
          <SubscriptionZeroStateMessage />
        </MockSubscriptionContext>
      </IntlProvider>
      ,
    );

    // Click invite button
    const inviteButton = screen.getByText(INVITE_LEARNERS_BUTTON_TEXT);
    await act(async () => { userEvent.click(inviteButton); });
    expect(forceRefreshSubscription).toHaveBeenCalled();
    expect(forceRefreshUsersOverview).toHaveBeenCalled();
    expect(forceRefreshUsers).toHaveBeenCalled();
    expect(screen.getByText('email addresses were successfully added', { exact: false })).toBeInTheDocument();
  });
});
