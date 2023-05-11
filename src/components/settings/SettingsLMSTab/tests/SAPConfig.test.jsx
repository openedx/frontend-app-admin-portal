import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

// @ts-ignore
import SAPConfig from '../LMSConfigs/SAP/SAPConfig.tsx';
import { INVALID_LINK, INVALID_NAME } from '../../data/constants';
import LmsApiService from '../../../../data/services/LmsApiService';
// @ts-ignore
import FormContextWrapper from '../../../forms/FormContextWrapper.tsx';

const mockUpdateConfigApi = jest.spyOn(LmsApiService, 'updateSuccessFactorsConfig');
const mockConfigResponseData = {
  uuid: 'foobar',
  id: 1,
  display_name: 'display name',
  sap_base_url: 'https://foobar.com',
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
  sapBaseUrl: 'http://www.example.com',
  sapCompanyId: '12',
  sapUserId: 'userId',
  oauthClientId: 'clientId',
  oauthClientSecret: 'secretshh',
  sapUserType: 'admin',
};

// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: 'just a whole muddle of saps',
  sapBaseUrl: 'you dumb dumb this isnt a url',
  sapCompanyId: '12',
  sapUserId: 'userId',
  oauthClientId: 'clientId',
  oauthClientSecret: 'secretshh',
  sapUserType: 'admin',
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
    <FormContextWrapper
      formWorkflowConfig={SAPConfig({
        enterpriseCustomerUuid: enterpriseId,
        onSubmit: mockSetExistingConfigFormData,
        handleCloseClick: mockOnClick,
        existingData: formData,
        existingConfigNames: [],
        channelMap: {
          SAP: {
            post: mockPost,
            update: mockUpdate,
            delete: mockDelete,
          },
        },
      })}
      onClickOut={mockOnClick}
      onSubmit={mockSetExistingConfigFormData}
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
  test('test button disable', async () => {
    render(testSAPConfigSetup(noExistingData));

    const enableButton = screen.getByRole('button', { name: 'Enable' });
    await clearForm();
    expect(enableButton).toBeDisabled();

    userEvent.type(screen.getByLabelText('Display Name'), 'terriblenogoodverybaddisplayname');
    userEvent.type(screen.getByLabelText('SAP Base URL'), 'badlink');
    userEvent.type(screen.getByLabelText('SAP Company ID'), '1');
    userEvent.type(screen.getByLabelText('SAP User ID'), '1');
    userEvent.type(screen.getByLabelText('OAuth Client ID'), 'id');
    userEvent.type(screen.getByLabelText('OAuth Client Secret'), 'secret');
    userEvent.click(screen.getByLabelText('Admin'));

    expect(enableButton).toBeDisabled();
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));

    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('SAP Base URL'), {
      target: { value: '' },
    });
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(
      screen.getByLabelText('SAP Base URL'),
      'https://www.test.com',
    );

    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
    expect(enableButton).not.toBeDisabled();
  });
  test('it creates new configs on submit', async () => {
    render(testSAPConfigSetup(noExistingData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });

    await clearForm();

    userEvent.type(screen.getByLabelText('Display Name'), 'lmsconfig');
    userEvent.type(screen.getByLabelText('SAP Base URL'), 'http://www.example.com');
    userEvent.type(screen.getByLabelText('SAP Company ID'), '1');
    userEvent.type(screen.getByLabelText('SAP User ID'), '1');
    userEvent.type(screen.getByLabelText('OAuth Client ID'), 'id');
    userEvent.type(screen.getByLabelText('OAuth Client Secret'), 'secret');
    userEvent.click(screen.getByLabelText('Admin'));

    await waitFor(() => expect(enableButton).not.toBeDisabled());

    userEvent.click(enableButton);

    const expectedConfig = {
      active: false,
      display_name: 'lmsconfig',
      sap_base_url: 'http://www.example.com',
      sap_company_id: '1',
      sap_user_id: '1',
      oauth_client_id: 'id',
      oauth_client_secret: 'secret',
      sap_user_type: 'admin',
      enterprise_customer: enterpriseId,
    };
    await waitFor(() => expect(mockPost).toHaveBeenCalledWith(expectedConfig));
  });
  test('saves draft correctly', async () => {
    render(testSAPConfigSetup(noExistingData));
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    await clearForm();

    userEvent.type(screen.getByLabelText('Display Name'), 'lmsconfig');
    userEvent.type(screen.getByLabelText('SAP Base URL'), 'http://www.example.com');
    userEvent.type(screen.getByLabelText('SAP Company ID'), '1');
    userEvent.type(screen.getByLabelText('SAP User ID'), '1');
    userEvent.type(screen.getByLabelText('OAuth Client ID'), 'id');
    userEvent.type(screen.getByLabelText('OAuth Client Secret'), 'secret');
    userEvent.click(screen.getByLabelText('User'));

    expect(cancelButton).not.toBeDisabled();
    userEvent.click(cancelButton);

    await waitFor(() => expect(screen.getByText('Exit configuration')).toBeInTheDocument());
    const closeButton = screen.getByRole('button', { name: 'Exit' });

    userEvent.click(closeButton);

    const expectedConfig = {
      active: false,
      display_name: 'lmsconfig',
      sap_base_url: 'http://www.example.com',
      sap_company_id: '1',
      sap_user_id: '1',
      oauth_client_id: 'id',
      oauth_client_secret: 'secret',
      sap_user_type: 'user',
      enterprise_customer: enterpriseId,
    };
    expect(mockPost).toHaveBeenCalledWith(expectedConfig);
  });
  test('validates poorly formatted existing data on load', async () => {
    render(testSAPConfigSetup(invalidExistingData));
    expect(screen.queryByText(INVALID_LINK)).toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).toBeInTheDocument();
  });
  test('validates properly formatted existing data on load', () => {
    render(testSAPConfigSetup(existingConfigData));
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });
});
