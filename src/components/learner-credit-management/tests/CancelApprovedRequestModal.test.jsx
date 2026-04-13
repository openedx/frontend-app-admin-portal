import React from 'react';
import {
  fireEvent, render, screen, waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { axe } from 'jest-axe';
import CancelApprovedRequestModal from '../CancelApprovedRequestModal';
import { BudgetDetailPageContext } from '../BudgetDetailPageWrapper';
import { accessibilitySettings } from '../../../../tests/accessibility-settings';

const mockDisplayToastForApprovalCancellation = jest.fn();

const defaultContextValue = {
  successfulCancellationToast: {
    displayToastForApprovalCancellation: mockDisplayToastForApprovalCancellation,
  },
};

const defaultProps = {
  cancelButtonState: 'default',
  cancelApprovedRequest: jest.fn(),
  close: jest.fn(),
  isOpen: true,
  trackEvent: jest.fn(),
};

const renderWithProviders = (ui, { contextValue = defaultContextValue } = {}) => render(
  <IntlProvider locale="en">
    <BudgetDetailPageContext.Provider value={contextValue}>
      {ui}
    </BudgetDetailPageContext.Provider>
  </IntlProvider>,
);

describe('CancelApprovedRequestModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWithProviders(<CancelApprovedRequestModal />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders singular cancel button text by default', () => {
    renderWithProviders(<CancelApprovedRequestModal {...defaultProps} />);

    expect(screen.getByRole('button', { name: /cancel approval/i })).toBeInTheDocument();
  });

  it('renders plural cancel button text when uuidCount is greater than 1', () => {
    renderWithProviders(<CancelApprovedRequestModal {...defaultProps} uuidCount={2} />);

    expect(screen.getByRole('button', { name: /cancel approvals \(2\)/i })).toBeInTheDocument();
  });

  it('calls cancel handler, tracking, and success toast with uuidCount', async () => {
    const cancelApprovedRequest = jest.fn().mockResolvedValue({ status: 200 });
    const trackEvent = jest.fn();

    renderWithProviders(
      <CancelApprovedRequestModal
        {...defaultProps}
        cancelApprovedRequest={cancelApprovedRequest}
        trackEvent={trackEvent}
        uuidCount={3}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel approvals \(3\)/i }));

    await waitFor(() => {
      expect(cancelApprovedRequest).toHaveBeenCalledTimes(1);
    });

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(mockDisplayToastForApprovalCancellation).toHaveBeenCalledWith(3);
  });

  it('tracks event and does not show toast when cancellation fails', async () => {
    const cancelApprovedRequest = jest.fn().mockRejectedValue(new Error('Failed'));
    const trackEvent = jest.fn();

    renderWithProviders(
      <CancelApprovedRequestModal
        {...defaultProps}
        cancelApprovedRequest={cancelApprovedRequest}
        trackEvent={trackEvent}
        uuidCount={2}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel approvals \(2\)/i }));

    await waitFor(() => {
      expect(cancelApprovedRequest).toHaveBeenCalledTimes(1);
    });

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(mockDisplayToastForApprovalCancellation).not.toHaveBeenCalled();
  });

  it('shows pending button label when cancelButtonState is pending', () => {
    renderWithProviders(
      <CancelApprovedRequestModal
        {...defaultProps}
        cancelButtonState="pending"
      />,
    );

    expect(screen.getByRole('button', { name: /canceling/i })).toBeInTheDocument();
  });

  it('shows error button label when cancelButtonState is error', () => {
    renderWithProviders(
      <CancelApprovedRequestModal
        {...defaultProps}
        cancelButtonState="error"
      />,
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows complete button label when cancelButtonState is complete', () => {
    renderWithProviders(
      <CancelApprovedRequestModal
        {...defaultProps}
        cancelButtonState="complete"
      />,
    );

    expect(screen.getByRole('button', { name: /canceled/i })).toBeInTheDocument();
  });
});
