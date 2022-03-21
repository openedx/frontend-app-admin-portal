import React from 'react';
import {
  screen,
  render,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import moment from 'moment';

import LmsApiService from '../../../../data/services/LmsApiService';
import MockSettingsContext, { MOCK_CONSTANTS, generateStore } from './TestUtils';
import SettingsAccessLinkManagement from '../SettingsAccessLinkManagement';
import * as hooks from '../../data/hooks';
import { SETTINGS_ACCESS_EVENTS } from '../../../../eventTracking';
import * as couponActions from '../../../../data/actions/coupons';

jest.mock('../../../../data/actions/coupons');

jest.mock('../../../../data/services/LmsApiService', () => ({
  __esModule: true,
  default: {
    toggleEnterpriseCustomerUniversalLink: jest.fn(),
  },
}));

jest.mock('@edx/frontend-enterprise-utils', () => {
  const originalModule = jest.requireActual('@edx/frontend-enterprise-utils');
  return ({
    ...originalModule,
    sendEnterpriseTrackEvent: jest.fn(),
  });
});

const mockRefreshLinks = jest.fn();
const renderWithContext = (store = generateStore(), links = [], loadingLinks = false) => {
  jest.spyOn(hooks, 'useLinkManagement').mockImplementation(
    () => ({
      links,
      loadingLinks,
      refreshLinks: mockRefreshLinks,
    }),
  );
  return (
    <MockSettingsContext store={store}>
      <SettingsAccessLinkManagement />
    </MockSettingsContext>
  );
};

describe('<SettingsAccessLinkManagement/>', () => {
  beforeEach(() => couponActions.fetchCouponOrders.mockReturnValue({
    type: 'fetch coupons',
  }));

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('Toggle Universal Link Off', async () => {
    LmsApiService.toggleEnterpriseCustomerUniversalLink.mockReturnValue({ data: {} });
    render(renderWithContext());

    // Clicking `Enable` opens modal
    const switchInput = screen.queryByText('Enable');
    await act(async () => { userEvent.click(switchInput); });
    expect(screen.queryByText('Are you sure?')).toBeTruthy();

    // Clicking disable calls api
    const disableButton = screen.queryByText('Disable');
    await act(async () => { userEvent.click(disableButton); });
    expect(LmsApiService.toggleEnterpriseCustomerUniversalLink).toHaveBeenCalledTimes(1);
    expect(LmsApiService.toggleEnterpriseCustomerUniversalLink).toHaveBeenCalledWith({
      enterpriseUUID: MOCK_CONSTANTS.ENTERPRISE_ID,
      enableUniversalLink: false,
    });

    // Links are refreshed
    expect(mockRefreshLinks).toHaveBeenCalledTimes(1);

    // Event is sent
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      MOCK_CONSTANTS.ENTERPRISE_ID,
      SETTINGS_ACCESS_EVENTS.UNIVERSAL_LINK_TOGGLE,
      { toggle_to: false },
    );

    // Modal is closed
    expect(screen.queryByText('Are you sure?')).toBeFalsy();
  });

  test('Toggle Universal Link On', async () => {
    LmsApiService.toggleEnterpriseCustomerUniversalLink.mockReturnValue({ data: {} });
    render(renderWithContext(generateStore({ enableUniversalLink: false })));

    // Clicking `Enable` does not open modal
    const switchInput = screen.queryByText('Enable');
    await act(async () => { userEvent.click(switchInput); });
    expect(screen.queryByText('Are you sure?')).toBeFalsy();

    // It calls api
    expect(LmsApiService.toggleEnterpriseCustomerUniversalLink).toHaveBeenCalledTimes(1);
    expect(LmsApiService.toggleEnterpriseCustomerUniversalLink).toHaveBeenCalledWith({
      enterpriseUUID: MOCK_CONSTANTS.ENTERPRISE_ID,
      enableUniversalLink: true,
      expirationDate: moment().add(MOCK_CONSTANTS.NET_DAYS_UNTIL_EXPIRATION, 'days').startOf('day').format(),
    });

    // Links are refreshed
    expect(mockRefreshLinks).toHaveBeenCalledTimes(1);

    // Event is sent
    expect(sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      MOCK_CONSTANTS.ENTERPRISE_ID,
      SETTINGS_ACCESS_EVENTS.UNIVERSAL_LINK_TOGGLE,
      { toggle_to: true },
    );
  });
});
