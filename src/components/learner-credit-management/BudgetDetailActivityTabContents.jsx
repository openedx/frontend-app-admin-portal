import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Stack, Skeleton } from '@edx/paragon';

import BudgetDetailRedemptions from './BudgetDetailRedemptions';
import BudgetDetailAssignments from './BudgetDetailAssignments';
import { useBudgetDetailActivityOverview } from './data';
import NoBudgetActivityEmptyState from './NoBudgetActivityEmptyState';

const BudgetDetailActivityTabContents = ({ enterpriseUUID, enterpriseFeatures }) => {
  const isTopDownAssignmentEnabled = enterpriseFeatures.topDownAssignmentRealTimeLcm;
  const {
    isLoading: isBudgetActivityOverviewLoading,
    data: budgetActivityOverview,
  } = useBudgetDetailActivityOverview({
    enterpriseUUID,
    isTopDownAssignmentEnabled,
  });

  if (isBudgetActivityOverviewLoading || !budgetActivityOverview) {
    return <Skeleton count={2} height={180} />;
  }

  const hasContentAssignments = !!budgetActivityOverview.contentAssignments?.count > 0;
  const hasSpentTransactions = !!budgetActivityOverview.spentTransactions?.count > 0;

  // If there is no activity whatsoever (no assignments, no spent transactions), show the
  // full empty state.
  if (!hasContentAssignments && !hasSpentTransactions) {
    return (
      <NoBudgetActivityEmptyState />
    );
  }

  // Otherwise, render the contents of the "Activity" tab.
  return (
    <Stack gap={5}>
      <BudgetDetailAssignments
        hasContentAssignments={hasContentAssignments}
        hasSpentTransactions={hasSpentTransactions}
      />
      <BudgetDetailRedemptions
        hasContentAssignments={hasContentAssignments}
        hasSpentTransactions={hasSpentTransactions}
      />
    </Stack>
  );
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

BudgetDetailActivityTabContents.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
};

export default connect(mapStateToProps)(BudgetDetailActivityTabContents);
