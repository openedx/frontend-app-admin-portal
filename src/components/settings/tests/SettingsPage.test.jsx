import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { axe } from 'jest-axe';
import SettingsPage from '../index';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

jest.mock('../SettingsTabs');

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
        <Routes>
          <Route path="/settings/*" element={<SettingsPage />} />
        </Routes>
      </Provider>
    </MemoryRouter>
  </IntlProvider>
);

describe('<SettingsPage />', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(settingsPageWithRouter('/settings'));
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

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
