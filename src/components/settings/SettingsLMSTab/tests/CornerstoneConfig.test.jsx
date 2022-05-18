import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import CornerstoneConfig from '../LMSConfigs/CornerstoneConfig';
import { INVALID_LINK, INVALID_NAME } from '../../data/constants';
import LmsApiService from '../../../../data/services/LmsApiService';

jest.mock('../../../../data/services/LmsApiService');

const enterpriseId = 'test-enterprise-id';

const mockOnClick = jest.fn();
const noConfigs = [];
const existingConfig = [
  {
    displayName: 'name',
  }];
const existingConfigInvalid = [
  {
    displayName: 'fooooooooobaaaaaaaaar',
  }];
const noExistingData = {};
// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: 'fooooooooobaaaaaaaaar',
  cornerstoneBaseUrl: 'bad_url :^(',
};
const existingConfigData = {
  id: 1,
  cornerstoneBaseUrl: 'https://foobar.com',
  displayName: 'test display name',
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('<CornerstoneConfig />', () => {
  test('renders Cornerstone Config Form', () => {
    render(
      <CornerstoneConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    screen.getByLabelText('Display Name');
    screen.getByLabelText('Cornerstone Base URL');
  });
  test('test button disable', () => {
    render(
      <CornerstoneConfig
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
    // bad url not able to be submitted
    fireEvent.change(screen.getByLabelText('Cornerstone Base URL'), {
      target: { value: 'test1' },
    });
    expect(screen.getByText('Submit')).toBeDisabled();
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    // duplicate display name not able to be submitted
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'name' },
    });
    expect(screen.queryByText(INVALID_NAME));

    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'test1' },
    });
    fireEvent.change(screen.getByLabelText('Cornerstone Base URL'), {
      target: { value: 'https://www.test1.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
  test('it edits existing configs on submit', () => {
    render(
      <CornerstoneConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigData}
        existingConfigs={existingConfig}
      />,
    );
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    fireEvent.change(screen.getByLabelText('Cornerstone Base URL'), {
      target: { value: 'https://www.test1.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
    fireEvent.click(screen.getByText('Submit'));

    const expectedConfig = {
      cornerstone_base_url: 'https://www.test1.com',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.updateCornerstoneConfig).toHaveBeenCalledWith(expectedConfig, 1);
  });
  test('it creates new configs on submit', () => {
    render(
      <CornerstoneConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    fireEvent.change(screen.getByLabelText('Cornerstone Base URL'), {
      target: { value: 'https://www.test1.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
    fireEvent.click(screen.getByText('Submit'));

    const expectedConfig = {
      active: false,
      cornerstone_base_url: 'https://www.test1.com',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.postNewCornerstoneConfig).toHaveBeenCalledWith(expectedConfig);
  });
  test('saves draft correctly', () => {
    render(
      <CornerstoneConfig
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
    expect(LmsApiService.postNewCornerstoneConfig).toHaveBeenCalledWith(expectedConfig);
  });
  test('validates poorly formatted existing data on load', () => {
    render(
      <CornerstoneConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={invalidExistingData}
        existingConfigs={existingConfigInvalid}
      />,
    );
    expect(screen.getByText(INVALID_LINK)).toBeInTheDocument();
    expect(screen.getByText(INVALID_NAME)).toBeInTheDocument();
  });
  test('validates properly formatted existing data on load', () => {
    render(
      <CornerstoneConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigData}
        existingConfigs={existingConfig}
      />,
    );
    expect(screen.queryByText(INVALID_LINK)).not.toBeInTheDocument();
    expect(screen.queryByText(INVALID_NAME)).not.toBeInTheDocument();
  });
});
