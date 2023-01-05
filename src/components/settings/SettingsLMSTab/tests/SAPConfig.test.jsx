import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import SAPConfig from '../LMSConfigs/SAPConfig';
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
  displayName: 'foobar',
  sapsfBaseUrl: 'https://foobarish.com',
};
// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: 'fooooooooobaaaaaaaaar',
  sapsfBaseUrl: 'bad_url :^(',
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('<SAPConfig />', () => {
  test('renders SAP Config Form', () => {
    render(
      <SAPConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    screen.getByLabelText('Display Name');
    screen.getByLabelText('SAP Base URL');
    screen.getByLabelText('SAP Company ID');
    screen.getByLabelText('SAP User ID');
    screen.getByLabelText('OAuth Client ID');
    screen.getByLabelText('OAuth Client Secret');
    screen.getByLabelText('SAP User Type');
  });
  test('test button disable', () => {
    render(
      <SAPConfig
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
    // bad url, cannot be submitted
    fireEvent.change(screen.getByLabelText('SAP Base URL'), {
      target: { value: 'test2' },
    });
    fireEvent.change(screen.getByLabelText('SAP Company ID'), {
      target: { value: 'test3' },
    });
    fireEvent.change(screen.getByLabelText('SAP User ID'), {
      target: { value: 'test4' },
    });
    fireEvent.change(screen.getByLabelText('OAuth Client ID'), {
      target: { value: 'test5' },
    });
    fireEvent.change(screen.getByLabelText('OAuth Client Secret'), {
      target: { value: 'test6' },
    });
    // don't have to change userType, will default to user
    expect(screen.getByText('Submit')).toBeDisabled();
    expect(screen.queryByText(INVALID_NAME));
    expect(screen.queryByText(INVALID_LINK));
    fireEvent.change(screen.getByLabelText('SAP Base URL'), {
      target: { value: 'https://test2.com' },
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'test2' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
  test('it edits existing configs on submit', () => {
    render(
      <SAPConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigData}
        existingConfigs={existingConfigDisplayNames}
      />,
    );
    fireEvent.change(screen.getByLabelText('SAP Company ID'), {
      target: { value: 'test3' },
    });
    fireEvent.change(screen.getByLabelText('SAP User ID'), {
      target: { value: 'test4' },
    });
    fireEvent.change(screen.getByLabelText('OAuth Client ID'), {
      target: { value: 'test5' },
    });
    fireEvent.change(screen.getByLabelText('OAuth Client Secret'), {
      target: { value: 'test6' },
    });
    fireEvent.change(screen.getByLabelText('SAP Base URL'), {
      target: { value: 'https://www.test.com' },
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
    userEvent.click(screen.getByText('Submit'));

    const expectedConfig = {
      sapsf_base_url: 'https://www.test.com',
      sapsf_company_id: 'test3',
      sapsf_user_id: 'test4',
      secret: 'test6',
      key: 'test5',
      user_type: 'admin',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.updateSuccessFactorsConfig).toHaveBeenCalledWith(expectedConfig, 1);
  });
  test('it creates new configs on submit', () => {
    render(
      <SAPConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    fireEvent.change(screen.getByLabelText('SAP Company ID'), {
      target: { value: 'test3' },
    });
    fireEvent.change(screen.getByLabelText('SAP User ID'), {
      target: { value: 'test4' },
    });
    fireEvent.change(screen.getByLabelText('OAuth Client ID'), {
      target: { value: 'test5' },
    });
    fireEvent.change(screen.getByLabelText('OAuth Client Secret'), {
      target: { value: 'test6' },
    });
    fireEvent.change(screen.getByLabelText('SAP Base URL'), {
      target: { value: 'https://www.test.com' },
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
    userEvent.click(screen.getByText('Submit'));

    const expectedConfig = {
      active: false,
      sapsf_base_url: 'https://www.test.com',
      sapsf_company_id: 'test3',
      sapsf_user_id: 'test4',
      secret: 'test6',
      key: 'test5',
      user_type: 'admin',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.postNewSuccessFactorsConfig).toHaveBeenCalledWith(expectedConfig);
  });
  test('saves draft correctly', () => {
    render(
      <SAPConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
      />,
    );
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    userEvent.click(screen.getByText('Cancel'));
    userEvent.click(screen.getByText('Save'));
    const expectedConfig = {
      active: false,
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
      user_type: 'admin',
    };
    expect(LmsApiService.postNewSuccessFactorsConfig).toHaveBeenCalledWith(expectedConfig);
  });
  test('validates poorly formatted existing data on load', () => {
    render(
      <SAPConfig
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
      <SAPConfig
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
