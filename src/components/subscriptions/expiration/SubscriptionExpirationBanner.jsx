import React, { useContext, useState } from 'react';
import { MailtoLink, Alert } from '@edx/paragon';

import {
  SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
} from '../data/constants';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';

const SubscriptionExpirationBanner = () => {
  const { subscription: { daysUntilExpiration }, hasMultipleSubscriptions } = useContext(SubscriptionDetailContext);
  const [showBanner, setShowBanner] = useState(true);

  const renderMessage = () => (
    <>
      {hasMultipleSubscriptions && daysUntilExpiration <= 0 ? (
        <>
          This subscription cohort has expired. You may still view the statuses of learners who participated.
        </>
      ) : (
        <>
          Your subscription is {daysUntilExpiration} days from expiration.
          Contact the edX Customer Success team at
          {' '}
          <MailtoLink to="customersuccess@edx.org">customersuccess@edx.org</MailtoLink>
          {' '}
          to extend your contract.
        </>
      )}
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
    <Alert
      className="expiration-alert mt-1"
      variant={alertType}
      dismissible={dismissible}
      show={showBanner}
      onClose={() => setShowBanner(false)}
    >
      {renderMessage(daysUntilExpiration)}
    </Alert>
  );
};

export default SubscriptionExpirationBanner;
