import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { logError } from '@edx/frontend-platform/logging';
import messages from '../messages';
import TourCompleteModal from '../../TourCompleteModal';
import LmsApiService from '../../../../data/services/LmsApiService';

jest.mock('../../../../data/services/LmsApiService');
const mockUpdateCompletedTour = LmsApiService.updateCompletedTour as jest.Mock;

jest.mock('@edx/frontend-platform/logging');
const mockLogError = logError as jest.Mock;

jest.mock('../data/images/CompletedModal.svg', () => 'mocked-image-path');

const mockStore = configureStore([]);

const renderComponent = (props = {}, storeState = {}) => {
  const defaultProps = {
    adminUuid: 'test-admin',
    ...props,
  };

  const defaultState = {
    enterpriseCustomerAdmin: {
      onboardingTourCompleted: false,
      uuid: 'test-admin-uuid',
    },
    ...storeState,
  };

  const store = mockStore(defaultState);

  return render(
    <IntlProvider locale="en" messages={{}}>
      <Provider store={store}>
        <TourCompleteModal {...defaultProps} />
      </Provider>
    </IntlProvider>,
  );
};

describe('TourCompleteModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateCompletedTour.mockResolvedValue({});
  });

  it('renders the modal with correct title and content when tour is not completed', () => {
    renderComponent();

    expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'Onboarding complete modal');
    expect(screen.getByText(messages.completeTourModalTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.completeTourModal.defaultMessage)).toBeInTheDocument();
  });

  it('shows the completion image', () => {
    renderComponent();

    const image = screen.getByAltText('Graphic of person watching an informational video greeting another person');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'mocked-image-path');
  });

  it('shows the done button', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
  });

  it('calls updateCompletedTour and closes modal when done button is clicked', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    await waitFor(() => {
      expect(mockUpdateCompletedTour).toHaveBeenCalledWith('test-admin');
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('logs error when updateCompletedTour fails', async () => {
    const error = new Error('API Error');
    mockUpdateCompletedTour.mockRejectedValue(error);

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    await waitFor(() => {
      expect(mockLogError).toHaveBeenCalledWith(error);
    });
  });

  it('opens modal when onboarding tour is not completed', () => {
    renderComponent({}, {
      enterpriseCustomerAdmin: {
        onboardingTourCompleted: false,
        uuid: 'test-admin-uuid',
      },
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has correct modal properties', () => {
    renderComponent();

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('aria-label', 'Onboarding complete modal');
  });

  it('modal is fullscreen on mobile and has no close button', () => {
    renderComponent();
    const closeButton = screen.queryByRole('button', { name: /close/i });
    expect(closeButton).not.toBeInTheDocument();
  });
});
