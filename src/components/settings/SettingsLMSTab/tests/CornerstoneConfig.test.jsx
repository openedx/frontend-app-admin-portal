import React from 'react';
import {
  act, render, fireEvent, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { INVALID_LINK, INVALID_NAME } from '../../data/constants';
// @ts-ignore
import CornerstoneConfig from '../LMSConfigs/Cornerstone/CornerstoneConfig.tsx';
// @ts-ignore
import FormContextWrapper from '../../../forms/FormContextWrapper.tsx';

const enterpriseId = 'test-enterprise-id';
const mockOnClick = jest.fn();
// Freshly creating a config will have an empty existing data object
const noExistingData = {};

const existingConfigData = {
  id: 1,
  displayName: 'foobar',
  cornerstoneBaseUrl: 'https://example.com',
};

// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: 'john jacob jinglehiemer schmidt',
  cornerstoneBaseUrl: 'its 2023 you know what a link looks like',
};

const noConfigs = [];

afterEach(() => {
  jest.clearAllMocks();
});

const mockSetExistingConfigFormData = jest.fn();
const mockPost = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

function testCornerstoneConfigSetup(formData) {
  return (
    <FormContextWrapper
      formWorkflowConfig={CornerstoneConfig({
        enterpriseCustomerUuid: enterpriseId,
        onSubmit: mockSetExistingConfigFormData,
        handleCloseClick: mockOnClick,
        existingData: formData,
        existingConfigNames: [],
        channelMap: {
          CSOD: {
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
    fireEvent.change(screen.getByLabelText('Cornerstone Base URL'), {
      target: { value: '' },
    });
  });
}

describe('<CornerstoneConfig />', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  test('renders Cornerstone Enable Form', () => {
    render(testCornerstoneConfigSetup(noConfigs));
    screen.getByLabelText('Display Name');
    screen.getByLabelText('Cornerstone Base URL');
  });
  test('test button disable', async () => {
    render(testCornerstoneConfigSetup(noExistingData));

    const enableButton = screen.getByRole('button', { name: 'Enable' });
    await clearForm();
    expect(enableButton).toBeDisabled();

    userEvent.type(screen.getByLabelText('Display Name'), 'terriblenogoodverybaddisplayname');
    userEvent.type(screen.getByLabelText('Cornerstone Base URL'), 'badlink');
    expect(enableButton).toBeDisabled();
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));

    await clearForm();
    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(
      screen.getByLabelText('Cornerstone Base URL'),
      'https://www.test4.com',
    );
    expect(enableButton).not.toBeDisabled();
  });
  test('it creates new configs on submit', async () => {
    render(testCornerstoneConfigSetup(noExistingData));
    const enableButton = screen.getByRole('button', { name: 'Enable' });

    await clearForm();

    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Cornerstone Base URL'), 'https://www.test.com');
    await waitFor(() => expect(enableButton).not.toBeDisabled());

    userEvent.click(enableButton);
    const expectedConfig = {
      active: false,
      display_name: 'displayName',
      cornerstone_base_url: 'https://www.test.com',
      enterprise_customer: enterpriseId,
    };
    await waitFor(() => expect(mockPost).toHaveBeenCalledWith(expectedConfig));
  });
  test('saves draft correctly', async () => {
    render(testCornerstoneConfigSetup(noExistingData));
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await clearForm();

    userEvent.type(screen.getByLabelText('Display Name'), 'displayName');
    userEvent.type(screen.getByLabelText('Cornerstone Base URL'), 'https://www.test.com');
    expect(cancelButton).not.toBeDisabled();
    userEvent.click(cancelButton);

    await waitFor(() => expect(screen.getByText('Exit configuration')).toBeInTheDocument());
    const closeButton = screen.getByRole('button', { name: 'Exit' });

    userEvent.click(closeButton);
    const expectedConfig = {
      active: false,
      display_name: 'displayName',
      cornerstone_base_url: 'https://www.test.com',
      enterprise_customer: enterpriseId,
    };
    expect(mockPost).toHaveBeenCalledWith(expectedConfig);
  });
  test('validates poorly formatted existing data on load', async () => {
    render(testCornerstoneConfigSetup(invalidExistingData));
    expect(screen.queryByText(INVALID_LINK)).toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).toBeInTheDocument();
  });
  test('validates properly formatted existing data on load', () => {
    render(testCornerstoneConfigSetup(existingConfigData));
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });
});
