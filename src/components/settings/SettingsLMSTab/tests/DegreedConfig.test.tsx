import React from 'react';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import DegreedConfig from '../LMSConfigs/Degreed/DegreedConfig';
import { INVALID_LINK, INVALID_NAME } from '../../data/constants';
import LmsApiService from '../../../../data/services/LmsApiService';
import FormContextWrapper from '../../../forms/FormContextWrapper';
import { validationMessages } from '../LMSConfigs/Degreed/DegreedConfigEnablePage';

const mockUpdateConfigApi = jest.spyOn(LmsApiService, 'updateDegreedConfig');
const mockConfigResponseData = {
  uuid: 'foobar',
  id: 1,
  display_name: 'display name',
  degreed_base_url: 'https://foobar.com',
  active: false,
};
mockUpdateConfigApi.mockResolvedValue({ data: mockConfigResponseData });

const mockPostConfigApi = jest.spyOn(LmsApiService, 'postNewDegreedConfig');
mockPostConfigApi.mockResolvedValue({ data: mockConfigResponseData });

const mockFetchSingleConfig = jest.spyOn(LmsApiService, 'fetchSingleDegreedConfig');
mockFetchSingleConfig.mockResolvedValue({ data: { refresh_token: 'foobar' } });

const enterpriseId = 'test-enterprise-id';
const mockOnClick = jest.fn();
// Freshly creating a config will have an empty existing data object
const noExistingData = {};

const existingConfigData = {
  id: 1,
  displayName: 'foobar',
  clientId: '1',
  clientSecret: 'shhhitsasecret123',
  degreedBaseUrl: 'https://foobarish.com',
  degreedTokenFetchBaseUrl: 'https://foobarish.com/fetch',
};

// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: "your display name doesn't need to be this long stop it",
  clientId: '1',
  clientSecret: 'shhhitsasecret123',
  degreedBaseUrl: 'bad icky url',
  degreedTokenFetchBaseUrl: 'https://foobarish.com/fetch',
};

const noConfigs = [];

afterEach(() => {
  jest.clearAllMocks();
});

const mockSetExistingConfigFormData = jest.fn();
const mockPost = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

function testDegreedConfigSetup(formData) {
  return (
    <IntlProvider locale="en">
      <FormContextWrapper
        formWorkflowConfig={DegreedConfig({
          enterpriseCustomerUuid: enterpriseId,
          onSubmit: mockSetExistingConfigFormData,
          handleCloseClick: mockOnClick,
          existingData: formData,
          existingConfigNames: new Map(),
          channelMap: {
            DEGREED2: {
              post: mockPost,
              update: mockUpdate,
              delete: mockDelete,
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
async function clearForm(user) {
  await user.clear(screen.getByLabelText('Display Name'));
  await user.clear(screen.getByLabelText('API Client ID'));
  await user.clear(screen.getByLabelText('API Client Secret'));
  await user.clear(screen.getByLabelText('Degreed Base URL'));
  await user.clear(screen.getByLabelText('Degreed Token Fetch Base URL'));
}

describe('<DegreedConfig />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  test('renders Degreed Enable Form', () => {
    render(testDegreedConfigSetup(noConfigs));
    screen.getByLabelText('Display Name');
    screen.getByLabelText('API Client ID');
    screen.getByLabelText('API Client Secret');
    screen.getByLabelText('Degreed Base URL');
    screen.getByLabelText('Degreed Token Fetch Base URL');
  });
  test('test error messages', async () => {
    const user = userEvent.setup();
    render(testDegreedConfigSetup(noExistingData));

    const enableButton = screen.getByRole('button', { name: 'Enable' });
    await clearForm(user);
    await user.click(enableButton);
    expect(screen.queryByText(validationMessages.displayNameRequired));
    expect(screen.queryByText(validationMessages.clientIdRequired));
    expect(screen.queryByText(validationMessages.clientSecretRequired));
    expect(screen.queryByText(validationMessages.degreedUrlRequired));

    await user.clear(screen.getByLabelText('Display Name'));
    await user.clear(screen.getByLabelText('API Client ID'));
    await user.clear(screen.getByLabelText('API Client Secret'));
    await user.clear(screen.getByLabelText('Degreed Base URL'));
    await user.clear(screen.getByLabelText('Degreed Token Fetch Base URL'));
    await user.type(screen.getByLabelText('Display Name'), 'terriblenogoodverybaddisplayname');
    await user.type(screen.getByLabelText('API Client ID'), '1');
    await user.type(screen.getByLabelText('API Client Secret'), 'shhhitsasecret123');
    await user.type(screen.getByLabelText('Degreed Base URL'), 'badlink');

    await user.click(enableButton);
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    await user.clear(screen.getByLabelText('Display Name'));
    await user.clear(screen.getByLabelText('Degreed Base URL'));
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    await user.type(screen.getByLabelText('Degreed Base URL'), 'https://www.test4.com');
    await user.click(enableButton);
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });
  test('it creates new configs on submit', async () => {
    const user = userEvent.setup();
    render(testDegreedConfigSetup(noExistingData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });
    await clearForm(user);

    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    await user.type(screen.getByLabelText('API Client ID'), '1');
    await user.type(screen.getByLabelText('API Client Secret'), 'shhhitsasecret123');
    await user.type(screen.getByLabelText('Degreed Base URL'), 'https://www.test.com');
    await user.type(screen.getByLabelText('Degreed Token Fetch Base URL'), 'https://www.test.com');
    await user.click(enableButton);

    const expectedConfig = {
      active: false,
      display_name: 'displayName',
      client_id: '1',
      client_secret: 'shhhitsasecret123',
      degreed_base_url: 'https://www.test.com',
      degreed_token_fetch_base_url: 'https://www.test.com',
      enterprise_customer: enterpriseId,
    };
    await waitFor(() => expect(mockPost).toHaveBeenCalledWith(expectedConfig));
  });
  test('saves draft correctly', async () => {
    const user = userEvent.setup();
    render(testDegreedConfigSetup(noExistingData));
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    await clearForm(user);
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    await user.type(screen.getByLabelText('API Client ID'), '1');
    await user.type(screen.getByLabelText('API Client Secret'), 'shhhitsasecret123');
    await user.type(screen.getByLabelText('Degreed Base URL'), 'https://www.test.com');
    await user.type(screen.getByLabelText('Degreed Token Fetch Base URL'), 'https://www.test.com');

    expect(cancelButton).not.toBeDisabled();
    userEvent.click(cancelButton);

    await waitFor(() => expect(screen.getByText('Exit configuration')).toBeInTheDocument());
    const closeButton = screen.getByRole('button', { name: 'Exit' });

    userEvent.click(closeButton);
    const expectedConfig = {
      active: false,
      display_name: 'displayName',
      client_id: '1',
      client_secret: 'shhhitsasecret123',
      degreed_base_url: 'https://www.test.com',
      degreed_token_fetch_base_url: 'https://www.test.com',
      enterprise_customer: enterpriseId,
    };
    expect(mockPost).toHaveBeenCalledWith(expectedConfig);
  });
  test('validates poorly formatted existing data on load', async () => {
    const user = userEvent.setup();
    render(testDegreedConfigSetup(invalidExistingData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });
    await user.click(enableButton);
    expect(screen.queryByText(INVALID_LINK)).toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).toBeInTheDocument();
  });
  test('validates properly formatted existing data on load', async () => {
    const user = userEvent.setup();
    render(testDegreedConfigSetup(existingConfigData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });
    // ensuring the existing data is prefilled
    expect((screen.getByLabelText('Display Name') as HTMLInputElement).value).toEqual(
      existingConfigData.displayName,
    );
    expect((screen.getByLabelText('API Client ID') as HTMLInputElement).value).toEqual(
      existingConfigData.clientId,
    );
    expect((screen.getByLabelText('API Client Secret') as HTMLInputElement).value).toEqual(
      existingConfigData.clientSecret,
    );
    expect((screen.getByLabelText('Degreed Base URL') as HTMLInputElement).value).toEqual(
      existingConfigData.degreedBaseUrl,
    );
    expect((screen.getByLabelText('Degreed Token Fetch Base URL') as HTMLInputElement).value).toEqual(
      existingConfigData.degreedTokenFetchBaseUrl,
    );

    await user.click(enableButton);
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });
});
