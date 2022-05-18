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
const noConfigs = [];
const existingConfig = [
  {
    displayName: 'test ayylmao',
  }];
const existingConfigInvalid = [
  {
    displayName: 'fooooooooobaaaaaaaaar',
  }];
const noExistingData = {};
const existingConfigData = {
  id: 1,
  displayName: 'test ayylmao',
  degreedBaseUrl: 'https://foobar.com',
  degreedFetchUrl: 'https://foobar.com',
};
// Existing invalid data that will be validated on load
const invalidExistingData = {
  displayName: 'fooooooooobaaaaaaaaar',
  degreedBaseUrl: 'bad_url :^(',
  degreedFetchUrl: '',
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('<Degreed2Config />', () => {
  test('renders Degreed2 Config Form', () => {
    render(
      <Degreed2Config
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={noExistingData}
        existingConfigs={noConfigs}
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
    fireEvent.change(screen.getByLabelText('Degreed Base URL'), {
      target: { value: 'test4' },
    });
    fireEvent.change(screen.getByLabelText('Degreed Token Fetch Base Url'), {
      target: { value: 'test5' },
    });
    expect(screen.getByText('Submit')).toBeDisabled();
    expect(screen.queryByText(INVALID_NAME));
    const linkText = screen.queryAllByText(INVALID_LINK);
    expect(linkText.length).toBe(2);

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
    fireEvent.change(screen.getByLabelText('Degreed Base URL'), {
      target: { value: 'https://test2.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });
  test('it edits existing configs on submit', () => {
    render(
      <Degreed2Config
        enterpriseCustomerUuid={enterpriseId}
        onClick={mockOnClick}
        existingData={existingConfigData}
        existingConfigs={existingConfig}
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
    fireEvent.change(screen.getByLabelText('Degreed Token Fetch Base Url'), {
      target: { value: 'https://test2.com' },
    });
    expect(screen.getByText('Submit')).not.toBeDisabled();
    fireEvent.click(screen.getByText('Submit'));

    const expectedConfig = {
      degreed_base_url: 'https://test1.com',
      degreed_fetch_url: 'https://test2.com',
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
        existingConfigs={noConfigs}
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
    expect(LmsApiService.postNewDegreed2Config).toHaveBeenCalledWith(expectedConfig);
  });
  test('validates poorly formatted existing data on load', () => {
    render(
      <Degreed2Config
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
      <Degreed2Config
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
