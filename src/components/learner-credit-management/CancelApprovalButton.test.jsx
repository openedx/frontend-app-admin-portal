import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { BudgetDetailPageContext } from './BudgetDetailPageWrapper';
import CancelApprovalButton from './CancelApprovalButton';

// Mock the API service
jest.mock('../../data/services/EnterpriseAccessApiService', () => ({
  cancelApprovedBnrSubsidyRequest: jest.fn(),
}));

// Mock the hooks
jest.mock('./data/hooks/useBudgetId', () => ({
  __esModule: true,
  default: () => ({
    subsidyAccessPolicyId: 'test-policy-id',
  }),
}));

jest.mock('./data/hooks/useSubsidyAccessPolicy', () => ({
  __esModule: true,
  default: () => ({
    data: {
      subsidyUuid: 'test-subsidy-uuid',
      assignmentConfiguration: { uuid: 'test-assignment-config' },
      isSubsidyActive: true,
      isAssignable: true,
      catalogUuid: 'test-catalog-uuid',
      aggregates: {},
    },
  }),
}));

// Mock event tracking
jest.mock('@edx/frontend-enterprise-utils', () => ({
  sendEnterpriseTrackEvent: jest.fn(),
}));

const mockStore = {
  getState: () => ({
    portalConfiguration: {
      enterpriseId: 'test-enterprise-id',
    },
  }),
  dispatch: jest.fn(),
  subscribe: jest.fn(),
};

const mockContextValue = {
  successfulCancellationToast: {
    displayToastForApprovalCancellation: jest.fn(),
  },
};

const renderWithProviders = (component) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <Provider store={mockStore}>
      <QueryClientProvider client={queryClient}>
        <IntlProvider locale="en">
          <BudgetDetailPageContext.Provider value={mockContextValue}>
            {component}
          </BudgetDetailPageContext.Provider>
        </IntlProvider>
      </QueryClientProvider>
    </Provider>,
  );
};

describe('CancelApprovalButton', () => {
  const mockRow = {
    original: {
      uuid: 'test-uuid',
      learnerEmail: 'test@example.com',
      lastActionStatus: 'waiting_for_learner',
      requestStatus: 'approved',
      courseTitle: 'Test Course',
      courseListPrice: '$100',
    },
  };

  const mockRowNotEligible = {
    original: {
      uuid: 'test-uuid',
      learnerEmail: 'test@example.com',
      lastActionStatus: 'redeemed',
      requestStatus: 'approved',
      courseTitle: 'Test Course',
      courseListPrice: '$100',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders cancel button for eligible requests', () => {
    renderWithProviders(<CancelApprovalButton row={mockRow} />);

    const cancelButton = screen.getByTestId('cancel-approval-test-uuid');
    expect(cancelButton).toBeInTheDocument();
  });

  test('does not render cancel button for non-eligible requests', () => {
    renderWithProviders(<CancelApprovalButton row={mockRowNotEligible} />);

    const cancelButton = screen.queryByTestId('cancel-approval-test-uuid');
    expect(cancelButton).not.toBeInTheDocument();
  });

  test('opens modal when cancel button is clicked', () => {
    renderWithProviders(<CancelApprovalButton row={mockRow} />);

    const cancelButton = screen.getByTestId('cancel-approval-test-uuid');
    fireEvent.click(cancelButton);

    expect(screen.getByText('Cancel approval?')).toBeInTheDocument();
  });

  test('shows correct modal content', () => {
    renderWithProviders(<CancelApprovalButton row={mockRow} />);

    const cancelButton = screen.getByTestId('cancel-approval-test-uuid');
    fireEvent.click(cancelButton);

    expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
    expect(screen.getByText(/The learner will be notified/)).toBeInTheDocument();
    expect(screen.getByText('Go back')).toBeInTheDocument();
    expect(screen.getByText('Cancel approval')).toBeInTheDocument();
  });

  test('closes modal when go back button is clicked', () => {
    renderWithProviders(<CancelApprovalButton row={mockRow} />);

    const cancelButton = screen.getByTestId('cancel-approval-test-uuid');
    fireEvent.click(cancelButton);

    const goBackButton = screen.getByText('Go back');
    fireEvent.click(goBackButton);

    expect(screen.queryByText('Cancel approval?')).not.toBeInTheDocument();
  });
});
