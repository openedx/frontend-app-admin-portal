import React from 'react';
import { mount } from 'enzyme';

import SubscriptionExpirationBanner from './SubscriptionExpirationBanner';
import { SubscriptionDetailContext } from '../SubscriptionDetailData';
import {
  SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
} from '../data/constants';
import { addDays, getSubscriptionExpirationDetails } from '../test-utils';

/* eslint-disable react/prop-types */
const BannerWithContext = ({
  subscriptionState = {},
}) => (
  <SubscriptionDetailContext.Provider value={subscriptionState}>
    <SubscriptionExpirationBanner />
  </SubscriptionDetailContext.Provider>
);
/* eslint-enable react/prop-types */

describe('<SubscriptionExpirationBanner />', () => {
  test('does not render an alert before the "moderate" days until expiration threshold', () => {
    const daysUntilExpiration = SUBSCRIPTION_DAYS_REMAINING_MODERATE + 1;
    // The actual date isn't relevant here, just how many days until expiration
    const subscriptionState = getSubscriptionExpirationDetails(
      daysUntilExpiration,
      addDays(new Date(), daysUntilExpiration),
    );

    const wrapper = mount(<BannerWithContext subscriptionState={subscriptionState} />);
    expect(wrapper.exists('.expiration-alert')).toEqual(false);
  });

  test('renders an alert after any expiration threshold has passed', () => {
    const thresholds = [
      SUBSCRIPTION_DAYS_REMAINING_MODERATE,
      SUBSCRIPTION_DAYS_REMAINING_SEVERE,
      SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
    ];
    Object.values(thresholds).forEach((threshold) => {
      const daysUntilExpiration = threshold - 1;
      // The actual date isn't relevant here, just how many days until expiration
      const subscriptionState = getSubscriptionExpirationDetails(
        daysUntilExpiration,
        addDays(new Date(), daysUntilExpiration),
      );

      const wrapper = mount(<BannerWithContext subscriptionState={subscriptionState} />);
      expect(wrapper.exists('.expiration-alert')).toEqual(true);
    });
  });
});
