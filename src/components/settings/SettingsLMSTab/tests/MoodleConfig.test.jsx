import React from 'react';
import {
  render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import MoodleConfig from '../LMSConfigs/Moodle/MoodleConfig';
import { INVALID_LINK, INVALID_NAME } from '../../data/constants';
import LmsApiService from '../../../../data/services/LmsApiService';
import FormContextWrapper from '../../../forms/FormContextWrapper';
import { validationMessages } from '../LMSConfigs/Moodle/MoodleConfigEnablePage';

const mockUpdateConfigApi = jest.spyOn(LmsApiService, 'updateMoodleConfig');
const mockConfigResponseData = {
  uuid: 'foobar',
  id: 1,
  display_name: 'display name',
  moodle_base_url: 'https://foobar.com',
  active: false,
};
mockUpdateConfigApi.mockResolvedValue({ data: mockConfigResponseData });

const mockPostConfigApi = jest.spyOn(LmsApiService, 'postNewMoodleConfig');
mockPostConfigApi.mockResolvedValue({ data: mockConfigResponseData });

const mockFetchSingleConfig = jest.spyOn(LmsApiService, 'fetchSingleMoodleConfig');
mockFetchSingleConfig.mockResolvedValue({ data: { refresh_token: 'foobar' } });

const enterpriseId = 'test-enterprise-id';
const mockOnClick = jest.fn();
// Freshly creating a config will have an empty existing data object
const noExistingData = {};

const existingConfigData = {
  id: 1,
  displayName: 'hola',
  moodleBaseUrl: 'https://example.com',
  serviceShortName: 'shortname',
  token: 'token',
};

// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: 'just a whole muddle of moodles',
  moodleBaseUrl: "you dumb dumb this isn't a url",
  serviceShortName: 'shortname',
  token: 'token',
  username: 'blah1',
  password: 'blahblah',
};

const noConfigs = [];

afterEach(() => {
  jest.clearAllMocks();
});

const mockSetExistingConfigFormData = jest.fn();
const mockPost = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

function testMoodleConfigSetup(formData) {
  return (
    <IntlProvider locale="en">
      <FormContextWrapper
        formWorkflowConfig={MoodleConfig({
          enterpriseCustomerUuid: enterpriseId,
          onSubmit: mockSetExistingConfigFormData,
          handleCloseClick: mockOnClick,
          existingData: formData,
          existingConfigNames: new Map(),
          channelMap: {
            MOODLE: {
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

async function clearForm(user) {
  await user.clear(screen.getByLabelText('Display Name'));
  await user.clear(screen.getByLabelText('Moodle Base URL'));
  await user.clear(screen.getByLabelText('Webservice Short Name'));
  await user.clear(screen.getByLabelText('Token'));
  await user.clear(screen.getByLabelText('Username'));
  await user.clear(screen.getByLabelText('Password'));
}

describe('<MoodleConfig />', () => {
  test('renders Moodle Enable Form', () => {
    render(testMoodleConfigSetup(noConfigs));
    screen.getByLabelText('Display Name');
    screen.getByLabelText('Moodle Base URL');
    screen.getByLabelText('Webservice Short Name');
    screen.getByLabelText('Token');
    screen.getByLabelText('Username');
    screen.getByLabelText('Password');
  });
  test('test error messages', async () => {
    const user = userEvent.setup();
    render(testMoodleConfigSetup(noExistingData));

    const enableButton = screen.getByRole('button', { name: 'Enable' });
    await clearForm(user);
    await user.click(enableButton);
    expect(screen.queryByText(validationMessages.displayNameRequired));
    expect(screen.queryByText(validationMessages.baseUrlRequired));
    expect(screen.queryByText(validationMessages.serviceNameRequired));
    expect(screen.queryByText(validationMessages.verificationRequired));

    await user.type(screen.getByLabelText('Display Name'), 'terriblenogoodverybaddisplayname');
    await user.type(screen.getByLabelText('Moodle Base URL'), 'badlink');
    await user.type(screen.getByLabelText('Webservice Short Name'), 'name');
    await user.type(screen.getByLabelText('Token'), 'ofmyaffection');
    await user.type(screen.getByLabelText('Username'), 'user');

    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    expect(screen.queryByText(validationMessages.serviceNameRequired));

    await user.clear(screen.getByLabelText('Display Name'));
    await user.clear(screen.getByLabelText('Moodle Base URL'));
    await user.clear(screen.getByLabelText('Username'));
    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    await user.type(
      screen.getByLabelText('Moodle Base URL'),
      'https://www.test.com',
    );

    expect(!screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    expect(!screen.queryByText(validationMessages.serviceNameRequired));
  });
  test('it creates new configs on submit', async () => {
    const user = userEvent.setup();
    render(testMoodleConfigSetup(noExistingData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });

    await clearForm(user);

    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    await user.type(screen.getByLabelText('Moodle Base URL'), 'https://www.test.com');
    await user.type(screen.getByLabelText('Webservice Short Name'), 'name');
    await user.type(screen.getByLabelText('Username'), 'user');
    await user.type(screen.getByLabelText('Password'), 'password123');

    await user.click(enableButton);
    const expectedConfig = {
      active: false,
      display_name: 'displayName',
      moodle_base_url: 'https://www.test.com',
      service_short_name: 'name',
      token: '',
      username: 'user',
      password: 'password123',
      enterprise_customer: enterpriseId,
    };
    await waitFor(() => expect(mockPost).toHaveBeenCalledWith(expectedConfig));
  });
  test('saves draft correctly', async () => {
    const user = userEvent.setup();
    render(testMoodleConfigSetup(noExistingData));
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    await clearForm(user);

    await user.type(screen.getByLabelText('Display Name'), 'displayName');
    await user.type(screen.getByLabelText('Moodle Base URL'), 'https://www.test.com');
    await user.type(screen.getByLabelText('Webservice Short Name'), 'name');
    await user.type(screen.getByLabelText('Username'), 'user');
    await user.type(screen.getByLabelText('Password'), 'password123');

    expect(cancelButton).not.toBeDisabled();
    await user.click(cancelButton);

    await waitFor(() => expect(screen.getByText('Exit configuration')).toBeInTheDocument());
    const closeButton = screen.getByRole('button', { name: 'Exit' });

    await user.click(closeButton);

    const expectedConfig = {
      active: false,
      display_name: 'displayName',
      moodle_base_url: 'https://www.test.com',
      service_short_name: 'name',
      token: '',
      username: 'user',
      password: 'password123',
      enterprise_customer: enterpriseId,
    };
    expect(mockPost).toHaveBeenCalledWith(expectedConfig);
  });
  test('validates poorly formatted existing data on load', async () => {
    const user = userEvent.setup();
    render(testMoodleConfigSetup(invalidExistingData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });
    await user.click(enableButton);
    expect(screen.queryByText(INVALID_LINK)).toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).toBeInTheDocument();
    expect(screen.queryByText(validationMessages.verificationRequired)).toBeInTheDocument();
  });
  test('validates properly formatted existing data on load', async () => {
    const user = userEvent.setup();
    render(testMoodleConfigSetup(existingConfigData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });
    // ensuring the existing data is prefilled
    expect(screen.getByLabelText('Display Name').value).toEqual(existingConfigData.displayName);
    expect(screen.getByLabelText('Moodle Base URL').value).toEqual(existingConfigData.moodleBaseUrl);
    expect(screen.getByLabelText('Webservice Short Name').value).toEqual(existingConfigData.serviceShortName);
    expect(screen.getByLabelText('Token').value).toEqual(existingConfigData.token);

    await user.click(enableButton);

    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
    expect(screen.queryByText(validationMessages.serviceNameRequired)).not.toBeInTheDocument();
  });
});
