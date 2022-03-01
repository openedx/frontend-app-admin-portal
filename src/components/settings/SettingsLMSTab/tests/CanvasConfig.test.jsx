import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import CanvasConfig from '../LMSConfigs/CanvasConfig';
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

describe('<CanvasConfig />', () => {
  test('renders Canvas Config Form', () => {
    render(
      <CanvasConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
      />,
    );
    screen.getByLabelText('Display Name');
    screen.getByLabelText('API Client ID');
    screen.getByLabelText('API Client Secret');
    screen.getByLabelText('Canvas Account Number');
    screen.getByLabelText('Canvas Base URL');
  });
  test('test button disable', () => {
    render(
      <CanvasConfig
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
    fireEvent.change(screen.getByLabelText('Canvas Account Number'), {
      target: { value: '3' },
    });
    // bad url is not able to be submitted
    fireEvent.change(screen.getByLabelText('Canvas Base URL'), {
      target: { value: 'test4' },
    });
    expect(screen.getByText('Submit')).toBeDisabled();
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    fireEvent.change(screen.getByLabelText('Canvas Base URL'), {
      target: { value: 'https://www.test4.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
  test('it edits existing configs on submit', () => {
    render(
      <CanvasConfig
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
    fireEvent.change(screen.getByLabelText('Canvas Account Number'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    fireEvent.change(screen.getByLabelText('Canvas Base URL'), {
      target: { value: 'https://www.test4.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
    fireEvent.click(screen.getByText('Submit'));

    const expectedConfig = {
      active: false,
      canvas_base_url: 'https://www.test4.com',
      canvas_account_id: '3',
      client_id: 'test1',
      client_secret: 'test2',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.updateCanvasConfig).toHaveBeenCalledWith(expectedConfig, 1);
  });
  test('it creates new configs on submit', () => {
    render(
      <CanvasConfig
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
    fireEvent.change(screen.getByLabelText('Canvas Account Number'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    fireEvent.change(screen.getByLabelText('Canvas Base URL'), {
      target: { value: 'https://www.test4.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
    fireEvent.click(screen.getByText('Submit'));

    const expectedConfig = {
      active: false,
      canvas_base_url: 'https://www.test4.com',
      canvas_account_id: '3',
      client_id: 'test1',
      client_secret: 'test2',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.postNewCanvasConfig).toHaveBeenCalledWith(expectedConfig);
  });
  test('saves draft correctly', () => {
    render(
      <CanvasConfig
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
    expect(LmsApiService.postNewCanvasConfig).toHaveBeenCalledWith(expectedConfig);
  });
});
