import React from 'react';
import {
  screen, waitFor, waitForElementToBeRemoved,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { legacy_configureStore as configureMockStore } from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { renderWithRouter } from '../../../test/testUtils';
import { BLACKBOARD_TYPE, CANVAS_TYPE } from '../../data/constants';
import { channelMapping } from '../../../../utils';

import SettingsLMSTab from '../index';
import LmsApiService from '../../../../data/services/LmsApiService';

const enterpriseId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const enterpriseSlug = 'test-slug';
const enableSamlConfigurationScreen = false;
const identityProvider = '';

const initialState = {
  portalConfiguration: {
    enterpriseId, enterpriseSlug, enableSamlConfigurationScreen, identityProvider,
  },
};
const mockBlackboardResponseData = {
  uuid: 'foobar',
  id: 1,
  display_name: 'display name',
  blackboard_base_url: 'https://foobar.com',
  active: false,
};

const mockBlackboardResponseDataActive = {
  uuid: 'foobar',
  id: 1,
  display_name: 'display name',
  blackboard_base_url: 'https://foobar.com',
  active: true,
};

const mockCanvasResponseData = {
  uuid: 'foobar',
  id: 1,
  canvas_account_id: 1,
  display_name: 'display name',
  canvas_base_url: 'https://foobar.com',
  client_id: 'wassap',
  client_secret: 'chewlikeyouhaveasecret',
  active: false,
};

const mockCanvasResponseDataActive = {
  uuid: 'foobar',
  id: 1,
  canvas_account_id: 1,
  display_name: 'display name',
  canvas_base_url: 'https://foobar.com',
  client_id: 'wassap',
  client_secret: 'chewlikeyouhaveasecret',
  active: true,
};

const mockStore = configureMockStore([thunk]);
window.open = jest.fn();

const mockBlackboardPost = jest.spyOn(LmsApiService, 'postNewBlackboardConfig');
const mockBlackboardUpdate = jest.spyOn(LmsApiService, 'updateBlackboardConfig');
const mockBlackboardFetch = jest.spyOn(LmsApiService, 'fetchSingleBlackboardConfig');
const mockBlackboardFetchGlobal = jest.spyOn(LmsApiService, 'fetchBlackboardGlobalConfig');
mockBlackboardPost.mockResolvedValue({ data: mockBlackboardResponseData });
mockBlackboardUpdate.mockResolvedValue({ data: mockBlackboardResponseData });
mockBlackboardFetch.mockResolvedValue({ data: { refresh_token: 'foobar' } });
mockBlackboardFetchGlobal.mockReturnValue({ data: { results: [{ app_key: 1 }] } });

const SettingsBlackboardWrapper = () => (
  <IntlProvider locale="en">
    <Provider store={mockStore({ ...initialState })}>
      <SettingsLMSTab
        enterpriseId={enterpriseId}
        enterpriseSlug={enterpriseSlug}
        enableSamlConfigurationScreen={enableSamlConfigurationScreen}
        identityProvider={identityProvider}
        hasSSOConfig
      />
    </Provider>
  </IntlProvider>
);

const mockCanvasPost = jest.spyOn(LmsApiService, 'postNewCanvasConfig');
const mockCanvasUpdate = jest.spyOn(LmsApiService, 'updateCanvasConfig');
const mockCanvasFetch = jest.spyOn(LmsApiService, 'fetchSingleCanvasConfig');
mockCanvasPost.mockResolvedValue({ data: mockCanvasResponseData });
mockCanvasUpdate.mockResolvedValue({ data: mockCanvasResponseData });
mockCanvasFetch.mockResolvedValue({ data: { refresh_token: 'foobar' } });

const SettingsCanvasWrapper = () => (
  <IntlProvider locale="en">
    <Provider store={mockStore({ ...initialState })}>
      <SettingsLMSTab
        enterpriseId={enterpriseId}
        enterpriseSlug={enterpriseSlug}
        enableSamlConfigurationScreen={enableSamlConfigurationScreen}
        identityProvider={identityProvider}
        hasSSOConfig
      />
    </Provider>
  </IntlProvider>
);

describe('Test authorization flows for Blackboard and Canvas', () => {
  test('Blackboard properly authorizes', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingsBlackboardWrapper />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await user.click(screen.getByText('New learning platform integration'));
    expect(await screen.findByText(channelMapping[BLACKBOARD_TYPE].displayName));
    const blackboardCard = screen.getByText(channelMapping[BLACKBOARD_TYPE].displayName);
    await user.click(blackboardCard);
    await user.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.queryByText('Authorize connection to Blackboard')).toBeTruthy();
    });
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    await user.type(screen.getByLabelText('Blackboard Base URL'), 'https://www.test4.com');

    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
    await user.click(authorizeButton);
    const inProgress = screen.getByText('Authorization in progress');
    await waitForElementToBeRemoved(inProgress);

    await waitFor(() => {
      expect(screen.queryByText('Your Blackboard integration has been successfully authorized and is ready to activate!')).toBeTruthy();
    });
    const expectedConfig = {
      active: false,
      blackboard_base_url: 'https://www.test4.com',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
      lms: BLACKBOARD_TYPE,
    };
    expect(mockBlackboardPost).toHaveBeenCalledWith(expectedConfig);
    expect(window.open).toHaveBeenCalled();
    expect(mockBlackboardFetch).toHaveBeenCalledWith(1);
  });
  // TODO: Figure out how to mock existing data deeper to test
  // - Authorizing an existing, edited config will call update config endpoint
  // - Authorizing an existing config will not call update or create config endpoint
  test('Blackboard config is activated after last step', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingsBlackboardWrapper />);
    mockBlackboardUpdate.mockResolvedValue({ data: mockBlackboardResponseDataActive });

    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await user.click(screen.getByText('New learning platform integration'));
    const blackboardCard = screen.getByText(channelMapping[BLACKBOARD_TYPE].displayName);
    await user.click(blackboardCard);
    await user.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.getByText('Authorize connection to Blackboard')).toBeInTheDocument();
    });
    await user.clear(screen.getByLabelText('Display Name'));
    await user.clear(screen.getByLabelText('Blackboard Base URL'));
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    await user.type(screen.getByLabelText('Blackboard Base URL'), 'https://www.test4.com');

    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
    await user.click(authorizeButton);
    await waitFor(() => {
      expect(screen.queryByText('Your Blackboard integration has been successfully authorized and is ready to activate!')).toBeTruthy();
    });

    const activateButton = screen.getByRole('button', { name: 'Activate' });
    await user.click(activateButton);
    await waitFor(() => {
      expect(screen.queryByText('Learning platform integration successfully submitted.')).toBeTruthy();
    });
    expect(mockBlackboardUpdate).toHaveBeenCalledWith({ active: true, enterprise_customer: enterpriseId }, 1);
  });
  test('Canvas properly authorizes', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingsCanvasWrapper />);
    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await user.click(screen.getByText('New learning platform integration'));
    const canvasCard = screen.getByText(channelMapping[CANVAS_TYPE].displayName);
    await user.click(canvasCard);
    await user.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(screen.queryByText('Authorize connection to Canvas')).toBeTruthy();
    });

    await user.clear(screen.getByLabelText('Display Name'));
    await user.clear(screen.getByLabelText('Canvas Base URL'));
    await user.clear(screen.getByLabelText('API Client ID'));
    await user.clear(screen.getByLabelText('Canvas Account Number'));
    await user.clear(screen.getByLabelText('API Client Secret'));
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    await user.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');
    await user.type(screen.getByLabelText('API Client ID'), 'test1');
    await user.type(screen.getByLabelText('Canvas Account Number'), '3');
    await user.type(screen.getByLabelText('API Client Secret'), 'test2');

    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
    await user.click(authorizeButton);
    const inProgress = screen.getByText('Authorization in progress');
    await waitForElementToBeRemoved(inProgress);

    await waitFor(() => {
      expect(screen.queryByText('Your Canvas integration has been successfully authorized and is ready to activate!')).toBeTruthy();
    });

    const expectedConfig = {
      active: false,
      canvas_base_url: 'https://www.test4.com',
      canvas_account_id: '3',
      client_id: 'test1',
      client_secret: 'test2',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
      lms: CANVAS_TYPE,
    };
    expect(mockCanvasPost).toHaveBeenCalledWith(expectedConfig);
    expect(window.open).toHaveBeenCalled();
    expect(mockCanvasFetch).toHaveBeenCalledWith(1);
  });
  test('Canvas config is activated after last step', async () => {
    const user = userEvent.setup();
    renderWithRouter(<SettingsCanvasWrapper />);
    mockCanvasUpdate.mockResolvedValue({ data: mockCanvasResponseDataActive });

    const skeleton = screen.getAllByTestId('skeleton');
    await waitForElementToBeRemoved(skeleton);
    await user.click(screen.getByText('New learning platform integration'));
    const canvasCard = screen.getByText(channelMapping[CANVAS_TYPE].displayName);
    await user.click(canvasCard);
    await user.click(screen.getByText('Next'));
    await waitFor(() => {
      expect(screen.queryByText('Authorize connection to Canvas')).toBeTruthy();
    });

    await user.clear(screen.getByLabelText('Display Name'));
    await user.clear(screen.getByLabelText('API Client ID'));
    await user.clear(screen.getByLabelText('API Client Secret'));
    await user.clear(screen.getByLabelText('Canvas Account Number'));
    await user.clear(screen.getByLabelText('Canvas Base URL'));
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    await user.type(screen.getByLabelText('API Client ID'), 'test1');
    await user.type(screen.getByLabelText('API Client Secret'), 'test2');
    await user.type(screen.getByLabelText('Canvas Account Number'), '3');
    await user.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');

    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
    await user.click(authorizeButton);
    const inProgress = screen.getByText('Authorization in progress');
    await waitForElementToBeRemoved(inProgress);
    await waitFor(() => {
      expect(screen.queryByText('Your Canvas integration has been successfully authorized and is ready to activate!')).toBeTruthy();
    });
    const activateButton = screen.getByRole('button', { name: 'Activate' });
    await user.click(activateButton);
    expect(screen.queryByText('Learning platform integration successfully submitted.')).toBeTruthy();
    expect(mockCanvasUpdate).toHaveBeenCalledWith({ active: true, enterprise_customer: enterpriseId }, 1);
  });
});
