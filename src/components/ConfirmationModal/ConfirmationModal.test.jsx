import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import { axe } from 'jest-axe';
import ConfirmationModal from './index';
import { renderWithI18nProvider } from '../test/testUtils';
import { accessibilitySettings } from '../../../tests/accessibility-settings';

describe('<ConfirmationModal />', () => {
  it('has no accessibility violations', async () => {
    const { container } = renderWithI18nProvider(<ConfirmationModal />);
    const results = await axe(container, accessibilitySettings);
    expect(results).toHaveNoViolations();
  });

  const basicProps = {
    isOpen: true,
    onConfirm: jest.fn(),
    onClose: jest.fn(),
    body: 'Content',
  };

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const mockHandleConfirm = jest.fn();
    renderWithI18nProvider(<ConfirmationModal {...basicProps} onConfirm={mockHandleConfirm} />);
    await user.click(screen.getByText('Confirm'));
    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when modal is closed', async () => {
    const user = userEvent.setup();
    const mockHandleClose = jest.fn();
    renderWithI18nProvider(<ConfirmationModal {...basicProps} onClose={mockHandleClose} />);
    await user.click(screen.getByText('Cancel'));
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  it('should show error alert if confirmButtonState = error', () => {
    renderWithI18nProvider(<ConfirmationModal {...basicProps} confirmButtonState="errored" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
