import React from 'react';
import {
  screen,
  render,
  cleanup,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { MemoryRouter, Route } from 'react-router-dom';
import SettingsTabs from '../SettingsTabs';
import { SETTINGS_TAB_LABELS } from '../data/constants';

const ACCESS_MOCK_CONTENT = 'access';
const LMS_MOCK_CONTENT = 'lms';

jest.mock(
  '../SettingsAccessTab/',
  () => () => (<div>{ACCESS_MOCK_CONTENT}</div>),
);

jest.mock(
  '../SettingsLMSTab/',
  () => () => (<div>{LMS_MOCK_CONTENT}</div>),
);

const settingsTabsWithRouter = () => (
  <MemoryRouter initialEntries={['settings/']}>
    <Route path="settings/">
      <SettingsTabs />
    </Route>
  </MemoryRouter>
);

describe('<SettingsPage />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('Clicking on a tab changes content via router', async () => {
    render(settingsTabsWithRouter());
    const lmsTab = screen.getByText(SETTINGS_TAB_LABELS.lms);
    await act(async () => { userEvent.click(lmsTab); });
    expect(screen.queryByText(LMS_MOCK_CONTENT)).toBeTruthy();
  });

  it('Clicking on default tab does not change content', async () => {
    render(settingsTabsWithRouter());
    const accessTab = screen.getByText(SETTINGS_TAB_LABELS.access);
    await act(async () => { userEvent.click(accessTab); });
    expect(screen.queryByText(ACCESS_MOCK_CONTENT)).toBeTruthy();
  });
});
