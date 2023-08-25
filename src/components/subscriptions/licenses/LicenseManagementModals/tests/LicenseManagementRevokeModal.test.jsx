import React from 'react';
import dayjs from 'dayjs';
import {
  screen,
  render,
  cleanup,
  act,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { logError } from '@edx/frontend-platform/logging';

import LicenseManagerApiService from '../../../../../data/services/LicenseManagerAPIService';
import LicenseManagementRevokeModal from '../LicenseManagementRevokeModal';
import { ASSIGNED } from '../../../data/constants';

jest.mock('../../../../../data/services/LicenseManagerAPIService', () => ({
  __esModule: true,
  default: {
    licenseRevokeAll: jest.fn(),
    licenseBulkRevoke: jest.fn(),
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
    expirationDate: dayjs().add(1, 'days').format(), // tomorrow
    isRevocationCapEnabled: false,
    revocations: {
      applied: 1,
      remaining: 0,
    },
  },
  usersToRevoke: [],
  revokeAllUsers: undefined,
  activeFilters: [],
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
      render(<LicenseManagementRevokeModal {...props} totalToRevoke={1} />);
      expect(screen.getByText('Revoke License'));
      expect(screen.getByText('Revoke (1)'));
    });
    it('revoking only more then 1 user', () => {
      const props = { ...basicProps, usersToRevoke: [sampleUser, sampleUser] };
      render(<LicenseManagementRevokeModal {...props} totalToRevoke={2} />);
      expect(screen.getByText('Revoke Licenses'));
      expect(screen.getByText('Revoke (2)'));
    });
    it('revoking all users', () => {
      const props = { ...basicProps, revokeAllUsers: true, totalToRevoke: null };
      render(<LicenseManagementRevokeModal {...props} />);
      expect(screen.getByText('Revoke Licenses'));
      expect(screen.getByText('Revoke all'));
    });
    it('revoking all users, with totalToRevoke provided', () => {
      const props = {
        ...basicProps,
        revokeAllUsers: true,
        totalToRevoke: 10,
      };
      render(<LicenseManagementRevokeModal {...props} />);
      expect(screen.getByText('Revoke Licenses'));
      expect(screen.getByText('Revoke (10)'));
    });
  });

  describe('when submit button is clicked', () => {
    it('displays done on submit', async () => {
      LicenseManagerApiService.licenseBulkRevoke.mockResolvedValue({ data: {} });
      const props = { ...basicProps, usersToRevoke: [sampleUser] };

      act(() => {
        render(<LicenseManagementRevokeModal {...props} totalToRevoke={1} />);
      });

      const button = screen.getByText('Revoke (1)');
      await act(async () => { userEvent.click(button); });
      expect(onSubmitMock).toBeCalledTimes(1);

      expect(screen.queryByText('Revoke (1)')).toBeFalsy();
      expect(screen.getByText('Done'));
      expect(logError).toBeCalledTimes(0);
    });
    it('displays alert if licenseBulkRevoke has error', async () => {
      LicenseManagerApiService.licenseBulkRevoke.mockRejectedValue(new Error('something went wrong'));
      const props = { ...basicProps, usersToRevoke: [sampleUser], totalToRevoke: 1 };

      act(() => {
        render(<LicenseManagementRevokeModal {...props} />);
      });

      const button = screen.getByText('Revoke (1)');
      await act(async () => { userEvent.click(button); });
      expect(onSubmitMock).toBeCalledTimes(1);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeTruthy();
      });
      expect(logError).toBeCalledTimes(1);
    });
    it('displays alert if licenseRevokeAll has error', async () => {
      LicenseManagerApiService.licenseRevokeAll.mockRejectedValue(new Error('something went wrong'));
      const props = { ...basicProps, revokeAllUsers: true, totalToRevoke: null };

      act(() => {
        render(<LicenseManagementRevokeModal {...props} />);
      });

      const button = screen.getByText('Revoke all');
      await act(async () => { userEvent.click(button); });
      expect(onSubmitMock).toBeCalledTimes(1);

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

  describe('calls the correct revoke endpoint', () => {
    beforeEach(() => {
      const mockPromiseResolve = Promise.resolve({ data: {} });
      LicenseManagerApiService.licenseRevokeAll.mockReturnValue(mockPromiseResolve);
      LicenseManagerApiService.licenseBulkRevoke.mockReturnValue(mockPromiseResolve);
    });

    it('calls licenseRevokeAll when revoking all users and there are no active filters', async () => {
      const props = {
        ...basicProps, revokeAllUsers: true, totalToRevoke: null, activeFilters: [],
      };

      act(() => {
        render(<LicenseManagementRevokeModal {...props} />);
      });

      const button = screen.getByText('Revoke all');
      await act(async () => { userEvent.click(button); });
      expect(LicenseManagerApiService.licenseRevokeAll).toHaveBeenCalled();
    });

    it('calls licenseBulkRevoke with emails when users are passed in', async () => {
      const props = {
        ...basicProps, usersToRevoke: [sampleUser], totalToRevoke: 1, activeFilters: [],
      };

      act(() => {
        render(<LicenseManagementRevokeModal {...props} />);
      });

      const button = screen.getByText('Revoke (1)');
      await act(async () => { userEvent.click(button); });
      expect(LicenseManagerApiService.licenseBulkRevoke).toHaveBeenCalledWith(
        props.subscription.uuid,
        {
          user_emails: [sampleUser.email],
        },
      );
    });

    it('calls licenseBulkRevoke with filters when revoking all users and filters are applied', async () => {
      const props = {
        ...basicProps,
        revokeAllUsers: true,
        totalToRevoke: null,
        activeFilters: [{
          name: 'statusBadge',
          filterValue: [ASSIGNED],
        }],
      };

      act(() => {
        render(<LicenseManagementRevokeModal {...props} />);
      });

      const button = screen.getByText('Revoke all');
      await act(async () => { userEvent.click(button); });
      expect(LicenseManagerApiService.licenseBulkRevoke).toHaveBeenCalledWith(
        props.subscription.uuid,
        {
          filters: [{
            name: 'status_in',
            filter_value: [ASSIGNED],
          }],
        },
      );
    });
  });
});
