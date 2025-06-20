import React from 'react';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  screen,
  render,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import configureMockStore from 'redux-mock-store';

import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SettingsTabs from '../SettingsTabs';
import { SCHOLAR_THEME } from '../data/constants';

import { features } from '../../../config';
import '@testing-library/jest-dom/extend-expect';

const ACCESS_MOCK_CONTENT = 'access';
const LMS_MOCK_CONTENT = 'lms';
const SSO_MOCK_CONTENT = 'sso';
const API_CREDENTIALS_CONTENT = 'credentials';

jest.mock('../../../data/services/LmsApiService', () => ({
  updateEnterpriseCustomerBranding: jest.fn(),
}));

jest.mock(
  '../SettingsAccessTab/',
  () => function SettingsAccessTab() {
    return <div>{ACCESS_MOCK_CONTENT}</div>;
  },
);

jest.mock(
  '../SettingsLMSTab/',
  () => function SettingsLMSTab() {
    return <div>{LMS_MOCK_CONTENT}</div>;
  },
);

jest.mock(
  '../SettingsSSOTab/',
  () => function SettingsSSOTab() {
    return <div>{SSO_MOCK_CONTENT}</div>;
  },
);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));
jest.mock(
  '../SettingsApiCredentialsTab/',
  () => function SettingsAccessTab() {
    return <div>{API_CREDENTIALS_CONTENT}</div>;
  },
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
    enterpriseBranding: {
      primary_color: SCHOLAR_THEME.button,
      secondary_color: SCHOLAR_THEME.banner,
      tertiary_color: SCHOLAR_THEME.accent,
    },
  },
};

const mockStore = configureMockStore([thunk]);
const getMockStore = store => mockStore(store);
const defaultStore = getMockStore({ ...initialStore });

const SettingsTabsWithRouter = ({ store = defaultStore }) => (
  <IntlProvider locale="en">
    <MemoryRouter initialEntries={['/settings']}>
      <Provider store={store}>
        <Routes>
          <Route path="/settings" element={<SettingsTabs />} />
        </Routes>
      </Provider>
    </MemoryRouter>
  </IntlProvider>
);

describe('<SettingsTabs />', () => {
  beforeEach(() => {
    features.EXTERNAL_LMS_CONFIGURATION = true;
    features.FEATURE_SSO_SETTINGS_TAB = true;
    features.SETTINGS_PAGE_LMS_TAB = true;
    features.SETTINGS_PAGE_APPEARANCE_TAB = true;

    jest.clearAllMocks();
  });

  test('SSO tab is not rendered if FEATURE_SSO_SETTINGS_TAB = false', () => {
    features.FEATURE_SSO_SETTINGS_TAB = false;
    render(<SettingsTabsWithRouter />);
    expect(screen.queryByText('Single Sign On (SSO)')).not.toBeInTheDocument();
  });

  test('Appearance tab is not rendered if FEATURE_SETTING_PAGE_APPEARANCE_TAB = false', () => {
    features.SETTINGS_PAGE_APPEARANCE_TAB = false;
    render(<SettingsTabsWithRouter />);
    expect(screen.queryByText('Portal Appearance')).not.toBeInTheDocument();
  });

  test('Clicking on a tab changes content via router', async () => {
    const user = userEvent.setup();
    render(<SettingsTabsWithRouter />);
    const lmsTab = screen.getByText('Learning Platform');
    await user.click(lmsTab);
    expect(screen.queryByText(LMS_MOCK_CONTENT)).toBeTruthy();
  });

  test('Clicking on default tab does not change content', async () => {
    const user = userEvent.setup();
    render(<SettingsTabsWithRouter />);
    const accessTab = screen.getByText('Configure Access');
    await user.click(accessTab);
    expect(screen.queryByText(ACCESS_MOCK_CONTENT)).toBeTruthy();
  });

  test('Api credentials tab is not rendered if FEATURE_API_CREDENTIALS_TAB = false', () => {
    features.FEATURE_API_CREDENTIALS_TAB = false;
    render(<SettingsTabsWithRouter />);
    expect(screen.queryByText(API_CREDENTIALS_CONTENT)).not.toBeInTheDocument();
  });
});
