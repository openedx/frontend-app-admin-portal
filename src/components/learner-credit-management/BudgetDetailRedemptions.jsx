import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Hyperlink } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { useNavigate, useLocation } from 'react-router-dom';

import LearnerCreditAllocationTable from './LearnerCreditAllocationTable';
import { useBudgetId, useBudgetRedemptions } from './data';

const BudgetDetailRedemptions = ({ enterpriseFeatures, enterpriseUUID }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state: locationState } = location;
  const { enterpriseOfferId, subsidyAccessPolicyId } = useBudgetId();
  const spentHeadingRef = useRef();
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

  useEffect(() => {
    if (locationState?.budgetActivityScrollToKey === 'spent') {
      spentHeadingRef.current?.scrollIntoView({ behavior: 'smooth' });
      const newState = { ...locationState };
      delete newState.budgetActivityScrollToKey;
      navigate(location.pathname, { ...location, state: newState });
    }
  }, [navigate, location, locationState]);

  return (
    <section>
      <h3 className="mb-3" ref={spentHeadingRef}>Spent</h3>
      <p className="small mb-4">
        Spent activity is driven by completed enrollments.{' '}
        {(enterpriseOfferId || (subsidyAccessPolicyId && !enterpriseFeatures.topDownAssignmentRealTimeLcm)) ? (
          <>
            Enrollment data is automatically updated every 12 hours.
            Come back later to view more recent enrollments.
          </>
        ) : (
          <Hyperlink destination={getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL} target="_blank">
            Learn more
          </Hyperlink>
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
