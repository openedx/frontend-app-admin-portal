import React from 'react';
import { mount } from 'enzyme';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Button, Modal } from '@edx/paragon';

import { MODAL_DIALOG_CLASS_NAME, BaseSubscriptionExpirationModal } from './SubscriptionExpirationModal';
import { SubscriptionContext } from './SubscriptionData';
import {
  SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
} from './constants';
import { addDays, getSubscriptionExpirationDetails } from './test-utils';

const history = createMemoryHistory({
  initialEntries: ['/'],
});

/* eslint-disable react/prop-types */
const ModalWithContext = ({
  subscriptionState = {},
  enableCodeManagementScreen = false,
}) => (
  <Router history={history}>
    <Route exact path="/:enterpriseSlug/admin/subscriptions">
      <SubscriptionContext.Provider value={subscriptionState}>
        <BaseSubscriptionExpirationModal
          enterpriseSlug="test-enterprise"
          enableCodeManagementScreen={enableCodeManagementScreen}
        />
      </SubscriptionContext.Provider>
    </Route>
  </Router>
);
/* eslint-enable react/prop-types */

describe('<SubscriptionExpirationModal />', () => {
  test('does not render before the "moderate" days until expiration threshold', () => {
    const daysUntilExpiration = SUBSCRIPTION_DAYS_REMAINING_MODERATE + 1;
    const subscriptionState = getSubscriptionExpirationDetails(
      daysUntilExpiration,
      addDays(new Date(), daysUntilExpiration),
    );

    const wrapper = mount(<ModalWithContext subscriptionState={subscriptionState} />);
    expect(wrapper.exists(Modal)).toEqual(false);
  });

  test('renders a modal for "post-expiration" if the subscription already expired', () => {
    const daysUntilExpiration = -1;
    const subscriptionState = getSubscriptionExpirationDetails(
      daysUntilExpiration,
      addDays(new Date(), daysUntilExpiration),
    );

    const wrapper = mount(<ModalWithContext subscriptionState={subscriptionState} />);
    const modal = wrapper.find(Modal);
    expect(modal.prop('dialogClassName')).toEqual(`${MODAL_DIALOG_CLASS_NAME} expired`);
  });

  test('includes a link to the code mgmt page if the enterprise has the page enabled and the subscription has expired', () => {
    const daysUntilExpiration = -1;
    const subscriptionState = getSubscriptionExpirationDetails(
      daysUntilExpiration,
      addDays(new Date(), daysUntilExpiration),
    );
    const wrapper = mount(<ModalWithContext subscriptionState={subscriptionState} />);
    expect(wrapper.text().includes('code management page')).toBe(false);

    const wrapperWithCodeManagement = mount(<ModalWithContext
      subscriptionState={subscriptionState}
      enableCodeManagementScreen
    />);
    expect(wrapperWithCodeManagement.text().includes('code management page')).toBe(true);
  });

  test('renders a modal for each expiration threshold that the user has not yet seen', () => {
    const thresholds = [
      SUBSCRIPTION_DAYS_REMAINING_MODERATE,
      SUBSCRIPTION_DAYS_REMAINING_SEVERE,
      SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
    ];
    Object.values(thresholds).forEach((threshold) => {
      const daysUntilExpiration = threshold - 1;
      const subscriptionState = getSubscriptionExpirationDetails(
        daysUntilExpiration,
        addDays(new Date(), daysUntilExpiration),
      );

      const wrapper = mount(<ModalWithContext subscriptionState={subscriptionState} />);
      const modal = wrapper.find(Modal);
      expect(modal.prop('dialogClassName')).toEqual(`${MODAL_DIALOG_CLASS_NAME}`);

      // Click the ok button, and now we should no longer see the modal again
      const closeButton = modal.find(Button);
      closeButton.simulate('click');
      const updatedWrapper = mount(<ModalWithContext subscriptionState={subscriptionState} />);
      expect(updatedWrapper.exists(Modal)).toEqual(false);
    });
  });
});
