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
import moment from 'moment';

import LicenseManagerApiService from '../../../../../data/services/LicenseManagerAPIService';
import LicenseManagementRevokeModal from '../LicenseManagementRevokeModal';

jest.mock('../../../../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true,
  default: {
    licenseRevokeAll: jest.fn(),
    licenseBulkRevoke: jest.fn(),
  },
}));

const basicProps = {
  isOpen: true,
  onClose: () => {},
  onSuccess: () => {},
  subscription: {
    uuid: 'lorem',
    expirationDate: moment().add(1, 'days').format(), // tomorrow
    isRevocationCapEnabled: false,
    revocations: {
      applied: 1,
      remaining: 0,
    },
  },
  usersToRevoke: [],
  revokeAllUsers: undefined,
  totalToRevoke: undefined,
};

const sampleUser = {
  email: 'foo@bar.io',
};

describe('<LicenseManagementRevokeModal />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders when isOpen', () => {
    render(<LicenseManagementRevokeModal {...basicProps} />);
    expect(screen.queryByRole('dialog')).toBeTruthy();
  });

  describe('submit button and title displays right text when ', () => {
    it('revoking only 1 user', () => {
      const props = { ...basicProps, usersToRevoke: [sampleUser] };
      render(<LicenseManagementRevokeModal {...props} />);
      expect(screen.queryByText('Revoke License')).toBeTruthy();
      expect(screen.queryByText('Revoke (1)')).toBeTruthy();
    });
    it('revoking only more then 1 user', () => {
      const props = { ...basicProps, usersToRevoke: [sampleUser, sampleUser] };
      render(<LicenseManagementRevokeModal {...props} />);
      expect(screen.queryByText('Revoke Licenses')).toBeTruthy();
      expect(screen.queryByText('Revoke (2)')).toBeTruthy();
    });
    it('revoking all users', () => {
      const props = { ...basicProps, revokeAllUsers: true };
      render(<LicenseManagementRevokeModal {...props} />);
      expect(screen.queryByText('Revoke Licenses')).toBeTruthy();
      expect(screen.queryByText('Revoke (All)')).toBeTruthy();
    });
    it('revoking all users, with totalToRevoke provided', () => {
      const props = {
        ...basicProps,
        revokeAllUsers: true,
        totalToRevoke: 10,
      };
      render(<LicenseManagementRevokeModal {...props} />);
      expect(screen.queryByText('Revoke Licenses')).toBeTruthy();
      expect(screen.queryByText('Revoke (10)')).toBeTruthy();
    });
  });

  describe('when submit button is clicked', () => {
    it('displays done on submit', async () => {
      const mockPromiseResolve = Promise.resolve({ data: {} });
      LicenseManagerApiService.licenseBulkRevoke.mockReturnValue(mockPromiseResolve);
      const props = { ...basicProps, usersToRevoke: [sampleUser] };

      act(() => {
        render(<LicenseManagementRevokeModal {...props} />);
      });

      const button = screen.getByText('Revoke (1)');
      await act(async () => { userEvent.click(button); });

      expect(screen.queryByText('Revoke (1)')).toBeFalsy();
      expect(screen.queryByText('Done')).toBeTruthy();
      expect(logError).toBeCalledTimes(0);
    });

    it('displays alert if licenseBulkRevoke has error', async () => {
      const mockPromiseReject = Promise.reject(new Error('something went wrong'));
      LicenseManagerApiService.licenseBulkRevoke.mockReturnValue(mockPromiseReject);
      const props = { ...basicProps, usersToRevoke: [sampleUser] };

      act(() => {
        render(<LicenseManagementRevokeModal {...props} />);
      });

      const button = screen.getByText('Revoke (1)');
      await act(async () => { userEvent.click(button); });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeTruthy();
      });
      expect(logError).toBeCalledTimes(1);
    });
    it('displays alert if licenseRevokeAll has error', async () => {
      const mockPromiseReject = Promise.reject(new Error('something went wrong'));
      LicenseManagerApiService.licenseRevokeAll.mockReturnValue(mockPromiseReject);
      const props = { ...basicProps, revokeAllUsers: true };

      act(() => {
        render(<LicenseManagementRevokeModal {...props} />);
      });

      const button = screen.getByText('Revoke (All)');
      await act(async () => { userEvent.click(button); });

      // await act(() => mockPromiseReject)
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeTruthy();
      });
      expect(logError).toBeCalledTimes(1);
    });
  });

  describe('when revocation cap is enabled ', () => {
    it('should display alert when there are 0 remaining revocations', () => {
      const props = {
        ...basicProps,
        usersToRevoke: [sampleUser],
        subscription: {
          ...basicProps.subscription,
          isRevocationCapEnabled: true,
        },
      };
      render(<LicenseManagementRevokeModal {...props} />);
      expect(screen.getByRole('alert')).toBeTruthy();
    });
  });
});
