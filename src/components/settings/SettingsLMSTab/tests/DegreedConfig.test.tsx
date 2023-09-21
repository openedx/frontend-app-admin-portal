import React from 'react';
import {
  act, render, fireEvent, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

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
  );
}
async function clearForm() {
  await act(async () => {
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('API Client ID'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('API Client Secret'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Base URL'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Token Fetch Base URL'), {
      target: { value: '' },
    });
  });
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
    render(testDegreedConfigSetup(noExistingData));

    const enableButton = screen.getByRole('button', { name: 'Enable' });
    await clearForm();
    userEvent.click(enableButton);
    expect(screen.queryByText(validationMessages.displayNameRequired));
    expect(screen.queryByText(validationMessages.clientIdRequired));
    expect(screen.queryByText(validationMessages.clientSecretRequired));
    expect(screen.queryByText(validationMessages.degreedUrlRequired));

    userEvent.paste(screen.getByLabelText('Display Name'), 'terriblenogoodverybaddisplayname');
    userEvent.paste(screen.getByLabelText('API Client ID'), '1');
    userEvent.paste(screen.getByLabelText('API Client Secret'), 'shhhitsasecret123');
    userEvent.paste(screen.getByLabelText('Degreed Base URL'), 'badlink');

    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Base URL'), {
      target: { value: '' },
    });
    userEvent.click(enableButton);
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    userEvent.paste(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.paste(
      screen.getByLabelText('Degreed Base URL'),
      'https://www.test4.com',
    );
    userEvent.click(enableButton);
    expect(!screen.queryByText(INVALID_LINK));
    expect(!screen.queryByText(INVALID_NAME));
  });
  test('it creates new configs on submit', async () => {
    render(testDegreedConfigSetup(noExistingData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });
    await clearForm();

    userEvent.paste(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.paste(screen.getByLabelText('API Client ID'), '1');
    userEvent.paste(screen.getByLabelText('API Client Secret'), 'shhhitsasecret123');
    userEvent.paste(screen.getByLabelText('Degreed Base URL'), 'https://www.test.com');
    userEvent.paste(screen.getByLabelText('Degreed Token Fetch Base URL'), 'https://www.test.com');
    userEvent.click(enableButton);

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
    render(testDegreedConfigSetup(noExistingData));
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    await clearForm();
    userEvent.paste(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.paste(screen.getByLabelText('API Client ID'), '1');
    userEvent.paste(screen.getByLabelText('API Client Secret'), 'shhhitsasecret123');
    userEvent.paste(screen.getByLabelText('Degreed Base URL'), 'https://www.test.com');
    userEvent.paste(screen.getByLabelText('Degreed Token Fetch Base URL'), 'https://www.test.com');

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
    render(testDegreedConfigSetup(invalidExistingData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });
    userEvent.click(enableButton);
    expect(screen.queryByText(INVALID_LINK)).toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).toBeInTheDocument();
  });
  test('validates properly formatted existing data on load', () => {
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

    userEvent.click(enableButton);
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });
});
