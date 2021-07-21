import React, { useContext, useState } from 'react';
import { Alert } from '@edx/paragon';
import PropTypes from 'prop-types';

import {
  SUBSCRIPTION_DAYS_REMAINING_MODERATE,
  SUBSCRIPTION_DAYS_REMAINING_SEVERE,
  SUBSCRIPTION_DAYS_REMAINING_EXCEPTIONAL,
} from '../data/constants';
import { SubscriptionDetailContext } from '../SubscriptionDetailContextProvider';
import { formatTimestamp } from '../../../utils';
import ContactCustomerSupportButton from '../buttons/ContactCustomerSupportButton';

const SubscriptionExpirationBanner = ({ isSubscriptionPlanDetails }) => {
  const {
    subscription: { daysUntilExpiration, expirationDate },
  } = useContext(SubscriptionDetailContext);
  const [showBanner, setShowBanner] = useState(true);

  const renderMessage = () => {
    const subscriptionExpired = daysUntilExpiration <= 0;
    // use subscription detail view messaging
    if (isSubscriptionPlanDetails) {
      return (
        <>
          {subscriptionExpired ? (
            <>
              <Alert.Heading>
                This subscription plan&apos;s end date has passed
              </Alert.Heading>
              Administrative actions are no longer available as of the plan end date of
              {formatTimestamp({ timestamp: expirationDate })}. You may still view the
              statuses of your invited learners.
            </>
          ) : (
            <>
              <Alert.Heading>
                This subscription plan&apos;s end date is approaching
              </Alert.Heading>
              Administrative actions will no longer be available following the
              plan end date of {formatTimestamp({ timestamp: expirationDate })}.
            </>
          )}
        </>
      );
    }
    return (
      <>
        {subscriptionExpired ? (
          <>
            <Alert.Heading>
              Your subscription contract has expired
            </Alert.Heading>
            Renew your subscription today to reconnect your learning community.
          </>
        ) : (
          <>
            <Alert.Heading>
              Your subscription contract is expiring soon
            </Alert.Heading>
            Your current subscription contract will expire in {daysUntilExpiration} days.
            Renew your subscription today to minimize access disruption for your learners.
          </>
        )}
      </>
    );
  };

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

  const actions = [];
  if (!isSubscriptionPlanDetails || daysUntilExpiration > SUBSCRIPTION_DAYS_REMAINING_SEVERE) {
    actions.push(<ContactCustomerSupportButton />);
  }

  return (
    <Alert
      className="expiration-alert mt-1"
      variant={alertType}
      dismissible={dismissible}
      show={showBanner}
      onClose={() => setShowBanner(false)}
      actions={actions}
    >
      {renderMessage(daysUntilExpiration)}
    </Alert>
  );
};

SubscriptionExpirationBanner.propTypes = {
  isSubscriptionPlanDetails: PropTypes.bool,
};

SubscriptionExpirationBanner.defaultProps = {
  isSubscriptionPlanDetails: false,
};

export default SubscriptionExpirationBanner;
