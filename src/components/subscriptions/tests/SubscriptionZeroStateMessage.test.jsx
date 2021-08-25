import {
  screen,
  render,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import React from 'react';
import SubscriptionZeroStateMessage from '../SubscriptionZeroStateMessage';
import { SubscriptionManagementContext, SUBSCRIPTION_PLAN_ZERO_STATE } from './TestUtilities';

const INVITE_LEARNERS_BUTTON_TEXT = 'Invite learners';

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
});
