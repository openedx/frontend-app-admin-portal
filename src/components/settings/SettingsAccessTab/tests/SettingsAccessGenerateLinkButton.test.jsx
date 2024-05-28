import React from 'react';
import {
  screen,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SettingsAccessGenerateLinkButton from '../SettingsAccessGenerateLinkButton';
import LmsApiService from '../../../../data/services/LmsApiService';
import { renderWithI18nProvider } from '../../../test/testUtils';

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
    renderWithI18nProvider(<SettingsAccessGenerateLinkButton {...basicProps} />);
    expect(screen.queryByText('Generate link')).toBeTruthy();
  });

  it('is disabled if disabled = true', () => {
    renderWithI18nProvider(<SettingsAccessGenerateLinkButton {...basicProps} disabled />);
    const button = screen.queryByText('Generate link').closest('button');
    expect(button).toBeTruthy();
    expect(button).toHaveProperty('disabled', true);
  });

  it('clicking button calls api', async () => {
    const mockHandleSuccess = jest.fn();
    renderWithI18nProvider(<SettingsAccessGenerateLinkButton {...basicProps} onSuccess={mockHandleSuccess} />);
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
