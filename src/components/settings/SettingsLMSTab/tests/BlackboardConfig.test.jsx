import React from 'react';
import {
  act, render, fireEvent, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import BlackboardConfig from '../LMSConfigs/BlackboardConfig';
import { INVALID_LINK, INVALID_NAME, SUCCESS_LABEL } from '../../data/constants';
import LmsApiService from '../../../../data/services/LmsApiService';

jest.mock('../../data/constants', () => ({
  ...jest.requireActual('../../data/constants'),
  LMS_CONFIG_OAUTH_POLLING_INTERVAL: 0,
}));
window.open = jest.fn();
const mockUpdateConfigApi = jest.spyOn(LmsApiService, 'updateBlackboardConfig');
mockUpdateConfigApi.mockResolvedValue({ data: { uuid: 'foobar', id: 1 } });

const mockPostConfigApi = jest.spyOn(LmsApiService, 'postNewBlackboardConfig');
mockPostConfigApi.mockResolvedValue({ data: { uuid: 'foobar', id: 1 } });

const mockFetchGlobalConfig = jest.spyOn(LmsApiService, 'fetchBlackboardGlobalConfig');
mockFetchGlobalConfig.mockResolvedValue({ data: { results: [{ app_key: 'ayylmao' }] } });

const mockFetchSingleConfig = jest.spyOn(LmsApiService, 'fetchSingleBlackboardConfig');
mockFetchSingleConfig.mockResolvedValue({ data: { refresh_token: 'foobar' } });

const enterpriseId = 'test-enterprise-id';
const mockOnClick = jest.fn();
const noConfigs = [];
const existingConfigDisplayNames = ['name'];
const existingConfigDisplayNames2 = ['foobar'];

// Freshly creating a config will have an empty existing data object
const noExistingData = {};
// Existing config data that has been authorized
const existingConfigData = {
  refreshToken: 'ayylmao',
  id: 1,
  displayName: 'foobar',
};
// Existing config data that has not been authorized
const existingConfigDataNoAuth = {
  id: 1,
  displayName: 'foobar',
  blackboardBaseUrl: 'https://foobarish.com',
};
// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: 'fooooooooobaaaaaaaaar',
  blackboardBaseUrl: 'bad_url :^(',
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('<BlackboardConfig />', () => {
  test('renders Blackboard Config Form', () => {
    render(
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    screen.getByLabelText('Display Name');
    screen.getByLabelText('Blackboard Base URL');
  });
  test('test validation and button disable', async () => {
    render(
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={existingConfigDisplayNames}
      />,
    );
    expect(screen.getByText('Authorize')).toBeDisabled();

    userEvent.type(screen.getByLabelText('Display Name'), 'reallyreallyreallyreallyreallylongname');
    userEvent.type(screen.getByLabelText('Blackboard Base URL'), 'test3');

    expect(screen.getByText('Authorize')).toBeDisabled();

    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));

    // test duplicate display name
    userEvent.type(screen.getByLabelText('Display Name'), 'name');
    expect(screen.queryByText(INVALID_NAME));
  });
  test('test validation and button enable', async () => {
    render(
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    expect(screen.getByText('Authorize')).toBeDisabled();
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Blackboard Base URL'), 'https://www.test.com');

    expect(screen.getByText('Authorize')).not.toBeDisabled();
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });
  test('it edits existing configs on submit', async () => {
    render(
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigData}
        existingConfigs={existingConfigDisplayNames2}
      />,
    );
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Blackboard Base URL'), {
      target: { value: '' },
    });
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Blackboard Base URL'), 'https://www.test.com');

    expect(screen.getByText('Authorize')).not.toBeDisabled();

    await waitFor(() => userEvent.click(screen.getByText('Authorize')));
    const expectedConfig = {
      active: false,
      blackboard_base_url: 'https://www.test.com',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(mockUpdateConfigApi).toHaveBeenCalledWith(expectedConfig, 1);
  });
  test('it creates new configs on submit', async () => {
    render(
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Blackboard Base URL'), {
      target: { value: '' },
    });
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Blackboard Base URL'), 'https://www.test.com');

    expect(screen.getByText('Authorize')).not.toBeDisabled();
    userEvent.click(screen.getByText('Authorize'));

    // Await a find by text in order to account for state changes in the button callback
    await waitFor(() => expect(screen.queryByText('Authorize')).not.toBeInTheDocument());

    const expectedConfig = {
      active: false,
      blackboard_base_url: 'https://www.test.com',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(mockPostConfigApi).toHaveBeenCalledWith(expectedConfig);
  });
  test('saves draft correctly', async () => {
    render(
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Blackboard Base URL'), 'https://www.test.com');

    expect(screen.getByText('Authorize')).not.toBeDisabled();
    userEvent.click(screen.getByText('Authorize'));
    // Await a find by text in order to account for state changes in the button callback
    await waitFor(() => expect(screen.queryByText('Authorize')).not.toBeInTheDocument());

    userEvent.click(screen.getByText('Cancel'));
    userEvent.click(screen.getByText('Save'));

    const expectedConfig = {
      active: false,
      blackboard_base_url: 'https://www.test.com',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(mockPostConfigApi).toHaveBeenCalledWith(expectedConfig);
  });
  test('Authorizing a config will initiate backend polling', async () => {
    render(
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Blackboard Base URL'), 'https://www.test.com');

    expect(screen.getByText('Authorize')).not.toBeDisabled();
    await waitFor(() => userEvent.click(screen.getByText('Authorize')));

    // Await a find by text in order to account for state changes in the button callback
    await waitFor(() => expect(screen.queryByText('Authorize')).not.toBeInTheDocument());
    expect(mockOnClick).toHaveBeenCalledWith(SUCCESS_LABEL);
    expect(window.open).toHaveBeenCalled();
    expect(mockFetchSingleConfig).toHaveBeenCalledWith(1);
  });
  test('Authorizing an existing, edited config will call update config endpoint', async () => {
    render(
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigDataNoAuth}
        existingConfigs={existingConfigDisplayNames2}
      />,
    );
    act(() => {
      fireEvent.change(screen.getByLabelText('Display Name'), {
        target: { value: '' },
      });
      fireEvent.change(screen.getByLabelText('Blackboard Base URL'), {
        target: { value: '' },
      });
    });
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Blackboard Base URL'), 'https://www.test.com');

    expect(screen.getByText('Authorize')).not.toBeDisabled();
    await waitFor(() => userEvent.click(screen.getByText('Authorize')));

    await waitFor(() => expect(screen.queryByText('Authorize')).not.toBeInTheDocument());
    expect(mockOnClick).toHaveBeenCalledWith(SUCCESS_LABEL);
    expect(window.open).toHaveBeenCalled();
    expect(mockUpdateConfigApi).toHaveBeenCalled();
    expect(mockFetchSingleConfig).toHaveBeenCalledWith(1);
  });
  test('Authorizing an existing config will not call update or create config endpoint', async () => {
    render(
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigDataNoAuth}
        existingConfigs={existingConfigDisplayNames2}
      />,
    );
    expect(screen.getByText('Authorize')).not.toBeDisabled();

    await waitFor(() => userEvent.click(screen.getByText('Authorize')));

    // Await a find by text in order to account for state changes in the button callback
    await waitFor(() => expect(screen.queryByText('Authorize')).not.toBeInTheDocument());
    expect(mockOnClick).toHaveBeenCalledWith(SUCCESS_LABEL);
    expect(mockUpdateConfigApi).not.toHaveBeenCalled();
    expect(window.open).toHaveBeenCalled();
    expect(mockFetchSingleConfig).toHaveBeenCalledWith(1);
  });
  test('validates poorly formatted existing data on load', () => {
    render(
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={invalidExistingData}
        existingConfigs={noConfigs}
      />,
    );
    expect(screen.getByText(INVALID_LINK)).toBeInTheDocument();
    expect(screen.getByText(INVALID_NAME)).toBeInTheDocument();
  });
  test('validates properly formatted existing data on load', () => {
    render(
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigDataNoAuth}
        existingConfigs={noConfigs}
      />,
    );
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });
});
