import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { SubscriptionContext } from './SubscriptionData';

import SubscriptionExpiration from './expiration/SubscriptionExpiration';
import MultipleSubscriptionsPicker from './MultipleSubscriptionPicker';
import {
  DEFAULT_LEAD_TEXT,
} from './data/constants';
import { sortSubscriptionsByStatus } from './data/utils';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';

const MultipleSubscriptionsPage = ({
  match, redirectPage, leadText, createActions,
}) => {
  const { params: { enterpriseSlug } } = match;
  const { data } = useContext(SubscriptionContext);
  const subscriptions = data.results;

  if (subscriptions.length === 0) {
    return null;
  }

  if (subscriptions.length === 1) {
    return (
      <Redirect to={`/${enterpriseSlug}/admin/${redirectPage}/${subscriptions[0].uuid}`} />
    );
  }

  const sortedSubscriptions = sortSubscriptionsByStatus(subscriptions);

  return (
    <>
      <SubscriptionExpiration />
      <MultipleSubscriptionsPicker
        enterpriseSlug={enterpriseSlug}
        leadText={leadText}
        subscriptions={sortedSubscriptions}
        redirectPage={redirectPage}
        createActions={createActions}
      />
    </>
  );
};

MultipleSubscriptionsPage.defaultProps = {
  redirectPage: ROUTE_NAMES.subscriptionManagement,
  leadText: DEFAULT_LEAD_TEXT,
  createActions: null,
};

MultipleSubscriptionsPage.propTypes = {
  redirectPage: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  leadText: PropTypes.string,
  createActions: PropTypes.func,
};

export default MultipleSubscriptionsPage;
