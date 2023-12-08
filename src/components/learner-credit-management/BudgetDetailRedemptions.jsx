import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Hyperlink } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform/config';

import LearnerCreditAllocationTable from './LearnerCreditAllocationTable';
import { useBudgetId, useBudgetRedemptions } from './data';

const BudgetDetailRedemptions = ({ enterpriseFeatures, enterpriseUUID }) => {
  const { enterpriseOfferId, subsidyAccessPolicyId } = useBudgetId();
  const {
    isLoading,
    budgetRedemptions,
    fetchBudgetRedemptions,
  } = useBudgetRedemptions(
    enterpriseUUID,
    enterpriseOfferId,
    subsidyAccessPolicyId,
    enterpriseFeatures.topDownAssignmentRealTimeLcm,
  );
  return (
    <section>
      <h3 className="mb-3">Spent</h3>
      <p className="small mb-4">
        Spent activity is driven by completed enrollments.{' '}
        <Hyperlink destination={getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL} target="_blank">
          Learn more
        </Hyperlink>
        {(enterpriseOfferId || (subsidyAccessPolicyId && !enterpriseFeatures.topDownAssignmentRealTimeLcm)) && (
          <>
            Enrollment data is automatically updated every 12 hours.
            Come back later to view more recent enrollments.
          </>
        )}
      </p>
      <LearnerCreditAllocationTable
        isLoading={isLoading}
        tableData={budgetRedemptions}
        fetchTableData={fetchBudgetRedemptions}
      />
    </section>
  );
};

const mapStateToProps = state => ({
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
  enterpriseUUID: state.portalConfiguration.enterpriseId,
});

BudgetDetailRedemptions.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
};

export default connect(mapStateToProps)(BudgetDetailRedemptions);
