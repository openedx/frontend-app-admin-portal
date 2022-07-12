import React from 'react';
import {
  screen,
  render,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import { logError } from '@edx/frontend-platform/logging';

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
    formattedLinkExpirationDate: moment().format(),
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

  it('throws an error if trying to generate a link and formattedLinkExpirationDate = null', async () => {
    render(<SettingsAccessGenerateLinkButton {...basicProps} formattedLinkExpirationDate={null} />);
    const button = screen.queryByText('Generate link').closest('button');
    await act(async () => { userEvent.click(button); });
    expect(LmsApiService.createEnterpriseCustomerLink).toHaveBeenCalledTimes(0);
    expect(logError).toHaveBeenCalledWith(new Error('Attempted to generate universal link without an expiration date'));
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
      basicProps.formattedLinkExpirationDate,
    );
    expect(mockHandleSuccess).toHaveBeenCalledTimes(1);
  });
});
