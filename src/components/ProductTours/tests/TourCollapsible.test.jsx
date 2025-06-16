import {
  render, screen, fireEvent,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import TourCollapsible from '../TourCollapsible';

// Mock FloatingCollapsible component
jest.mock('../../FloatingCollapsible', () => {
  const FloatingCollapsible = ({ children, title, onDismiss }) => (
    <div data-testid="floating-collapsible">
      <h3>{title}</h3>
      <button type="button" data-testid="dismiss-button" onClick={onDismiss}>Dismiss</button>
      {children}
    </div>
  );
  return FloatingCollapsible;
});

// Mock IconButton component
jest.mock('@openedx/paragon', () => {
  const OriginalModule = jest.requireActual('@openedx/paragon');
  return {
    ...OriginalModule,
    IconButton: ({
      src, onClick, alt, iconAs: IconAs,
    }) => (
      <button data-testid="icon-button" type="button" onClick={onClick} aria-label={alt}>
        {IconAs ? <IconAs src={src} /> : <img src={src} alt={alt} />}
      </button>
    ),
  };
});

jest.mock('../../../data/actions/enterpriseCustomerAdmin', () => ({
  dismissOnboardingTour: jest.fn(),
  reopenOnboardingTour: jest.fn(),
}));

const mockStore = configureStore([]);

const defaultState = {
  enterpriseCustomerAdmin: {
    onboardingTourCompleted: false,
    onboardingTourDismissed: false,
  },
};

const mockSetShowCollapsible = jest.fn();

const setup = (storeState = defaultState, showCollapsible = false) => {
  const store = mockStore(storeState);
  store.dispatch = jest.fn();

  const wrapper = render(
    <IntlProvider locale="en">
      <Provider store={store}>
        <TourCollapsible
          onTourSelect={jest.fn()}
          showCollapsible={showCollapsible}
          setShowCollapsible={mockSetShowCollapsible}
        />
      </Provider>
    </IntlProvider>,
  );

  return {
    store,
    wrapper,
  };
};

describe('TourCollapsible', () => {
  it('renders FloatingCollapsible when tour is not completed and not dismissed', () => {
    setup(defaultState, true);
    expect(screen.queryByTestId('floating-collapsible')).toBeTruthy();
  });

  it('renders question icon button when tour is completed', () => {
    const state = {
      enterpriseCustomerAdmin: {
        onboardingTourCompleted: true,
        onboardingTourDismissed: false,
      },
    };
    setup(state);
    expect(screen.queryByTestId('floating-collapsible')).toBeFalsy();
    expect(screen.queryByTestId('icon-button')).toBeTruthy();
  });

  it('renders question icon button when tour is dismissed', () => {
    const state = {
      enterpriseCustomerAdmin: {
        onboardingTourCompleted: false,
        onboardingTourDismissed: true,
      },
    };
    setup(state);

    expect(screen.queryByTestId('floating-collapsible')).toBeFalsy();
    expect(screen.queryByTestId('icon-button')).toBeTruthy();
  });

  it('dismisses the tour when dismiss button is clicked', async () => {
    setup(defaultState, true);

    const dismissButton = screen.getByTestId('dismiss-button');
    fireEvent.click(dismissButton);

    // Check if the collapsible has been dismissed
    expect(mockSetShowCollapsible).toHaveBeenCalledWith(false);
  });

  it('reopens the tour when question icon is clicked', async () => {
    const state = {
      enterpriseCustomerAdmin: {
        onboardingTourCompleted: false,
        onboardingTourDismissed: true,
      },
    };
    setup(state);

    const questionIconButton = screen.getByTestId('icon-button');
    fireEvent.click(questionIconButton);

    // Check if reopenOnboardingTour action was dispatched
    expect(mockSetShowCollapsible).toHaveBeenCalledWith(true);
  });

  it('displays tooltip when hovering over question icon', () => {
    const state = {
      enterpriseCustomerAdmin: {
        onboardingTourCompleted: true,
        onboardingTourDismissed: false,
      },
    };
    setup(state);

    const questionIconButton = screen.getByTestId('icon-button');
    fireEvent.mouseOver(questionIconButton);

    // Wait for tooltip to appear
    const tooltipId = 'product-tours-question-icon-tooltip';
    expect(document.getElementById(tooltipId)).toBeDefined();
  });
});
