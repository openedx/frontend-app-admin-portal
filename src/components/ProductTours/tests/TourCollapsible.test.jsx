import React from 'react';
import {
  render, screen, fireEvent, waitFor,
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

const mockStore = configureStore([]);
const defaultState = {
  enterpriseCustomerAdmin: {
    onboardingTourCompleted: false,
    onboardingTourDismissed: false,
  },
};

const setup = (storeState = defaultState) => {
  const store = mockStore(storeState);
  store.dispatch = jest.fn();

  const wrapper = render(
    <IntlProvider locale="en">
      <Provider store={store}>
        <TourCollapsible />
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
    setup();
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

  it('dismisses the tour when dismiss button is clicked', () => {
    const { store } = setup();

    const dismissButton = screen.getByTestId('dismiss-button');
    fireEvent.click(dismissButton);

    // Check if dismissOnboardingTour action was dispatched
    expect(store.dispatch).toHaveBeenCalled();
    expect(screen.queryByTestId('floating-collapsible')).toBeFalsy();
    expect(screen.queryByTestId('icon-button')).toBeTruthy();
  });

  it('reopens the tour when question icon is clicked', async () => {
    const state = {
      enterpriseCustomerAdmin: {
        onboardingTourCompleted: false,
        onboardingTourDismissed: true,
      },
    };
    const { store } = setup(state);

    const questionIconButton = screen.getByTestId('icon-button');
    fireEvent.click(questionIconButton);

    // Check if reopenOnboardingTour action was dispatched
    expect(store.dispatch).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByTestId('floating-collapsible')).toBeTruthy();
      expect(screen.queryByTestId('icon-button')).toBeFalsy();
    });
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
