import { screen, waitFor } from '@testing-library/react';
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

  it('should call onConfirm when confirm button is clicked', async () => {
    const mockHandleConfirm = jest.fn();
    renderWithI18nProvider(<ConfirmationModal {...basicProps} onConfirm={mockHandleConfirm} />);
    await waitFor(() => userEvent.click(screen.getByText('Confirm')));
    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when modal is closed', async () => {
    const mockHandleClose = jest.fn();
    renderWithI18nProvider(<ConfirmationModal {...basicProps} onClose={mockHandleClose} />);
    await waitFor(() => userEvent.click(screen.getByText('Cancel')));
    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });

  it('should show error alert if confirmButtonState = error', () => {
    renderWithI18nProvider(<ConfirmationModal {...basicProps} confirmButtonState="errored" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
