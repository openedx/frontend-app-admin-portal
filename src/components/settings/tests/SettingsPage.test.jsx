import React from 'react';
import {
  screen,
  render,
  cleanup,
} from '@testing-library/react';

import { MemoryRouter, Route } from 'react-router-dom';
import SettingsPage from '../index';

jest.mock('../SettingsTabs');

const settingsPageWithRouter = (route) => (
  <MemoryRouter initialEntries={[route]}>
    <Route path="/settings">
      <SettingsPage />
    </Route>
  </MemoryRouter>
);

describe('<SettingsPage />', () => {
  afterEach(() => {
    cleanup();
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
