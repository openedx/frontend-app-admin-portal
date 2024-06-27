import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SettingsPage from '../index';
import { GlobalContext } from '../../GlobalContextProvider';

jest.mock('../SettingsTabs');

const headerHeight = 0;
const footerHeight = 0;

const defaultGlobalContextValue = {
  headerHeight,
  footerHeight,
  minHeight: `calc(100vh - ${headerHeight + footerHeight + 16}px)`,
  dispatch: jest.fn(),
};

const mockStore = configureMockStore();
const store = mockStore({
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
  },
  coupons: {
    loading: false,
  },
});

const settingsPageWithRouter = (route) => (
  <IntlProvider locale="en">
    <MemoryRouter initialEntries={[route]}>
      <Provider store={store}>
        <GlobalContext.Provider value={defaultGlobalContextValue}>
          <Routes>
            <Route path="/settings/*" element={<SettingsPage />} />
          </Routes>
        </GlobalContext.Provider>
      </Provider>
    </MemoryRouter>
  </IntlProvider>
);

describe('<SettingsPage />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Redirects to appearance tab when no param given', () => {
    render(settingsPageWithRouter('/settings'));
    expect(screen.queryByText('404')).toBeFalsy();
    expect(screen.queryByText('appearance')).toBeTruthy();
  });

  it('Does not redirect when access is passed', () => {
    render(settingsPageWithRouter('/settings/access'));
    expect(screen.queryByText('404')).toBeFalsy();
    expect(screen.queryByText('access')).toBeTruthy();
  });

  it('Renders not found page', () => {
    render(settingsPageWithRouter('/settings/foo'));
    expect(screen.queryByText('404')).toBeTruthy();
  });
});
