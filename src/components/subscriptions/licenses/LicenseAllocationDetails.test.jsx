import React from 'react';
import { mount } from 'enzyme';

import {
  beforeEach,
  describe,
  jest,
  test,
} from '@jest/globals';
import {
  TAB_LICENSED_USERS,
  TAB_PENDING_USERS,
  TAB_REVOKED_USERS,
} from '../data/constants';
import LicenseAllocationDetails from './LicenseAllocationDetails';
import {
  SubscriptionManagementContext,
  SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE,
  SUBSCRIPTION_PLAN_ZERO_STATE,
} from '../TestUtilities';

// PropType validation for state is done by SubscriptionManagementContext
// eslint-disable-next-line react/prop-types
const LicenseAllocationDetailsWithContext = ({ detailState }) => (
  <SubscriptionManagementContext detailState={detailState}>
    <LicenseAllocationDetails />
  </SubscriptionManagementContext>
);

describe('<SubscriptionZeroStateMessaging />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('displays the zero state on the default All Users tab with no allocations', () => {
    const wrapper = mount(<LicenseAllocationDetailsWithContext detailState={SUBSCRIPTION_PLAN_ZERO_STATE} />);
    expect(wrapper.find('SubscriptionZeroStateMessaging').exists()).toBeTruthy();
  });

  test('does not display the zero state on All Users tab when there are allocations', () => {
    const wrapper = mount(<LicenseAllocationDetailsWithContext detailState={SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE} />);
    expect(wrapper.find('SubscriptionZeroStateMessaging').exists()).toBeFalsy();
  });

  const testTab = (tab, detailState) => {
    const wrapper = mount(<LicenseAllocationDetailsWithContext detailState={detailState} />);
    wrapper.find(`#navigation-${tab}`).simulate('click');
    wrapper.update();
    expect(wrapper.find('SubscriptionZeroStateMessaging').exists()).toBeFalsy();
  };

  [TAB_PENDING_USERS, TAB_REVOKED_USERS, TAB_LICENSED_USERS].forEach((tab) => {
    test(`does not display the zero state on ${tab} with no allocations`, () => {
      testTab(tab, SUBSCRIPTION_PLAN_ZERO_STATE);
    });

    test(`does not display the zero state on ${tab} with allocations`, () => {
      testTab(tab, SUBSCRIPTION_PLAN_ASSIGNED_USER_STATE);
    });
  });
});
