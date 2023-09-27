import React from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import MultipleBudgetsPage from './MultipleBudgetsPage';
import BudgetDetailPage from './BudgetDetailPage';

const LearnerCreditManagementRoutes = ({ baseUrl }) => (
  <>
    <Route
      exact
      path={`${baseUrl}/admin/${ROUTE_NAMES.learnerCredit}`}
      component={MultipleBudgetsPage}
    />

    <Route
      exact
      path={`${baseUrl}/admin/${ROUTE_NAMES.learnerCredit}/:budgetId`}
      component={BudgetDetailPage}
    />
  </>
);

LearnerCreditManagementRoutes.propTypes = {
  baseUrl: PropTypes.string.isRequired,
};

export default LearnerCreditManagementRoutes;
