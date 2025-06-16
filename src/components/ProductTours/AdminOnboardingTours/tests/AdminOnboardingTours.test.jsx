import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import AdminOnboardingTours from '../AdminOnboardingTours';
import useLearnerProgressTour from '../useLearnerProgressTour';

jest.mock('@edx/frontend-platform/i18n', () => ({
  FormattedMessage: ({ defaultMessage }) => defaultMessage,
  defineMessages: (messages) => messages,
}));

const mockOnAdvance = jest.fn();

const targets = ['#step-1', '#step-2', '#step-3', '#step-4'];

jest.mock('../useLearnerProgressTour', () => jest.fn(() => ([
  {
    target: targets[0],
    placement: 'right',
    title: 'This is a title',
    body: 'And would you believe it, this is a body!',
    onAdvance: mockOnAdvance,
  },
  {
    target: targets[1],
    placement: 'bottom',
    body: 'Learning is so fun!',
    onAdvance: mockOnAdvance,
  }, {
    target: targets[2],
    placement: 'top',
    body: 'Here is a really cool button, or perhaps a table.',
    onAdvance: mockOnAdvance,
  }, {
    target: targets[3],
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
  });

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    setTarget: jest.fn(),
    targetSelector: 'learner-progress-sidebar',
  };

  const renderComponent = (props = {}) => {
    const finalProps = { ...defaultProps, ...props };
    return render(
      <Provider store={store}>
        <p id={targets[0]}>Step 1</p>
        <p id={targets[1]}>Step 2</p>
        <p id={targets[2]}>Step 3</p>
        <p id={targets[3]}>Step 4</p>
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
      enterpriseSlug: slug,
      adminUuid: enterpriseAdminUuid,
    });
  });

  it('renders???', () => {
    renderComponent();
    screen.debug(undefined, 1000000);
  });
});
