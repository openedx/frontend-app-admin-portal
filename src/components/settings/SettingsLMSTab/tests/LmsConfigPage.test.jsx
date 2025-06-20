import React from 'react';
import {
  screen, waitFor, waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { renderWithRouter } from '../../../test/testUtils';
import {
  BLACKBOARD_TYPE, CANVAS_TYPE, CORNERSTONE_TYPE, DEGREED2_TYPE,
  MOODLE_TYPE, SAP_TYPE,
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
    <IntlProvider locale="en">
      <SettingsLMSTab
        enterpriseId={enterpriseId}
        enterpriseSlug={enterpriseSlug}
        enableSamlConfigurationScreen={enableSamlConfigurationScreen}
        identityProvider={identityProvider}
        hasSSOConfig={false}
      />
    </IntlProvider>
  </Provider>
);

const SettingsLMSWrapperWithSSO = () => (
  <Provider store={mockStore({ ...initialState })}>
    <IntlProvider locale="en">
      <SettingsLMSTab
        enterpriseId={enterpriseId}
        enterpriseSlug={enterpriseSlug}
        enableSamlConfigurationScreen={enableSamlConfigurationScreen}
        identityProvider={identityProvider}
        hasSSOConfig
      />
    </IntlProvider>
  </Provider>
);

describe('<SettingsLMSTab />', () => {
  it('Renders with no config card present w/o sso', async () => {
    renderWithRouter(<SettingsLMSWrapper />);
    await waitFor(() => {
      expect(screen.queryByText('You do not have any learning platforms integrated yet.')).toBeTruthy();
      expect(screen.queryByText('At least one active Single Sign-On (SSO) integration is required to configure a new learning platform integration.')).toBeTruthy();
      expect(screen.queryByText('New SSO integration')).toBeTruthy();
      expect(screen.getByText('New SSO integration').closest('a')).toHaveAttribute('href', '/test-slug/admin/settings/sso');
    });
  });
  it('Renders with no config card present w/ sso', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    await waitFor(() => {
      expect(screen.queryByText('You do not have any learning platforms integrated yet.')).toBeTruthy();
      expect(screen.queryByText('At least one active Single Sign-On (SSO) integration is required to configure a new learning platform integration.')).toBeFalsy();
      expect(screen.queryByText('New learning platform integration')).toBeTruthy();
    });
    await user.click(screen.getByText('New learning platform integration'));
    expect(screen.queryByText('Select the LMS or LXP you want to integrate with edX For Business.')).toBeTruthy();
  });

  it('Renders with all LMS cards present', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await user.click(screen.getByText('New learning platform integration'));
    await waitFor(() => {
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
    const user = userEvent.setup();
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await user.click(screen.getByText('New learning platform integration'));
    await waitFor(() => {
      expect(screen.findByText(channelMapping[BLACKBOARD_TYPE].displayName));
    });
    const blackboardCard = screen.getByText(channelMapping[BLACKBOARD_TYPE].displayName);
    await user.click(blackboardCard);
    await user.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.queryByText('Authorize connection to Blackboard')).toBeTruthy();
    });
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(await screen.findByText('Exit configuration')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    await user.click(exitButton);
    expect(screen.queryByText('Authorize connection to Blackboard')).toBeFalsy();
  });
  test('Canvas card cancel flow', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await user.click(screen.getByText('New learning platform integration'));
    await waitFor(() => {
      expect(screen.findByText(channelMapping[CANVAS_TYPE].displayName));
    });
    const canvasCard = screen.getByText(channelMapping[CANVAS_TYPE].displayName);
    await user.click(canvasCard);
    await user.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.queryByText('Authorize connection to Canvas')).toBeTruthy();
    });
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(await screen.findByText('Exit configuration')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    await user.click(exitButton);
    expect(screen.queryByText('Authorize connection to Canvas')).toBeFalsy();
  });
  test('Cornerstone card cancel flow', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await user.click(screen.getByText('New learning platform integration'));
    await waitFor(() => {
      expect(screen.findByText(channelMapping[CORNERSTONE_TYPE].displayName));
    });
    const cornerstoneCard = screen.getByText(channelMapping[CORNERSTONE_TYPE].displayName);
    await user.click(cornerstoneCard);
    await user.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.queryByText('Enable connection to Cornerstone')).toBeTruthy();
    });
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(await screen.findByText('Exit configuration')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    await user.click(exitButton);
    expect(screen.queryByText('Enable connection to Cornerstone')).toBeFalsy();
  });
  test('Degreed card cancel flow', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await user.click(screen.getByText('New learning platform integration'));
    await waitFor(() => {
      expect(screen.findByText(channelMapping[DEGREED2_TYPE].displayName));
    });
    const degreedCard = screen.getByText(channelMapping[DEGREED2_TYPE].displayName);
    await user.click(degreedCard);
    await user.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.queryByText('Enable connection to Degreed')).toBeTruthy();
    });
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(await screen.findByText('Exit configuration')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    await user.click(exitButton);
    expect(screen.queryByText('Enable connection to Degreed')).toBeFalsy();
  });
  test('Moodle card cancel flow', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await user.click(screen.getByText('New learning platform integration'));
    await waitFor(() => {
      expect(screen.findByText(channelMapping[MOODLE_TYPE].displayName));
    });
    const moodleCard = screen.getByText(channelMapping[MOODLE_TYPE].displayName);
    await user.click(moodleCard);
    await user.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.queryByText('Enable connection to Moodle')).toBeTruthy();
    });
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(await screen.findByText('Exit configuration')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    await user.click(exitButton);
    expect(screen.queryByText('Enable connection to Moodle')).toBeFalsy();
  });
  test('SAP card cancel flow', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingsLMSWrapperWithSSO />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await user.click(screen.getByText('New learning platform integration'));
    await waitFor(() => {
      expect(screen.findByText(channelMapping[SAP_TYPE].displayName));
    });
    const moodleCard = screen.getByText(channelMapping[SAP_TYPE].displayName);
    await user.click(moodleCard);
    await user.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.queryByText('Enable connection to SAP Success Factors')).toBeTruthy();
    });
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(await screen.findByText('Exit configuration')).toBeTruthy();
    const exitButton = screen.getByText('Exit without saving');
    await user.click(exitButton);
    expect(screen.queryByText('Enable connection to SAP Success Factors')).toBeFalsy();
  });
  test('Expected behavior when customer has no IDP configured', async () => {
    const user = userEvent.setup();
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
      <Provider store={mockStore({ ...needsSSOState })}>
        <IntlProvider locale="en">
          <SettingsLMSTab
            enterpriseId={enterpriseId}
            enterpriseSlug={enterpriseSlug}
            identityProvider={identityProvider}
            enableSamlConfigurationScreen={samlConfigurationScreenEnabled}
          />
        </IntlProvider>
      </Provider>
    );
    renderWithRouter(<NeedsSSOConfigLMSWrapper />);
    expect(window.location.pathname).toEqual('/');
    await screen.findByText('No SSO configured');
    const configureSSOButton = screen.getByText('Configure SSO');
    await user.click(configureSSOButton);
    expect(window.location.pathname).toEqual(`/${enterpriseSlug}/admin/settings/sso`);
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
