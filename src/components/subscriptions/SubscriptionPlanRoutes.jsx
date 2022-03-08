import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Route } from 'react-router-dom';

import MultipleSubscriptionsPage from './MultipleSubscriptionsPage';
import SubscriptionDetailPage from './SubscriptionDetailPage';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import { MANAGE_LEARNERS_TAB } from './data/constants';

const SubscriptionPlanRoutes = ({ enterpriseSlug }) => {
  const multipleSubsCreateActions = (subscription) => {
    const now = moment();
    const isScheduled = now.isBefore(subscription.startDate);
    const isExpired = now.isAfter(subscription.expirationDate);
    const buttonText = `${isExpired ? 'View' : 'Manage'} learners`;
    const buttonVariant = isExpired ? 'outline-primary' : 'primary';

    const actions = [];

    if (!isScheduled) {
      actions.push({
        variant: buttonVariant,
        to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${MANAGE_LEARNERS_TAB}/${subscription.uuid}`,
        buttonText,
      });
    }

    return actions;
  };

  return (
    <>
      <Route
        path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}/${MANAGE_LEARNERS_TAB}`}
        render={routeProps => (
          <MultipleSubscriptionsPage
            {...routeProps}
            createActions={multipleSubsCreateActions}
          />
        )}
        exact
      />
      <Route
        path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}/${MANAGE_LEARNERS_TAB}/:subscriptionUUID`}
        component={SubscriptionDetailPage}
        exact
      />
    </>
  );
};

SubscriptionPlanRoutes.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

export default SubscriptionPlanRoutes;
