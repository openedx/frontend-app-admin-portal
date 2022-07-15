import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { MemoryRouter, Route } from 'react-router-dom';
import SettingsPage from '../index';

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
  <MemoryRouter initialEntries={[route]}>
    <Provider store={store}>
      <Route path="/settings">
        <SettingsPage />
      </Route>
    </Provider>
  </MemoryRouter>
);

describe('<SettingsPage />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Redirects to access tab when no param given', () => {
    render(settingsPageWithRouter('/settings'));
    expect(screen.queryByText('404')).toBeFalsy();
    expect(screen.queryByText('access')).toBeTruthy();
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
