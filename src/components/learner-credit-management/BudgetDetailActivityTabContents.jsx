import React, { useContext } from 'react';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Stack, Skeleton } from '@openedx/paragon';

import BudgetDetailAssignments from './BudgetDetailAssignments';
import BudgetDetailRedemptions from './BudgetDetailRedemptions';
import { BudgetDetailPageContext } from './BudgetDetailPageWrapper';
import { useBudgetDetailActivityOverview, useBudgetId, useSubsidyAccessPolicy } from './data';
import NoAssignableBudgetActivity from './empty-state/NoAssignableBudgetActivity';
import NoBnEBudgetActivity from './empty-state/NoBnEBudgetActivity';

const BudgetDetailActivityTabContents = ({ enterpriseUUID, enterpriseFeatures, appliesToAllContexts }) => {
  const isTopDownAssignmentEnabled = enterpriseFeatures.topDownAssignmentRealTimeLcm;
  const { enterpriseOfferId, subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const isEnterpriseGroupsEnabled = enterpriseFeatures.enterpriseGroupsV1
    && !isEmpty(subsidyAccessPolicy?.groupAssociations);
  const { openInviteModal } = useContext(BudgetDetailPageContext);
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

  // If enterprise groups is turned on, it's learner credit NOT enterprise offers w/ no spend
  const renderBnEActivity = isEnterpriseGroupsEnabled && (enterpriseOfferId == null) && !hasSpentTransactions;

  if (!isTopDownAssignmentEnabled || !subsidyAccessPolicy?.isAssignable) {
    if (isEnterpriseGroupsEnabled) {
      if (appliesToAllContexts) {
        return (
          <BudgetDetailRedemptions />
        );
      }

      return (
        <>
          {renderBnEActivity
            && (
              <NoBnEBudgetActivity
                openInviteModal={openInviteModal}
                isEnterpriseGroupsEnabled={isEnterpriseGroupsEnabled}
              />
            )}
          {hasSpentTransactions && <BudgetDetailRedemptions />}
        </>
      );
    }
    return (
      <>
        {renderBnEActivity && (<NoBnEBudgetActivity openInviteModal={openInviteModal} />)}
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
  appliesToAllContexts: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(BudgetDetailActivityTabContents);
