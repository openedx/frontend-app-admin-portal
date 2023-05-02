import React from 'react';
import {
  fireEvent, screen, waitFor, waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  DEGREED2_TYPE,
  MOODLE_TYPE,
  SAP_TYPE,
} from '../../data/constants';
import { channelMapping } from '../../../../utils';

import SettingsLMSTab from '../index';
import buttonBool from '../utils';

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
      hasSSOConfig={false}
    />
  </Provider>
);

const SettingsLMSWrapperWithSSO = () => (
  <Provider store={mockStore({ ...initialState })}>
    <SettingsLMSTab
      enterpriseId={enterpriseId}
      enterpriseSlug={enterpriseSlug}
      enableSamlConfigurationScreen={enableSamlConfigurationScreen}
      identityProvider={identityProvider}
      hasSSOConfig
    />
  </Provider>
);

describe('<SettingsLMSTab />', () => {
  it('Renders with no config card present w/o sso', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    await waitFor(() => {
      expect(screen.queryByText('You don\'t have any learning platforms integrated yet.')).toBeTruthy();
      expect(screen.queryByText('At least one active Single Sign-On (SSO) integration is required to configure a new learning platform integration.')).toBeTruthy();
      expect(screen.queryByText('New SSO integration')).toBeTruthy();
      expect(screen.getByText('New SSO integration').closest('a')).toHaveAttribute('href', '/test-slug/admin/settings/sso');
    });
  });
  it('Renders with no config card present w/ sso', async () => {
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    await waitFor(() => {
      expect(screen.queryByText('You don\'t have any learning platforms integrated yet.')).toBeTruthy();
      expect(screen.queryByText('At least one active Single Sign-On (SSO) integration is required to configure a new learning platform integration.')).toBeFalsy();
      expect(screen.queryByText('New learning platform integration')).toBeTruthy();
      userEvent.click(screen.getByText('New learning platform integration'));
      expect(screen.queryByText('Select the LMS or LXP you want to integrate with edX For Business.')).toBeTruthy();
    });
  });

  it('Renders with all LMS cards present', async () => {
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    await waitFor(() => {
      userEvent.click(screen.getByText('New learning platform integration'));
      expect(screen.queryByText('Select the LMS or LXP you want to integrate with edX For Business.')).toBeTruthy();
      expect(screen.queryByText(channelMapping[BLACKBOARD_TYPE].displayName)).toBeTruthy();
      expect(screen.queryByText(channelMapping[CANVAS_TYPE].displayName)).toBeTruthy();
      expect(screen.queryByText(channelMapping[CORNERSTONE_TYPE].displayName)).toBeTruthy();
      expect(screen.queryByText(channelMapping[DEGREED2_TYPE].displayName)).toBeTruthy();
      expect(screen.queryByText(channelMapping[MOODLE_TYPE].displayName)).toBeTruthy();
      expect(screen.queryByText(channelMapping[SAP_TYPE].displayName)).toBeTruthy();
    });
  });
  test('Blackboard card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await waitFor(() => {
      userEvent.click(screen.getByText('New learning platform integration'));
      expect(screen.findByText(channelMapping[BLACKBOARD_TYPE].displayName));
    });
    const blackboardCard = screen.getByText(channelMapping[BLACKBOARD_TYPE].displayName);
    userEvent.click(blackboardCard);
    userEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.queryByText('Authorize connection to Blackboard')).toBeTruthy();
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    const cancelButton = screen.getByText('Cancel');
    userEvent.click(cancelButton);
    expect(await screen.findByText('Exit configuration')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    userEvent.click(exitButton);
    expect(screen.queryByText('Authorize connection to Blackboard')).toBeFalsy();
  });
  test('Canvas card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await waitFor(() => {
      userEvent.click(screen.getByText('New learning platform integration'));
      expect(screen.findByText(channelMapping[CANVAS_TYPE].displayName));
    });
    const canvasCard = screen.getByText(channelMapping[CANVAS_TYPE].displayName);
    userEvent.click(canvasCard);
    userEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.queryByText('Authorize connection to Canvas')).toBeTruthy();
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    const cancelButton = screen.getByText('Cancel');
    userEvent.click(cancelButton);
    expect(await screen.findByText('Exit configuration')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    userEvent.click(exitButton);
    expect(screen.queryByText('Authorize connection to Canvas')).toBeFalsy();
  });
  test('Cornerstone card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await waitFor(() => {
      userEvent.click(screen.getByText('New learning platform integration'));
      expect(screen.findByText(channelMapping[CORNERSTONE_TYPE].displayName));
    });
    const cornerstoneCard = screen.getByText(channelMapping[CORNERSTONE_TYPE].displayName);
    fireEvent.click(cornerstoneCard);
    userEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.queryByText('Enable connection to Cornerstone')).toBeTruthy();
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    const cancelButton = screen.getByText('Cancel');
    userEvent.click(cancelButton);
    expect(await screen.findByText('Exit configuration')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    userEvent.click(exitButton);
    expect(screen.queryByText('Enable connection to Cornerstone')).toBeFalsy();
  });
  test('Degreed card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await waitFor(() => {
      userEvent.click(screen.getByText('New learning platform integration'));
      expect(screen.findByText(channelMapping[DEGREED2_TYPE].displayName));
    });
    const degreedCard = screen.getByText(channelMapping[DEGREED2_TYPE].displayName);
    fireEvent.click(degreedCard);
    userEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.queryByText('Enable connection to Degreed')).toBeTruthy();
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    const cancelButton = screen.getByText('Cancel');
    userEvent.click(cancelButton);
    expect(await screen.findByText('Exit configuration')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    userEvent.click(exitButton);
    expect(screen.queryByText('Enable connection to Degreed')).toBeFalsy();
  });
  test('Moodle card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await waitFor(() => {
      userEvent.click(screen.getByText('New learning platform integration'));
      expect(screen.findByText(channelMapping[MOODLE_TYPE].displayName));
    });
    const moodleCard = screen.getByText(channelMapping[MOODLE_TYPE].displayName);
    fireEvent.click(moodleCard);
    userEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.queryByText('Enable connection to Moodle')).toBeTruthy();
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    const cancelButton = screen.getByText('Cancel');
    userEvent.click(cancelButton);
    expect(await screen.findByText('Exit configuration')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    userEvent.click(exitButton);
    expect(screen.queryByText('Enable connection to Moodle')).toBeFalsy();
  });
  test('SAP card cancel flow', async () => {
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await waitFor(() => {
      userEvent.click(screen.getByText('New learning platform integration'));
      expect(screen.findByText(channelMapping[SAP_TYPE].displayName));
    });
    const moodleCard = screen.getByText(channelMapping[SAP_TYPE].displayName);
    fireEvent.click(moodleCard);
    userEvent.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.queryByText('Enable connection to SAP Success Factors')).toBeTruthy();
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    const cancelButton = screen.getByText('Cancel');
    userEvent.click(cancelButton);
    expect(await screen.findByText('Exit configuration')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    userEvent.click(exitButton);
    expect(screen.queryByText('Enable connection to SAP Success Factors')).toBeFalsy();
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
    await waitFor(() => userEvent.click(configureSSOButton));
    expect(history.location.pathname).toEqual(`/${enterpriseSlug}/admin/settings/sso`);
  });
  test('Expected behavior when customer has IDP configured', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    await waitFor(() => expect(screen.queryByText('No SSO configured')).not.toBeInTheDocument());
  });
  test('test button text', () => {
    expect(!buttonBool(draftConfig));
    expect(buttonBool(completeConfig));
  });
});
