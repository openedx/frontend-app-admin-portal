import React from 'react';
import { mount } from 'enzyme';
import { Button, Modal } from '@edx/paragon';

import { MODAL_DIALOG_CLASS_NAME, BaseSubscriptionExpirationModal } from '../../expiration/SubscriptionExpirationModal';
import {
  SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
} from '../../data/constants';
import {
  SUBSCRIPTION_PLAN_ZERO_STATE,
  SubscriptionManagementContext,
  TEST_ENTERPRISE_CUSTOMER_SLUG,
} from '../TestUtilities';

// PropType validation for state is done by SubscriptionManagementContext
// eslint-disable-next-line react/prop-types
const ExpirationModalWithContext = ({ detailState, enableCodeManagementScreen = false }) => (
  <SubscriptionManagementContext detailState={detailState}>
    <BaseSubscriptionExpirationModal
      enterpriseSlug={TEST_ENTERPRISE_CUSTOMER_SLUG}
      enableCodeManagementScreen={enableCodeManagementScreen}
    />
  </SubscriptionManagementContext>
);

describe('<SubscriptionExpirationModal />', () => {
  test('does not render before the "moderate" days until expiration threshold', () => {
    const wrapper = mount(<ExpirationModalWithContext detailState={SUBSCRIPTION_PLAN_ZERO_STATE} />);
    expect(wrapper.exists(Modal)).toEqual(false);
  });

  test('renders a modal for "post-expiration" if the subscription already expired', () => {
    const detailStateCopy = {
      ...SUBSCRIPTION_PLAN_ZERO_STATE,
      daysUntilExpiration: -1,
    };
    const wrapper = mount(<ExpirationModalWithContext detailState={detailStateCopy} />);
    const modal = wrapper.find(Modal);
    expect(modal.prop('dialogClassName')).toEqual(`${MODAL_DIALOG_CLASS_NAME} expired`);
  });

  test('includes a link to the code mgmt page if the enterprise has the page enabled and the subscription has expired', () => {
    const detailStateCopy = {
      ...SUBSCRIPTION_PLAN_ZERO_STATE,
      daysUntilExpiration: -1,
    };
    const wrapper = mount(<ExpirationModalWithContext detailState={detailStateCopy} />);
    expect(wrapper.text().includes('code management page')).toBe(false);

    const wrapperWithCodeManagement = mount(<ExpirationModalWithContext
      detailState={detailStateCopy}
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
      const detailStateCopy = {
        ...SUBSCRIPTION_PLAN_ZERO_STATE,
        daysUntilExpiration: threshold,
      };
      const wrapper = mount(<ExpirationModalWithContext detailState={detailStateCopy} />);
      const modal = wrapper.find(Modal);
      expect(modal.prop('dialogClassName')).toEqual(`${MODAL_DIALOG_CLASS_NAME}`);

      // Click the ok button, and now we should no longer see the modal again
      const closeButton = modal.find(Button);
      closeButton.simulate('click');
      const updatedWrapper = mount(<ExpirationModalWithContext detailState={detailStateCopy} />);
      expect(updatedWrapper.exists(Modal)).toEqual(false);
    });
  });
});
