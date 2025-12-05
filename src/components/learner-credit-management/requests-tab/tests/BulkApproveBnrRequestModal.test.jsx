import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import BulkApproveBnrRequestModal from '../BulkApproveBnrRequestModal';
import { BudgetDetailPageContext } from '../../BudgetDetailPageWrapper';

const mockDisplayToastForBulkApproval = jest.fn();

const defaultContextValue = {
  successfulBulkApprovalToast: {
    displayToastForBulkApproval: mockDisplayToastForBulkApproval,
  },
};

const defaultProps = {
  approveButtonState: 'default',
  approveBnrRequests: jest.fn(),
  close: jest.fn(),
  isOpen: true,
  requestCount: 1,
};

const renderWithProviders = (ui, { contextValue = defaultContextValue } = {}) => render(
  <IntlProvider locale="en">
    <BudgetDetailPageContext.Provider value={contextValue}>
      {ui}
    </BudgetDetailPageContext.Provider>
  </IntlProvider>,
);

describe('BulkApproveBnrRequestModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when isOpen is true', () => {
    renderWithProviders(<BulkApproveBnrRequestModal {...defaultProps} />);

    expect(screen.getByText(/approve enrollment request\?/i)).toBeInTheDocument();
    expect(screen.getByText(/approving an enrollment request cannot be undone/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    renderWithProviders(<BulkApproveBnrRequestModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText(/approve enrollment request\?/i)).not.toBeInTheDocument();
  });

  it('renders plural text for multiple requests', () => {
    renderWithProviders(<BulkApproveBnrRequestModal {...defaultProps} requestCount={5} />);

    expect(screen.getByText(/approve enrollment requests\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /approve \(5\)/i })).toBeInTheDocument();
  });

  it('calls approveBnrRequests and displays toast on success', async () => {
    const mockApproveBnrRequests = jest.fn().mockResolvedValue({});
    const mockClose = jest.fn();

    renderWithProviders(
      <BulkApproveBnrRequestModal
        {...defaultProps}
        approveBnrRequests={mockApproveBnrRequests}
        close={mockClose}
        requestCount={3}
      />,
    );

    const approveButton = screen.getByRole('button', { name: /approve \(3\)/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(mockApproveBnrRequests).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockDisplayToastForBulkApproval).toHaveBeenCalledWith(3);
    });

    await waitFor(() => {
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it('displays error alert when approveBnrRequests fails', async () => {
    const mockApproveBnrRequests = jest.fn().mockRejectedValue(new Error('API Error'));

    renderWithProviders(
      <BulkApproveBnrRequestModal
        {...defaultProps}
        approveBnrRequests={mockApproveBnrRequests}
      />,
    );

    const approveButton = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByTestId('bulk-approve-request-modal-alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/please try again/i)).toBeInTheDocument();
  });

  it('clears error and closes modal when close button is clicked after error', async () => {
    const mockApproveBnrRequests = jest.fn().mockRejectedValue(new Error('API Error'));
    const mockClose = jest.fn();

    renderWithProviders(
      <BulkApproveBnrRequestModal
        {...defaultProps}
        approveBnrRequests={mockApproveBnrRequests}
        close={mockClose}
      />,
    );

    // Trigger error
    const approveButton = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(screen.getByTestId('bulk-approve-request-modal-alert')).toBeInTheDocument();
    });

    // Click cancel to close
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockClose).toHaveBeenCalled();
  });

  it('displays pending state while approving', async () => {
    const mockApproveBnrRequests = jest.fn(() => new Promise(() => {})); // Never resolves

    renderWithProviders(
      <BulkApproveBnrRequestModal
        {...defaultProps}
        approveBnrRequests={mockApproveBnrRequests}
        approveButtonState="pending"
      />,
    );

    expect(screen.getByRole('button', { name: /approving/i })).toBeInTheDocument();
  });

  it('displays error button state for retry', () => {
    renderWithProviders(
      <BulkApproveBnrRequestModal
        {...defaultProps}
        approveButtonState="error"
      />,
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('displays complete button state after success', () => {
    renderWithProviders(
      <BulkApproveBnrRequestModal
        {...defaultProps}
        approveButtonState="complete"
      />,
    );

    expect(screen.getByRole('button', { name: /approved/i })).toBeInTheDocument();
  });
});
