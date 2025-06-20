import React from 'react';
import dayjs from 'dayjs';
import {
  cleanup, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { logError } from '@edx/frontend-platform/logging';

import { IntlProvider } from '@edx/frontend-platform/i18n';
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
const onSuccessMock = jest.fn();

const basicProps = {
  isOpen: true,
  onClose: () => {},
  onSuccess: onSuccessMock,
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

const LicenseManagementRevokeModalWrapper = (props) => (
  <IntlProvider locale="en">
    <LicenseManagementRevokeModal {...props} />
  </IntlProvider>
);

describe('<LicenseManagementRevokeModal />', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders when isOpen', () => {
    render(<LicenseManagementRevokeModalWrapper {...basicProps} />);
    expect(screen.queryByRole('dialog')).toBeTruthy();
  });

  describe('submit button and title displays right text when ', () => {
    it('revoking only 1 user', () => {
      const props = { ...basicProps, usersToRevoke: [sampleUser] };
      render(<LicenseManagementRevokeModalWrapper {...props} totalToRevoke={1} />);
      expect(screen.getByText('Revoke License'));
      expect(screen.getByText('Revoke (1)'));
    });
    it('revoking only more then 1 user', () => {
      const props = { ...basicProps, usersToRevoke: [sampleUser, sampleUser] };
      render(<LicenseManagementRevokeModalWrapper {...props} totalToRevoke={2} />);
      expect(screen.getByText('Revoke Licenses'));
      expect(screen.getByText('Revoke (2)'));
    });
    it('revoking all users', () => {
      const props = { ...basicProps, revokeAllUsers: true, totalToRevoke: null };
      render(<LicenseManagementRevokeModalWrapper {...props} />);
      expect(screen.getByText('Revoke Licenses'));
      expect(screen.getByText('Revoke all'));
    });
    it('revoking all users, with totalToRevoke provided', () => {
      const props = {
        ...basicProps,
        revokeAllUsers: true,
        totalToRevoke: 10,
      };
      render(<LicenseManagementRevokeModalWrapper {...props} />);
      expect(screen.getByText('Revoke Licenses'));
      expect(screen.getByText('Revoke (10)'));
    });
  });

  describe('when submit button is clicked', () => {
    it('displays done on submit', async () => {
      const user = userEvent.setup();
      LicenseManagerApiService.licenseBulkRevoke.mockResolvedValue({ data: {} });
      const props = { ...basicProps, usersToRevoke: [sampleUser] };
      render(<LicenseManagementRevokeModalWrapper {...props} totalToRevoke={1} />);
      const button = screen.getByText('Revoke (1)');
      await user.click(button);
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSuccessMock).toHaveBeenCalledTimes(1);

      expect(screen.queryByText('Revoke (1)')).toBeFalsy();
      expect(screen.getByText('Done'));
      expect(logError).toHaveBeenCalledTimes(0);
    });
    it('displays alert if licenseBulkRevoke has error', async () => {
      const user = userEvent.setup();
      LicenseManagerApiService.licenseBulkRevoke.mockRejectedValue(new Error('something went wrong'));
      const props = { ...basicProps, usersToRevoke: [sampleUser], totalToRevoke: 1 };
      render(<LicenseManagementRevokeModalWrapper {...props} />);
      const button = screen.getByText('Revoke (1)');
      await user.click(button);
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSuccessMock).toHaveBeenCalledTimes(0);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeTruthy();
      });
      expect(logError).toHaveBeenCalledTimes(1);
    });

    describe('handles different bulk-revoke API response cases', () => {
      const props = { ...basicProps, usersToRevoke: [sampleUser], totalToRevoke: 1 };

      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('handles 200 success response correctly', async () => {
        const user = userEvent.setup();
        const mockSuccess200 = { status: 200, data: { success: true } };
        LicenseManagerApiService.licenseBulkRevoke.mockResolvedValue(mockSuccess200);
        render(<LicenseManagementRevokeModalWrapper {...props} />);
        await user.click(screen.getByText('Revoke (1)'));
        expect(onSuccessMock).toHaveBeenCalledTimes(1);
        expect(logError).toHaveBeenCalledTimes(0);
      });

      it('handles 400 error response correctly', async () => {
        const user = userEvent.setup();
        const mockError400 = { response: { status: 400, data: { unsuccessful_revocations: [{ error: 'Not found' }] } } };
        LicenseManagerApiService.licenseBulkRevoke.mockRejectedValue(mockError400);
        render(<LicenseManagementRevokeModalWrapper {...props} />);
        await user.click(screen.getByText('Revoke (1)'));
        expect(onSuccessMock).toHaveBeenCalledTimes(0);
        expect(logError).toHaveBeenCalledTimes(1);
      });

      it('handles 404 error response correctly', async () => {
        const user = userEvent.setup();
        const mockError404 = { response: { status: 404, data: { unsuccessful_revocations: [{ error: 'Not found' }] } } };
        LicenseManagerApiService.licenseBulkRevoke.mockRejectedValue(mockError404);
        render(<LicenseManagementRevokeModalWrapper {...props} />);
        await user.click(screen.getByText('Revoke (1)'));
        expect(onSuccessMock).toHaveBeenCalledTimes(0);
        expect(logError).toHaveBeenCalledTimes(1);
      });

      it('handles 207 partial success with only 404 errors correctly', async () => {
        const user = userEvent.setup();
        const mockPartialSuccess207WithOnly404 = {
          status: 207,
          data: {
            unsuccessful_revocations: [{ error_response_status: 404 }],
          },
        };
        LicenseManagerApiService.licenseBulkRevoke.mockResolvedValue(mockPartialSuccess207WithOnly404);
        render(<LicenseManagementRevokeModalWrapper {...props} />);
        await user.click(screen.getByText('Revoke (1)'));
        expect(onSuccessMock).toHaveBeenCalledTimes(1);
        expect(logError).toHaveBeenCalledTimes(0);
      });

      it('handles 207 partial success with mixed errors correctly', async () => {
        const user = userEvent.setup();
        const mockPartialSuccess207WithMixedErrors = {
          status: 207,
          data: {
            unsuccessful_revocations: [
              { error_response_status: 404 },
              { error_response_status: 400 },
            ],
            successful_revocations: [
              { license_uuid: 'license-uuid-1', original_status: 'assigned', user_email: 'user1@example.com' },
              { license_uuid: 'license-uuid-2', original_status: 'activated', user_email: 'user2@example.com' },
            ],
          },
        };
        LicenseManagerApiService.licenseBulkRevoke.mockResolvedValue(mockPartialSuccess207WithMixedErrors);
        render(<LicenseManagementRevokeModalWrapper {...props} />);
        await user.click(screen.getByText('Revoke (1)'));
        expect(onSuccessMock).toHaveBeenCalledTimes(0);
        expect(logError).toHaveBeenCalledTimes(1);
      });

      it('handles 207 partial success with 404 errors and successful revocations correctly', async () => {
        const user = userEvent.setup();
        const mockPartialSuccess207WithMixed404AndSuccess = {
          status: 207,
          data: {
            unsuccessful_revocations: [
              { error_response_status: 404, user_email: 'user1@example.com' },
              { error_response_status: 404, user_email: 'user2@example.com' },
            ],
            successful_revocations: [
              { license_uuid: 'license-uuid-3', original_status: 'assigned', user_email: 'user3@example.com' },
              { license_uuid: 'license-uuid-4', original_status: 'activated', user_email: 'user4@example.com' },
            ],
          },
        };
        LicenseManagerApiService.licenseBulkRevoke.mockResolvedValue(mockPartialSuccess207WithMixed404AndSuccess);
        render(<LicenseManagementRevokeModalWrapper {...props} />);
        await user.click(screen.getByText('Revoke (1)'));
        expect(onSuccessMock).toHaveBeenCalledTimes(1);
        expect(onSuccessMock).toHaveBeenCalledWith(mockPartialSuccess207WithMixed404AndSuccess.data);
        expect(logError).toHaveBeenCalledTimes(0);
      });
    });

    it('displays alert if licenseRevokeAll has error', async () => {
      const user = userEvent.setup();
      LicenseManagerApiService.licenseRevokeAll.mockRejectedValue(new Error('something went wrong'));
      const props = { ...basicProps, revokeAllUsers: true, totalToRevoke: null };
      render(<LicenseManagementRevokeModalWrapper {...props} />);
      const button = screen.getByText('Revoke all');
      await user.click(button);
      expect(onSubmitMock).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeTruthy();
      });
      expect(logError).toHaveBeenCalledTimes(1);
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
      render(<LicenseManagementRevokeModalWrapper {...props} />);
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
      const user = userEvent.setup();
      const props = {
        ...basicProps, revokeAllUsers: true, totalToRevoke: null, activeFilters: [],
      };
      render(<LicenseManagementRevokeModalWrapper {...props} />);
      const button = screen.getByText('Revoke all');
      await user.click(button);
      expect(LicenseManagerApiService.licenseRevokeAll).toHaveBeenCalled();
    });

    it('calls licenseBulkRevoke with emails when users are passed in', async () => {
      const user = userEvent.setup();
      const props = {
        ...basicProps, usersToRevoke: [sampleUser], totalToRevoke: 1, activeFilters: [],
      };
      render(<LicenseManagementRevokeModalWrapper {...props} />);
      const button = screen.getByText('Revoke (1)');
      await user.click(button);
      expect(LicenseManagerApiService.licenseBulkRevoke).toHaveBeenCalledWith(
        props.subscription.uuid,
        {
          user_emails: [sampleUser.email],
        },
      );
    });

    it('calls licenseBulkRevoke with filters when revoking all users and filters are applied', async () => {
      const user = userEvent.setup();
      const props = {
        ...basicProps,
        revokeAllUsers: true,
        usersToRevoke: [sampleUser],
        totalToRevoke: null,
        activeFilters: [{
          name: 'statusBadge',
          filterValue: [ASSIGNED],
        }],
      };
      render(<LicenseManagementRevokeModalWrapper {...props} />);
      const button = screen.getByText('Revoke all');
      await user.click(button);
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
