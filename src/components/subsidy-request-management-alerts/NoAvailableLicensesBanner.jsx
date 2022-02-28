import React, { useContext, useState } from 'react';
import { Alert } from '@edx/paragon';

import { SubscriptionContext } from '../subscriptions/SubscriptionData';
import ContactCustomerSupportButton from '../ContactCustomerSupportButton';

const NoAvailableLicensesBanner = () => {
  const { data } = useContext(SubscriptionContext);

  const [showBanner, setShowBanner] = useState(true);

  const dismissBanner = () => {
    setShowBanner(false);
  };

  const subscriptions = data.results;

  if (!(subscriptions.length > 0)) {
    return null;
  }

  const renderAlert = (heading, body) => (
    <Alert
      variant="danger"
      dismissible
      show={showBanner}
      onClose={dismissBanner}
      actions={[
        <ContactCustomerSupportButton variant="primary" />,
      ]}
    >
      <Alert.Heading>
        {heading}
      </Alert.Heading>
      {body}
    </Alert>
  );

  const allSubscriptionsExpired = subscriptions[0].agreementNetDaysUntilExpiration <= 0;

  if (allSubscriptionsExpired) {
    return renderAlert(
      'All subscriptions ended',
      'Browsing on-demand has been disabled and all links have been deactivated. Contact support to renew your subscription and approve outstanding requests.',
    );
  }

  const allLicensesAssigned = subscriptions.every(subscription => subscription.licenses.unassigned === 0);

  if (allLicensesAssigned) {
    return renderAlert(
      'Not enough licenses',
      'You don’t have any licenses left in your subscriptions. Contact support to get additional licenses and approve outstanding requests.',
    );
  }

  return null;
};

export default NoAvailableLicensesBanner;
