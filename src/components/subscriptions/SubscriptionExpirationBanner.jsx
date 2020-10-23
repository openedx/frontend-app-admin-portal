import React, { useContext } from 'react';
import { MailtoLink } from '@edx/paragon';

import StatusAlert from '../../components/StatusAlert';
import { SubscriptionContext } from './SubscriptionData';
import {
  SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
} from './constants';

export default function SubscriptionExpirationBanner() {
  const { details } = useContext(SubscriptionContext);
  const { daysUntilExpiration } = details;

  const renderMessage = () => (
    <React.Fragment>
      Your subscription is {daysUntilExpiration} days from expiration.
      Contact the edX Customer Success team at
      {' '}
      <MailtoLink to="customersuccess@edx.org">customersuccess@edx.org</MailtoLink>
      {' '}
      to extend your contract.
    </React.Fragment>
  );

  if (daysUntilExpiration > SUBSCRIPTION_DAYS_REMAINING_MODERATE) {
    return null;
  }

  let dismissible = true;
  let alertType = 'info';
  if (daysUntilExpiration <= SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
    alertType = 'warning';
  }
  if (daysUntilExpiration <= SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL) {
    dismissible = false;
    alertType = 'danger';
  }

  return (
    <StatusAlert
      className="mt-1"
      alertType={alertType}
      message={renderMessage(daysUntilExpiration)}
      dismissible={dismissible}
    />
  );
}
