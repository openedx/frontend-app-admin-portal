import React from 'react';
import {
  act, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SAPConfig from '../LMSConfigs/SAP/SAPConfig';
import { INVALID_LINK, INVALID_NAME } from '../../data/constants';
import LmsApiService from '../../../../data/services/LmsApiService';
import FormContextWrapper from '../../../forms/FormContextWrapper';
import { validationMessages } from '../LMSConfigs/SAP/SAPConfigEnablePage';

const mockUpdateConfigApi = jest.spyOn(LmsApiService, 'updateSuccessFactorsConfig');
const mockConfigResponseData = {
  uuid: 'foobar',
  id: 1,
  display_name: 'display name',
  sapf_base_url: 'https://foobar.com',
  active: false,
};
mockUpdateConfigApi.mockResolvedValue({ data: mockConfigResponseData });

const mockPostConfigApi = jest.spyOn(LmsApiService, 'postNewSuccessFactorsConfig');
mockPostConfigApi.mockResolvedValue({ data: mockConfigResponseData });

const mockFetchSingleConfig = jest.spyOn(LmsApiService, 'fetchSingleSuccessFactorsConfig');
mockFetchSingleConfig.mockResolvedValue({ data: { refresh_token: 'foobar' } });

const enterpriseId = 'test-enterprise-id';
const mockOnClick = jest.fn();
// Freshly creating a config will have an empty existing data object
const noExistingData = {};

const existingConfigData = {
  id: 1,
  displayName: 'whatsinaname',
  sapsfBaseUrl: 'http://www.example.com',
  sapsfCompanyId: '12',
  sapsfUserId: 'userId',
  key: 'clientId',
  secret: 'secretshh',
  userType: 'admin',
};

// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: 'just a whole muddle of saps',
  sapsfBaseUrl: 'you dumb dumb this isnt a url',
  sapsfCompanyId: '12',
  sapsfUserId: 'userId',
  key: 'clientId',
  secret: 'secretshh',
  userType: 'admin',
};

const noConfigs = [];

afterEach(() => {
  jest.clearAllMocks();
});

const mockSetExistingConfigFormData = jest.fn();
const mockPost = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

function testSAPConfigSetup(formData) {
  return (
    <IntlProvider locale="en">
      <FormContextWrapper
        formWorkflowConfig={SAPConfig({
          enterpriseCustomerUuid: enterpriseId,
          onSubmit: mockSetExistingConfigFormData,
          handleCloseClick: mockOnClick,
          existingData: formData,
          existingConfigNames: new Map(),
          channelMap: {
            SAP: {
              post: mockPost,
              update: mockUpdate,
              delete: mockDelete,
            },
          },
        })}
        onClickOut={mockOnClick}
        formData={formData}
        isStepperOpen
        dispatch={jest.fn()}
      />
    </IntlProvider>
  );
}

async function clearForm() {
  await act(async () => {
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('SAP Base URL'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('SAP Company ID'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('SAP User ID'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('OAuth Client ID'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('OAuth Client Secret'), {
      target: { value: '' },
    });
  });
}

describe('<SAPConfig />', () => {
  test('renders SAP Enable Form', () => {
    render(testSAPConfigSetup(noConfigs));
    screen.getByLabelText('Display Name');
    screen.getByLabelText('SAP Base URL');
    screen.getByLabelText('SAP Company ID');
    screen.getByLabelText('SAP User ID');
    screen.getByLabelText('OAuth Client ID');
    screen.getByLabelText('OAuth Client Secret');
    screen.getByLabelText('SAP User Type');
  });
  test('test error messages', async () => {
    render(testSAPConfigSetup(noExistingData));

    const enableButton = screen.getByRole('button', { name: 'Enable' });
    await clearForm();
    userEvent.click(enableButton);
    expect(screen.queryByText(validationMessages.displayNameRequired));
    expect(screen.queryByText(validationMessages.baseUrlRequired));
    expect(screen.queryByText(validationMessages.companyIdRequired));
    expect(screen.queryByText(validationMessages.userIdRequired));
    expect(screen.queryByText(validationMessages.keyRequired));
    expect(screen.queryByText(validationMessages.secretRequired));
    expect(screen.queryByText(validationMessages.userTypeRequired));

    userEvent.paste(screen.getByLabelText('Display Name'), 'terriblenogoodverybaddisplayname');
    userEvent.paste(screen.getByLabelText('SAP Base URL'), 'badlink');
    userEvent.paste(screen.getByLabelText('SAP Company ID'), '1');
    userEvent.paste(screen.getByLabelText('SAP User ID'), '1');
    userEvent.paste(screen.getByLabelText('OAuth Client ID'), 'id');
    userEvent.paste(screen.getByLabelText('OAuth Client Secret'), 'secret');
    userEvent.click(screen.getByLabelText('Admin'));

    userEvent.click(enableButton);
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));

    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('SAP Base URL'), {
      target: { value: '' },
    });
    userEvent.paste(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.paste(
      screen.getByLabelText('SAP Base URL'),
      'https://www.test.com',
    );
    userEvent.click(enableButton);
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });
  test('it creates new configs on submit', async () => {
    render(testSAPConfigSetup(noExistingData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });

    await clearForm();
    userEvent.paste(screen.getByLabelText('Display Name'), 'lmsconfig');
    userEvent.paste(screen.getByLabelText('SAP Base URL'), 'http://www.example.com');
    userEvent.paste(screen.getByLabelText('SAP Company ID'), '1');
    userEvent.paste(screen.getByLabelText('SAP User ID'), '1');
    userEvent.paste(screen.getByLabelText('OAuth Client ID'), 'id');
    userEvent.paste(screen.getByLabelText('OAuth Client Secret'), 'secret');
    userEvent.click(screen.getByLabelText('Admin'));

    userEvent.click(enableButton);
    const expectedConfig = {
      active: false,
      display_name: 'lmsconfig',
      sapsf_base_url: 'http://www.example.com',
      sapsf_company_id: '1',
      sapsf_user_id: '1',
      key: 'id',
      secret: 'secret',
      user_type: 'admin',
      enterprise_customer: enterpriseId,
    };
    await waitFor(() => expect(mockPost).toHaveBeenCalledWith(expectedConfig));
  }, 30000);
  test('saves draft correctly', async () => {
    render(testSAPConfigSetup(noExistingData));
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    await clearForm();
    userEvent.paste(screen.getByLabelText('Display Name'), 'lmsconfig');
    userEvent.paste(screen.getByLabelText('SAP Base URL'), 'http://www.example.com');
    userEvent.paste(screen.getByLabelText('SAP Company ID'), '1');
    userEvent.paste(screen.getByLabelText('SAP User ID'), '1');
    userEvent.paste(screen.getByLabelText('OAuth Client ID'), 'id');
    userEvent.paste(screen.getByLabelText('OAuth Client Secret'), 'secret');
    userEvent.click(screen.getByLabelText('User'));

    expect(cancelButton).not.toBeDisabled();
    userEvent.click(cancelButton);

    await waitFor(() => expect(screen.getByText('Exit configuration')).toBeInTheDocument());
    const closeButton = screen.getByRole('button', { name: 'Exit' });

    userEvent.click(closeButton);

    const expectedConfig = {
      active: false,
      display_name: 'lmsconfig',
      sapsf_base_url: 'http://www.example.com',
      sapsf_company_id: '1',
      sapsf_user_id: '1',
      key: 'id',
      secret: 'secret',
      user_type: 'user',
      enterprise_customer: enterpriseId,
    };
    expect(mockPost).toHaveBeenCalledWith(expectedConfig);
  });
  test('validates poorly formatted existing data on load', async () => {
    render(testSAPConfigSetup(invalidExistingData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });
    userEvent.click(enableButton);
    expect(screen.queryByText(INVALID_LINK)).toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).toBeInTheDocument();
  });
  test('validates properly formatted existing data on load', () => {
    render(testSAPConfigSetup(existingConfigData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });
    // ensuring the existing data is prefilled
    expect(screen.getByLabelText('Display Name').value).toEqual(existingConfigData.displayName);
    expect(screen.getByLabelText('SAP Base URL').value).toEqual(existingConfigData.sapsfBaseUrl);
    expect(screen.getByLabelText('SAP Company ID').value).toEqual(existingConfigData.sapsfCompanyId);
    expect(screen.getByLabelText('SAP User ID').value).toEqual(existingConfigData.sapsfUserId);
    expect(screen.getByLabelText('OAuth Client ID').value).toEqual(existingConfigData.key);
    expect(screen.getByLabelText('OAuth Client Secret').value).toEqual(existingConfigData.secret);

    userEvent.click(enableButton);
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });
});
