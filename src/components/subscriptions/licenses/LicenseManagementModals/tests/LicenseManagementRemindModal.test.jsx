import React from 'react';
import {
  screen,
  render,
  cleanup,
  act,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { logError } from '@edx/frontend-platform/logging';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import moment from 'moment';

import LicenseManagerApiService from '../../../../../data/services/LicenseManagerAPIService';
import LicenseManagementRemindModal from '../LicenseManagementRemindModal';

const mockStore = configureMockStore();
const store = mockStore({
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
  },
});
jest.mock('../../../../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true,
  default: {
    licenseRemind: jest.fn(),
  },
}));

const onSubmitMock = jest.fn();
const basicProps = {
  isOpen: true,
  onClose: () => {},
  onSuccess: () => {},
  onSubmit: onSubmitMock,
  subscription: {
    uuid: 'lorem',
    expirationDate: moment().add(1, 'days').format(), // tomorrow
  },
  usersToRemind: [],
  remindAllUsers: undefined,
  totalToRemind: undefined,
};

const sampleUser = {
  email: 'foo@bar.io',
};

const LicenseManagementRemindModalWithStore = (props) => (
  <Provider store={store}>
    <LicenseManagementRemindModal {...props} />
  </Provider>
);

describe('<LicenseManagementRemindModal />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders when isOpen', () => {
    render(LicenseManagementRemindModalWithStore(basicProps));
    expect(screen.queryByRole('dialog')).toBeTruthy();
  });

  describe('submit button and title displays right text when ', () => {
    it('reminding only 1 user', () => {
      const props = { ...basicProps, usersToRemind: [sampleUser] };
      render(LicenseManagementRemindModalWithStore({ ...props }));
      expect(screen.queryByText('Remind User')).toBeTruthy();
      expect(screen.queryByText('Remind (1)')).toBeTruthy();
    });
    it('reminding only more then 1 user', () => {
      const props = { ...basicProps, usersToRemind: [sampleUser, sampleUser] };
      render(LicenseManagementRemindModalWithStore({ ...props }));
      expect(screen.queryByText('Remind Users')).toBeTruthy();
      expect(screen.queryByText('Remind (2)')).toBeTruthy();
    });
    it('reminding all users', () => {
      const props = { ...basicProps, remindAllUsers: true };
      render(LicenseManagementRemindModalWithStore({ ...props }));
      expect(screen.queryByText('Remind Users')).toBeTruthy();
      expect(screen.queryByText('Remind (All)')).toBeTruthy();
    });
    it('reminding all users, with totalToRemind provided', () => {
      const props = {
        ...basicProps,
        remindAllUsers: true,
        totalToRemind: 10,
      };
      render(LicenseManagementRemindModalWithStore({ ...props }));
      expect(screen.queryByText('Remind Users')).toBeTruthy();
      expect(screen.queryByText('Remind (10)')).toBeTruthy();
    });
  });

  describe('when submit button is clicked', () => {
    it('displays done on submit', async () => {
      const mockPromiseResolve = Promise.resolve({ data: {} });
      LicenseManagerApiService.licenseRemind.mockReturnValue(mockPromiseResolve);
      const props = { ...basicProps, usersToRemind: [sampleUser] };

      act(() => {
        render(LicenseManagementRemindModalWithStore({ ...props }));
      });

      const button = screen.getByText('Remind (1)');
      await act(async () => { userEvent.click(button); });
      expect(onSubmitMock).toBeCalledTimes(1);

      expect(screen.queryByText('Remind (1)')).toBeFalsy();
      expect(screen.queryByText('Done')).toBeTruthy();
      expect(logError).toBeCalledTimes(0);
    });

    it('displays alert if licenseRemind has error', async () => {
      const mockPromiseReject = Promise.reject(new Error('something went wrong'));
      LicenseManagerApiService.licenseRemind.mockReturnValue(mockPromiseReject);
      const props = { ...basicProps, usersToRemind: [sampleUser] };

      act(() => {
        render(LicenseManagementRemindModalWithStore({ ...props }));
      });

      const button = screen.getByText('Remind (1)');
      await act(async () => { userEvent.click(button); });
      expect(onSubmitMock).toBeCalledTimes(1);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeTruthy();
      });
      expect(logError).toBeCalledTimes(1);
    });
  });
});
