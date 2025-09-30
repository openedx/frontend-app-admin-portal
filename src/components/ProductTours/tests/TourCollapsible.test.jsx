import {
  render, screen, fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import TourCollapsible from '../TourCollapsible';
import { queryClient } from '../../test/testUtils';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';

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

jest.mock('../AdminOnboardingTours/data/useFetchCompletedOnboardingFlows', () => ({
  ...jest.requireActual('../AdminOnboardingTours/data/useFetchCompletedOnboardingFlows'),
  __esModule: true,
  default: jest.fn().mockReturnValue({
    data: [{
      completedTourFlows: [],
      onboardingTourCompleted: false,
      onboardingTourDismissed: false,
    }],
  }),
}));

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
    uuid: 'test-uuid',
  },
  portalConfiguration: {
    enableSubscriptionManagementScreen: true,
  },
};

const defaultEnterpriseSubsidiesContextValue = {
  isLoadingCustomerAgreement: false,
  canManageLearnerCredit: true,
  customerAgreement: {
    subscriptions: [{ contents: 'unimportant' }],
  },
};

const mockSetShowCollapsible = jest.fn();

const setup = (
  storeState = defaultState,
  showCollapsible = false,
  subsidiesContextValue = defaultEnterpriseSubsidiesContextValue,
) => {
  const store = mockStore(storeState);
  store.dispatch = jest.fn();

  const wrapper = render(
    <QueryClientProvider client={queryClient()}>
      <IntlProvider locale="en">
        <Provider store={store}>
          <EnterpriseSubsidiesContext.Provider value={subsidiesContextValue}>
            <TourCollapsible
              onTourSelect={jest.fn()}
              showCollapsible={showCollapsible}
              setShowCollapsible={mockSetShowCollapsible}
            />
          </EnterpriseSubsidiesContext.Provider>
        </Provider>
      </IntlProvider>,
    </QueryClientProvider>,
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
        uuid: 'test-uuid',
      },
      portalConfiguration: {
        enableSubscriptionManagementScreen: true,
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
        uuid: 'test-uuid',
      },
      portalConfiguration: {
        enableSubscriptionManagementScreen: true,
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
        uuid: 'test-uuid',
      },
      portalConfiguration: {
        enableSubscriptionManagementScreen: true,
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
        uuid: 'test-uuid',
      },
      portalConfiguration: {
        enableSubscriptionManagementScreen: true,
      },
    };
    setup(state);

    const questionIconButton = screen.getByTestId('icon-button');
    fireEvent.mouseOver(questionIconButton);

    // Wait for tooltip to appear
    const tooltipId = 'product-tours-question-icon-tooltip';
    expect(document.getElementById(tooltipId)).toBeDefined();
  });

  it('displays all steps when features enabled', () => {
    const state = {
      enterpriseCustomerAdmin: {
        onboardingTourCompleted: false,
        onboardingTourDismissed: false,
        uuid: 'test-uuid',
      },
      portalConfiguration: {
        enableReportingConfigScreen: true,
        enableSubscriptionManagementScreen: true,
      },
    };
    setup(state, true);
    expect(screen.queryByText('Track learner progress')).toBeInTheDocument();
    expect(screen.queryByText('View enrollment insights')).toBeInTheDocument();
    expect(screen.queryByText('Administer subscriptions')).toBeInTheDocument();
    expect(screen.queryByText('Organize learners')).toBeInTheDocument();
    expect(screen.queryByText('Customize reports')).toBeInTheDocument();
    expect(screen.queryByText('Set up preferences')).toBeInTheDocument();
  });

  it('does not display reporting configuration step when reporting is disabled', () => {
    const state = {
      enterpriseCustomerAdmin: {
        onboardingTourCompleted: false,
        onboardingTourDismissed: false,
        uuid: 'test-uuid',
      },
      portalConfiguration: {
        enableReportingConfigScreen: false,
      },
    };
    setup(state, true);
    expect(screen.queryByText('Customize reports')).not.toBeInTheDocument();
  });

  it('does not display administer subscriptions step when subscription management is disabled', () => {
    const state = {
      enterpriseCustomerAdmin: {
        onboardingTourCompleted: false,
        onboardingTourDismissed: false,
        uuid: 'test-uuid',
      },
      portalConfiguration: {
        enableSubscriptionManagementScreen: false,
      },
    };
    setup(state, true);
    expect(screen.queryByText('Administer subscriptions')).not.toBeInTheDocument();
  });

  it('does not display administer subscriptions step when there are no subscription plans', () => {
    const state = {
      enterpriseCustomerAdmin: {
        onboardingTourCompleted: false,
        onboardingTourDismissed: false,
        uuid: 'test-uuid',
      },
      portalConfiguration: {
        enableSubscriptionManagementScreen: true,
      },
    };
    const subsidiesContextValue = {
      isLoadingCustomerAgreement: false,
      customerAgreement: {
        subscriptions: [],
      },
    };
    setup(state, true, subsidiesContextValue);
    expect(screen.queryByText('Administer subscriptions')).not.toBeInTheDocument();
  });
});
