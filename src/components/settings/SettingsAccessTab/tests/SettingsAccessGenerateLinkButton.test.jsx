import React from 'react';
import {
  screen,
  render,
  cleanup,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';

import ContextProvider from '../../SettingsContext';
import SettingsAccessGenerateLinkButton from '../SettingsAccessGenerateLinkButton';
import * as hooks from '../../data/hooks';
import LmsApiService from '../../../../data/services/LmsApiService';

jest.mock('../../../../data/services/LmsApiService', () => ({
  __esModule: true,
  default: {
    createEnterpriseCustomerLink: jest.fn(),
  },
}));

const ENTERPRISE_ID = 'test-enterprise';
const NET_DAYS_UNTIL_EXPIRATION = 100;
const renderWithContext = (loadingCustomerAgreement = false) => {
  jest.spyOn(hooks, 'useCustomerAgreementData').mockImplementation(
    () => ({
      customerAgreement: { netDaysUntilExpiration: NET_DAYS_UNTIL_EXPIRATION },
      loadingCustomerAgreement,
    }),
  );
  return (
    <ContextProvider enterpriseId={ENTERPRISE_ID}>
      <SettingsAccessGenerateLinkButton onSuccess={() => {}} />
    </ContextProvider>
  );
};

describe('<SettingsAccessGenerateLinkButton />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('Displays default state', () => {
    render(renderWithContext());
    expect(screen.queryByText('Generate link')).toBeTruthy();
  });

  it('Displays loading state', () => {
    render(renderWithContext(true));
    expect(screen.queryByText('Readying link generation')).toBeTruthy();
  });

  it('Clicking button calls api', async () => {
    render(renderWithContext());
    const mockPromiseResolve = Promise.resolve({ data: {} });
    LmsApiService.createEnterpriseCustomerLink.mockReturnValue(mockPromiseResolve);
    const button = screen.getByText('Generate link');
    await act(async () => { userEvent.click(button); });
    expect(LmsApiService.createEnterpriseCustomerLink).toHaveBeenCalledTimes(1);

    expect(LmsApiService.createEnterpriseCustomerLink).toHaveBeenCalledWith(
      ENTERPRISE_ID,
      moment().add(NET_DAYS_UNTIL_EXPIRATION, 'days').startOf('day').format(),
    );
  });
});
