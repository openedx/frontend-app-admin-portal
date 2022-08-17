import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import {
  screen,
  render,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';

import { MemoryRouter, Route } from 'react-router-dom';
import SettingsTabs from '../SettingsTabs';
import { SETTINGS_TAB_LABELS } from '../data/constants';
import { features } from '../../../config';
import '@testing-library/jest-dom/extend-expect';

const ACCESS_MOCK_CONTENT = 'access';
const LMS_MOCK_CONTENT = 'lms';
const SSO_MOCK_CONTENT = 'sso';

jest.mock(
  '../SettingsAccessTab/',
  () => () => (<div>{ACCESS_MOCK_CONTENT}</div>),
);

jest.mock(
  '../SettingsLMSTab/',
  () => () => (<div>{LMS_MOCK_CONTENT}</div>),
);

jest.mock(
  '../SettingsSSOTab/',
  () => () => (<div>{SSO_MOCK_CONTENT}</div>),
);

const enterpriseId = 'test-enterprise';
const initialStore = {
  portalConfiguration: {
    enterpriseId,
    enterpriseSlug: 'sluggy',
    enableLearnerPortal: true,
    enableLmsConfigurationsScreen: true,
    enableIntegratedCustomerLearnerPortalSearch: true,
    enableSamlConfigurationScreen: false,
    enableUniversalLink: false,
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const defaultStore = getMockStore({ ...initialStore });

// eslint-disable-next-line react/prop-types
const SettingsTabsWithRouter = ({ store = defaultStore }) => (
  <MemoryRouter initialEntries={['settings/']}>
    <Provider store={store}>
      <Route path="settings/">
        <SettingsTabs />
      </Route>
    </Provider>
  </MemoryRouter>
);

describe('<SettingsTabs />', () => {
  afterEach(() => {
    features.EXTERNAL_LMS_CONFIGURATION = true;
    features.FEATURE_SSO_SETTINGS_TAB = true;
    features.SETTINGS_PAGE_LMS_TAB = true;
    features.SETTINGS_PAGE_APPEARANCE_TAB = true;

    jest.clearAllMocks();
  });

  test.each([
    [false, true],
    [true, false],
  ])('LMS tab is not rendered if either SETTINGS_PAGE_LMS_TAB or enableLmsConfigurationsScreen = false', (
    enableSettingsPageLmsTab,
    enableLmsConfigurationsScreen,
  ) => {
    features.SETTINGS_PAGE_LMS_TAB = enableSettingsPageLmsTab;

    render(
      <SettingsTabsWithRouter
        store={getMockStore({
          ...initialStore,
          portalConfiguration: {
            ...initialStore.portalConfiguration,
            enableLmsConfigurationsScreen,
          },
        })}
      />,
    );

    expect(screen.queryByText(SETTINGS_TAB_LABELS.lms)).not.toBeInTheDocument();
  });

  test('SSO tab is not rendered if FEATURE_SSO_SETTINGS_TAB = false', () => {
    features.FEATURE_SSO_SETTINGS_TAB = false;
    render(<SettingsTabsWithRouter />);
    expect(screen.queryByText(SETTINGS_TAB_LABELS.sso)).not.toBeInTheDocument();
  });

  test('Clicking on a tab changes content via router', async () => {
    render(<SettingsTabsWithRouter />);
    const lmsTab = screen.getByText(SETTINGS_TAB_LABELS.lms);
    await act(async () => { userEvent.click(lmsTab); });
    expect(screen.queryByText(LMS_MOCK_CONTENT)).toBeTruthy();
  });

  test('Clicking on default tab does not change content', async () => {
    render(<SettingsTabsWithRouter />);
    const accessTab = screen.getByText(SETTINGS_TAB_LABELS.access);
    await act(async () => { userEvent.click(accessTab); });
    expect(screen.queryByText(ACCESS_MOCK_CONTENT)).toBeTruthy();
  });
});
