import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import BudgetAssignmentsTable from './BudgetAssignmentsTable';
import AssignMoreCoursesEmptyStateMinimal from './AssignMoreCoursesEmptyStateMinimal';
import { useBudgetContentAssignments, useBudgetId, useSubsidyAccessPolicy } from './data';

const BudgetDetailAssignments = ({
  hasContentAssignments,
  hasSpentTransactions,
  enterpriseFeatures,
}) => {
  const { subsidyAccessPolicyId } = useBudgetId();
  const { data: subsidyAccessPolicy } = useSubsidyAccessPolicy(subsidyAccessPolicyId);
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
  });

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
      <h3 className="mb-3">Assigned</h3>
      <p className="small mb-4">
        Assigned activity earmarks funds in your budget so you can&apos;t overspend. For funds to move
        from assigned to spent, your learners must complete enrollment.
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
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

BudgetDetailAssignments.propTypes = {
  hasContentAssignments: PropTypes.bool.isRequired,
  hasSpentTransactions: PropTypes.bool.isRequired,
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }).isRequired,
};

export default connect(mapStateToProps)(BudgetDetailAssignments);
