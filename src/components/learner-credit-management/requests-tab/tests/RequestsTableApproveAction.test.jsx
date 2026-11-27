import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import RequestsTableApproveAction from '../RequestsTableApproveAction';
import { BudgetDetailPageContext } from '../../BudgetDetailPageWrapper';
import { queryClient } from '../../../test/testUtils';
import { LEARNER_CREDIT_REQUEST_STATES } from '../../data';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    budgetId: 'test-policy-id',
  }),
}));

const mockStore = configureMockStore([thunk]);

const mockDisplayToastForBulkApproval = jest.fn();

const defaultContextValue = {
  successfulBulkApprovalToast: {
    displayToastForBulkApproval: mockDisplayToastForBulkApproval,
  },
};

const defaultStoreState = {
  portalConfiguration: {
    enterpriseId: 'test-enterprise-id',
  },
};

const createMockRow = (
  uuid,
  state = LEARNER_CREDIT_REQUEST_STATES.requested,
) => ({
  original: {
    uuid,
    learnerRequestState: state,
  },
});

const defaultProps = {
  selectedFlatRows: [createMockRow('request-1'), createMockRow('request-2')],
  isEntireTableSelected: false,
  requestStatusCounts: [
    { learnerRequestState: LEARNER_CREDIT_REQUEST_STATES.requested, count: 5 },
    { learnerRequestState: LEARNER_CREDIT_REQUEST_STATES.accepted, count: 3 },
  ],
};

const renderWithProviders = (
  props = {},
  { storeState = defaultStoreState, contextValue = defaultContextValue } = {},
) => {
  const store = mockStore(storeState);

  return render(
    <MemoryRouter>
      <QueryClientProvider client={queryClient()}>
        <Provider store={store}>
          <IntlProvider locale="en">
            <BudgetDetailPageContext.Provider value={contextValue}>
              <RequestsTableApproveAction {...defaultProps} {...props} />
            </BudgetDetailPageContext.Provider>
          </IntlProvider>
        </Provider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
};

describe('RequestsTableApproveAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders approve button with correct count for selected rows', () => {
    renderWithProviders();

    expect(
      screen.getByRole('button', { name: /approve \(2\)/i }),
    ).toBeInTheDocument();
  });

  it('filters out non-requested rows from count', () => {
    const mixedRows = [
      createMockRow('request-1', LEARNER_CREDIT_REQUEST_STATES.requested),
      createMockRow('request-2', LEARNER_CREDIT_REQUEST_STATES.accepted),
      createMockRow('request-3', LEARNER_CREDIT_REQUEST_STATES.requested),
    ];

    renderWithProviders({ selectedFlatRows: mixedRows });

    // Only 2 rows are in 'requested' state
    expect(
      screen.getByRole('button', { name: /approve \(2\)/i }),
    ).toBeInTheDocument();
  });

  it('disables button when no approvable rows are selected', () => {
    const noApprovableRows = [
      createMockRow('request-1', LEARNER_CREDIT_REQUEST_STATES.accepted),
      createMockRow('request-2', LEARNER_CREDIT_REQUEST_STATES.declined),
    ];

    renderWithProviders({ selectedFlatRows: noApprovableRows });

    expect(
      screen.getByRole('button', { name: /approve \(0\)/i }),
    ).toBeDisabled();
  });

  it('uses requestStatusCounts when entire table is selected', () => {
    renderWithProviders({
      isEntireTableSelected: true,
      requestStatusCounts: [
        {
          learnerRequestState: LEARNER_CREDIT_REQUEST_STATES.requested,
          count: 10,
        },
        {
          learnerRequestState: LEARNER_CREDIT_REQUEST_STATES.accepted,
          count: 5,
        },
      ],
    });

    // Should show count from requestStatusCounts for 'requested' state
    expect(
      screen.getByRole('button', { name: /approve \(10\)/i }),
    ).toBeInTheDocument();
  });

  it('shows 0 when entire table selected but no requested items in counts', () => {
    renderWithProviders({
      isEntireTableSelected: true,
      requestStatusCounts: [
        {
          learnerRequestState: LEARNER_CREDIT_REQUEST_STATES.accepted,
          count: 5,
        },
      ],
    });

    expect(
      screen.getByRole('button', { name: /approve \(0\)/i }),
    ).toBeDisabled();
  });

  it('opens modal when approve button is clicked', () => {
    renderWithProviders();

    const approveButton = screen.getByRole('button', {
      name: /approve \(2\)/i,
    });
    fireEvent.click(approveButton);

    // Modal should be open - check for modal title
    expect(
      screen.getByText(/approve enrollment requests\?/i),
    ).toBeInTheDocument();
  });

  it('renders with empty selectedFlatRows', () => {
    renderWithProviders({ selectedFlatRows: [] });

    expect(
      screen.getByRole('button', { name: /approve \(0\)/i }),
    ).toBeDisabled();
  });

  it('renders with default props when optional props are not provided', () => {
    const store = mockStore(defaultStoreState);

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient()}>
          <Provider store={store}>
            <IntlProvider locale="en">
              <BudgetDetailPageContext.Provider value={defaultContextValue}>
                <RequestsTableApproveAction />
              </BudgetDetailPageContext.Provider>
            </IntlProvider>
          </Provider>
        </QueryClientProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: /approve \(0\)/i }),
    ).toBeDisabled();
  });
});
