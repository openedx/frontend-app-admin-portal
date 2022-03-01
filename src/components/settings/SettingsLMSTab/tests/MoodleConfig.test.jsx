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
const noExistingData = {};
const existingConfigData = {
  id: 1,
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
});
