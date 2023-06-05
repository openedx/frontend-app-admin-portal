import React from 'react';
import {
  act, render, fireEvent, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import CanvasConfig from '../LMSConfigs/Canvas/CanvasConfig';
import { INVALID_LINK, INVALID_NAME } from '../../data/constants';
import FormContextWrapper from '../../../forms/FormContextWrapper';
import { validationMessages } from '../LMSConfigs/Canvas/CanvasConfigAuthorizePage';

jest.mock('../../data/constants', () => ({
  ...jest.requireActual('../../data/constants'),
  LMS_CONFIG_OAUTH_POLLING_INTERVAL: 0,
}));
window.open = jest.fn();
const enterpriseId = 'test-enterprise-id';

const mockOnClick = jest.fn();
// Freshly creating a config will have an empty existing data object
const noExistingData = {};
// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: 'fooooooooobaaaaaaaaar',
  canvasBaseUrl: 'bad_url :^(',
};
// Existing config data that has not been authorized
const existingConfigDataNoAuth = {
  id: 1,
  displayName: 'foobar',
  canvasBaseUrl: 'https://foobarish.com',
  clientId: 'ayylmao',
  clientSecret: 'testingsecret',
  canvasAccountId: '10',
};

const mockConfigResponseData = {
  uuid: 'foobar',
  id: 1,
  canvas_account_id: '1',
  display_name: 'display name',
  canvas_base_url: 'https://foobar.com',
  client_id: 'wassap',
  client_secret: 'chewlikeyouhaveasecret',
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
        existingConfigNames: new Map(),
        channelMap: {
          CANVAS: {
            post: mockPost,
            update: mockUpdate,
            fetch: mockFetch,
          },
        },
      })}
      onClickOut={mockOnClick}
      formData={formData}
      isStepperOpen
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

describe('<CanvasConfig />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  // test('renders Canvas Authorize Form', () => {
  //   render(testCanvasConfigSetup(noConfigs));
  //   screen.getByLabelText('Display Name');
  //   screen.getByLabelText('API Client ID');
  //   screen.getByLabelText('API Client Secret');
  //   screen.getByLabelText('Canvas Account Number');
  //   screen.getByLabelText('Canvas Base URL');
  // });
  // test('test error messages', async () => {
  //   render(testCanvasConfigSetup(noExistingData));

  //   const authorizeButton = screen.getByRole('button', { name: 'Authorize' });

  //   await clearForm();
  //   userEvent.click(authorizeButton);
  //   expect(screen.queryByText(validationMessages.displayNameRequired));
  //   expect(screen.queryByText(validationMessages.canvasUrlRequired));
  //   expect(screen.queryByText(validationMessages.clientIdRequired));
  //   expect(screen.queryByText(validationMessages.accountIdRequired));
  //   expect(screen.queryByText(validationMessages.clientSecretRequired));

  //   userEvent.paste(screen.getByLabelText('Display Name'), 'name');
  //   userEvent.paste(screen.getByLabelText('Canvas Base URL'), 'test4');
  //   userEvent.paste(screen.getByLabelText('API Client ID'), 'test3');
  //   userEvent.paste(screen.getByLabelText('Canvas Account Number'), '23');
  //   userEvent.paste(screen.getByLabelText('API Client Secret'), 'test6');
  //   userEvent.click(authorizeButton);

  //   expect(screen.queryByText(INVALID_LINK));
  //   expect(screen.queryByText(INVALID_NAME));
  //   await clearForm();
  //   userEvent.paste(screen.getByLabelText('Display Name'), 'displayName');
  //   userEvent.paste(
  //     screen.getByLabelText('Canvas Base URL'),
  //     'https://www.test4.com',
  //   );
  //   userEvent.click(authorizeButton);
  //   expect(!screen.queryByText(INVALID_LINK));
  //   expect(!screen.queryByText(INVALID_NAME));
  // });
  // test('saves draft correctly', async () => {
  //   render(testCanvasConfigSetup(noExistingData));
  //   const cancelButton = screen.getByRole('button', { name: 'Cancel' });

  //   await clearForm();
  //   userEvent.paste(screen.getByLabelText('Display Name'), 'displayName');
  //   userEvent.paste(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');
  //   userEvent.paste(screen.getByLabelText('API Client ID'), 'test1');
  //   userEvent.paste(screen.getByLabelText('Canvas Account Number'), '3');
  //   userEvent.paste(screen.getByLabelText('API Client Secret'), 'test2');

  //   expect(cancelButton).not.toBeDisabled();
  //   userEvent.click(cancelButton);

  //   // Await a find by text in order to account for state changes in the button callback
  //   await waitFor(() => expect(screen.getByText('Exit configuration')).toBeInTheDocument());

  //   userEvent.click(screen.getByText('Exit'));

  //   const expectedConfig = {
  //     active: false,
  //     display_name: 'displayName',
  //     enterprise_customer: enterpriseId,
  //     canvas_account_id: '3',
  //     canvas_base_url: 'https://www.test4.com',
  //     client_id: 'test1',
  //     client_secret: 'test2',
  //   };
  //   expect(mockPost).toHaveBeenCalledWith(expectedConfig);
  // });
  test('Authorizing a config will initiate backend polling', async () => {
    render(testCanvasConfigSetup(noExistingData));
    const authorizeButton = screen.getByRole('button', { name: 'Authorize' });

    await clearForm();
    userEvent.paste(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.paste(screen.getByLabelText('Canvas Base URL'), 'https://www.test4.com');
    userEvent.paste(screen.getByLabelText('API Client ID'), 'test1');
    userEvent.paste(screen.getByLabelText('Canvas Account Number'), '3');
    userEvent.paste(screen.getByLabelText('API Client Secret'), 'test2');
    userEvent.click(authorizeButton);

    // await authorization loading modal
    await waitFor(() => expect(screen.queryByText('Please confirm authorization through Canvas and return to this window once complete.')));
    expect(window.open).toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(1);
  });
  // test('validates poorly formatted existing data on load', async () => {
  //   render(testCanvasConfigSetup(invalidExistingData));
  //   const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
  //   userEvent.click(authorizeButton);
  //   await waitFor(() => expect(screen.getByText(INVALID_NAME)).toBeInTheDocument());
  //   expect(screen.getByText(INVALID_LINK)).toBeInTheDocument();
  // });
  // test('validates properly formatted existing data on load', () => {
  //   render(testCanvasConfigSetup(existingConfigDataNoAuth));
  //   const authorizeButton = screen.getByRole('button', { name: 'Authorize' });
  //   // ensuring the existing data is prefilled
  //   expect((screen.getByLabelText('Display Name') as HTMLInputElement).value).toEqual(
  //     existingConfigDataNoAuth.displayName,
  //   );
  //   expect((screen.getByLabelText('Canvas Base URL') as HTMLInputElement).value).toEqual(
  //     existingConfigDataNoAuth.canvasBaseUrl,
  //   );
  //   expect((screen.getByLabelText('API Client ID') as HTMLInputElement).value).toEqual(
  //     existingConfigDataNoAuth.clientId,
  //   );
  //   expect((screen.getByLabelText('Canvas Account Number') as HTMLInputElement).value).toEqual(
  //     existingConfigDataNoAuth.canvasAccountId,
  //   );
  //   expect((screen.getByLabelText('API Client Secret') as HTMLInputElement).value).toEqual(
  //     existingConfigDataNoAuth.clientSecret,
  //   );

  //   userEvent.click(authorizeButton);
  //   expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
  //   expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  // });
});
