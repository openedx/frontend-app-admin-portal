import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import userEvent from '@testing-library/user-event';
import AdminOnboardingTours from '../AdminOnboardingTours';
import { RESET_TARGETS } from '../constants';

const mockOnAdvance = jest.fn();
const mockOnEnd = jest.fn();
const eventName = 'onboarding-tour-event-name';
const mockUuid = '123-issa-id';

jest.mock('../flows/AdminOnboardingTour', () => jest.fn(() => ([
  {
    target: '#step-1',
    placement: 'right',
    title: 'This is a title',
    body: 'And would you believe it, this is a body!',
    onAdvance: () => mockOnAdvance(eventName),
  },
  {
    target: '#step-2',
    placement: 'bottom',
    body: 'Learning is so fun!',
    onAdvance: () => mockOnAdvance(eventName),
  }, {
    target: '#step-3',
    placement: 'top',
    body: 'Here is a really cool button, or perhaps a table.',
    onAdvance: () => mockOnAdvance(eventName),
  }, {
    target: '#step-4',
    placement: 'top',
    body: 'Upon our conclusion, I wish you an earnest farewell.',
    onEnd: () => mockOnEnd(eventName, mockUuid),
  },
])));

jest.mock('../../CheckpointOverlay', () => jest.fn(() => <div data-testid="checkpoint-overlay" />));

const mockStore = configureStore([]);

describe('AdminOnboardingTours', () => {
  let store;

  const mockedInsights = {
    learner_progress: {
      enterprise_customer_uuid: 'aac56d39-f38d-4510-8ef9-085cab048ea9',
    },
    learner_engagement: {
      enterprise_customer_uuid: 'aac56d39-f38d-4510-8ef9-085cab048ea9',
    },
  };

  const slug = 'Stark Industries';
  const enterpriseAdminUuid = 'test-uuid';

  beforeEach(() => {
    store = mockStore({
      portalConfiguration: {
        enableLearnerPortal: true,
        enterpriseSlug: slug,
        enterpriseFeatures: {
          enterpriseAdminOnboardingEnabled: true,
        },
      },
      dashboardInsights: {
        loading: false,
        insights: mockedInsights,
      },
      enterpriseCustomerAdmin: {
        uuid: enterpriseAdminUuid,
      },
    });
    jest.clearAllMocks();
  });

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    setTarget: jest.fn(),
    targetSelector: '#step-1',
  };

  const renderComponent = (props = {}) => {
    const finalProps = { ...defaultProps, ...props };
    return render(
      <IntlProvider locale="en">
        <Provider store={store}>
          <p id="step-1">Step 1</p>
          <p id="step-2">Step 2</p>
          <p id="step-3">Step 3</p>
          <p id="step-4">Step 4</p>
          <AdminOnboardingTours {...finalProps} />
        </Provider>
      </IntlProvider>,
    );
  };

  it('renders nothing when isOpen is false', async () => {
    renderComponent({ isOpen: false });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders CheckpointOverlay with correct target', () => {
    renderComponent();
    const overlay = screen.getByTestId('checkpoint-overlay');
    expect(overlay).toBeTruthy();
  });

  it('renders Product tour', async () => {
    renderComponent();
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('This is a title')).toBeInTheDocument();
    expect(screen.getByText('And would you believe it, this is a body!')).toBeInTheDocument();
  });

  it('advances the tour', async () => {
    renderComponent();
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    const nextButton = screen.getByRole('button', { name: 'Next' });
    userEvent.click(nextButton);
    await waitFor(() => {
      expect(mockOnAdvance).toHaveBeenCalled();
    });
  });

  it('ends the tour', async () => {
    renderComponent();
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    const nextButton = screen.getByRole('button', { name: 'Next' });
    userEvent.click(nextButton);
    expect(await screen.findByText('Learning is so fun!')).toBeInTheDocument();
    userEvent.click(nextButton);
    expect(await screen.findByText('Here is a really cool button, or perhaps a table.')).toBeInTheDocument();
    userEvent.click(nextButton);
    expect(await screen.findByText('Upon our conclusion, I wish you an earnest farewell.')).toBeInTheDocument();
    const endButton = screen.getByRole('button', { name: 'Keep going' });
    userEvent.click(endButton);

    await waitFor(() => {
      expect(mockOnEnd).toHaveBeenCalled();
    });
  });

  it('resets current step to 0 when targetSelector is in RESET_TARGETS', () => {
    // Render with a non-reset target first
    const { rerender } = renderComponent({ targetSelector: '#step-1' });

    // Verify we start at step 1
    expect(screen.getByText('Step 1')).toBeInTheDocument();

    // Change to a reset target
    rerender(
      <IntlProvider locale="en">
        <Provider store={store}>
          <p id="step-1">Step 1</p>
          <p id="step-2">Step 2</p>
          <AdminOnboardingTours {...defaultProps} targetSelector={RESET_TARGETS[0]} />
        </Provider>
      </IntlProvider>,
    );

    // Verify we're back at step 1 (reset to 0)
    expect(screen.getByText('Step 1')).toBeInTheDocument();
  });
});
