import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BudgetAssignmentsTable from './BudgetAssignmentsTable';

const BudgetDetailAssignments = ({
  isLoading,
  tableData,
  fetchTableData,
  enterpriseFeatures,
}) => {
  if (!enterpriseFeatures?.topDownAssignmentRealTimeLcm) {
    return null;
  }
  return (
    <section>
      <h3 className="mb-3">Assigned</h3>
      <p className="small mb-4">
        Assigned activity earmarks funds in your budget so you can&apos;t overspend. For funds to move
        from assigned to spent, your learners must complete enrollment.
      </p>
      <BudgetAssignmentsTable
        isLoading={isLoading}
        tableData={tableData}
        fetchTableData={fetchTableData}
      />
    </section>
  );
};

const mapStateToProps = state => ({
  enterpriseFeatures: state.portalConfiguration.enterpriseFeatures,
});

BudgetDetailAssignments.propTypes = {
  enterpriseFeatures: PropTypes.shape({
    topDownAssignmentRealTimeLcm: PropTypes.bool,
  }),
  isLoading: PropTypes.bool.isRequired,
  tableData: PropTypes.shape().isRequired,
  fetchTableData: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(BudgetDetailAssignments);
