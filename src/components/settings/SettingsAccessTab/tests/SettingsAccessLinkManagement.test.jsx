/* eslint-disable react/prop-types */
import React from 'react';
import dayjs from 'dayjs';
import { screen, render, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import LmsApiService from '../../../../data/services/LmsApiService';
import MockSettingsContext, { MOCK_CONSTANTS, generateStore } from './TestUtils';
import SettingsAccessLinkManagement from '../SettingsAccessLinkManagement';
import * as hooks from '../../data/hooks';
import { SETTINGS_ACCESS_EVENTS } from '../../../../eventTracking';
import * as couponActions from '../../../../data/actions/coupons';
import { MAX_UNIVERSAL_LINKS } from '../../data/constants';

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

const SettingsAccessLinkManagementWrapper = ({
  store = generateStore({}),
  links = [],
  loadingLinks = false,
  enterpriseSubsidiesContextValue = {
    coupons: [],
    customerAgreement: undefined,
  },
}) => {
  jest.spyOn(hooks, 'useLinkManagement').mockImplementation(
    () => ({
      links,
      loadingLinks,
      refreshLinks: mockRefreshLinks,
    }),
  );

  return (
    <MockSettingsContext
      store={store}
      enterpriseSubsidiesContextValue={enterpriseSubsidiesContextValue}
    >
      <IntlProvider locale="en">
        <SettingsAccessLinkManagement />
      </IntlProvider>
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
    render(
      <SettingsAccessLinkManagementWrapper />,
    );

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
    const subExpirationDate = dayjs().add(1, 'days').format();
    const couponExpirationDate = dayjs().add(3, 'days').format();
    render(
      <SettingsAccessLinkManagementWrapper
        store={generateStore({
          portalConfiguration: { enableUniversalLink: false },
        })}
        enterpriseSubsidiesContextValue={{
          coupons: [{ endDate: couponExpirationDate }],
          customerAgreement: {
            subscriptions: [{ expirationDate: subExpirationDate }],
          },
        }}
      />,
    );

    // Clicking `Enable` does not open modal
    const switchInput = screen.queryByText('Enable');
    await act(async () => { userEvent.click(switchInput); });
    expect(screen.queryByText('Are you sure?')).toBeFalsy();

    expect(LmsApiService.toggleEnterpriseCustomerUniversalLink).toHaveBeenCalledTimes(1);
    expect(LmsApiService.toggleEnterpriseCustomerUniversalLink).toHaveBeenCalledWith({
      enterpriseUUID: MOCK_CONSTANTS.ENTERPRISE_ID,
      enableUniversalLink: true,
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

  test('Generate link button is enabled if there are less than MAX_UNIVERSAL_LINKS', async () => {
    render(
      <SettingsAccessLinkManagementWrapper
        store={generateStore({
          portalConfiguration: { enableUniversalLink: true },
        })}
        links={Array.from({ length: MAX_UNIVERSAL_LINKS - 1 }, () => ({
          usageCount: 0,
          usageLimit: 1,
        }))}
        enterpriseSubsidiesContextValue={{
          coupons: [],
          customerAgreement: {
            subscriptions: [],
          },
        }}
      />,
    );

    const button = screen.queryByText('Generate link').closest('button');
    expect(button).toBeTruthy();
    expect(button).toHaveProperty('disabled', false);
  });

  test('Generate link button is disabled if MAX_UNIVERSAL_LINKS is exceeded', async () => {
    render(
      <SettingsAccessLinkManagementWrapper
        store={generateStore({
          portalConfiguration: { enableUniversalLink: true },
        })}
        links={Array.from({ length: MAX_UNIVERSAL_LINKS }, () => ({
          usageCount: 0,
          usageLimit: 1,
        }))}
        enterpriseSubsidiesContextValue={{
          coupons: [],
          customerAgreement: {
            subscriptions: [],
          },
        }}
      />,
    );

    const button = screen.queryByText('Generate link').closest('button');
    expect(button).toBeTruthy();
    expect(button).toHaveProperty('disabled', true);
  });
});
