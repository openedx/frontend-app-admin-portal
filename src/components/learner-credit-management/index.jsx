import React from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import MultipleBudgetsPage from './MultipleBudgetsPage';
import BudgetDetailPage from './BudgetDetailPage';

const LearnerCreditManagementRoutes = ({ match }) => (
  <>
    <Route
      exact
      path={match.path}
      component={MultipleBudgetsPage}
    />

    <Route
      exact
      path={`${match.path}/:budgetId`}
      component={BudgetDetailPage}
    />
  </>
);

LearnerCreditManagementRoutes.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string.isRequired,
  }).isRequired,
};

export default LearnerCreditManagementRoutes;
