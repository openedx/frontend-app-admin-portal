import React from 'react';
import {
  render, screen, fireEvent, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { axe } from 'jest-axe';
import BulkDeclineBnrRequestModal from '../BulkDeclineBnrRequestModal';
import { BudgetDetailPageContext } from '../../BudgetDetailPageWrapper';
import { accessibilitySettings } from '../../../../../tests/accessibility-settings';

const mockDisplayToastForBulkDecline = jest.fn();

const defaultContextValue = {
  successfulBulkDeclineToast: {
    displayToastForBulkDecline: mockDisplayToastForBulkDecline,
  },
};

const defaultProps = {
  declineButtonState: 'default',
  declineBnrRequests: jest.fn(),
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

describe('BulkDeclineBnrRequestModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<BulkDeclineBnrRequestModal {...defaultProps} />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders modal when isOpen is true', () => {
    renderWithProviders(<BulkDeclineBnrRequestModal {...defaultProps} />);

    expect(screen.getByText(/decline enrollment request\?/i)).toBeInTheDocument();
    expect(screen.getByText(/declining an enrollment request cannot be undone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reason for declining/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('does not render modal when isOpen is false', () => {
    renderWithProviders(<BulkDeclineBnrRequestModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText(/decline enrollment request\?/i)).not.toBeInTheDocument();
  });

  it('renders plural text for multiple requests', () => {
    renderWithProviders(<BulkDeclineBnrRequestModal {...defaultProps} requestCount={5} />);

    expect(screen.getByText(/decline enrollment requests\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /decline \(5\)/i })).toBeInTheDocument();
  });

  it('calls declineBnrRequests and displays toast on success', async () => {
    const mockDeclineBnrRequests = jest.fn().mockResolvedValue({});
    const mockClose = jest.fn();
    const mockOnRefresh = jest.fn();

    renderWithProviders(
      <BulkDeclineBnrRequestModal
        {...defaultProps}
        declineBnrRequests={mockDeclineBnrRequests}
        close={mockClose}
        onRefresh={mockOnRefresh}
        requestCount={3}
      />,
    );

    const declineButton = screen.getByRole('button', { name: /decline \(3\)/i });
    fireEvent.click(declineButton);

    await waitFor(() => {
      expect(mockDeclineBnrRequests).toHaveBeenCalledTimes(1);
    });
    // Reason is passed even when empty
    expect(mockDeclineBnrRequests).toHaveBeenCalledWith('');

    await waitFor(() => {
      expect(mockDisplayToastForBulkDecline).toHaveBeenCalledWith(3);
    });

    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it('forwards the user-entered decline reason to declineBnrRequests', async () => {
    const mockDeclineBnrRequests = jest.fn().mockResolvedValue({});

    renderWithProviders(
      <BulkDeclineBnrRequestModal
        {...defaultProps}
        declineBnrRequests={mockDeclineBnrRequests}
        requestCount={2}
      />,
    );

    const reasonInput = screen.getByTestId('bulk-decline-request-reason-input');
    fireEvent.change(reasonInput, { target: { value: 'Budget exhausted' } });
    expect(screen.getByText(/16\/250 characters/i)).toBeInTheDocument();

    const declineButton = screen.getByRole('button', { name: /decline \(2\)/i });
    fireEvent.click(declineButton);

    await waitFor(() => {
      expect(mockDeclineBnrRequests).toHaveBeenCalledWith('Budget exhausted');
    });
  });

  it('displays error alert and still triggers onRefresh when declineBnrRequests fails', async () => {
    const mockDeclineBnrRequests = jest.fn().mockRejectedValue(new Error('API Error'));
    const mockOnRefresh = jest.fn();

    renderWithProviders(
      <BulkDeclineBnrRequestModal
        {...defaultProps}
        declineBnrRequests={mockDeclineBnrRequests}
        onRefresh={mockOnRefresh}
      />,
    );

    const declineButton = screen.getByRole('button', { name: /decline/i });
    fireEvent.click(declineButton);

    await waitFor(() => {
      expect(screen.getByTestId('bulk-decline-request-modal-alert')).toBeInTheDocument();
    });

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/please try again/i)).toBeInTheDocument();
    // Refresh is invoked even on failure so any partially-declined rows are reflected.
    await waitFor(() => {
      expect(mockOnRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('clears error and closes modal when cancel is clicked after error', async () => {
    const mockDeclineBnrRequests = jest.fn().mockRejectedValue(new Error('API Error'));
    const mockClose = jest.fn();

    renderWithProviders(
      <BulkDeclineBnrRequestModal
        {...defaultProps}
        declineBnrRequests={mockDeclineBnrRequests}
        close={mockClose}
      />,
    );

    const declineButton = screen.getByRole('button', { name: /decline/i });
    fireEvent.click(declineButton);

    await waitFor(() => {
      expect(screen.getByTestId('bulk-decline-request-modal-alert')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockClose).toHaveBeenCalled();
  });

  it('displays pending state while declining', () => {
    renderWithProviders(
      <BulkDeclineBnrRequestModal
        {...defaultProps}
        declineButtonState="pending"
      />,
    );

    expect(screen.getByRole('button', { name: /declining/i })).toBeInTheDocument();
  });

  it('displays error button state for retry', () => {
    renderWithProviders(
      <BulkDeclineBnrRequestModal
        {...defaultProps}
        declineButtonState="error"
      />,
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('displays complete button state after success', () => {
    renderWithProviders(
      <BulkDeclineBnrRequestModal
        {...defaultProps}
        declineButtonState="complete"
      />,
    );

    expect(screen.getByRole('button', { name: /declined/i })).toBeInTheDocument();
  });
});
