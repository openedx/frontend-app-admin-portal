import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import { SubscriptionContext } from './SubscriptionData';

import SubscriptionExpiration from './expiration/SubscriptionExpiration';
import MultipleSubscriptionsPicker from './MultipleSubscriptionPicker';
import { DEFAULT_LEAD_TEXT, DEFAULT_REDIRECT_PAGE } from './data/constants';

const MultipleSubscriptionsPage = ({
  match, redirectPage, leadText, buttonText,
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
        leadText={leadText}
        buttonText={buttonText}
        subscriptions={subscriptions}
        redirectPage={redirectPage}
      />
    </>
  );
};

MultipleSubscriptionsPage.defaultProps = {
  redirectPage: DEFAULT_REDIRECT_PAGE,
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
  leadText: PropTypes.string,
  buttonText: PropTypes.string,
};

export default MultipleSubscriptionsPage;
