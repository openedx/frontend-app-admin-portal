import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import DismissConfirmationModal from '../DismissConfirmationModal';
import messages from '../messages';
import { ONBOARDING_TOUR_DISMISS_COOKIE_NAME } from '../constants';

const mockOpenConfirmationModal = jest.fn();
const mockOnConfirm = jest.fn();

const renderComponent = (props = {}) => {
  const defaultProps = {
    openConfirmationModal: mockOpenConfirmationModal,
    onConfirm: mockOnConfirm,
    ...props,
  };

  return render(
    <IntlProvider locale="en" messages={{}}>
      <DismissConfirmationModal {...defaultProps} />
    </IntlProvider>,
  );
};

describe('DismissConfirmationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('renders the modal with correct title and content', () => {
    renderComponent();

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Dismiss confirmation modal');
    expect(screen.getByText(messages.dismissConfirmationBody.defaultMessage)).toBeInTheDocument();
  });

  it('shows cancel and submit buttons', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });

  it('calls openConfirmationModal with false when cancel is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(mockOpenConfirmationModal).toHaveBeenCalledWith(false);
  });

  it('calls onConfirm and sets localStorage when submit is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(mockOnConfirm).toHaveBeenCalled();
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      ONBOARDING_TOUR_DISMISS_COOKIE_NAME,
      'true',
    );
    expect(mockOpenConfirmationModal).toHaveBeenCalledWith(false);
  });
});
