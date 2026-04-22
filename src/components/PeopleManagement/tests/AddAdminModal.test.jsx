import React from 'react';
import {
  act, render, screen, waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { axe } from 'jest-axe';
import AddAdminModal from '../AddAdminModal';
import LmsApiService from '../../../data/services/LmsApiService';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

jest.mock('../../../data/services/LmsApiService');
jest.mock('@edx/frontend-platform/logging');

const messages = {
  'adminPortal.peopleManagement.addAdmin.modal.title': 'Invite Admins',
  'adminPortal.peopleManagement.addAdmin.modal.emailLabel': 'Enter email address',
  'adminPortal.peopleManagement.addAdmin.modal.helperText.maxCount': 'Maximum invite at a time: 10 emails',
  'adminPortal.peopleManagement.addAdmin.modal.helperText.perLine': 'To add more than one member, enter one email address per line.',
  'adminPortal.peopleManagement.addAdmin.modal.cancel': 'Cancel',
  'adminPortal.peopleManagement.addAdmin.modal.submit': 'Invite',
  'adminPortal.peopleManagement.addAdmin.modal.submitting': 'Inviting...',
  'adminPortal.peopleManagement.addAdmin.modal.success': 'Invited!',
  'adminPortal.peopleManagement.addAdmin.modal.error': 'Try again',
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
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AddAdminModalWrapper />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
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
      expect(screen.getByText('Maximum invite at a time: 10 emails')).toBeInTheDocument();
      expect(screen.getByText('To add more than one member, enter one email address per line.')).toBeInTheDocument();
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

      await waitFor(() => {
        expect(screen.getByText('invalid-email is not a valid email.')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('closes modal immediately on successful invite', async () => {
      const user = userEvent.setup();
      const mockOnClose = jest.fn();
      const mockOnSuccess = jest.fn();
      const mockResponse = {
        status: 200,
        data: [{ email: 'admin@example.com', status: 'invite sent' }],
      };
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue(mockResponse);

      render(<AddAdminModalWrapper {...defaultProps} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');
      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Email Input Validation', () => {
    it('invite button is disabled when no email is entered', () => {
      render(<AddAdminModalWrapper {...defaultProps} />);

      const inviteButton = screen.getByText('Invite').closest('button');
      expect(inviteButton).toBeDisabled();
    });

    it('shows real-time validation error as user types invalid email', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'invalid-email');

      await waitFor(() => {
        expect(screen.getByText('invalid-email is not a valid email.')).toBeInTheDocument();
      });

      const inviteButton = screen.getByText('Invite').closest('button');
      expect(inviteButton).toBeDisabled();
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

    it('shows real-time error when more than 10 emails are entered', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const emails = Array.from({ length: 11 }, (_, i) => `admin${i + 1}@example.com`);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, emails.join('\n'));

      await waitFor(() => {
        expect(screen.getByText('11 emails entered (10 maximum). Delete 1 email to proceed.')).toBeInTheDocument();
      });

      const inviteButton = screen.getByText('Invite').closest('button');
      expect(inviteButton).toBeDisabled();
      expect(LmsApiService.inviteEnterpriseAdmin).not.toHaveBeenCalled();
    });

    it('shows real-time error for duplicate emails', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com\nadmin@example.com');

      await waitFor(() => {
        const elements = screen.getAllByText((content, element) => element?.textContent === 'admin@example.com was entered more than once.');
        expect(elements.length).toBeGreaterThan(0);
      });

      const inviteButton = screen.getByText('Invite').closest('button');
      expect(inviteButton).toBeDisabled();
      expect(LmsApiService.inviteEnterpriseAdmin).not.toHaveBeenCalled();
    });

    it('shows real-time error for case-insensitive duplicate emails', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com\nAdmin@Example.COM');

      await waitFor(() => {
        const elements = screen.getAllByText((content, element) => element?.textContent === 'Admin@Example.COM was entered more than once.');
        expect(elements.length).toBeGreaterThan(0);
      });

      const inviteButton = screen.getByText('Invite').closest('button');
      expect(inviteButton).toBeDisabled();
      expect(LmsApiService.inviteEnterpriseAdmin).not.toHaveBeenCalled();
    });

    it('trims leading/trailing spaces from emails before validation', async () => {
      const user = userEvent.setup();
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue({ status: 200 });
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, '  admin@example.com  ');

      const inviteButton = screen.getByText('Invite');
      expect(inviteButton.closest('button')).not.toBeDisabled();
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

    it('clears error message when user corrects invalid email', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'invalid-email');

      await waitFor(() => {
        expect(screen.getByText('invalid-email is not a valid email.')).toBeInTheDocument();
      });

      await user.clear(textarea);
      await user.type(textarea, 'admin@example.com');

      await waitFor(() => {
        expect(screen.queryByText('invalid-email is not a valid email.')).not.toBeInTheDocument();
      });
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

    it('calls onSuccess and closes modal after successful invitation', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();
      const mockOnClose = jest.fn();
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue({ status: 200, data: 'Success' });
      render(<AddAdminModalWrapper {...defaultProps} onSuccess={mockOnSuccess} onClose={mockOnClose} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('calls onSuccess with API response and closes modal immediately', async () => {
      const user = userEvent.setup();
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
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
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

    it('closes modal and calls onSuccess for multi-email invite', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();
      const mockOnClose = jest.fn();
      const mockResponse = {
        status: 200,
        data: [
          { email: 'test1@test.com', status: 'already sent' },
          { email: 'test2@test.com', status: 'invite sent' },
        ],
      };
      LmsApiService.inviteEnterpriseAdmin.mockResolvedValue(mockResponse);

      render(<AddAdminModalWrapper {...defaultProps} onSuccess={mockOnSuccess} onClose={mockOnClose} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test1@test.com\ntest2@test.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse);
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('calls onError and closes modal when API call fails', async () => {
      const user = userEvent.setup();
      const mockOnError = jest.fn();
      const mockOnClose = jest.fn();
      const error = new Error('Failed to invite admin');
      LmsApiService.inviteEnterpriseAdmin.mockRejectedValue(error);

      render(<AddAdminModalWrapper {...defaultProps} onError={mockOnError} onClose={mockOnClose} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(error);
        expect(mockOnClose).toHaveBeenCalled();
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
  });

  describe('Button State Management', () => {
    it('button is in default state initially', () => {
      render(<AddAdminModalWrapper {...defaultProps} />);

      expect(screen.getByText('Invite')).toBeInTheDocument();
    });

    it('invite button is disabled when error message is showing', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'invalid-email');

      await waitFor(() => {
        expect(screen.getByText('invalid-email is not a valid email.')).toBeInTheDocument();
      });

      const inviteButton = screen.getByText('Invite').closest('button');
      expect(inviteButton).toBeDisabled();
    });

    it('invite button is enabled when valid email is entered', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite').closest('button');
      expect(inviteButton).not.toBeDisabled();
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

      await waitFor(() => {
        expect(screen.getByText('invalid-email is not a valid email.')).toBeInTheDocument();
      });

      const inviteButton = screen.getByText('Invite').closest('button');
      expect(inviteButton).toBeDisabled();
      expect(LmsApiService.inviteEnterpriseAdmin).not.toHaveBeenCalled();
    });

    it('clears error when input becomes whitespace-only lines', async () => {
      const user = userEvent.setup();
      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'invalid-email');

      await waitFor(() => {
        expect(screen.getByText('invalid-email is not a valid email.')).toBeInTheDocument();
      });

      await user.clear(textarea);
      await user.type(textarea, '   ');

      await waitFor(() => {
        expect(screen.queryByText(/is not a valid email/)).not.toBeInTheDocument();
      });
    });

    it('does not call API again while submission is pending', async () => {
      const user = userEvent.setup();
      let resolvePromise;
      const promise = new Promise((resolve) => { resolvePromise = resolve; });
      LmsApiService.inviteEnterpriseAdmin.mockReturnValue(promise);

      render(<AddAdminModalWrapper {...defaultProps} />);

      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'admin@example.com');

      const inviteButton = screen.getByText('Invite');
      await user.click(inviteButton);

      const pendingButton = await screen.findByRole('button', { name: /inviting/i });

      // Try clicking again while pending - should not call API again
      await user.click(pendingButton);
      expect(LmsApiService.inviteEnterpriseAdmin).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolvePromise({ status: 200 });
      });
    });
  });
});
