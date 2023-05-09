import React from 'react';
import {
  act, fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import MoodleConfig from '../LMSConfigs/Moodle/MoodleConfig';
import { INVALID_LINK, INVALID_MOODLE_VERIFICATION, INVALID_NAME } from '../../data/constants';
import LmsApiService from '../../../../data/services/LmsApiService';
import FormContextWrapper from '../../../forms/FormContextWrapper';

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
  webserviceShortName: 'shortname',
  token: 'token',
};

// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: 'just a whole muddle of moodles',
  moodleBaseUrl: "you dumb dumb this isn't a url",
  webserviceShortName: 'shortname',
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
    <FormContextWrapper
      formWorkflowConfig={MoodleConfig({
        enterpriseCustomerUuid: enterpriseId,
        onSubmit: mockSetExistingConfigFormData,
        handleCloseClick: mockOnClick,
        existingData: formData,
        existingConfigNames: [],
        channelMap: {
          MOODLE: {
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
    fireEvent.change(screen.getByLabelText('Moodle Base URL'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Webservice Short Name'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Token'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '' },
    });
  });
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
  test('test button disable', async () => {
    render(testMoodleConfigSetup(noExistingData));

    const enableButton = screen.getByRole('button', { name: 'Enable' });
    await clearForm();
    expect(enableButton).toBeDisabled();

    userEvent.type(screen.getByLabelText('Display Name'), 'terriblenogoodverybaddisplayname');
    userEvent.type(screen.getByLabelText('Moodle Base URL'), 'badlink');
    userEvent.type(screen.getByLabelText('Webservice Short Name'), 'name');
    userEvent.type(screen.getByLabelText('Token'), 'ofmyaffection');
    userEvent.type(screen.getByLabelText('Username'), 'user');

    expect(enableButton).toBeDisabled();
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    expect(screen.queryByText(INVALID_MOODLE_VERIFICATION));

    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Moodle Base URL'), {
      target: { value: '' },
    });
    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: '' },
    });
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(
      screen.getByLabelText('Moodle Base URL'),
      'https://www.test.com',
    );

    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_MOODLE_VERIFICATION)).not.toBeInTheDocument();
    expect(enableButton).not.toBeDisabled();
  });
  test('it creates new configs on submit', async () => {
    render(testMoodleConfigSetup(noExistingData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });

    await clearForm();

    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Moodle Base URL'), 'https://www.test.com');
    userEvent.type(screen.getByLabelText('Webservice Short Name'), 'name');
    userEvent.type(screen.getByLabelText('Username'), 'user');
    userEvent.type(screen.getByLabelText('Password'), 'password123');

    await waitFor(() => expect(enableButton).not.toBeDisabled());
    await act(async () => { userEvent.click(enableButton); });

    userEvent.click(enableButton);

    const expectedConfig = {
      active: false,
      display_name: 'displayName',
      moodle_base_url: 'https://www.test.com',
      webservice_short_name: 'name',
      token: '',
      username: 'user',
      password: 'password123',
      enterprise_customer: enterpriseId,
    };
    await waitFor(() => expect(mockPost).toHaveBeenCalledWith(expectedConfig));
  });
  test('saves draft correctly', async () => {
    render(testMoodleConfigSetup(noExistingData));
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });

    await clearForm();

    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Moodle Base URL'), 'https://www.test.com');
    userEvent.type(screen.getByLabelText('Webservice Short Name'), 'name');
    userEvent.type(screen.getByLabelText('Username'), 'user');
    userEvent.type(screen.getByLabelText('Password'), 'password123');

    expect(cancelButton).not.toBeDisabled();
    userEvent.click(cancelButton);

    await waitFor(() => expect(screen.getByText('Exit configuration')).toBeInTheDocument());
    const closeButton = screen.getByRole('button', { name: 'Exit' });

    userEvent.click(closeButton);

    const expectedConfig = {
      active: false,
      display_name: 'displayName',
      moodle_base_url: 'https://www.test.com',
      webservice_short_name: 'name',
      token: '',
      username: 'user',
      password: 'password123',
      enterprise_customer: enterpriseId,
    };
    expect(mockPost).toHaveBeenCalledWith(expectedConfig);
  });
  test('validates poorly formatted existing data on load', async () => {
    render(testMoodleConfigSetup(invalidExistingData));
    expect(screen.queryByText(INVALID_LINK)).toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).toBeInTheDocument();
    expect(screen.queryByText(INVALID_MOODLE_VERIFICATION)).toBeInTheDocument();
  });
  test('validates properly formatted existing data on load', () => {
    render(testMoodleConfigSetup(existingConfigData));
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_MOODLE_VERIFICATION)).not.toBeInTheDocument();
  });
});
