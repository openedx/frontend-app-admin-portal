import React from 'react';
import {
  act, render, fireEvent, screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import CanvasConfig from '../LMSConfigs/CanvasConfig';
import { INVALID_LINK, INVALID_NAME } from '../../data/constants';
import LmsApiService from '../../../../data/services/LmsApiService';

jest.mock('../../data/constants', () => ({
  ...jest.requireActual('../../data/constants'),
  LMS_CONFIG_OAUTH_POLLING_INTERVAL: 0,
}));
window.open = jest.fn();
const mockUpdateConfigApi = jest.spyOn(LmsApiService, 'updateCanvasConfig');
mockUpdateConfigApi.mockResolvedValue({ data: { uuid: 'foobar', id: 1 } });

const mockPostConfigApi = jest.spyOn(LmsApiService, 'postNewCanvasConfig');
mockPostConfigApi.mockResolvedValue({ data: { uuid: 'foobar', id: 1 } });

const mockFetchSingleConfig = jest.spyOn(LmsApiService, 'fetchSingleCanvasConfig');
mockFetchSingleConfig.mockResolvedValue({ data: { refresh_token: 'foobar' } });

const enterpriseId = 'test-enterprise-id';

const mockOnClick = jest.fn();
// Freshly creating a config will have an empty existing data object
const noExistingData = {};
// Existing config data that has been authorized
const existingConfigData = {
  refreshToken: 'foobar',
  id: 1,
  displayName: 'foobarss',
};
// Existing config data that has not been authorized
const existingConfigDataNoAuth = {
  id: 1,
  displayName: 'foobar',
  canvasBaseUrl: 'https://foobarish.com',
  clientId: 'ayylmao',
  clientSecret: 'testingsecret',
  canvasAccountId: 10,
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('<CanvasConfig />', () => {
  test('renders Canvas Config Form', () => {
    render(
      <CanvasConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
      />,
    );
    screen.getByLabelText('Display Name');
    screen.getByLabelText('API Client ID');
    screen.getByLabelText('API Client Secret');
    screen.getByLabelText('Canvas Account Number');
    screen.getByLabelText('Canvas Base URL');
  });
  test('test button disable', async () => {
    render(
      <CanvasConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
      />,
    );
    expect(screen.getByText('Authorize')).toBeDisabled();

    userEvent.type(screen.getByLabelText('Display Name'), 'reallyreallyreallyreallyreallylongname');
    userEvent.type(screen.getByLabelText('Canvas Base URL'), 'test4');
    userEvent.type(screen.getByLabelText('API Client ID'), 'test3');
    userEvent.type(screen.getByLabelText('Canvas Account Number'), '23');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'test6');

    expect(screen.getByText('Authorize')).toBeDisabled();
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Display Name'), {
        target: { value: '' },
      });
      fireEvent.change(screen.getByLabelText('Canvas Base URL'), {
        target: { value: '' },
      });
    });
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');

    expect(screen.getByText('Authorize')).not.toBeDisabled();
  });
  test('it edits existing configs on submit', async () => {
    render(
      <CanvasConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigData}
      />,
    );
    await act(async () => {
      fireEvent.change(screen.getByLabelText('API Client ID'), {
        target: { value: '' },
      });
      fireEvent.change(screen.getByLabelText('API Client Secret'), {
        target: { value: '' },
      });
      fireEvent.change(screen.getByLabelText('Canvas Account Number'), {
        target: { value: '' },
      });
      fireEvent.change(screen.getByLabelText('Display Name'), {
        target: { value: '' },
      });
      fireEvent.change(screen.getByLabelText('Canvas Base URL'), {
        target: { value: '' },
      });
    });

    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');
    userEvent.type(screen.getByLabelText('API Client ID'), 'test1');
    userEvent.type(screen.getByLabelText('Canvas Account Number'), '3');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'test2');

    expect(screen.getByText('Submit')).not.toBeDisabled();

    userEvent.click(screen.getByText('Submit'));

    // Await a find by text in order to account for state changes in the button callback
    expect(await screen.findByText('Submit')).toBeInTheDocument();

    const expectedConfig = {
      active: false,
      canvas_base_url: 'https://www.test4.com',
      canvas_account_id: '3',
      client_id: 'test1',
      client_secret: 'test2',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.updateCanvasConfig).toHaveBeenCalledWith(expectedConfig, 1);
  });
  test('it creates new configs on submit', async () => {
    render(
      <CanvasConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
      />,
    );
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');
    userEvent.type(screen.getByLabelText('API Client ID'), 'test1');
    userEvent.type(screen.getByLabelText('Canvas Account Number'), '3');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'test2');

    expect(screen.getByText('Authorize')).not.toBeDisabled();

    userEvent.click(screen.getByText('Authorize'));
    // Await a find by text in order to account for state changes in the button callback
    expect(await screen.findByText('Authorize')).toBeInTheDocument();

    const expectedConfig = {
      active: false,
      canvas_base_url: 'https://www.test4.com',
      canvas_account_id: '3',
      client_id: 'test1',
      client_secret: 'test2',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.postNewCanvasConfig).toHaveBeenCalledWith(expectedConfig);
  });
  test('saves draft correctly', async () => {
    render(
      <CanvasConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
      />,
    );
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');
    userEvent.type(screen.getByLabelText('API Client ID'), 'test1');
    userEvent.type(screen.getByLabelText('Canvas Account Number'), '3');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'test2');

    expect(screen.getByText('Authorize')).not.toBeDisabled();
    userEvent.click(screen.getByText('Authorize'));
    userEvent.click(screen.getByText('Cancel'));
    userEvent.click(screen.getByText('Save'));

    // Await a find by text in order to account for state changes in the button callback
    expect(await screen.findByText('Authorize')).toBeInTheDocument();

    const expectedConfig = {
      active: false,
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
      canvas_account_id: '3',
      canvas_base_url: 'https://www.test4.com',
      client_id: 'test1',
      client_secret: 'test2',
    };
    expect(LmsApiService.postNewCanvasConfig).toHaveBeenCalledWith(expectedConfig);
  });
  test('Authorizing a config will initial backend polling', async () => {
    render(
      <CanvasConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
      />,
    );
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');
    userEvent.type(screen.getByLabelText('API Client ID'), 'test1');
    userEvent.type(screen.getByLabelText('Canvas Account Number'), '3');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'test2');

    expect(screen.getByText('Authorize')).not.toBeDisabled();
    userEvent.click(screen.getByText('Authorize'));

    // Await a find by text in order to account for state changes in the button callback
    expect(await screen.findByText('Authorize')).toBeInTheDocument();
    expect(await screen.findByText('Display Name')).toBeInTheDocument();

    expect(window.open).toHaveBeenCalled();
    expect(mockFetchSingleConfig).toHaveBeenCalledWith(1);
  });
  test('Authorizing an existing, edited config will call update config endpoint', async () => {
    render(
      <CanvasConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigDataNoAuth}
      />,
    );
    act(() => {
      fireEvent.change(screen.getByLabelText('Display Name'), {
        target: { value: '' },
      });
      fireEvent.change(screen.getByLabelText('Canvas Base URL'), {
        target: { value: '' },
      });
    });
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');

    expect(screen.getByText('Authorize')).not.toBeDisabled();
    userEvent.click(screen.getByText('Authorize'));

    // Await a find by text in order to account for state changes in the button callback
    expect(await screen.findByText('Authorize')).toBeInTheDocument();
    expect(await screen.findByText('Display Name')).toBeInTheDocument();

    expect(mockUpdateConfigApi).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalled();
    expect(mockFetchSingleConfig).toHaveBeenCalledWith(1);
  });
  test('Authorizing an existing config will not call update or create config endpoint', async () => {
    render(
      <CanvasConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigDataNoAuth}
      />,
    );
    expect(screen.getByText('Authorize')).not.toBeDisabled();

    userEvent.click(screen.getByText('Authorize'));

    // Await a find by text in order to account for state changes in the button callback
    expect(await screen.findByText('Display Name')).toBeInTheDocument();

    expect(mockUpdateConfigApi).not.toHaveBeenCalled();
    expect(window.open).toHaveBeenCalled();
    expect(mockFetchSingleConfig).toHaveBeenCalledWith(1);
  });
});
