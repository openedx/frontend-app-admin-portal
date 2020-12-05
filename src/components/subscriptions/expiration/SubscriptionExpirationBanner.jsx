import React, { useContext } from 'react';
import { MailtoLink } from '@edx/paragon';

import StatusAlert from '../../StatusAlert';
import { SubscriptionDetailContext } from '../SubscriptionDetailData';
import {
  SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
} from '../data/constants';

export default function SubscriptionExpirationBanner() {
  const { details } = useContext(SubscriptionDetailContext);
  const { daysUntilExpiration } = details;

  const renderMessage = () => (
    <>
      Your subscription is {daysUntilExpiration} days from expiration.
      Contact the edX Customer Success team at
      {' '}
      <MailtoLink to="customersuccess@edx.org">customersuccess@edx.org</MailtoLink>
      {' '}
      to extend your contract.
    </>
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
      className="expiration-alert mt-1"
      alertType={alertType}
      message={renderMessage(daysUntilExpiration)}
      dismissible={dismissible}
    />
  );
}
