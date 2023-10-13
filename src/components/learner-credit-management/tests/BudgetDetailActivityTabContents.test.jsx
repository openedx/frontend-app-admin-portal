import React from 'react';
import { render, screen } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import thunk from 'redux-thunk';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import BudgetDetailActivityTabContents from '../BudgetDetailActivityTabContents';
import '@testing-library/jest-dom/extend-expect';
import { useOfferRedemptions } from '../data';
import { EnterpriseSubsidiesContext } from '../../EnterpriseSubsidiesContext';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({
    budgetId: '123',
  }),
}));

jest.mock('../data', () => ({
  ...jest.requireActual('../data'),
  isUUID: jest.fn(),
  useOfferRedemptions: jest.fn(),
}));

useOfferRedemptions.mockReturnValue({
  isLoading: false,
  offerRedemptions: {
    itemCount: 0,
    pageCount: 0,
    results: [],
  },
  fetchOfferRedemptions: jest.fn(),
});
const mockStore = configureMockStore([thunk]);

const TestWrapper = ({
  initialState = {
    portalConfiguration: {
      enterpriseId: '1234',
      enterpriseSlug: 'test-enterprise',
      enableLearnerPortal: true,
    },
  },
  enterpriseSubsidiesContextValue = { isLoading: false },
  ...rest
}) => {
  const store = mockStore(initialState);
  return (
    <IntlProvider locale="en">
      <Provider store={store}>
        <EnterpriseSubsidiesContext.Provider value={enterpriseSubsidiesContextValue}>
          {rest.children}
        </EnterpriseSubsidiesContext.Provider>
      </Provider>
    </IntlProvider>
  );
};

const renderWithProviders = (ui, options) => render(ui, { wrapper: TestWrapper, ...options });

describe('BudgetDetailActivityTabContents', () => {
  const defaultProps = {
    isTopDownAssignmentRealTimeLcmEnabled: true,
    hasPendingAssignments: true,
    hasCompletedTransactions: true,
    enterpriseUUID: '123',
    enterpriseSlug: 'test-enterprise',
    enableLearnerPortal: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    useParams.mockReturnValue({
      budgetId: '123',
      activeTabKey: 'activity',
    });
  });

  it('renders LearnerCreditAllocationTable when isTopDownAssignmentRealTimeLcmEnabled is false', () => {
    renderWithProviders(
      <BudgetDetailActivityTabContents
        {...defaultProps}
        isTopDownAssignmentRealTimeLcmEnabled={false}
      />,
    );
    expect(
      screen.getByText(/Spent activity is driven by completed enrollments/),
    ).toBeInTheDocument();
  });

  it('renders NoBudgetActivityCard when hasPendingAssignments and hasCompletedTransactions are false', () => {
    renderWithProviders(
      <BudgetDetailActivityTabContents
        {...defaultProps}
        hasPendingAssignments={false}
        hasCompletedTransactions={false}
      />,
    );
    expect(
      screen.getByText('No budget activity yet? Assign a course!'),
    ).toBeInTheDocument();
  });

  it('renders AssignMoreCoursesCard and LearnerCreditAllocationTable when hasPendingAssignments is false and hasCompletedTransactions is true', () => {
    renderWithProviders(
      <BudgetDetailActivityTabContents
        {...defaultProps}
        hasPendingAssignments={false}
        hasCompletedTransactions={true}
      />,
    );
    expect(
      screen.getByText('Assign more courses to maximize your budget.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders Assignments Table and LearnerCreditAllocationTable when hasPendingAssignments is true', () => {
    renderWithProviders(
      <BudgetDetailActivityTabContents
        {...defaultProps}
        hasPendingAssignments={true}
        hasCompletedTransactions={false}
      />,
    );
    expect(screen.getByText('Assignments Table')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
