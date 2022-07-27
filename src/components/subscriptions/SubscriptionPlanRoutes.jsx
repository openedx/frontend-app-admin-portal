import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Route } from 'react-router-dom';
import { connect } from 'react-redux';

import MultipleSubscriptionsPage from './MultipleSubscriptionsPage';
import SubscriptionDetailPage from './SubscriptionDetailPage';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import { MANAGE_LEARNERS_TAB } from './data/constants';

function SubscriptionPlanRoutes({ enterpriseSlug }) {
  const multipleSubsCreateActions = (subscription) => {
    const now = moment();
    const isScheduled = now.isBefore(subscription.startDate);
    const isExpired = now.isAfter(subscription.expirationDate);
    const buttonText = `${isExpired ? 'View' : 'Manage'} learners`;
    const buttonVariant = isExpired ? 'outline-primary' : 'primary';

    const actions = [];

    if (!isScheduled) {
      const to = `/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${MANAGE_LEARNERS_TAB}/${subscription.uuid}`;
      actions.push({
        variant: buttonVariant,
        to,
        buttonText,
      });
    }

    return actions;
  };

  const baseManageLearnersPath = `/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}/${MANAGE_LEARNERS_TAB}`;
  const redirectPage = `${ROUTE_NAMES.subscriptionManagement}/${MANAGE_LEARNERS_TAB}`;

  return (
    <>
      <Route
        path={baseManageLearnersPath}
        render={routeProps => (
          <MultipleSubscriptionsPage
            {...routeProps}
            redirectPage={redirectPage}
            createActions={multipleSubsCreateActions}
          />
        )}
        exact
      />
      <Route
        path={`${baseManageLearnersPath}/:subscriptionUUID`}
        component={SubscriptionDetailPage}
        exact
      />
    </>
  );
}

SubscriptionPlanRoutes.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(SubscriptionPlanRoutes);
