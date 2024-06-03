import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';

import ConfirmationModal from './index';
import { renderWithI18nProvider } from '../test/testUtils';

describe('<ConfirmationModal />', () => {
  const basicProps = {
    isOpen: true,
    onConfirm: jest.fn(),
    onClose: jest.fn(),
    body: 'Content',
  };

  it('should call onConfirm when confirm button is clicked', () => {
    const mockHandleConfirm = jest.fn();
    renderWithI18nProvider(<ConfirmationModal {...basicProps} onConfirm={mockHandleConfirm} />);
    userEvent.click(screen.getByText('Confirm'));
    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when modal is closed', () => {
    const mockHandleClose = jest.fn();
    renderWithI18nProvider(<ConfirmationModal {...basicProps} onClose={mockHandleClose} />);
    userEvent.click(screen.getByText('Cancel'));
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  it('should show error alert if confirmButtonState = error', () => {
    renderWithI18nProvider(<ConfirmationModal {...basicProps} confirmButtonState="errored" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
