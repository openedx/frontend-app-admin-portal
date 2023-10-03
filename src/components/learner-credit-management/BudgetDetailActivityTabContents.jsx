import React from 'react';
import PropTypes from 'prop-types';
import NoBudgetActivityCard from './NoBudgetActivityCard';
import LearnerCreditAllocationTable from './LearnerCreditAllocationTable';

const BudgetDetailActivityTabContents = ({
  isTopDownAssignmentRealTimeLcmEnabled,
  hasPendingAssignments,
  hasCompletedTransactions,
  isLoadingOfferRedemptions,
  fetchOfferRedemptions,
  offerRedemptions,
  enterpriseUUID,
  enterpriseSlug,
  enableLearnerPortal,
}) => {
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

BudgetDetailActivityTabContents.propTypes = {
  isTopDownAssignmentRealTimeLcmEnabled: PropTypes.bool.isRequired,
  hasPendingAssignments: PropTypes.bool.isRequired,
  hasCompletedTransactions: PropTypes.bool.isRequired,
  isLoadingOfferRedemptions: PropTypes.bool.isRequired,
  offerRedemptions: PropTypes.shape({
    itemCount: PropTypes.number,
    pageCount: PropTypes.number,
    results: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  fetchOfferRedemptions: PropTypes.func.isRequired,
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
};
export default BudgetDetailActivityTabContents;
