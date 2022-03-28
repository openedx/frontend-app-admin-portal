import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Degreed2Config from '../LMSConfigs/Degreed2Config';
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

describe('<DegreedConfig />', () => {
  test('renders Degreed Config Form', () => {
    render(
      <Degreed2Config
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
      />,
    );
    screen.getByLabelText('Display Name');
    screen.getByLabelText('API Client ID');
    screen.getByLabelText('API Client Secret');
    screen.getByLabelText('Degreed Base URL');
  });
  test('test button disable', () => {
    render(
      <Degreed2Config
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
    fireEvent.change(screen.getByLabelText('Degreed Base URL'), {
      target: { value: 'test4' },
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
      <Degreed2Config
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
      display_name: 'displayName',
      client_id: 'test1',
      client_secret: 'test2',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.updateDegreed2Config).toHaveBeenCalledWith(expectedConfig, 1);
  });
  test('it creates new configs on submit', () => {
    render(
      <Degreed2Config
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
      display_name: 'displayName',
      client_id: 'test1',
      client_secret: 'test2',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.postNewDegreed2Config).toHaveBeenCalledWith(expectedConfig);
  });
  test('saves draft correctly', () => {
    render(
      <Degreed2Config
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
    expect(LmsApiService.postNewDegreed2Config).toHaveBeenCalledWith(expectedConfig);
  });
});
