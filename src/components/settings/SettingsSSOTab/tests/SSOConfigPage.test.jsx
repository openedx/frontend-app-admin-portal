import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWithRouter } from '../../../test/testUtils';
import SettingsSSOTab from '../index';

const enterpriseId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const enterpriseSlug = 'test-slug';
const enterpriseName = 'name';
const enableSamlConfigurationScreen = true;
const identityProvider = '';

const initialState = {
  portalConfiguration: {
    enterpriseId, enterpriseSlug, enterpriseName, enableSamlConfigurationScreen, identityProvider,
  },
};

const mockStore = configureMockStore([thunk]);
const setHasSSOConfig = jest.fn();
const SettingsSSOWrapper = () => (
  <Provider store={mockStore({ ...initialState })}>
    <IntlProvider locale="en">
      <SettingsSSOTab
        enterpriseId={enterpriseId}
        setHasSSOConfig={setHasSSOConfig}
      />
    </IntlProvider>
  </Provider>
);

describe('<SettingsSSOTab />', () => {
  it('Renders with no config card present', async () => {
    renderWithRouter(<SettingsSSOWrapper />);
    await waitFor(() => {
      expect(screen.queryByText('You don\'t have any SSOs integrated yet.')).toBeTruthy();
      expect(screen.queryByText('New SSO integration')).toBeTruthy();
      userEvent.click(screen.getByText('New SSO integration'));
      expect(screen.queryByText('First provide your Identity Provider Metadata and fill out the corresponding fields.')).toBeTruthy();
    });
  });
});
