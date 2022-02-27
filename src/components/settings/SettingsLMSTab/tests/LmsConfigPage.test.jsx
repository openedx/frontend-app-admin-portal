import React from 'react';
import {
  fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import configureMockStore from 'redux-mock-store';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';

import { renderWithRouter } from '../../../test/testUtils';
import {
  BLACKBOARD_TYPE,
  CANVAS_TYPE,
  CORNERSTONE_TYPE,
  DEGREED_TYPE,
  DEGREED2_TYPE,
  MOODLE_TYPE,
  SAP_TYPE,
} from '../../data/constants';
import { channelMapping } from '../../../../utils';

import SettingsLMSTab from '../index';
import { buttonBool } from '../utils';

const enterpriseId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const enterpriseSlug = 'test-slug';
const enableSamlConfigurationScreen = false;
const identityProvider = '';

const initialState = {
  portalConfiguration: {
    enterpriseId, enterpriseSlug, enableSamlConfigurationScreen, identityProvider,
  },
};

const draftConfig = {
  field1: '',
  field2: 'test',
  field3: 'test',
};

const completeConfig = {
  field1: 'test',
  field2: 'test',
  field3: 'test',
};

const mockStore = configureMockStore([thunk]);

const SettingsLMSWrapper = () => (
  <Provider store={mockStore({ ...initialState })}>
    <SettingsLMSTab
      enterpriseId={enterpriseId}
      enterpriseSlug={enterpriseSlug}
      enableSamlConfigurationScreen={enableSamlConfigurationScreen}
      identityProvider={identityProvider}
    />
  </Provider>
);

describe('<SettingsLMSTab />', () => {
  it('Renders with all LMS cards present', () => {
    renderWithRouter(<SettingsLMSWrapper />);
    expect(screen.queryByText(channelMapping[BLACKBOARD_TYPE].displayName)).toBeTruthy();
    expect(screen.queryByText(channelMapping[CANVAS_TYPE].displayName)).toBeTruthy();
    expect(screen.queryByText(channelMapping[CORNERSTONE_TYPE].displayName)).toBeTruthy();
    expect(screen.queryByText(channelMapping[DEGREED2_TYPE].displayName)).toBeTruthy();
    expect(screen.queryByText(channelMapping[MOODLE_TYPE].displayName)).toBeTruthy();
    expect(screen.queryByText(channelMapping[SAP_TYPE].displayName)).toBeTruthy();
  });
  test('Blackboard card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const blackboardCard = screen.getByText(channelMapping[BLACKBOARD_TYPE].displayName);
    fireEvent.click(blackboardCard);
    expect(screen.queryByText('Connect Blackboard')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(await screen.findByText('Do you want to save your work?')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    fireEvent.click(exitButton);
    expect(screen.queryByText('Connect Blackboard')).toBeFalsy();
  });
  test('Canvas card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const canvasCard = screen.getByText(channelMapping[CANVAS_TYPE].displayName);
    fireEvent.click(canvasCard);
    expect(screen.queryByText('Connect Canvas')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(await screen.findByText('Do you want to save your work?')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    fireEvent.click(exitButton);
    expect(screen.queryByText('Connect Canvas')).toBeFalsy();
  });
  test('Cornerstone card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const cornerstoneCard = screen.getByText(channelMapping[CORNERSTONE_TYPE].displayName);
    fireEvent.click(cornerstoneCard);
    expect(screen.queryByText('Connect Cornerstone')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(await screen.findByText('Do you want to save your work?')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    fireEvent.click(exitButton);
    expect(screen.queryByText('Connect Cornerstone')).toBeFalsy();
  });
  test('Degreed card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const degreedCard = screen.getByText(channelMapping[DEGREED2_TYPE].displayName);
    fireEvent.click(degreedCard);
    expect(screen.queryByText('Connect Degreed')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(await screen.findByText('Do you want to save your work?')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    fireEvent.click(exitButton);
    expect(screen.queryByText('Connect Degreed')).toBeFalsy();
  });
  test('Moodle card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const moodleCard = screen.getByText(channelMapping[MOODLE_TYPE].displayName);
    fireEvent.click(moodleCard);
    expect(screen.queryByText('Connect Moodle')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(await screen.findByText('Do you want to save your work?')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    fireEvent.click(exitButton);
    expect(screen.queryByText('Connect Moodle')).toBeFalsy();
  });
  test('SAP card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const sapCard = screen.getByText(channelMapping[SAP_TYPE].displayName);
    fireEvent.click(sapCard);
    expect(screen.queryByText('Connect SAP')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(await screen.findByText('Do you want to save your work?')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    fireEvent.click(exitButton);
    expect(screen.queryByText('Connect SAP')).toBeFalsy();
  });
  test('No action Moodle card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const sapCard = screen.getByText(channelMapping[MOODLE_TYPE].displayName);
    fireEvent.click(sapCard);
    expect(screen.queryByText('Connect Moodle')).toBeTruthy();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Exit without saving')).toBeFalsy();
    expect(screen.queryByText('Connect Moodle')).toBeFalsy();
  });
  test('No action Degreed2 card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const sapCard = screen.getByText(channelMapping[DEGREED2_TYPE].displayName);
    fireEvent.click(sapCard);
    expect(screen.queryByText('Connect Degreed')).toBeTruthy();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Exit without saving')).toBeFalsy();
    expect(screen.queryByText('Connect Degreed')).toBeFalsy();
  });
  test('No action Degreed card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const sapCard = screen.getByText(channelMapping[DEGREED_TYPE].displayName);
    fireEvent.click(sapCard);
    expect(screen.queryByText('Connect Degreed')).toBeTruthy();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Exit without saving')).toBeFalsy();
    expect(screen.queryByText('Connect Degreed')).toBeFalsy();
  });
  test('No action Cornerstone card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const sapCard = screen.getByText(channelMapping[CORNERSTONE_TYPE].displayName);
    fireEvent.click(sapCard);
    expect(screen.queryByText('Connect Cornerstone')).toBeTruthy();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Exit without saving')).toBeFalsy();
    expect(screen.queryByText('Connect Cornerstone')).toBeFalsy();
  });
  test('No action Canvas card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const sapCard = screen.getByText(channelMapping[CANVAS_TYPE].displayName);
    fireEvent.click(sapCard);
    expect(screen.queryByText('Connect Canvas')).toBeTruthy();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Exit without saving')).toBeFalsy();
    expect(screen.queryByText('Connect Canvas')).toBeFalsy();
  });
  test('No action Blackboard card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const sapCard = screen.getByText(channelMapping[BLACKBOARD_TYPE].displayName);
    fireEvent.click(sapCard);
    expect(screen.queryByText('Connect Blackboard')).toBeTruthy();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Exit without saving')).toBeFalsy();
    expect(screen.queryByText('Connect Blackbard')).toBeFalsy();
  });
  test('No action SAP card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    const sapCard = screen.getByText(channelMapping[SAP_TYPE].displayName);
    fireEvent.click(sapCard);
    expect(screen.queryByText('Connect SAP')).toBeTruthy();
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(screen.queryByText('Exit without saving')).toBeFalsy();
    expect(screen.queryByText('Connect SAP')).toBeFalsy();
  });
  test('Expected behavior when customer has no IDP configured', async () => {
    const history = createMemoryHistory();
    const samlConfigurationScreenEnabled = true;
    const needsSSOState = {
      portalConfiguration: {
        enterpriseId,
        enterpriseSlug,
        identityProvider,
        enableSamlConfigurationScreen: samlConfigurationScreenEnabled,
      },
    };
    const NeedsSSOConfigLMSWrapper = () => (
      <Router history={history}>
        <Provider store={mockStore({ ...needsSSOState })}>
          <SettingsLMSTab
            enterpriseId={enterpriseId}
            enterpriseSlug={enterpriseSlug}
            identityProvider={identityProvider}
            enableSamlConfigurationScreen={samlConfigurationScreenEnabled}
          />
        </Provider>
      </Router>
    );
    renderWithRouter(<NeedsSSOConfigLMSWrapper />);
    expect(history.location.pathname).toEqual('/');
    await screen.findByText('No SSO configured');
    const configureSSOButton = screen.getByText('Configure SSO');
    fireEvent.click(configureSSOButton);
    expect(history.location.pathname).toEqual(`/${enterpriseSlug}/admin/settings/sso`);
  });
  test('Expected behavior when customer has IDP configured', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    expect(screen.queryByText('No SSO configured')).not.toBeInTheDocument();
  });
  test('test button text', () => {
    expect(!buttonBool(draftConfig));
    expect(buttonBool(completeConfig));
  });
});
