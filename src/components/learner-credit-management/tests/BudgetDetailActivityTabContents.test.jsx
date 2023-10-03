import React from 'react';
import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import BudgetDetailActivityTabContents from '../BudgetDetailActivityTabContents';
import '@testing-library/jest-dom/extend-expect';

const BudgetDetailActivityTabContentsWrapper = (props) => (
  <IntlProvider locale="en">
    <BudgetDetailActivityTabContents {...props} />
  </IntlProvider>
);

describe('BudgetDetailActivityTabContents', () => {
  const defaultProps = {
    isTopDownAssignmentRealTimeLcmEnabled: true,
    hasPendingAssignments: true,
    hasCompletedTransactions: true,
    isLoadingOfferRedemptions: false,
    offerRedemptions: {
      itemCount: 2,
      pageCount: 1,
      results: [
        { id: 1, name: 'Offer 1' },
        { id: 2, name: 'Offer 2' },
      ],
    },
    fetchOfferRedemptions: jest.fn(),
    enterpriseUUID: '123',
    enterpriseSlug: 'test-enterprise',
    enableLearnerPortal: true,
  };

  it('renders LearnerCreditAllocationTable when isTopDownAssignmentRealTimeLcmEnabled is false', () => {
    render(<BudgetDetailActivityTabContentsWrapper {...defaultProps} isTopDownAssignmentRealTimeLcmEnabled={false} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders NoBudgetActivityCard when hasPendingAssignments and hasCompletedTransactions are false', () => {
    render(<BudgetDetailActivityTabContentsWrapper {...defaultProps} hasPendingAssignments={false} hasCompletedTransactions={false} />);
    expect(screen.getByText('No budget activity yet? Assign a course!')).toBeInTheDocument();
  });

  it('renders NoBudgetActivityCard and LearnerCreditAllocationTable when hasPendingAssignments is false and hasCompletedTransactions is true', () => {
    render(<BudgetDetailActivityTabContentsWrapper {...defaultProps} hasPendingAssignments={false} />);
    expect(screen.getByText('No budget activity yet? Assign a course!')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renders Assignments Table and LearnerCreditAllocationTable when hasPendingAssignments is true', () => {
    render(<BudgetDetailActivityTabContentsWrapper {...defaultProps} />);
    expect(screen.getByText('Assignments Table')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
