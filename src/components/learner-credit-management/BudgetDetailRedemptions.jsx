import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LearnerCreditAllocationTable from './LearnerCreditAllocationTable';

const BudgetDetailRedemptions = ({
  isLoading,
  offerRedemptions,
  fetchOfferRedemptions,
  enterpriseUUID,
  enterpriseSlug,
  enableLearnerPortal,
}) => (
  <section>
    <h3 className="mb-3">Spent</h3>
    <p className="small mb-4">
      Spent activity is driven by completed enrollments. Enrollment data is automatically updated every 12 hours.
      Come back later to view more recent enrollments.
    </p>
    <LearnerCreditAllocationTable
      isLoading={isLoading}
      tableData={offerRedemptions}
      fetchTableData={fetchOfferRedemptions}
      enterpriseUUID={enterpriseUUID}
      enterpriseSlug={enterpriseSlug}
      enableLearnerPortal={enableLearnerPortal}
    />
  </section>
);

const mapStateToProps = state => ({
  enterpriseUUID: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enableLearnerPortal: state.portalConfiguration.enableLearnerPortal,
});

BudgetDetailRedemptions.propTypes = {
  enterpriseUUID: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
  enableLearnerPortal: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired,
  offerRedemptions: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({
      userEmail: PropTypes.string,
      courseTitle: PropTypes.string.isRequired,
      courseListPrice: PropTypes.number.isRequired,
      enrollmentDate: PropTypes.string.isRequired,
      courseProductLine: PropTypes.string.isRequired,
    })),
    itemCount: PropTypes.number.isRequired,
    pageCount: PropTypes.number.isRequired,
  }).isRequired,
  fetchOfferRedemptions: PropTypes.func.isRequired,
};

export default connect(mapStateToProps)(BudgetDetailRedemptions);
