import React from 'react';
import {
  screen,
  render,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom/extend-expect';

import GenericError from '../GenericError';
import { useStatusChip } from '../../data';
import EVENT_NAMES from '../../../../eventTracking';

// Mock the BaseModalPopup component
jest.mock('../../assignments-status-chips/BaseModalPopup', () => {
  const MockBaseModalPopup = ({
    children,
    isOpen,
    onClose,
  }) => {
    if (!isOpen) {
      return null;
    }
    return (
      <div role="dialog" data-testid="modal-popup">
        {children}
        <button type="button" onClick={onClose}>Close</button>
      </div>
    );
  };
  MockBaseModalPopup.Heading = function MockHeading({ children, icon: Icon }) {
    return (
      <div data-testid="modal-heading">
        {Icon && <Icon />}
        {children}
      </div>
    );
  };
  MockBaseModalPopup.Content = function MockContent({ children }) {
    return (
      <div data-testid="modal-content">{children}</div>
    );
  };
  return MockBaseModalPopup;
});

jest.mock('../../data', () => ({
  useStatusChip: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL: 'https://support.example.com',
  })),
}));

const mockTrackEvent = jest.fn();
const mockOpenChipModal = jest.fn();
const mockCloseChipModal = jest.fn();
const mockHelpCenterTrackEvent = jest.fn();

const mockUseStatusChip = {
  openChipModal: mockOpenChipModal,
  closeChipModal: mockCloseChipModal,
  isChipModalOpen: false,
  helpCenterTrackEvent: mockHelpCenterTrackEvent,
};

const GenericErrorWrapper = ({ children }) => (
  <IntlProvider locale="en">
    {children}
  </IntlProvider>
);

describe('<GenericError />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useStatusChip.mockReturnValue(mockUseStatusChip);
  });

  const defaultProps = {
    errorReason: 'Test error reason',
    trackEvent: mockTrackEvent,
    recentAction: null,
  };

  it('renders chip with error reason', () => {
    render(
      <GenericErrorWrapper>
        <GenericError {...defaultProps} />
      </GenericErrorWrapper>,
    );

    expect(screen.getByText('Test error reason')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls useStatusChip with correct event names', () => {
    render(
      <GenericErrorWrapper>
        <GenericError {...defaultProps} />
      </GenericErrorWrapper>,
    );

    expect(useStatusChip).toHaveBeenCalledWith({
      chipInteractionEventName: EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT
        .BUDGET_DETAILS_REQUEST_DATATABLE_CHIP_GENERIC_ERROR,
      chipHelpCenterEventName: EVENT_NAMES.LEARNER_CREDIT_MANAGEMENT
        .BUDGET_DETAILS_REQUEST_DATATABLE_CHIP_GENERIC_ERROR_HELP_CENTER,
      trackEvent: mockTrackEvent,
    });
  });

  it('opens modal when chip is clicked', async () => {
    const user = userEvent.setup();
    render(
      <GenericErrorWrapper>
        <GenericError {...defaultProps} />
      </GenericErrorWrapper>,
    );

    const chip = screen.getByRole('button');
    await user.click(chip);

    expect(mockOpenChipModal).toHaveBeenCalledTimes(1);
  });

  it('opens modal when chip is pressed with keyboard', async () => {
    const user = userEvent.setup();
    render(
      <GenericErrorWrapper>
        <GenericError {...defaultProps} />
      </GenericErrorWrapper>,
    );

    const chip = screen.getByRole('button');
    chip.focus();
    await user.keyboard('{Enter}');

    expect(mockOpenChipModal).toHaveBeenCalledTimes(1);
  });

  describe('modal content', () => {
    beforeEach(() => {
      useStatusChip.mockReturnValue({
        ...mockUseStatusChip,
        isChipModalOpen: true,
      });
    });

    it('displays error reason as modal heading', () => {
      render(
        <GenericErrorWrapper>
          <GenericError {...defaultProps} />
        </GenericErrorWrapper>,
      );

      expect(screen.getByTestId('modal-heading')).toHaveTextContent('Test error reason');
    });

    it('shows generic error message when no recentAction', () => {
      render(
        <GenericErrorWrapper>
          <GenericError {...defaultProps} />
        </GenericErrorWrapper>,
      );

      expect(screen.getByText('Something went wrong behind the scenes.')).toBeInTheDocument();
      expect(screen.queryByText('Your attempt to decline this enrollment request has failed.')).not.toBeInTheDocument();
      expect(screen.queryByText('This enrollment request was not approved.')).not.toBeInTheDocument();
    });

    it('shows decline-specific message when recentAction is Declined', () => {
      const props = {
        ...defaultProps,
        recentAction: 'declined',
      };
      render(
        <GenericErrorWrapper>
          <GenericError {...props} />
        </GenericErrorWrapper>,
      );

      expect(screen.getByText(/Your attempt to decline this enrollment request has failed/)).toBeInTheDocument();
      expect(screen.getByText(/Something went wrong behind the scenes/)).toBeInTheDocument();
    });

    it('shows approve-specific message when recentAction is Approved', () => {
      const props = {
        ...defaultProps,
        recentAction: 'approved',
      };
      render(
        <GenericErrorWrapper>
          <GenericError {...props} />
        </GenericErrorWrapper>,
      );

      expect(screen.getByText(/This enrollment request was not approved/)).toBeInTheDocument();
      expect(screen.getByText(/Something went wrong behind the scenes/)).toBeInTheDocument();
    });

    it('shows correct resolution step for decline action', () => {
      const props = {
        ...defaultProps,
        recentAction: 'declined',
      };
      render(
        <GenericErrorWrapper>
          <GenericError {...props} />
        </GenericErrorWrapper>,
      );

      expect(screen.getByText(/Wait and try to decline this enrollment request again later/)).toBeInTheDocument();
    });

    it('shows correct resolution step for approve action', () => {
      const props = {
        ...defaultProps,
        recentAction: 'approved',
      };
      render(
        <GenericErrorWrapper>
          <GenericError {...props} />
        </GenericErrorWrapper>,
      );

      expect(screen.getByText(/Wait and try to approve this enrollment request again later/)).toBeInTheDocument();
    });

    it('shows generic resolution step when no recentAction', () => {
      render(
        <GenericErrorWrapper>
          <GenericError {...defaultProps} />
        </GenericErrorWrapper>,
      );

      expect(screen.getByText(/Wait and try to approve this enrollment request again later/)).toBeInTheDocument();
    });

    it('displays help center link', () => {
      render(
        <GenericErrorWrapper>
          <GenericError {...defaultProps} />
        </GenericErrorWrapper>,
      );

      const helpCenterLink = screen.getByText('Help Center');
      expect(helpCenterLink).toBeInTheDocument();
      expect(helpCenterLink).toHaveAttribute('href', 'https://support.example.com');
      expect(helpCenterLink).toHaveAttribute('target', '_blank');
    });

    it('calls help center track event when help center link is clicked', async () => {
      const user = userEvent.setup();
      render(
        <GenericErrorWrapper>
          <GenericError {...defaultProps} />
        </GenericErrorWrapper>,
      );

      const helpCenterLink = screen.getByText('Help Center');
      await user.click(helpCenterLink);

      expect(mockHelpCenterTrackEvent).toHaveBeenCalledTimes(1);
    });

    it('displays suggested resolution steps', () => {
      render(
        <GenericErrorWrapper>
          <GenericError {...defaultProps} />
        </GenericErrorWrapper>,
      );

      expect(screen.getByText('Suggested resolution steps')).toBeInTheDocument();
      expect(screen.getByText(/If the issue continues, contact customer support/)).toBeInTheDocument();
      expect(screen.getByText(/Get more troubleshooting help at/)).toBeInTheDocument();
    });

    it('modal is not rendered when isChipModalOpen is false', () => {
      useStatusChip.mockReturnValue({
        ...mockUseStatusChip,
        isChipModalOpen: false,
      });

      render(
        <GenericErrorWrapper>
          <GenericError {...defaultProps} />
        </GenericErrorWrapper>,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('chip properties', () => {
    it('has correct accessibility attributes', () => {
      render(
        <GenericErrorWrapper>
          <GenericError {...defaultProps} />
        </GenericErrorWrapper>,
      );

      const chip = screen.getByRole('button');
      expect(chip).toHaveAttribute('tabIndex', '0');
    });

    it('displays error reason as chip text', () => {
      const customErrorReason = 'Custom error message';
      const props = {
        ...defaultProps,
        errorReason: customErrorReason,
      };

      render(
        <GenericErrorWrapper>
          <GenericError {...props} />
        </GenericErrorWrapper>,
      );

      expect(screen.getByText(customErrorReason)).toBeInTheDocument();
    });
  });

  describe('prop validation', () => {
    it('handles null recentAction', () => {
      const props = {
        ...defaultProps,
        recentAction: null,
      };

      expect(() => {
        render(
          <GenericErrorWrapper>
            <GenericError {...props} />
          </GenericErrorWrapper>,
        );
      }).not.toThrow();
    });

    it('handles undefined recentAction', () => {
      const props = {
        ...defaultProps,
        recentAction: undefined,
      };

      expect(() => {
        render(
          <GenericErrorWrapper>
            <GenericError {...props} />
          </GenericErrorWrapper>,
        );
      }).not.toThrow();
    });
  });
});
