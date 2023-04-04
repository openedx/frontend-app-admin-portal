import React from "react";
import {
  act,
  render,
  fireEvent,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";

// @ts-ignore
import DegreedConfig from "../LMSConfigs/Degreed/DegreedConfig.tsx";
import {
  INVALID_LINK,
  INVALID_NAME,
} from "../../data/constants";
import LmsApiService from "../../../../data/services/LmsApiService";
// @ts-ignore
import FormContextWrapper from "../../../forms/FormContextWrapper.tsx";

const mockUpdateConfigApi = jest.spyOn(LmsApiService, "updateDegreedConfig");
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
  displayName: "foobar",
  clientId: '1',
  clientSecret: 'shhhitsasecret123',
  degreedBaseUrl: "https://foobarish.com",
  degreedFetchUrl: "https://foobarish.com/fetch"
};

// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: "your display name doesn't need to be this long stop it",
  clientId: '1',
  clientSecret: 'shhhitsasecret123',
  degreedBaseUrl: "bad icky url",
  degreedFetchUrl: "https://foobarish.com/fetch"
};


const noConfigs = [];

afterEach(() => {
  jest.clearAllMocks();
});

const mockSetExistingConfigFormData = jest.fn();

function testDegreedConfigSetup(formData) {
  return (
    <FormContextWrapper
      formWorkflowConfig={DegreedConfig({
        enterpriseCustomerUuid: enterpriseId,
        onSubmit: mockSetExistingConfigFormData,
        onClickCancel: mockOnClick,
        existingData: formData,
      })}
      onClickOut={mockOnClick}
      onSubmit={mockSetExistingConfigFormData}
      formData={formData}
      isStepperOpen={true}
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


describe("<DegreedConfig />", () => {
  test("renders Degreed Enable Form", () => {
    render(testDegreedConfigSetup(noConfigs));
    screen.getByLabelText("Display Name");
    screen.getByLabelText("API Client ID");
    screen.getByLabelText("API Client Secret");
    screen.getByLabelText("Degreed Base URL");
    screen.getByLabelText("Degreed Token Fetch Base URL");
  });
  test("test button disable", async () => {
    render(testDegreedConfigSetup(noExistingData));

    const enableButton = screen.getByRole('button', { name: 'Enable' });
    await clearForm();
    expect(enableButton).toBeDisabled();

    userEvent.type(screen.getByLabelText('Display Name'), 'terriblenogoodverybaddisplayname');
    userEvent.type(screen.getByLabelText('API Client ID'), '1');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'shhhitsasecret123');
    userEvent.type(screen.getByLabelText('Degreed Base URL'), 'badlink');

    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Base URL'), {
      target: { value: '' },
    });
    expect(enableButton).toBeDisabled();
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    userEvent.type(screen.getByLabelText("Display Name"), "displayName");
    userEvent.type(
      screen.getByLabelText("Degreed Base URL"),
      "https://www.test4.com"
    );
    expect(enableButton).not.toBeDisabled();
  });
  test('it creates new configs on submit', async () => {
    render(testDegreedConfigSetup(noExistingData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });
    
    await clearForm();

    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('API Client ID'), '1');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'shhhitsasecret123');
    userEvent.type(screen.getByLabelText('Degreed Base URL'), 'https://www.test.com');
    userEvent.type(screen.getByLabelText('Degreed Token Fetch Base URL'), 'https://www.test.com');

    await waitFor(() => expect(enableButton).not.toBeDisabled());

    userEvent.click(enableButton);

    const expectedConfig = {
      active: false,
      display_name: 'displayName',
      client_id: '1',
      client_secret: 'shhhitsasecret123',
      degreed_base_url: 'https://www.test.com',
      degreed_fetch_url: 'https://www.test.com',
      enterprise_customer: enterpriseId,
    };
    await waitFor(() => expect(LmsApiService.postNewDegreedConfig).toHaveBeenCalledWith(expectedConfig));
  });
  test('saves draft correctly', async () => {
    render(testDegreedConfigSetup(noExistingData));
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    await clearForm();

    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('API Client ID'), '1');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'shhhitsasecret123');
    userEvent.type(screen.getByLabelText('Degreed Base URL'), 'https://www.test.com');
    userEvent.type(screen.getByLabelText('Degreed Token Fetch Base URL'), 'https://www.test.com');

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
      degreed_fetch_url: 'https://www.test.com',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.postNewDegreedConfig).toHaveBeenCalledWith(expectedConfig);
  });
  test('validates poorly formatted existing data on load', async () => {
    render(testDegreedConfigSetup(invalidExistingData));
    expect(screen.queryByText(INVALID_LINK)).toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).toBeInTheDocument();
  });
  test('validates properly formatted existing data on load', () => {
    render(testDegreedConfigSetup(existingConfigData));
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });

});