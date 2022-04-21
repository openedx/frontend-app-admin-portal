/* eslint-disable react/prop-types */
import { screen, render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { SubscriptionDetailContext } from '../../SubscriptionDetailContextProvider';
import { SubsidyRequestsContext } from '../../../subsidy-requests';

import LicenseAllocationHeader from '../../licenses/LicenseAllocationHeader';

import { SUPPORTED_SUBSIDY_TYPES } from '../../../../data/constants/subsidyRequests';

const BNR_NEW_FEATURE_ALERT_TEXT = 'browse and request new feature alert!';
jest.mock('../../../NewFeatureAlertBrowseAndRequest', () => ({
  __esModule: true,
  default: () => BNR_NEW_FEATURE_ALERT_TEXT,
}));

const mockSubscription = {
  licenses: {
    allocated: 3,
    total: 5,
  },
};
const mockSubsidyRequestConfiguration = {};

const LicenseAllocationHeaderWrapper = ({
  subscription = mockSubscription,
  subsidyRequestConfiguration = mockSubsidyRequestConfiguration,
}) => (
  <SubscriptionDetailContext.Provider value={{ subscription }}>
    <SubsidyRequestsContext.Provider value={{ subsidyRequestConfiguration }}>
      <LicenseAllocationHeader />
    </SubsidyRequestsContext.Provider>
  </SubscriptionDetailContext.Provider>
);

describe('<LicenseAllocationHeader />', () => {
  it('should render license allocation', () => {
    render(<LicenseAllocationHeaderWrapper />);
    expect(screen.getByText('3 of 5 licenses allocated'));
  });

  it.each([
    {
      subsidyRequestConfiguration: {
        subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
        subsidyRequestsEnabled: false,
      },
      shouldShowAlert: true,
    },
    {
      subsidyRequestConfiguration: {
        subsidyType: SUPPORTED_SUBSIDY_TYPES.coupon,
        subsidyRequestsEnabled: false,
      },
      shouldShowAlert: false,
    },
    {
      subsidyRequestConfiguration: {
        subsidyType: SUPPORTED_SUBSIDY_TYPES.license,
        subsidyRequestsEnabled: true,
      },
      shouldShowAlert: false,
    },
  ])('should render browse and request feature alert correctly', ({ subsidyRequestConfiguration, shouldShowAlert }) => {
    render(<LicenseAllocationHeaderWrapper subsidyRequestConfiguration={subsidyRequestConfiguration} />);

    if (shouldShowAlert) {
      expect(screen.getByText(BNR_NEW_FEATURE_ALERT_TEXT));
    } else {
      expect(screen.queryByText(BNR_NEW_FEATURE_ALERT_TEXT)).not.toBeInTheDocument();
    }
  });
});
