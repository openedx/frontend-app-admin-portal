import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Hyperlink } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { useNavigate, useLocation } from 'react-router-dom';

import BudgetAssignmentsTable from './BudgetAssignmentsTable';
import AssignMoreCoursesEmptyStateMinimal from './AssignMoreCoursesEmptyStateMinimal';
import { useBudgetContentAssignments, useBudgetId, useSubsidyAccessPolicy } from './data';

const BudgetDetailAssignments = ({
  hasContentAssignments,
  hasSpentTransactions,
  enterpriseFeatures,
  enterpriseId,
}) => {
  const assignedHeadingRef = useRef();
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
  const navigate = useNavigate();

  const location = useLocation();
  const { state: locationState } = location;
  const isAssignableBudget = !!subsidyAccessPolicy?.isAssignable;
  const assignmentConfigurationUUID = subsidyAccessPolicy?.assignmentConfiguration?.uuid;
  const isTopDownAssignmentEnabled = enterpriseFeatures.topDownAssignmentRealTimeLcm;
  const {
    isLoading,
    contentAssignments,
    fetchContentAssignments,
  } = useBudgetContentAssignments({
    isEnabled: isAssignableBudget && hasContentAssignments,
    assignmentConfigurationUUID,
    enterpriseId,
  });

  useEffect(() => {
    if (locationState?.budgetActivityScrollToKey === 'assigned') {
      assignedHeadingRef.current?.scrollIntoView({ behavior: 'smooth' });
      const newState = { ...locationState };
      delete newState.budgetActivityScrollToKey;
      navigate(location.pathname, { ...location, state: newState, replace: true });
    }
  }, [navigate, location, locationState]);

  if (!isTopDownAssignmentEnabled || !isAssignableBudget) {
    return null;
  }

  if (!hasContentAssignments && hasSpentTransactions) {
    return (
      <AssignMoreCoursesEmptyStateMinimal />
    );
  }

  return (
    <section className="budget-detail-assignments">
      <h3 className="mb-3" ref={assignedHeadingRef}>Assigned</h3>
      <p className="small mb-4">
        Assigned activity earmarks funds in your budget so you can&apos;t overspend. For funds to move
        from assigned to spent, your learners must complete enrollment.{' '}
        <Hyperlink destination={getConfig().ENTERPRISE_SUPPORT_LEARNER_CREDIT_URL} target="_blank">
          Learn more
        </Hyperlink>
      </p>
      <BudgetAssignmentsTable
        isLoading={isLoading}
        tableData={contentAssignments}
        fetchTableData={fetchContentAssignments}
      />
    </section>
  );
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

BudgetDetailAssignments.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  hasContentAssignments: PropTypes.bool.isRequired,
  hasSpentTransactions: PropTypes.bool.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
};

export default connect(mapStateToProps)(BudgetDetailAssignments);
