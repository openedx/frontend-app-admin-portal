import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { SubscriptionContext } from './SubscriptionData';

import SubscriptionExpiration from './expiration/SubscriptionExpiration';
import MultipleSubscriptionsPicker from './MultipleSubscriptionPicker';

const DEFAULT_LEAD_TEXT = 'Invite your learners to access your course catalog and manage your subscription cohorts';

const MultipleSubscriptionsPage = ({
  match, redirectPage, useCatalog, leadText, buttonText,
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

  return (
    <>
      <SubscriptionExpiration />
      <MultipleSubscriptionsPicker
        enterpriseSlug={enterpriseSlug}
        useCatalog={useCatalog}
        leadText={leadText}
        buttonText={buttonText}
        subscriptions={subscriptions}
      />
    </>
  );
};

MultipleSubscriptionsPage.defaultProps = {
  redirectPage: 'subscriptions',
  useCatalog: false,
  leadText: DEFAULT_LEAD_TEXT,
  buttonText: null,
};

MultipleSubscriptionsPage.propTypes = {
  redirectPage: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  useCatalog: PropTypes.bool,
  leadText: PropTypes.string,
  buttonText: PropTypes.string,
};

export default MultipleSubscriptionsPage;
