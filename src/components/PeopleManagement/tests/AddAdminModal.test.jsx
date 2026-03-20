import React from 'react';
import {
  act, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import AddAdminModal from '../AddAdminModal';
import LmsApiService from '../../../data/services/LmsApiService';

jest.mock('../../../data/services/LmsApiService');
jest.mock('@edx/frontend-platform/logging');

const messages = {
  'adminPortal.peopleManagement.addAdmin.modal.title': 'Invite Admins',
  'adminPortal.peopleManagement.addAdmin.modal.emailLabel': 'Enter email address',
  'adminPortal.peopleManagement.addAdmin.modal.helperText': 'Maximum invite at a time: 10 emails. To add more than one member, enter one email address per line.',
  'adminPortal.peopleManagement.addAdmin.modal.cancel': 'Cancel',
  'adminPortal.peopleManagement.addAdmin.modal.submit': 'Invite',
  'adminPortal.peopleManagement.addAdmin.modal.submitting': 'Inviting...',
  'adminPortal.peopleManagement.addAdmin.modal.success': 'Invited!',
  'adminPortal.peopleManagement.addAdmin.modal.error': 'Try again',
  'adminPortal.peopleManagement.addAdmin.modal.error.noEmail': 'Please add at least one email address.',
  'adminPortal.peopleManagement.addAdmin.modal.error.tooManyEmails': '{enteredCount} emails entered ({maxCount} maximum). Delete {extraCount} {extraCount, plural, one {email} other {emails}} to proceed.',
  'adminPortal.peopleManagement.addAdmin.modal.error.invalidEmail': '{email} is not a valid email.',
  'adminPortal.peopleManagement.addAdmin.modal.error.duplicateEmails': '{email}{otherCount, plural, =0 { was entered more than once.} one { and # other email address was entered more than once.} other { and # other email addresses were entered more than once.}}',
  'adminPortal.peopleManagement.addAdmin.modal.error.inviteFailed': 'Failed to invite admins.',
  'adminPortal.peopleManagement.addAdmin.modal.successTitle': 'Invitation Results',
  'adminPortal.peopleManagement.addAdmin.modal.successMessage': 'Admins invited successfully!',
};

const AddAdminModalWrapper = (props) => (
  <IntlProvider locale="en" messages={messages}>
    <AddAdminModal {...props} />
  </IntlProvider>
);

describe('<AddAdminModal />', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    enterpriseId: 'test-enterprise-id',
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Modal Rendering', () => {
    it('renders modal when isOpen is true', () => {
      render(<AddAdminModalWrapper {...defaultProps} />);

      expect(screen.getByText('Invite Admins')).toBeInTheDocument();
      expect(screen.getByText('Enter email address')).toBeInTheDocument();
      expect(screen.getByText('Maximum invite at a time: 10 emails. To add more than one member, enter one email address per line.')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      render(<AddAdminModalWrapper {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Invite Admins')).not.toBeInTheDocument();
    });

    it('renders Cancel and Invite buttons', () => {
      render(<AddAdminModalWrapper {...defaultProps} />);

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Invite')).toBeInTheDocument();
    });

    it('renders textarea for email input', () => {
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveAttribute('rows', '6');
    });
  });

  describe('Modal Close Functionality', () => {
    it('calls onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      render(<AddAdminModalWrapper {...defaultProps} onClose={mockOnClose} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('resets form state when modal is closed', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      render(<AddAdminModalWrapper {...defaultProps} onClose={mockOnClose} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'invalid-email');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('invalid-email is not a valid email.')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('resets success message when modal is closed', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const mockOnClose = jest.fn();
      const mockResponse = {
        status: 200,
        data: [{ email: 'admin@example.com', status: 'invite sent' }],
      };
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue(mockResponse);

      const { rerender } = render(<AddAdminModalWrapper {...defaultProps} onClose={mockOnClose} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');
      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Invitation Results')).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });

      rerender(<AddAdminModalWrapper {...defaultProps} isOpen onClose={mockOnClose} />);

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.queryByText('Invitation Results')).not.toBeInTheDocument();

      jest.useRealTimers();
    });
  });

  describe('Email Input Validation', () => {
    it('shows error when no email is entered', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Please add at least one email address.')).toBeInTheDocument();
      });
    });

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'invalid-email');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('invalid-email is not a valid email.')).toBeInTheDocument();
      });
    });

    it('accepts valid single email', async () => {
      const user = userEvent.setup();
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue({ status: 200 });
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(LmsApiService.inviteEnterpriseAdmin).toHaveBeenCalledWith(
          'test-enterprise-id',
          { emails: ['admin@example.com'] },
        );
      });
    });

    it('accepts multiple valid emails (one per line)', async () => {
      const user = userEvent.setup();
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue({ status: 200 });
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin1@example.com\nadmin2@example.com\nadmin3@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(LmsApiService.inviteEnterpriseAdmin).toHaveBeenCalledWith(
          'test-enterprise-id',
          { emails: ['admin1@example.com', 'admin2@example.com', 'admin3@example.com'] },
        );
      });
    });

    it('shows error when more than 10 emails are entered', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const emails = Array.from({ length: 11 }, (_, i) => `admin${i + 1}@example.com`);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, emails.join('\n'));

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('11 emails entered (10 maximum). Delete 1 email to proceed.')).toBeInTheDocument();
      });

      expect(LmsApiService.inviteEnterpriseAdmin).not.toHaveBeenCalled();
    });

    it('shows error for duplicate emails', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com\nadmin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('admin@example.com was entered more than once.')).toBeInTheDocument();
      });

      expect(LmsApiService.inviteEnterpriseAdmin).not.toHaveBeenCalled();
    });

    it('trims whitespace from emails', async () => {
      const user = userEvent.setup();
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue({ status: 200 });
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '  admin@example.com  ');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(LmsApiService.inviteEnterpriseAdmin).toHaveBeenCalledWith(
          'test-enterprise-id',
          { emails: ['admin@example.com'] },
        );
      });
    });

    it('ignores empty lines between emails', async () => {
      const user = userEvent.setup();
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue({ status: 200 });
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin1@example.com\n\n\nadmin2@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(LmsApiService.inviteEnterpriseAdmin).toHaveBeenCalledWith(
          'test-enterprise-id',
          { emails: ['admin1@example.com', 'admin2@example.com'] },
        );
      });
    });

    it('clears error message when user types in textarea', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Please add at least one email address.')).toBeInTheDocument();
      });

      await user.type(textarea, 'admin@example.com');

      expect(screen.queryByText('Please add at least one email address.')).not.toBeInTheDocument();
    });
  });

  describe('Successful Invitation', () => {
    it('shows pending state during API call', async () => {
      const user = userEvent.setup();
      const promise = new Promise(() => {});
      LmsApiService.inviteEnterpriseAdmin.mockReturnValue(promise);

      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Inviting...')).toBeInTheDocument();
      });
    });

    it('shows complete state after successful invitation', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue({ status: 200, data: 'Success' });
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Admins invited successfully!')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('calls onSuccess with API response and closes modal after successful invitation', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const mockOnSuccess = jest.fn();
      const mockOnClose = jest.fn();
      const mockResponse = {
        status: 200,
        data: {
          message: 'Admins invited successfully',
          invited_admins: ['admin@example.com'],
        },
      };
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue(mockResponse);

      render(<AddAdminModalWrapper {...defaultProps} onSuccess={mockOnSuccess} onClose={mockOnClose} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Invitation Results')).toBeInTheDocument();
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });

      jest.useRealTimers();
    });

    it('sends all emails in a single API request', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const mockResponse = {
        status: 200,
        data: {
          message: 'Successfully invited 3 admins',
          invited_admins: ['admin1@example.com', 'admin2@example.com', 'admin3@example.com'],
        },
      };
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue(mockResponse);

      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin1@example.com\nadmin2@example.com\nadmin3@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(LmsApiService.inviteEnterpriseAdmin).toHaveBeenCalledTimes(1);
        expect(LmsApiService.inviteEnterpriseAdmin).toHaveBeenCalledWith(
          'test-enterprise-id',
          { emails: ['admin1@example.com', 'admin2@example.com', 'admin3@example.com'] },
        );
      });

      jest.useRealTimers();
    });

    it('displays detailed success message with email statuses', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const mockResponse = {
        status: 200,
        data: [
          { email: 'test1@test.com', status: 'already sent' },
          { email: 'test2@test.com', status: 'invite sent' },
        ],
      };
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue(mockResponse);

      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test1@test.com\ntest2@test.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Invitation Results')).toBeInTheDocument();
        expect(screen.getByText('test1@test.com')).toBeInTheDocument();
        expect(screen.getByText('test2@test.com')).toBeInTheDocument();
        expect(screen.getByText('already sent')).toBeInTheDocument();
        expect(screen.getByText('invite sent')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });

    it('hides form and buttons when showing success message', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const mockResponse = {
        status: 200,
        data: [{ email: 'admin@example.com', status: 'invite sent' }],
      };
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue(mockResponse);

      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Invitation Results')).toBeInTheDocument();
      });

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

      jest.useRealTimers();
    });

    it('displays fallback message for non-array response', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });
      const mockResponse = {
        status: 200,
        data: 'Success',
      };
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue(mockResponse);

      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Admins invited successfully!')).toBeInTheDocument();
      });

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('shows error state when API call fails', async () => {
      const user = userEvent.setup();
      const error = new Error('Failed to invite admin');
      LmsApiService.inviteEnterpriseAdmin.mockRejectedValue(error);

      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Try again')).toBeInTheDocument();
      });
    });

    it('displays API error message', async () => {
      const user = userEvent.setup();
      const error = new Error('Admin already exists');
      LmsApiService.inviteEnterpriseAdmin.mockRejectedValue(error);

      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Admin already exists')).toBeInTheDocument();
      });
    });

    it('logs error when API call fails', async () => {
      const user = userEvent.setup();
      const error = new Error('API Error');
      LmsApiService.inviteEnterpriseAdmin.mockRejectedValue(error);

      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(logError).toHaveBeenCalledWith(error);
      });
    });

    it('shows default error message when no error message is provided', async () => {
      const user = userEvent.setup();
      const error = new Error();
      error.message = '';
      LmsApiService.inviteEnterpriseAdmin.mockRejectedValue(error);

      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to invite admins.')).toBeInTheDocument();
      });
    });

    it('allows retry after error', async () => {
      const user = userEvent.setup();
      LmsApiService.inviteEnterpriseAdmin
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ status: 200 });

      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Try again')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Try again');
      await user.click(retryButton);

      await waitFor(() => {
        expect(LmsApiService.inviteEnterpriseAdmin).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Button State Management', () => {
    it('button is in default state initially', () => {
      render(<AddAdminModalWrapper {...defaultProps} />);

      expect(screen.getByText('Invite')).toBeInTheDocument();
    });

    it('disables form during submission', async () => {
      const user = userEvent.setup();
      const promise = new Promise(() => {});
      LmsApiService.inviteEnterpriseAdmin.mockReturnValue(promise);

      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('Inviting...')).toBeInTheDocument();
      });

      const pendingButton = screen.getByText('Inviting...');
      expect(pendingButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles emails with special characters', async () => {
      const user = userEvent.setup();
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue({ status: 200 });
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin+test@example-domain.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(LmsApiService.inviteEnterpriseAdmin).toHaveBeenCalledWith(
          'test-enterprise-id',
          { emails: ['admin+test@example-domain.com'] },
        );
      });
    });

    it('validates emails with multiple dots in domain', async () => {
      const user = userEvent.setup();
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue({ status: 200 });
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@subdomain.example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(LmsApiService.inviteEnterpriseAdmin).toHaveBeenCalledWith(
          'test-enterprise-id',
          { emails: ['admin@subdomain.example.com'] },
        );
      });
    });

    it('rejects email without @ symbol', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'adminexample.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('adminexample.com is not a valid email.')).toBeInTheDocument();
      });
    });

    it('rejects email without domain', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('admin@ is not a valid email.')).toBeInTheDocument();
      });
    });

    it('handles exactly 10 emails (boundary case)', async () => {
      const user = userEvent.setup();
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue({ status: 200 });
      render(<AddAdminModalWrapper {...defaultProps} />);

      const emails = Array.from({ length: 10 }, (_, i) => `admin${i + 1}@example.com`);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, emails.join('\n'));

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(LmsApiService.inviteEnterpriseAdmin).toHaveBeenCalledWith(
          'test-enterprise-id',
          { emails },
        );
      });
    });

    it('handles mixed valid and invalid emails', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'valid@example.com\ninvalid-email\nanother@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText('invalid-email is not a valid email.')).toBeInTheDocument();
      });

      expect(LmsApiService.inviteEnterpriseAdmin).not.toHaveBeenCalled();
    });
  });
});
