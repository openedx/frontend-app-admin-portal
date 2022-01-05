import React from 'react';
import {
  screen,
  render,
  cleanup,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import moment from 'moment';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import SettingsContextProvider from '../../SettingsContext';
import SettingsAccessGenerateLinkButton from '../SettingsAccessGenerateLinkButton';
import * as hooks from '../../data/hooks';
import LmsApiService from '../../../../data/services/LmsApiService';

jest.mock('../../../../data/services/LmsApiService', () => ({
  __esModule: true,
  default: {
    createEnterpriseCustomerLink: jest.fn(),
  },
}));

const onSuccessMock = jest.fn();

const ENTERPRISE_ID = 'test-enterprise';
const mockStore = configureMockStore();
const store = mockStore({
  portalConfiguration: {
    enterpriseId: ENTERPRISE_ID,
  },
});
const NET_DAYS_UNTIL_EXPIRATION = 100;
const renderWithContext = (loadingCustomerAgreement = false) => {
  jest.spyOn(hooks, 'useCustomerAgreementData').mockImplementation(
    () => ({
      customerAgreement: { netDaysUntilExpiration: NET_DAYS_UNTIL_EXPIRATION },
      loadingCustomerAgreement,
    }),
  );
  return (
    <Provider store={store}>
      <SettingsContextProvider>
        <SettingsAccessGenerateLinkButton onSuccess={onSuccessMock} />
      </SettingsContextProvider>
    </Provider>
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
  it('Is disable when loadingCustomerAgreement', () => {
    render(renderWithContext(true));
    const button = screen.queryByText('Generate link').closest('button');
    expect(button).toBeTruthy();
    expect(button).toHaveProperty('disabled', true);
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
    expect(onSuccessMock).toHaveBeenCalledTimes(1);
  });
});
