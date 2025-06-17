import React from 'react';
import {
  cleanup, screen, waitFor, waitForElementToBeRemoved,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import configureMockStore from 'redux-mock-store';

import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { renderWithRouter } from '../../../../test/testUtils';
import SettingsLMSTab from '../..';
import LmsApiService from '../../../../../data/services/LmsApiService';
import { getChannelMap } from '../../../../../utils';

const mockFetch = jest.fn();
mockFetch.mockResolvedValue({ data: { refresh_token: 'foobar' } });

const channelMapReturn = {
  BLACKBOARD: {
    fetch: mockFetch,
  },
};

jest.mock('../../../../../utils', () => ({
  ...jest.requireActual('../../../../../utils'),
  getChannelMap: jest.fn(),
}));

getChannelMap.mockReturnValue(channelMapReturn);

const enterpriseId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const enterpriseSlug = 'test-slug';
const enableSamlConfigurationScreen = false;
const identityProvider = '';

const initialState = {
  portalConfiguration: {
    enterpriseId, enterpriseSlug, enableSamlConfigurationScreen, identityProvider,
  },
};

const existingConfigData = {
  data: [{
    channelCode: 'BLACKBOARD',
    id: 1,
    isValid: [{ missing: [] }, { incorrect: [] }],
    active: true,
    displayName: 'squish',
    enterpriseCustomer: enterpriseId,
    lastSyncAttemptedAt: '2022-11-22T20:59:56Z',
    lastContentSyncAttemptedAt: '2022-11-22T20:59:56Z',
    lastLearnerSyncAttemptedAt: null,
    lastSyncErroredAt: null,
    lastContentSyncErroredAt: null,
    lastLearnerSyncErroredAt: null,
    lastModifiedAt: '2023-05-05T14:51:53.473144Z',
  }],
};

const configData = {
  data: {
    channelCode: 'BLACKBOARD',
    id: 1,
    isValid: [{ missing: [] }, { incorrect: [] }],
    active: true,
    displayName: 'foobar',
    enterpriseCustomer: enterpriseId,
    lastSyncAttemptedAt: '2022-11-22T20:59:56Z',
    lastContentSyncAttemptedAt: '2022-11-22T20:59:56Z',
    lastLearnerSyncAttemptedAt: null,
    lastSyncErroredAt: null,
    lastContentSyncErroredAt: null,
    lastLearnerSyncErroredAt: null,
    lastModifiedAt: '2023-05-05T14:51:53.473144Z',
  },
};

const mockStore = configureMockStore([thunk]);
window.open = jest.fn();

describe('Test sync history page full flow', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('Test opening sync history page', async () => {
    getAuthenticatedUser.mockReturnValue({
      administrator: true,
    });

    const mockFetchSingleConfig = jest.spyOn(LmsApiService, 'fetchSingleBlackboardConfig');
    const mockFetchExistingConfigs = jest.spyOn(LmsApiService, 'fetchEnterpriseCustomerIntegrationConfigs');
    mockFetchSingleConfig.mockResolvedValue(configData);
    mockFetchExistingConfigs.mockResolvedValue(existingConfigData);

    const SettingsLMSWrapper = () => (
      <IntlProvider locale="en">
        <Provider store={mockStore({ ...initialState })}>
          <SettingsLMSTab
            enterpriseId={enterpriseId}
            enterpriseSlug={enterpriseSlug}
            enableSamlConfigurationScreen={enableSamlConfigurationScreen}
            identityProvider={identityProvider}
            hasSSOConfig
          />
        </Provider>
      </IntlProvider>
    );

    renderWithRouter(<SettingsLMSWrapper />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await (expect(screen.getByText('squish')));

    const syncHistoryButton = screen.getByText('View sync history');
    expect(syncHistoryButton.getAttribute('href')).toBe(`/${configData.data.channelCode}/${configData.data.id}`);
  });
  test('Test configure action from sync history', async () => {
    const mockFetchSingleConfig = jest.spyOn(LmsApiService, 'fetchSingleBlackboardConfig');
    mockFetchSingleConfig.mockResolvedValue(configData);

    const location = {
      ...window.location,
      search: `?lms=${configData.data.channelCode}&id=${configData.data.id}`,
    };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location,
    });

    const SettingsLMSWrapper = () => (
      <IntlProvider locale="en">
        <Provider store={mockStore({ ...initialState })}>
          <SettingsLMSTab
            enterpriseId={enterpriseId}
            enterpriseSlug={enterpriseSlug}
            enableSamlConfigurationScreen={enableSamlConfigurationScreen}
            identityProvider={identityProvider}
            hasSSOConfig
          />
        </Provider>
      </IntlProvider>
    );

    renderWithRouter(<SettingsLMSWrapper />);
    expect(window.location.search).toEqual(`?lms=${configData.data.channelCode}&id=${configData.data.id}`);
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith('1'));
    // opens stepper
    await waitFor(() => expect(screen.getByText('New learning platform integration')));
  });
});
