import React from 'react';
import { mount } from 'enzyme';

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

// PropType validation for state is done by SubscriptionManagementContext
// eslint-disable-next-line react/prop-types
const ExpirationBannerWithContext = ({ detailState }) => (
  <SubscriptionManagementContext detailState={detailState}>
    <SubscriptionExpirationBanner />
  </SubscriptionManagementContext>
);

describe('<SubscriptionExpirationBanner />', () => {
  test('does not render an alert before the "moderate" days until expiration threshold', () => {
    const wrapper = mount(<ExpirationBannerWithContext detailState={SUBSCRIPTION_PLAN_ZERO_STATE} />);
    expect(wrapper.exists('.expiration-alert')).toEqual(false);
  });

  test('renders an alert after any expiration threshold has passed', () => {
    const thresholds = [
      SUBSCRIPTION_DAYS_REMAINING_MODERATE,
      SUBSCRIPTION_DAYS_REMAINING_SEVERE,
      SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
    ];
    Object.values(thresholds).forEach(threshold => {
      const detailStateCopy = {
        ...SUBSCRIPTION_PLAN_ZERO_STATE,
        daysUntilExpiration: threshold,
      };
      const wrapper = mount(<ExpirationBannerWithContext detailState={detailStateCopy} />);
      expect(wrapper.exists('.expiration-alert')).toEqual(true);
    });
  });
});
