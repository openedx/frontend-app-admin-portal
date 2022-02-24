import React from 'react';
import {
  render,
  fireEvent,
} from '@testing-library/react';
import DeclineSubsidyRequestModal from '../DeclineSubsidyRequestModal';

describe('<DeclineSubsidyRequestModal />', () => {
  const basicProps = {
    isOpen: true,
    onDecline: jest.fn(),
    onClose: jest.fn(),
    error: undefined,
  };

  it.each([true, false])('should call onDecline', (shouldNotifyLearner) => {
    const mockHandleDecline = jest.fn();
    const { getByTestId } = render(
      <DeclineSubsidyRequestModal {...basicProps} onDecline={mockHandleDecline} />,
    );

    if (shouldNotifyLearner) {
      const checkbox = getByTestId('decline-subsidy-request-modal-notify-learner-checkbox');
      fireEvent.click(checkbox);
    }

    const declineBtn = getByTestId('decline-subsidy-request-modal-decline-btn');
    fireEvent.click(declineBtn);

    expect(mockHandleDecline).toHaveBeenCalledWith(shouldNotifyLearner);
  });

  it('should call onClose', () => {
    const mockHandleClose = jest.fn();
    const { getByTestId } = render(
      <DeclineSubsidyRequestModal {...basicProps} onClose={mockHandleClose} />,
    );

    const closeBtn = getByTestId('decline-subsidy-request-modal-close-btn');
    fireEvent.click(closeBtn);

    expect(mockHandleClose).toHaveBeenCalled();
  });

  it('should render alert if an error occured', () => {
    const { getByTestId } = render(
      <DeclineSubsidyRequestModal {...basicProps} error={new Error('something went wrong')} />,
    );
    expect(getByTestId('decline-subsidy-request-modal-alert'));
  });
});
