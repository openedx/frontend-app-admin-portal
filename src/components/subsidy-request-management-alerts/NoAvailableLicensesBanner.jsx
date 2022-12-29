import React, { useState } from 'react';
import { Alert } from '@edx/paragon';
import PropTypes from 'prop-types';

import ContactCustomerSupportButton from '../ContactCustomerSupportButton';

const NoAvailableLicensesBanner = ({ subscriptions }) => {
  const [showBanner, setShowBanner] = useState(true);

  const dismissBanner = () => {
    setShowBanner(false);
  };

  if (subscriptions.length === 0) {
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

  const nonExpiredSubscriptions = subscriptions.filter(subscription => subscription.daysUntilExpiration > 0);

  if (nonExpiredSubscriptions.length === 0) {
    return renderAlert(
      'All subscriptions ended',
      'Browsing on-demand has been disabled and all links have been deactivated. Contact support to renew your subscription and approve outstanding requests.',
    );
  }

  const hasAvailableLicenses = nonExpiredSubscriptions.some(
    subscription => subscription.licenses.unassigned > 0,
  );

  if (!hasAvailableLicenses) {
    return renderAlert(
      'Not enough licenses',
      'You don’t have any licenses left in your subscriptions. Contact support to get additional licenses and approve outstanding requests.',
    );
  }

  return null;
};

NoAvailableLicensesBanner.propTypes = {
  subscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      daysUntilExpiration: PropTypes.number.isRequired,
      licenses: PropTypes.shape({ unassigned: PropTypes.number.isRequired }),
    }),
  ).isRequired,
};

export default NoAvailableLicensesBanner;
