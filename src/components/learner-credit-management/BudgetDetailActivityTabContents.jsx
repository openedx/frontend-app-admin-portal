import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import LearnerCreditAllocationTable from './LearnerCreditAllocationTable';
import NoBudgetActivityCard from './NoBudgetActivityCard';
import { useOfferRedemptions, isUUID } from './data';

const BudgetDetailActivityTabContents = ({
  isTopDownAssignmentRealTimeLcmEnabled,
  hasPendingAssignments,
  hasCompletedTransactions,
  enterpriseUUID,
  enterpriseSlug,
  enableLearnerPortal,
}) => {
  const { budgetId } = useParams();
  const enterpriseOfferId = isUUID(budgetId) ? null : budgetId;
  const subsidyAccessPolicyId = isUUID(budgetId) ? budgetId : null;
  const {
    isLoading: isLoadingOfferRedemptions,
    offerRedemptions,
    fetchOfferRedemptions,
  } = useOfferRedemptions(enterpriseUUID, enterpriseOfferId, subsidyAccessPolicyId);

  if (!isTopDownAssignmentRealTimeLcmEnabled) {
    return (
      <LearnerCreditAllocationTable
        isLoading={isLoadingOfferRedemptions}
        tableData={offerRedemptions}
        fetchTableData={fetchOfferRedemptions}
        enterpriseUUID={enterpriseUUID}
        enterpriseSlug={enterpriseSlug}
        enableLearnerPortal={enableLearnerPortal}
      />
    );
  }
  if (!hasPendingAssignments && !hasCompletedTransactions) {
    return <NoBudgetActivityCard />;
  }
  if (!hasPendingAssignments && hasCompletedTransactions) {
    return (
      <>
        <NoBudgetActivityCard />
        <LearnerCreditAllocationTable
          isLoading={isLoadingOfferRedemptions}
          tableData={offerRedemptions}
          fetchTableData={fetchOfferRedemptions}
          enterpriseUUID={enterpriseUUID}
          enterpriseSlug={enterpriseSlug}
          enableLearnerPortal={enableLearnerPortal}
        />
      </>
    );
  }

  if (
    (hasPendingAssignments && !hasCompletedTransactions)
    || (hasPendingAssignments && hasCompletedTransactions)
  ) {
    return (
      <>
        <h4>Assignments Table</h4>
        <LearnerCreditAllocationTable
          isLoading={isLoadingOfferRedemptions}
          tableData={offerRedemptions}
          fetchTableData={fetchOfferRedemptions}
          enterpriseUUID={enterpriseUUID}
          enterpriseSlug={enterpriseSlug}
          enableLearnerPortal={enableLearnerPortal}
        />
      </>
    );
  }

  return null;
};

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
});

BudgetDetailActivityTabContents.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
  isTopDownAssignmentRealTimeLcmEnabled: PropTypes.bool.isRequired,
  hasPendingAssignments: PropTypes.bool.isRequired,
  hasCompletedTransactions: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(BudgetDetailActivityTabContents);
