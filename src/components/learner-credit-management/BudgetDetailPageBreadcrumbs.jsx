import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb } from '@edx/paragon';
import { Link } from 'react-router-dom';
import React from 'react';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';

const BudgetDetailPageBreadcrumbs = ({ enterpriseSlug, budgetDisplayName }) => (
  <div className="small">
    <Breadcrumb
      ariaLabel="Learner Credit Management breadcrumb navigation"
      links={[{
        label: 'Budgets',
        to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.learnerCredit}`,
      }]}
      linkAs={Link}
      activeLabel={budgetDisplayName}
    />
  </div>
);

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

BudgetDetailPageBreadcrumbs.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
  budgetDisplayName: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(BudgetDetailPageBreadcrumbs);
