import React from 'react';
import { mount } from 'enzyme';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { Modal } from '@edx/paragon';

import { MODAL_DIALOG_CLASS_NAME, BaseSubscriptionExpirationModal } from './SubscriptionExpirationModal';
import { SubscriptionContext } from './SubscriptionData';
import { SUBSCRIPTION_DAYS_REMAINING_MODERATE } from './constants';
import { addDays, getSubscriptionExpirationDetails } from './test-utils';


const history = createMemoryHistory({
  initialEntries: ['/'],
});

jest.mock('universal-cookie', () => {
  const mockCookie = {
    get: jest.fn(() => true),
  };
  return jest.fn(() => mockCookie);
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

  test('does not render a modal if we are past an expiration threshold but they have the "seen" cookie', () => {
    const daysUntilExpiration = SUBSCRIPTION_DAYS_REMAINING_MODERATE - 1;
    const subscriptionState = getSubscriptionExpirationDetails(
      daysUntilExpiration,
      addDays(new Date(), daysUntilExpiration),
    );

    const wrapper = mount(<ModalWithContext subscriptionState={subscriptionState} />);
    expect(wrapper.exists(Modal)).toEqual(false);
  });

  test('renders a modal if we are past an expiration threshold and no cookie says the user has seen it', () => {
    const daysUntilExpiration = SUBSCRIPTION_DAYS_REMAINING_MODERATE - 1;
    const subscriptionState = getSubscriptionExpirationDetails(
      daysUntilExpiration,
      addDays(new Date(), daysUntilExpiration),
    );

    const wrapper = mount(<ModalWithContext subscriptionState={subscriptionState} />);
    const modal = wrapper.find(Modal);
    expect(modal.prop('dialogClassName')).toEqual(`${MODAL_DIALOG_CLASS_NAME}`);
  });
});
