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
import CanvasConfig from "../LMSConfigs/Canvas/CanvasConfig.tsx";
import {
  INVALID_LINK,
  INVALID_NAME,
} from "../../data/constants";
import LmsApiService from "../../../../data/services/LmsApiService";
// @ts-ignore
import FormContextWrapper from "../../../forms/FormContextWrapper.tsx";
import { findElementWithText } from "../../../test/testUtils";

jest.mock("../../data/constants", () => ({
  ...jest.requireActual("../../data/constants"),
  LMS_CONFIG_OAUTH_POLLING_INTERVAL: 0,
}));
window.open = jest.fn();
const mockUpdateConfigApi = jest.spyOn(LmsApiService, "updateCanvasConfig");
const mockConfigResponseData = {
  uuid: "foobar",
  id: 1,
  display_name: "display name",
  canvas_base_url: "https://foobar.com",
  canvas_account_id: 1,
  client_id: "123abc",
  client_secret: "asdhfahsdf",
  active: false,
};
mockUpdateConfigApi.mockResolvedValue({ data: mockConfigResponseData });

const mockPostConfigApi = jest.spyOn(LmsApiService, "postNewCanvasConfig");
mockPostConfigApi.mockResolvedValue({ data: mockConfigResponseData });

const mockFetchSingleConfig = jest.spyOn(
  LmsApiService,
  "fetchSingleCanvasConfig"
);
mockFetchSingleConfig.mockResolvedValue({ data: { refresh_token: "foobar" } });

const enterpriseId = "test-enterprise-id";

const mockOnClick = jest.fn();
// Freshly creating a config will have an empty existing data object
const noExistingData = {};
// Existing config data that has been authorized
const existingConfigData = {
  active: true,
  refreshToken: "foobar",
  id: 1,
  displayName: "foobarss",
};
// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: "fooooooooobaaaaaaaaar",
  canvasBaseUrl: "bad_url :^(",
};
// Existing config data that has not been authorized
const existingConfigDataNoAuth = {
  id: 1,
  displayName: "foobar",
  canvasBaseUrl: "https://foobarish.com",
  clientId: "ayylmao",
  clientSecret: "testingsecret",
  canvasAccountId: 10,
};

const noConfigs = [];

afterEach(() => {
  jest.clearAllMocks();
});

const mockSetExistingConfigFormData = jest.fn();

function testCanvasConfigSetup(formData) {
  return (
    <FormContextWrapper
      formWorkflowConfig={CanvasConfig({
        enterpriseCustomerUuid: enterpriseId,
        onSubmit: mockSetExistingConfigFormData,
        onClickCancel: mockOnClick,
        existingData: formData,
      })}
      onClickOut={mockOnClick}
      onSubmit={mockSetExistingConfigFormData}
      formData={formData}
    />
  );
}

async function clearForm() {
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
}


describe("<CanvasConfig />", () => {
  test("renders Canvas Authorize Form", () => {
    render(testCanvasConfigSetup(noConfigs));

    screen.getByLabelText("Display Name");
    screen.getByLabelText("API Client ID");
    screen.getByLabelText("API Client Secret");
    screen.getByLabelText("Canvas Account Number");
    screen.getByLabelText("Canvas Base URL");
  });
  test("test button disable", async () => {
    const { container } = render(testCanvasConfigSetup(noExistingData));

    const authorizeButton = findElementWithText(
      container,
      "button",
      "Authorize"
    );
    await clearForm();
    expect(authorizeButton).toBeDisabled();
    userEvent.type(screen.getByLabelText("Display Name"), "name");
    userEvent.type(screen.getByLabelText("Canvas Base URL"), "test4");
    userEvent.type(screen.getByLabelText("API Client ID"), "test3");
    userEvent.type(screen.getByLabelText("Canvas Account Number"), "23");
    userEvent.type(screen.getByLabelText("API Client Secret"), "test6");

    expect(authorizeButton).toBeDisabled();
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    await act(async () => {
      fireEvent.change(screen.getByLabelText("Display Name"), {
        target: { value: "" },
      });
      fireEvent.change(screen.getByLabelText("Canvas Base URL"), {
        target: { value: "" },
      });
    });
    userEvent.type(screen.getByLabelText("Display Name"), "displayName");
    userEvent.type(
      screen.getByLabelText("Canvas Base URL"),
      "https://www.test4.com"
    );

    expect(authorizeButton).not.toBeDisabled();
  });
  test('it edits existing configs on submit', async () => {
    const { container } = render(testCanvasConfigSetup(existingConfigData));
    const authorizeButton = findElementWithText(
      container,
      "button",
      "Authorize"
    );

    await clearForm(); 
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');
    userEvent.type(screen.getByLabelText('API Client ID'), 'test1');
    userEvent.type(screen.getByLabelText('Canvas Account Number'), '3');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'test2');

    expect(authorizeButton).not.toBeDisabled();

    userEvent.click(authorizeButton);

    // Await a find by text in order to account for state changes in the button callback
    await waitFor(() => expect(authorizeButton).not.toBeInTheDocument());

    const expectedConfig = {
      active: true,
      id: 1,
      refresh_token: "foobar",
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
    const { container  } = render(testCanvasConfigSetup(noExistingData));
    const authorizeButton = findElementWithText(
      container,
      "button",
      "Authorize"
    );
    
    await clearForm();

    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');
    userEvent.type(screen.getByLabelText('API Client ID'), 'test1');
    userEvent.type(screen.getByLabelText('Canvas Account Number'), '3');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'test2');
    await waitFor(() => expect(authorizeButton).not.toBeDisabled());

    userEvent.click(authorizeButton);

    // Await a find by text in order to account for state changes in the button callback
    await waitFor(() => expect(authorizeButton).not.toBeInTheDocument());

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
    const { container } = render(testCanvasConfigSetup(noExistingData));
    const cancelButton = findElementWithText(
      container,
      "button",
      "Cancel"
    );
    await clearForm();
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');
    userEvent.type(screen.getByLabelText('API Client ID'), 'test1');
    userEvent.type(screen.getByLabelText('Canvas Account Number'), '3');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'test2');

    expect(cancelButton).not.toBeDisabled();
    userEvent.click(cancelButton);

    // Await a find by text in order to account for state changes in the button callback
    await waitFor(() => expect(screen.getByText('Exit configuration')).toBeInTheDocument());

    userEvent.click(screen.getByText('Exit'));

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
  test('Authorizing a config will initiate backend polling', async () => {
    const { container } = render(testCanvasConfigSetup(noExistingData));
    const authorizeButton = findElementWithText(
      container,
      "button",
      "Authorize"
    );
    await clearForm();
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');
    userEvent.type(screen.getByLabelText('API Client ID'), 'test1');
    userEvent.type(screen.getByLabelText('Canvas Account Number'), '3');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'test2');

    expect(authorizeButton).not.toBeDisabled();
    userEvent.click(authorizeButton);

    // Await a find by text in order to account for state changes in the button callback
    await waitFor(() => expect(authorizeButton).not.toBeInTheDocument());

    expect(window.open).toHaveBeenCalled();
    expect(mockFetchSingleConfig).toHaveBeenCalledWith(1);
  });
  test('Authorizing an existing, edited config will call update config endpoint', async () => {
    const { container } = render(testCanvasConfigSetup(existingConfigDataNoAuth));
    const authorizeButton = findElementWithText(
      container,
      "button",
      "Authorize"
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

    expect(authorizeButton).not.toBeDisabled();
    userEvent.click(authorizeButton);

    // Await a find by text in order to account for state changes in the button callback
    await waitFor(() => expect(screen.getByText('Authorization in progress')).toBeInTheDocument());
    expect(mockUpdateConfigApi).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalled();
    expect(mockFetchSingleConfig).toHaveBeenCalledWith(1);
    await waitFor(() => expect(screen.getByText('Your Canvas integration has been successfully authorized and is ready to activate!')).toBeInTheDocument());
  });
  test('Authorizing an existing config will not call update or create config endpoint', async () => {
    const { container } = render(testCanvasConfigSetup(existingConfigDataNoAuth));
    const authorizeButton = findElementWithText(
      container,
      "button",
      "Authorize"
    );

    expect(authorizeButton).not.toBeDisabled();

    userEvent.click(authorizeButton);

    // Await a find by text in order to account for state changes in the button callback
    await waitFor(() => expect(screen.getByText('Your Canvas integration has been successfully authorized and is ready to activate!')).toBeInTheDocument());
    expect(mockUpdateConfigApi).not.toHaveBeenCalled();
    expect(window.open).toHaveBeenCalled();
    expect(mockFetchSingleConfig).toHaveBeenCalledWith(1);
  });
  test('validates poorly formatted existing data on load', async () => {
    render(testCanvasConfigSetup(invalidExistingData));
    expect(screen.getByText("Please enter a valid URL")).toBeInTheDocument();
    await waitFor(() => expect(expect(screen.getByText("Display name should be 20 characters or less")).toBeInTheDocument()));
  });
  test('validates properly formatted existing data on load', () => {
    render(testCanvasConfigSetup(existingConfigDataNoAuth));
    expect(screen.queryByText("Please enter a valid URL")).not.toBeInTheDocument();
    expect(screen.queryByText("Display name should be 20 characters or less")).not.toBeInTheDocument();
  });
  test('it calls setExistingConfigFormData after authorization', async () => {
    const { container } = render(testCanvasConfigSetup(existingConfigDataNoAuth));
    const authorizeButton = findElementWithText(
      container,
      "button",
      "Authorize"
    );
    act(() => {
      fireEvent.change(screen.getByLabelText('Display Name'), {
        target: { value: '' },
      });
    });
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    expect(authorizeButton).not.toBeDisabled();
    userEvent.click(authorizeButton);

    // Await a find by text in order to account for state changes in the button callback
    await waitFor(() => expect(screen.getByText('Your Canvas integration has been successfully authorized and is ready to activate!')).toBeInTheDocument());
    
    const activateButton = findElementWithText(
      container,
      "button",
      "Activate"
    );
    userEvent.click(activateButton);
    expect(mockSetExistingConfigFormData).toHaveBeenCalledWith({
      uuid: 'foobar',
      id: 1,
      displayName: 'display name',
      canvasBaseUrl: 'https://foobar.com',
      canvasAccountId: 1,
      clientId: '123abc',
      clientSecret: 'asdhfahsdf',
      active: false,
    });
  });
});
