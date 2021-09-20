import React from 'react';
import {
  screen, render, waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SubscriptionExpirationBanner from '../../expiration/SubscriptionExpirationBanner';
import {
  SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
} from '../../data/constants';
import {
  SUBSCRIPTION_PLAN_ZERO_STATE,
  SubscriptionManagementContext,
} from '../TestUtilities';

jest.mock('@edx/frontend-platform/analytics', () => ({
  sendTrackEvent: jest.fn(),
}));

// PropType validation for state is done by SubscriptionManagementContext
// eslint-disable-next-line react/prop-types
const ExpirationBannerWithContext = ({ detailState, isSubscriptionPlanDetails = false }) => (
  <SubscriptionManagementContext detailState={detailState}>
    <SubscriptionExpirationBanner isSubscriptionPlanDetails={isSubscriptionPlanDetails} />
  </SubscriptionManagementContext>
);

describe('<SubscriptionExpirationBanner />', () => {
  test('does not render an alert before the "moderate" days until expiration threshold', () => {
    const detailStateCopy = {
      ...SUBSCRIPTION_PLAN_ZERO_STATE,
      agreementNetDaysUntilExpiration: 240,
    };
    render(<ExpirationBannerWithContext detailState={detailStateCopy} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  test.each([
    SUBSCRIPTION_DAYS_REMAINING_MODERATE,
    SUBSCRIPTION_DAYS_REMAINING_SEVERE,
    SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
  ])('renders an alert after expiration threshold of %i', (threshold) => {
    const detailStateCopy = {
      ...SUBSCRIPTION_PLAN_ZERO_STATE,
      agreementNetDaysUntilExpiration: threshold,
    };
    render(<ExpirationBannerWithContext detailState={detailStateCopy} />);
    expect(screen.queryByRole('alert')).not.toBeNull();
  });

  test.each([
    SUBSCRIPTION_DAYS_REMAINING_MODERATE,
    SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  ])('expiration threshold %i is dismissible', async (threshold) => {
    const detailStateCopy = {
      ...SUBSCRIPTION_PLAN_ZERO_STATE,
      agreementNetDaysUntilExpiration: threshold,
    };
    render(<ExpirationBannerWithContext detailState={detailStateCopy} />);
    expect(screen.queryByRole('alert')).not.toBeNull();
    userEvent.click(screen.getByText('Dismiss'));
    await waitForElementToBeRemoved(screen.queryByRole('alert'));
    expect(screen.queryByRole('alert')).toBeNull();
  });

  test('does not render an alert when subscription expiration notifications are disabled', () => {
    const detailStateCopy = {
      ...SUBSCRIPTION_PLAN_ZERO_STATE,
      agreementNetDaysUntilExpiration: SUBSCRIPTION_DAYS_REMAINING_MODERATE,
      showExpirationNotifications: false,
    };
    render(<ExpirationBannerWithContext detailState={detailStateCopy} />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  test.each([
    true,
    false,
  ])('renders the correct message when isSubscriptionPlanDetails = %s', (isSubscriptionPlanDetails) => {
    const detailStateCopy = {
      ...SUBSCRIPTION_PLAN_ZERO_STATE,
      agreementNetDaysUntilExpiration: 0,
      daysUntilExpiration: 0,
    };
    render(<ExpirationBannerWithContext
      detailState={detailStateCopy}
      isSubscriptionPlanDetails={isSubscriptionPlanDetails}
    />);

    if (isSubscriptionPlanDetails) {
      expect(screen.getByText("This subscription plan's end date has passed"));
      expect(screen.queryByText('Your subscription contract has expired')).toBeNull();
    } else {
      expect(screen.getByText('Your subscription contract has expired'));
      expect(screen.queryByText("This subscription plan's end date has passed")).toBeNull();
    }
  });
});
