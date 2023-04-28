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
// @ts-ignore
import FormContextWrapper from "../../../forms/FormContextWrapper.tsx";

jest.mock("../../data/constants", () => ({
  ...jest.requireActual("../../data/constants"),
  LMS_CONFIG_OAUTH_POLLING_INTERVAL: 0,
}));
window.open = jest.fn();
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


const mockConfigResponseData = {
  uuid: 'foobar',
  id: 1,
  canvas_account_id: 1,
  display_name: 'display name',
  canvas_base_url: 'https://foobar.com',
  client_id: "wassap",
  client_secret: "chewlikeyouhaveasecret",
  active: false,
};

const noConfigs = [];

const mockSetExistingConfigFormData = jest.fn();
const mockPost = jest.fn();
const mockUpdate = jest.fn();
const mockFetch = jest.fn();
mockPost.mockResolvedValue({ data: mockConfigResponseData });
mockUpdate.mockResolvedValue({ data: mockConfigResponseData });
mockFetch.mockResolvedValue({ data: { refresh_token: 'foobar' } });


function testCanvasConfigSetup(formData) {
  return (
    <FormContextWrapper
      formWorkflowConfig={CanvasConfig({
        enterpriseCustomerUuid: enterpriseId,
        onSubmit: mockSetExistingConfigFormData,
        handleCloseClick: mockOnClick,
        existingData: formData,
        existingConfigNames: [],
        channelMap: {
          CANVAS: {
            post: mockPost,
            update: mockUpdate,
            fetch: mockFetch,
          },
        }
      })}
      onClickOut={mockOnClick}
      onSubmit={mockSetExistingConfigFormData}
      formData={formData}
      isStepperOpen={true}
      dispatch={jest.fn()}
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
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("renders Canvas Authorize Form", () => {
    render(testCanvasConfigSetup(noConfigs));
    screen.getByLabelText("Display Name");
    screen.getByLabelText("API Client ID");
    screen.getByLabelText("API Client Secret");
    screen.getByLabelText("Canvas Account Number");
    screen.getByLabelText("Canvas Base URL");
  });
  test("test button disable", async () => {
    render(testCanvasConfigSetup(noExistingData));

    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });

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
    render(testCanvasConfigSetup(existingConfigData));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });

    await clearForm(); 
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');
    userEvent.type(screen.getByLabelText('API Client ID'), 'test1');
    userEvent.type(screen.getByLabelText('Canvas Account Number'), '3');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'test2');

    expect(authorizeButton).not.toBeDisabled();

    userEvent.click(authorizeButton);

    // Await a find by text in order to account for state changes in the button callback
    await waitFor(() => expect(screen.getByRole('button', { name: 'Activate' })).toBeInTheDocument());

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
    expect(mockUpdate).toHaveBeenCalledWith(expectedConfig, 1);
  });
  test('it creates new configs on submit', async () => {
    render(testCanvasConfigSetup(noExistingData));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
    
    await clearForm();

    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');
    userEvent.type(screen.getByLabelText('API Client ID'), 'test1');
    userEvent.type(screen.getByLabelText('Canvas Account Number'), '3');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'test2');
    await waitFor(() => expect(authorizeButton).not.toBeDisabled());

    userEvent.click(authorizeButton);

    // Await a find by text in order to account for state changes in the button callback
    await waitFor(() => expect(screen.getByRole('button', { name: 'Activate' })).toBeInTheDocument());

    const expectedConfig = {
      active: false,
      canvas_base_url: 'https://www.test4.com',
      canvas_account_id: '3',
      client_id: 'test1',
      client_secret: 'test2',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(mockPost).toHaveBeenCalledWith(expectedConfig);
  });
  test('saves draft correctly', async () => {
    render(testCanvasConfigSetup(noExistingData));
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

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
    expect(mockPost).toHaveBeenCalledWith(expectedConfig);
  });
  test('Authorizing a config will initiate backend polling', async () => {
    render(testCanvasConfigSetup(noExistingData));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });

    await clearForm();
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');
    userEvent.type(screen.getByLabelText('API Client ID'), 'test1');
    userEvent.type(screen.getByLabelText('Canvas Account Number'), '3');
    userEvent.type(screen.getByLabelText('API Client Secret'), 'test2');

    expect(authorizeButton).not.toBeDisabled();
    userEvent.click(authorizeButton);

    // await authorization loading modal
    await waitFor(() => expect(screen.queryByText('Please confirm authorization through Canvas and return to this window once complete.')));
    expect(window.open).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(1);
  });
  test('Authorizing an existing, edited config will call update config endpoint', async () => {
    render(testCanvasConfigSetup(existingConfigDataNoAuth));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });

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

    // await authorization loading modal
    await waitFor(() => expect(screen.queryByText('Please confirm authorization through Canvas and return to this window once complete.')));
    expect(mockUpdate).toHaveBeenCalled();
    expect(window.open).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(1);
    await waitFor(() => expect(screen.getByText('Your Canvas integration has been successfully authorized and is ready to activate!')).toBeInTheDocument());
  });
  test('Authorizing an existing config will not call update or create config endpoint', async () => {
    render(testCanvasConfigSetup(existingConfigDataNoAuth));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });

    expect(authorizeButton).not.toBeDisabled();

    userEvent.click(authorizeButton);

    // await authorization loading modal
    await waitFor(() => expect(screen.queryByText('Please confirm authorization through Canvas and return to this window once complete.')));
    expect(mockUpdate).not.toHaveBeenCalled();
    expect(window.open).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(1);
    await waitFor(() => expect(screen.getByText('Your Canvas integration has been successfully authorized and is ready to activate!')).toBeInTheDocument());
  });
  test('validates poorly formatted existing data on load', async () => {
    render(testCanvasConfigSetup(invalidExistingData));
    expect(screen.getByText(INVALID_LINK)).toBeInTheDocument();
    await waitFor(() => expect(expect(screen.getByText(INVALID_NAME)).toBeInTheDocument()));
  });
  test('validates properly formatted existing data on load', () => {
    render(testCanvasConfigSetup(existingConfigDataNoAuth));
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });
  test('it calls setExistingConfigFormData after authorization', async () => {
    render(testCanvasConfigSetup(existingConfigDataNoAuth));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });

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
    const activateButton = screen.getByRole('button', { name: 'Activate' });

    userEvent.click(activateButton);
    expect(mockSetExistingConfigFormData).toHaveBeenCalledWith({
      uuid: 'foobar',
      id: 1,
      displayName: 'display name',
      canvasBaseUrl: 'https://foobar.com',
      canvasAccountId: 1,
      clientId: 'wassap',
      clientSecret: 'chewlikeyouhaveasecret',
      active: false,
    });
  });
});
