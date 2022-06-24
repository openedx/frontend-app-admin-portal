import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import MoodleConfig from '../LMSConfigs/MoodleConfig';
import { INVALID_LINK, INVALID_NAME } from '../../data/constants';
import LmsApiService from '../../../../data/services/LmsApiService';

jest.mock('../../../../data/services/LmsApiService');

const enterpriseId = 'test-enterprise-id';
const mockOnClick = jest.fn();
const noConfigs = [];
const existingConfigDisplayNames = ['name'];
const existingConfigDisplayNamesInvalid = ['foobar'];
const noExistingData = {};
const existingConfigData = {
  id: 1,
  moodleBaseUrl: 'https://foobarish.com',
  displayName: 'foobar',
};
// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: 'fooooooooobaaaaaaaaar',
  moodleBaseUrl: 'bad_url :^(',
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('<MoodleConfig />', () => {
  test('renders Moodle Config Form', () => {
    render(
      <MoodleConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    screen.getByLabelText('Display Name');
    screen.getByLabelText('Moodle Base URL');
    screen.getByLabelText('Webservice Short Name');
  });
  test('test button disable', () => {
    render(
      <MoodleConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    expect(screen.getByText('Submit')).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'reallyreallyreallyreallyreallylongname' },
    });
    fireEvent.change(screen.getByLabelText('Moodle Base URL'), {
      target: { value: 'test1' },
    });
    fireEvent.change(screen.getByLabelText('Webservice Short Name'), {
      target: { value: 'test2' },
    });
    expect(screen.queryByText(INVALID_NAME));
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.getByText('Submit')).toBeDisabled();

    // duplicate display name not able to be submitted
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'name' },
    });
    expect(screen.queryByText(INVALID_NAME));

    fireEvent.change(screen.getByLabelText('Moodle Base URL'), {
      target: { value: 'https://test1.com' },
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'test2' },
    });
    fireEvent.change(screen.getByLabelText('Token'), {
      target: { value: 'token111' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
  test('it edits existing configs on submit', () => {
    render(
      <MoodleConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigData}
        existingConfigs={existingConfigDisplayNames}
      />,
    );
    fireEvent.change(screen.getByLabelText('Moodle Base URL'), {
      target: { value: 'https://www.test1.com' },
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    fireEvent.change(screen.getByLabelText('Webservice Short Name'), {
      target: { value: 'test2' },
    });
    fireEvent.change(screen.getByLabelText('Token'), {
      target: { value: 'token111' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
    fireEvent.click(screen.getByText('Submit'));

    const expectedConfig = {
      moodle_base_url: 'https://www.test1.com',
      service_short_name: 'test2',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
      token: 'token111',
    };
    expect(LmsApiService.updateMoodleConfig).toHaveBeenCalledWith(expectedConfig, 1);
  });
  test('it creates new configs on submit', () => {
    render(
      <MoodleConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    fireEvent.change(screen.getByLabelText('Moodle Base URL'), {
      target: { value: 'https://www.test1.com' },
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    fireEvent.change(screen.getByLabelText('Webservice Short Name'), {
      target: { value: 'test2' },
    });
    fireEvent.change(screen.getByLabelText('Token'), {
      target: { value: 'token111' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
    fireEvent.click(screen.getByText('Submit'));

    const expectedConfig = {
      active: false,
      moodle_base_url: 'https://www.test1.com',
      service_short_name: 'test2',
      display_name: 'displayName',
      token: 'token111',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.postNewMoodleConfig).toHaveBeenCalledWith(expectedConfig);
  });
  test('saves draft correctly', () => {
    render(
      <MoodleConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    fireEvent.click(screen.getByText('Cancel'));
    fireEvent.click(screen.getByText('Save'));
    const expectedConfig = {
      active: false,
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.postNewMoodleConfig).toHaveBeenCalledWith(expectedConfig);
  });
  test('validates poorly formatted existing data on load', () => {
    render(
      <MoodleConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={invalidExistingData}
        existingConfigs={existingConfigDisplayNamesInvalid}
      />,
    );
    expect(screen.getByText(INVALID_LINK)).toBeInTheDocument();
    expect(screen.getByText(INVALID_NAME)).toBeInTheDocument();
  });
  test('validates properly formatted existing data on load', () => {
    render(
      <MoodleConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigData}
        existingConfigs={existingConfigDisplayNames}
      />,
    );
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });
});
