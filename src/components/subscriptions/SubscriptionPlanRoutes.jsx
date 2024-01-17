import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';

import MultipleSubscriptionsPage from './MultipleSubscriptionsPage';
import ConnectedSubscriptionDetailPage from './SubscriptionDetailPage';
import { ROUTE_NAMES } from '../EnterpriseApp/data/constants';
import { MANAGE_LEARNERS_TAB } from './data/constants';

const SubscriptionPlanRoutes = ({ enterpriseSlug }) => {
  const multipleSubsCreateActions = (subscription) => {
    const now = dayjs();
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

  const redirectPage = `${ROUTE_NAMES.subscriptionManagement}/${MANAGE_LEARNERS_TAB}`;

  return (
    <Routes>
      <Route
        path="/"
        element={(
          <MultipleSubscriptionsPage
            redirectPage={redirectPage}
            createActions={multipleSubsCreateActions}
          />
        )}
      />
      <Route
        path="/:subscriptionUUID"
        element={<ConnectedSubscriptionDetailPage />}
      />
    </Routes>
  );
};

SubscriptionPlanRoutes.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(SubscriptionPlanRoutes);
