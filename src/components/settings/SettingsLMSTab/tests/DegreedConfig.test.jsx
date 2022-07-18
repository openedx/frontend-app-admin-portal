import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import DegreedConfig from '../LMSConfigs/DegreedConfig';
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
  displayName: 'test ayylmao',
  degreedBaseUrl: 'https://foobar.com',
};
// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: 'fooooooooobaaaaaaaaar',
  degreedBaseUrl: 'bad_url :^(',
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('<DegreedConfig />', () => {
  test('renders Degreed Config Form', () => {
    render(
      <DegreedConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    screen.getByLabelText('Display Name');
    screen.getByLabelText('API Client ID');
    screen.getByLabelText('API Client Secret');
    screen.getByLabelText('Degreed Organization Code');
    screen.getByLabelText('Degreed Base URL');
    screen.getByLabelText('Degreed User ID');
    screen.getByLabelText('Degreed User Password');
  });
  test('test button disable', () => {
    render(
      <DegreedConfig
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
    fireEvent.change(screen.getByLabelText('API Client ID'), {
      target: { value: 'test1' },
    });
    fireEvent.change(screen.getByLabelText('API Client Secret'), {
      target: { value: 'test2' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Organization Code'), {
      target: { value: 'test3' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Base URL'), {
      target: { value: 'test4' },
    });
    fireEvent.change(screen.getByLabelText('Degreed User ID'), {
      target: { value: 'test5' },
    });
    fireEvent.change(screen.getByLabelText('Degreed User Password'), {
      target: { value: 'test5' },
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
    fireEvent.change(screen.getByLabelText('Degreed Base URL'), {
      target: { value: 'https://test1.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
  test('it edits existing configs on submit', () => {
    render(
      <DegreedConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigData}
        existingConfigs={existingConfigDisplayNames}
      />,
    );
    fireEvent.change(screen.getByLabelText('API Client ID'), {
      target: { value: 'test1' },
    });
    fireEvent.change(screen.getByLabelText('API Client Secret'), {
      target: { value: 'test2' },
    });
    fireEvent.change(screen.getByLabelText('Degreed User ID'), {
      target: { value: 'test5' },
    });
    fireEvent.change(screen.getByLabelText('Degreed User Password'), {
      target: { value: 'test5' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Organization Code'), {
      target: { value: 'test3' },
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Base URL'), {
      target: { value: 'https://test1.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
    fireEvent.click(screen.getByText('Submit'));

    const expectedConfig = {
      degreed_base_url: 'https://test1.com',
      degreed_company_id: 'test3',
      degreed_user_id: 'test5',
      degreed_user_password: 'test5',
      display_name: 'displayName',
      key: 'test1',
      secret: 'test2',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.updateDegreedConfig).toHaveBeenCalledWith(expectedConfig, 1);
  });
  test('it creates new configs on submit', () => {
    render(
      <DegreedConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    fireEvent.change(screen.getByLabelText('API Client ID'), {
      target: { value: 'test1' },
    });
    fireEvent.change(screen.getByLabelText('API Client Secret'), {
      target: { value: 'test2' },
    });
    fireEvent.change(screen.getByLabelText('Degreed User ID'), {
      target: { value: 'test5' },
    });
    fireEvent.change(screen.getByLabelText('Degreed User Password'), {
      target: { value: 'test5' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Organization Code'), {
      target: { value: 'test3' },
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Base URL'), {
      target: { value: 'https://test1.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
    fireEvent.click(screen.getByText('Submit'));

    const expectedConfig = {
      active: false,
      degreed_base_url: 'https://test1.com',
      degreed_company_id: 'test3',
      degreed_user_id: 'test5',
      degreed_user_password: 'test5',
      display_name: 'displayName',
      key: 'test1',
      secret: 'test2',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.postNewDegreedConfig).toHaveBeenCalledWith(expectedConfig);
  });
  test('saves draft correctly', () => {
    render(
      <DegreedConfig
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
    expect(LmsApiService.postNewDegreedConfig).toHaveBeenCalledWith(expectedConfig);
  });
  test('validates poorly formatted existing data on load', () => {
    render(
      <DegreedConfig
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
      <DegreedConfig
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
