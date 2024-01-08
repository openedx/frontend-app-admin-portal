import React from 'react';
import {
  act, render, fireEvent, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import BlackboardConfig from '../LMSConfigs/Blackboard/BlackboardConfig';
import { INVALID_LINK, INVALID_NAME } from '../../data/constants';
import FormContextWrapper from '../../../forms/FormContextWrapper';
import { validationMessages } from '../LMSConfigs/Blackboard/BlackboardConfigAuthorizePage';

jest.mock('../../data/constants', () => ({
  ...jest.requireActual('../../data/constants'),
  LMS_CONFIG_OAUTH_POLLING_INTERVAL: 0,
}));
window.open = jest.fn();
const enterpriseId = 'test-enterprise-id';
const mockOnClick = jest.fn();
// Freshly creating a config will have an empty existing data object
const noExistingData = {};
// Existing config data that has been authorized
const existingConfigData = {
  active: true,
  refreshToken: 'foobar',
  id: 1,
  displayName: 'foobarss',
};
// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: 'fooooooooobaaaaaaaaar',
  blackboardBaseUrl: 'bad_url :^(',
};
// Existing config data that has not been authorized
const existingConfigDataNoAuth = {
  id: 1,
  displayName: 'foobar',
  blackboardBaseUrl: 'https://foobarish.com',
};

const noConfigs = [];

const mockConfigResponseData = {
  uuid: 'foobar',
  id: 1,
  display_name: 'display name',
  blackboard_base_url: 'https://foobar.com',
  active: false,
};

const mockSetExistingConfigFormData = jest.fn();
const mockPost = jest.fn();
const mockUpdate = jest.fn();
const mockFetch = jest.fn();
const mockFetchGlobal = jest.fn();
mockPost.mockResolvedValue({ data: mockConfigResponseData });
mockUpdate.mockResolvedValue({ data: mockConfigResponseData });
mockFetch.mockResolvedValue({ data: { refresh_token: 'foobar' } });
mockFetchGlobal.mockReturnValue({ data: { results: [{ app_key: 1 }] } });

function testBlackboardConfigSetup(formData) {
  return (
    <FormContextWrapper
      formWorkflowConfig={BlackboardConfig({
        enterpriseCustomerUuid: enterpriseId,
        onSubmit: mockSetExistingConfigFormData,
        handleCloseClick: mockOnClick,
        existingData: formData,
        existingConfigNames: new Map(),
        channelMap: {
          BLACKBOARD: {
            post: mockPost,
            update: mockUpdate,
            fetch: mockFetch,
            fetchGlobal: mockFetchGlobal,
          },
        },
      })}
      workflowTitle="New learning platform integration"
      onClickOut={mockOnClick}
      formData={formData}
      isStepperOpen
      dispatch={jest.fn()}
    />
  );
}

async function clearForm() {
  await act(async () => {
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Blackboard Base URL'), {
      target: { value: '' },
    });
  });
}

describe('<BlackboardConfig />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test('renders Blackboard Authorize Form', () => {
    render(testBlackboardConfigSetup(noConfigs));
    screen.getByLabelText('Display Name');
    screen.getByLabelText('Blackboard Base URL');
  });
  test('test error messages', async () => {
    render(testBlackboardConfigSetup(noExistingData));

    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
    await clearForm();
    userEvent.click(authorizeButton);
    expect(screen.queryByText(validationMessages.displayNameRequired));
    expect(screen.queryByText(validationMessages.baseUrlRequired));

    userEvent.paste(screen.getByLabelText('Display Name'), 'name');
    userEvent.paste(screen.getByLabelText('Blackboard Base URL'), 'test4');

    userEvent.click(authorizeButton);
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    await clearForm();
    userEvent.paste(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.paste(
      screen.getByLabelText('Blackboard Base URL'),
      'https://www.test4.com',
    );
    userEvent.click(authorizeButton);
    expect(!screen.queryByText(INVALID_LINK));
    expect(!screen.queryByText(INVALID_NAME));
  });
  test('it edits existing configs on submit', async () => {
    render(testBlackboardConfigSetup(existingConfigData));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });

    await clearForm();
    userEvent.paste(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.paste(screen.getByLabelText('Blackboard Base URL'), 'https://www.test4.com');

    expect(authorizeButton).not.toBeDisabled();

    userEvent.click(authorizeButton);

    // await authorization loading modal
    await waitFor(() => expect(screen.queryByText('Please confirm authorization through Blackboard and return to this window once complete.')));

    const expectedConfig = {
      active: true,
      id: 1,
      refresh_token: 'foobar',
      blackboard_base_url: 'https://www.test4.com',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(mockUpdate).toHaveBeenCalledWith(expectedConfig, 1);
  });
  test('it creates new configs on submit', async () => {
    render(testBlackboardConfigSetup(noExistingData));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });

    await clearForm();

    userEvent.paste(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.paste(screen.getByLabelText('Blackboard Base URL'), 'https://www.test4.com');

    userEvent.click(authorizeButton);
    // await authorization loading modal
    await waitFor(() => expect(screen.queryByText('Please confirm authorization through Blackboard and return to this window once complete.')));

    const expectedConfig = {
      active: false,
      blackboard_base_url: 'https://www.test4.com',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(mockPost).toHaveBeenCalledWith(expectedConfig);
  });
  test('saves draft correctly', async () => {
    render(testBlackboardConfigSetup(noExistingData));
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    await clearForm();
    userEvent.paste(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.paste(screen.getByLabelText('Blackboard Base URL'), 'https://www.test4.com');

    expect(cancelButton).not.toBeDisabled();
    userEvent.click(cancelButton);

    await waitFor(() => expect(screen.getByText('Exit configuration')).toBeInTheDocument());
    const closeButton = screen.getByRole('button', { name: 'Exit' });

    userEvent.click(closeButton);

    const expectedConfig = {
      active: false,
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
      blackboard_base_url: 'https://www.test4.com',
    };
    expect(mockPost).toHaveBeenCalledWith(expectedConfig);
  });
  test('Authorizing a config will initiate backend polling', async () => {
    render(testBlackboardConfigSetup(noExistingData));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
    await clearForm();
    userEvent.paste(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.paste(screen.getByLabelText('Blackboard Base URL'), 'https://www.test4.com');
    userEvent.click(authorizeButton);

    // await authorization loading modal
    await waitFor(() => expect(screen.queryByText('Please confirm authorization through Blackboard and return to this window once complete.')));
    expect(window.open).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(1);
  });
  test('validates poorly formatted existing data on load', async () => {
    render(testBlackboardConfigSetup(invalidExistingData));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
    userEvent.click(authorizeButton);

    await waitFor(() => expect(screen.getByText(INVALID_NAME)).toBeInTheDocument());
    expect(screen.getByText(INVALID_LINK)).toBeInTheDocument();
  });
  test('validates properly formatted existing data on load', () => {
    render(testBlackboardConfigSetup(existingConfigDataNoAuth));
    // ensuring the existing data is prefilled
    expect((screen.getByLabelText('Display Name') as HTMLInputElement).value).toEqual(
      existingConfigDataNoAuth.displayName,
    );
    expect((screen.getByLabelText('Blackboard Base URL') as HTMLInputElement).value).toEqual(
      existingConfigDataNoAuth.blackboardBaseUrl,
    );

    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
    userEvent.click(authorizeButton);
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });
});
