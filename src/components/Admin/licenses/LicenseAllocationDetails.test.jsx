/* eslint-disable react/prop-types */
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { SubscriptionDetailContext } from '../../subscriptions/SubscriptionDetailContextProvider';
import { SubsidyRequestsContext } from '../../subsidy-requests';

import LicenseAllocationDetails from '../../subscriptions/licenses/LicenseAllocationDetails';

const BNR_NEW_FEATURE_ALERT_TEXT = 'browse and request new feature alert!';
jest.mock('../../NewFeatureAlertBrowseAndRequest', () => ({
  __esModule: true,
  default: () => BNR_NEW_FEATURE_ALERT_TEXT,
}));

jest.mock('../../subscriptions/licenses/LicenseManagementTable', () => ({
  __esModule: true,
  default: () => 'LicenseManagementTable',
}));

const mockSubscription = {
  licenses: {
    allocated: 3,
    total: 5,
  },
};
const mockSubsidyRequestConfiguration = {};

const defaultSubscriptionDetailContextValue = {
  subscription: mockSubscription,
};
const defaultSubsidyRequestContextValue = {
  subsidyRequestConfiguration: mockSubsidyRequestConfiguration,
};

const LicenseAllocationDetailsWrapper = ({
  initialSubscriptionDetailContextValue = defaultSubscriptionDetailContextValue,
  initialSubsidyRequestContextValue = defaultSubsidyRequestContextValue,
}) => (
  <SubscriptionDetailContext.Provider
    value={initialSubscriptionDetailContextValue}
  >
    <SubsidyRequestsContext.Provider value={initialSubsidyRequestContextValue}>
      <LicenseAllocationDetails />
    </SubsidyRequestsContext.Provider>
  </SubscriptionDetailContext.Provider>
);

describe('LicenseAllocationDetails', () => {
  it('renders the correct number of licenses allocated', () => {
    render(<LicenseAllocationDetailsWrapper />);
    expect(screen.getByText('3 of 5 licenses allocated')).toBeInTheDocument();
  });

  it('renders the correct number of licenses allocated when the subscription has no licenses', () => {
    const subscriptionWithNoLicenses = {
      licenses: {
        allocated: 0,
        total: 0,
      },
    };
    render(
      <LicenseAllocationDetailsWrapper
        initialSubscriptionDetailContextValue={{
          subscription: subscriptionWithNoLicenses,
        }}
      />,
    );
    expect(screen.getByText('0 of 0 licenses allocated')).toBeInTheDocument();
  });
});
