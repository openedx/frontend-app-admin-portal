import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import userEvent from '@testing-library/user-event';
import AdminOnboardingTours from '../AdminOnboardingTours';
import useLearnerProgressTour from '../useLearnerProgressTour';

const mockOnAdvance = jest.fn();

jest.mock('../useLearnerProgressTour', () => jest.fn(() => ([
  {
    target: '#step-1',
    placement: 'right',
    title: 'This is a title',
    body: 'And would you believe it, this is a body!',
    onAdvance: mockOnAdvance,
  },
  {
    target: '#step-2',
    placement: 'bottom',
    body: 'Learning is so fun!',
    onAdvance: mockOnAdvance,
  }, {
    target: '#step-3',
    placement: 'top',
    body: 'Here is a really cool button, or perhaps a table.',
    onAdvance: mockOnAdvance,
  }, {
    target: '#step-4',
    placement: 'top',
    body: 'Upon our conclusion, I wish you an earnest farewell.',
    onEnd: mockOnAdvance,
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

  it('renders useLearnerProgressTour hook with correct parameters', () => {
    renderComponent();
    expect(useLearnerProgressTour).toHaveBeenCalledWith({
      enterpriseSlug: slug,
      adminUuid: enterpriseAdminUuid,
      aiButtonVisible: true,
    });
  });

  it('renders Product tour', async () => {
    renderComponent();
    screen.debug(null, Infinity);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('This is a title')).toBeInTheDocument();
    expect(screen.getByText('This is a title')).toBeInTheDocument();
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
});
