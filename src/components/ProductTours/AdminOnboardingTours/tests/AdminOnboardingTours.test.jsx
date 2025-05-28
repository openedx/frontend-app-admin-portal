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

jest.mock('../useLearnerProgressTour', () => jest.fn(() => ({
  target: '#learner-progress-sidebar',
  title: { props: { defaultMessage: 'Track Learner Progress' } },
  body: { props: { defaultMessage: 'Track learner activity and progress.' } },
  placement: 'right',
  onAdvance: jest.fn(),
})));

jest.mock('../../CheckpointOverlay', () => jest.fn(() => <div data-testid="checkpoint-overlay" />));

const mockStore = configureStore([]);

describe('AdminOnboardingTours', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      portalConfiguration: {
        enableLearnerPortal: true,
        enterpriseSlug: 'test-enterprise',
        enterpriseFeatures: {
          enterpriseAdminOnboardingEnabled: true,
        },
      },
    });
  });

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    enterpriseSlug: 'test-enterprise',
    targetSelector: 'learner-progress-sidebar',
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
      enterpriseSlug: defaultProps.enterpriseSlug,
    });
  });

  it('passes correct props to ProductTour', () => {
    renderComponent();
    const tourConfig = useLearnerProgressTour();
    expect(tourConfig).toMatchObject({
      target: '#learner-progress-sidebar',
      placement: 'right',
    });
  });
});
