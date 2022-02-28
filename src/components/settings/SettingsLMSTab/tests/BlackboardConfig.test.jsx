import React from 'react';
import {
  render, fireEvent, screen,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import BlackboardConfig from '../LMSConfigs/BlackboardConfig';
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

describe('<BlackboardConfig />', () => {
  test('renders Blackboard Config Form', () => {
    render(
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
      />,
    );
    screen.getByLabelText('Display Name');
    screen.getByLabelText('API Client ID/Blackboard Application Key');
    screen.getByLabelText('API Client Secret/Application Secret');
    screen.getByLabelText('Blackboard Base URL');
  });
  test('test validation and button disable', () => {
    render(
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
      />,
    );
    expect(screen.getByText('Submit')).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'reallyreallyreallyreallyreallylongname' },
    });
    fireEvent.change(screen.getByLabelText('API Client ID/Blackboard Application Key'), {
      target: { value: 'test1' },
    });
    fireEvent.change(screen.getByLabelText('API Client Secret/Application Secret'), {
      target: { value: 'test2' },
    });
    // bad url is not able to be submitted
    fireEvent.change(screen.getByLabelText('Blackboard Base URL'), {
      target: { value: 'test3' },
    });
    expect(screen.getByText('Submit')).toBeDisabled();
    expect(screen.queryByText(INVALID_LINK));
    expect(screen.queryByText(INVALID_NAME));
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    fireEvent.change(screen.getByLabelText('Blackboard Base URL'), {
      target: { value: 'https://www.test.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
  test('it edits existing configs on submit', () => {
    render(
      <BlackboardConfig
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigData}
      />,
    );
    fireEvent.change(screen.getByLabelText('API Client ID/Blackboard Application Key'), {
      target: { value: 'test1' },
    });
    fireEvent.change(screen.getByLabelText('API Client Secret/Application Secret'), {
      target: { value: 'test2' },
    });
    fireEvent.change(screen.getByLabelText('Display Name'), {
      target: { value: 'displayName' },
    });
    fireEvent.change(screen.getByLabelText('Blackboard Base URL'), {
      target: { value: 'https://www.test.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
    fireEvent.click(screen.getByText('Submit'));

    const expectedConfig = {
      active: false,
      blackboard_base_url: 'https://www.test.com',
      client_id: 'test1',
      client_secret: 'test2',
      display_name: 'displayName',
      enterprise_customer: enterpriseId,
    };
    expect(LmsApiService.updateBlackboardConfig).toHaveBeenCalledWith(expectedConfig, 1);
  });
  test('saves draft correctly', () => {
    render(
      <BlackboardConfig
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
    expect(LmsApiService.postNewBlackboardConfig).toHaveBeenCalledWith(expectedConfig);
  });
});
