import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Stack, Skeleton } from '@edx/paragon';

import BudgetDetailRedemptions from './BudgetDetailRedemptions';
import BudgetDetailAssignments from './BudgetDetailAssignments';
import { useBudgetDetailActivityOverview, useBudgetId, useSubsidyAccessPolicy } from './data';
import NoAssignableBudgetActivity from './empty-state/NoAssignableBudgetActivity';
import NoBnEBudgetActivity from './empty-state/NoBnEBudgetActivity';

const BudgetDetailActivityTabContents = ({ enterpriseUUID, enterpriseFeatures }) => {
  const isTopDownAssignmentEnabled = enterpriseFeatures.topDownAssignmentRealTimeLcm;
  const isEnterpriseGroupsEnabled = enterpriseFeatures.enterpriseGroupsV1;
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const {
    isLoading: isBudgetActivityOverviewLoading,
    isFetching: isBudgetActivityOverviewFetching,
    data: budgetActivityOverview,
  } = useBudgetDetailActivityOverview({
    enterpriseUUID,
    isTopDownAssignmentEnabled,
  });

  // If the budget activity overview data is loading (either the initial request OR any
  // background re-fetching), show a skeleton.
  if (isBudgetActivityOverviewLoading || isBudgetActivityOverviewFetching || !budgetActivityOverview) {
    return (
      <>
        <Skeleton count={2} height={180} />
        <span className="sr-only">loading budget activity overview</span>
      </>
    );
  }

  const hasSpentTransactions = budgetActivityOverview.spentTransactions?.count > 0;
  const hasContentAssignments = budgetActivityOverview.contentAssignments?.count > 0;

  if (!isTopDownAssignmentEnabled || !subsidyAccessPolicy?.isAssignable) {
    return (
      <>
        {!hasSpentTransactions && isEnterpriseGroupsEnabled && (
          <NoBnEBudgetActivity />)}
        <BudgetDetailRedemptions />
      </>
    );
  }

  // If there is no activity whatsoever (no assignments, no spent transactions), show the
  // full empty state.
  if (!hasContentAssignments && !hasSpentTransactions) {
    return <NoAssignableBudgetActivity />;
  }

  // Otherwise, render the contents of the "Activity" tab.
  return (
    <Stack gap={5}>
      <BudgetDetailAssignments
        hasContentAssignments={hasContentAssignments}
        hasSpentTransactions={hasSpentTransactions}
      />
      <BudgetDetailRedemptions />
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
    enterpriseGroupsV1: PropTypes.bool,
  }).isRequired,
};

export default connect(mapStateToProps)(BudgetDetailActivityTabContents);
