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
const noExistingData = {};
const existingConfigData = {
  id: 1,
};

describe('<DegreedConfig />', () => {
  test('renders Degreed Config Form', () => {
    render(
      <DegreedConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
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
    expect(LmsApiService.updateDegreedConfig).toHaveBeenCalledWith(expectedConfig, 1);
  });
  test('it creates new configs on submit', () => {
    render(
      <DegreedConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
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
});
