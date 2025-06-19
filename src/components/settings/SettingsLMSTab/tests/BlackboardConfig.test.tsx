import React from 'react';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

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
    <IntlProvider locale="en">
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
    </IntlProvider>
  );
}

async function clearForm() {
  const user = userEvent.setup();

  await user.clear(screen.getByLabelText('Display Name'));
  await user.clear(screen.getByLabelText('Blackboard Base URL'));
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
    const user = userEvent.setup();
    render(testBlackboardConfigSetup(noExistingData));

    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
    await clearForm();
    await user.click(authorizeButton);
    expect(screen.queryByText(validationMessages.displayNameRequired));
    expect(screen.queryByText(validationMessages.baseUrlRequired));

    await user.type(screen.getByLabelText('Display Name'), 'name');
    await user.type(screen.getByLabelText('Blackboard Base URL'), 'test4');

    await user.click(authorizeButton);
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    await clearForm();
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    await user.type(screen.getByLabelText('Blackboard Base URL'), 'https://www.test4.com');
    await user.click(authorizeButton);
    expect(!screen.queryByText(INVALID_LINK));
    expect(!screen.queryByText(INVALID_NAME));
  });
  test('it edits existing configs on submit', async () => {
    const user = userEvent.setup();
    render(testBlackboardConfigSetup(existingConfigData));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });

    await clearForm();
    await waitFor(() => user.type(screen.getByLabelText('Display Name'), 'displayName'));
    await waitFor(() => user.type(screen.getByLabelText('Blackboard Base URL'), 'https://www.test4.com'));

    expect(authorizeButton).not.toBeDisabled();

    await waitFor(() => user.click(authorizeButton));

    // await authorization loading modal
    await waitFor(() => expect(screen.queryAllByText('Please confirm authorization through Blackboard and return to this window once complete.').length > 0));

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
    const user = userEvent.setup();

    render(testBlackboardConfigSetup(noExistingData));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });

    await clearForm();

    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    await user.type(screen.getByLabelText('Blackboard Base URL'), 'https://www.test4.com');

    await user.click(authorizeButton);
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
    const user = userEvent.setup();
    render(testBlackboardConfigSetup(noExistingData));
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    await clearForm();
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    await user.type(screen.getByLabelText('Blackboard Base URL'), 'https://www.test4.com');

    expect(cancelButton).not.toBeDisabled();
    await user.click(cancelButton);

    await waitFor(() => expect(screen.getByText('Exit configuration')).toBeInTheDocument());
    const closeButton = screen.getByRole('button', { name: 'Exit' });

    await user.click(closeButton);

    const expectedConfig = {
      active: false,
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
      blackboard_base_url: 'https://www.test4.com',
    };
    expect(mockPost).toHaveBeenCalledWith(expectedConfig);
  });
  test('Authorizing a config will initiate backend polling', async () => {
    const user = userEvent.setup();
    render(testBlackboardConfigSetup(noExistingData));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
    await clearForm();
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    await user.type(screen.getByLabelText('Blackboard Base URL'), 'https://www.test4.com');
    await user.click(authorizeButton);

    // await authorization loading modal
    await waitFor(() => expect(screen.queryByText('Please confirm authorization through Blackboard and return to this window once complete.')));
    expect(window.open).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(1);
  });
  test('validates poorly formatted existing data on load', async () => {
    const user = userEvent.setup();
    render(testBlackboardConfigSetup(invalidExistingData));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
    await user.click(authorizeButton);

    await waitFor(() => expect(screen.getByText(INVALID_NAME)).toBeInTheDocument());
    expect(screen.getByText(INVALID_LINK)).toBeInTheDocument();
  });
  test('validates properly formatted existing data on load', async () => {
    const user = userEvent.setup();
    render(testBlackboardConfigSetup(existingConfigDataNoAuth));
    // ensuring the existing data is prefilled
    expect((screen.getByLabelText('Display Name') as HTMLInputElement).value).toEqual(
      existingConfigDataNoAuth.displayName,
    );
    expect((screen.getByLabelText('Blackboard Base URL') as HTMLInputElement).value).toEqual(
      existingConfigDataNoAuth.blackboardBaseUrl,
    );

    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
    await user.click(authorizeButton);
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });
});
