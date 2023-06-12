import React from 'react';
import {
  screen,
  render,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SettingsAccessGenerateLinkButton from '../SettingsAccessGenerateLinkButton';
import LmsApiService from '../../../../data/services/LmsApiService';

jest.mock('../../../../data/services/LmsApiService', () => ({
  __esModule: true,
  default: {
    createEnterpriseCustomerLink: jest.fn(),
  },
}));

const ENTERPRISE_ID = 'test-enterprise';

describe('<SettingsAccessGenerateLinkButton />', () => {
  const basicProps = {
    enterpriseUUID: ENTERPRISE_ID,
    disabled: false,
    onSuccess: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('displays default state', () => {
    render(<SettingsAccessGenerateLinkButton {...basicProps} />);
    expect(screen.queryByText('Generate link')).toBeTruthy();
  });

  it('is disabled if disabled = true', () => {
    render(<SettingsAccessGenerateLinkButton {...basicProps} disabled />);
    const button = screen.queryByText('Generate link').closest('button');
    expect(button).toBeTruthy();
    expect(button).toHaveProperty('disabled', true);
  });

  it('clicking button calls api', async () => {
    const mockHandleSuccess = jest.fn();
    render(<SettingsAccessGenerateLinkButton {...basicProps} onSuccess={mockHandleSuccess} />);
    const mockPromiseResolve = Promise.resolve({ data: {} });
    LmsApiService.createEnterpriseCustomerLink.mockReturnValue(mockPromiseResolve);
    const button = screen.getByText('Generate link');
    await act(async () => { userEvent.click(button); });
    expect(LmsApiService.createEnterpriseCustomerLink).toHaveBeenCalledTimes(1);

    expect(LmsApiService.createEnterpriseCustomerLink).toHaveBeenCalledWith(
      ENTERPRISE_ID,
    );
    expect(mockHandleSuccess).toHaveBeenCalledTimes(1);
  });
});
