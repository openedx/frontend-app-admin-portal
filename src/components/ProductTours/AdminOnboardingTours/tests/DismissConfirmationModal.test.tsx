import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DismissConfirmationModal from '../DismissConfirmationModal';
import messages from '../messages';

const mockOpenConfirmationModal = jest.fn();
const mockOnConfirm = jest.fn();
const mockStore = configureStore([]);

const renderComponent = (props = {}, storeState = {}) => {
  const defaultProps = {
    openConfirmationModal: mockOpenConfirmationModal,
    onConfirm: mockOnConfirm,
    ...props,
  };

  const defaultState = {
    enterpriseCustomerAdmin: {
      onboardingTourDismissed: false,
      uuid: 'test-uuid',
    },
    ...storeState,
  };

  const store = mockStore(defaultState);

  return render(
    <IntlProvider locale="en" messages={{}}>
      <Provider store={store}>
        <DismissConfirmationModal {...defaultProps} />
      </Provider>
    </IntlProvider>,
  );
};

describe('DismissConfirmationModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the modal with correct title and content when tour is not dismissed', () => {
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

  it('calls onConfirm when submit is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(mockOnConfirm).toHaveBeenCalled();
    expect(mockOpenConfirmationModal).toHaveBeenCalledWith(false);
  });

  it('does not call onConfirm when it is not provided', () => {
    renderComponent({ onConfirm: undefined });

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(mockOnConfirm).not.toHaveBeenCalled();
    expect(mockOpenConfirmationModal).toHaveBeenCalledWith(false);
  });
});
