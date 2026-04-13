import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { axe } from 'jest-axe';
import SystemErrorAlertModal from '../assignment-allocation-status-modals/SystemErrorAlertModal';
import { accessibilitySettings } from '../../../../../tests/accessibility-settings';

const defaultProps = {
  isErrorModalOpen: true,
  closeErrorModal: jest.fn(),
  closeAssignmentModal: jest.fn(),
  retry: jest.fn(),
};

const renderModal = (props = {}) => render(
  <IntlProvider locale="en">
    <SystemErrorAlertModal {...defaultProps} {...props} />
  </IntlProvider>,
);

describe('<SystemErrorAlertModal />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderModal();
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  it('renders with default error message', () => {
    renderModal();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(
      "We're sorry. Something went wrong behind the scenes. Please try again, or reach out to customer support for help.",
    )).toBeInTheDocument();
  });

  it('renders with custom message when provided', () => {
    const customMessage = 'A group with this name already exists. Please enter a unique name to create a new group.';
    renderModal({ message: customMessage });
    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(screen.queryByText(
      "We're sorry. Something went wrong behind the scenes. Please try again, or reach out to customer support for help.",
    )).not.toBeInTheDocument();
  });

  it('calls retry when Try again is clicked', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByText('Try again'));
    expect(defaultProps.retry).toHaveBeenCalledTimes(1);
  });

  it('calls closeErrorModal and closeAssignmentModal when Exit is clicked', async () => {
    const user = userEvent.setup();
    renderModal();
    await user.click(screen.getByText('Exit and discard changes'));
    expect(defaultProps.closeErrorModal).toHaveBeenCalledTimes(1);
    expect(defaultProps.closeAssignmentModal).toHaveBeenCalledTimes(1);
  });
});
