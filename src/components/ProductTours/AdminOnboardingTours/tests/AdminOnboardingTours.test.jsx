import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AdminOnboardingTours from '../AdminOnboardingTours';
import useLearnerProgressTour from '../useLearnerProgressTour';
import messages from '../../messages';


jest.mock('@edx/frontend-platform/i18n', () => ({
  FormattedMessage: ({ defaultMessage }) => defaultMessage,
  defineMessages: (messages) => messages,
}));

const mockOnAdvance = jest.fn();

jest.mock('../useLearnerProgressTour', () => jest.fn(() => ([{
    target: '#learner-progress-sidebar',
    placement: 'right',
    title: 'Track Learner Progress',
    body: 'Track learner activity and progress across courses with the Learner Progress Report.',
    onAdvance: mockOnAdvance,
  }, {
    target: '#lpr-overview',
    placement: 'bottom',
    body: 'Get a high-level view of learner enrollments, course completions, and more.',
    onAdvance: mockOnAdvance,
  }, {
    target: '#progress-report',
    placement: 'top',
    body: 'Scroll down for a detailed, twice-daily updated progress report.',
    onAdvance: mockOnAdvance,
  }, {
    target: '#full-progress-report',
    placement: 'top',
    body: 'Access the full Learner Progress Report here.',
    onAdvance: mockOnAdvance,
  }, {
    target: '#filter',
    placement: 'top',
    body: 'Filter results by course, start date, or learner email.',
    onAdvance: mockOnAdvance,
  }, {
    target: '#csv-download',
    placement: 'top',
    body: 'Export the report as a CSV to gain insights and organize data efficiently.',
    onAdvance: mockOnAdvance,
  }, {
    target: '#module-activity',
    placement: 'top',
    body: 'View module-level details for Executive Education courses.',
    onAdvance: mockOnAdvance,
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

  beforeEach(() => {
    store = mockStore({
      portalConfiguration: {
        enableLearnerPortal: true,
        enterpriseSlug: 'test-enterprise',
        enterpriseFeatures: {
          enterpriseAdminOnboardingEnabled: true,
        },
      },
      dashboardInsights: {
        loading: false,
        insights: mockedInsights,
      },
    });
  });

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    enterpriseSlug: 'test-enterprise',
    targetSelector: 'learner-progress-sidebar',
    aiButtonVisible: false,
  };

  const renderComponent = (props = {}) => {
    const finalProps = { ...defaultProps, ...props };
    return render(
      <Provider store={store}>
        <AdminOnboardingTours {...finalProps} />
      </Provider>,
    );
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = renderComponent({ isOpen: false });
    expect(container.firstChild).toBeNull();
  });

  it('renders CheckpointOverlay with correct target', () => {
    renderComponent();
    const overlay = screen.getByTestId('checkpoint-overlay');
    expect(overlay).toBeTruthy();
  });

  it('renders ProductTour with correct configuration', () => {
    renderComponent();
    expect(useLearnerProgressTour).toHaveBeenCalledWith({
      aiButtonVisible: defaultProps.aiButtonVisible,
      enterpriseSlug: defaultProps.enterpriseSlug,
    });
  });
});
