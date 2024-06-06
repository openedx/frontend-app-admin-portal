import React, { useState } from 'react';
import { Alert } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

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
      <FormattedMessage
        id="admin.portal.manage.request.no.available.licenses.banner.all.subscriptions.ended.heading"
        defaultMessage="All subscriptions ended"
        description="Heading for the alert when all subscriptions have ended."
      />,
      <FormattedMessage
        id="admin.portal.manage.request.no.available.licenses.banner.all.subscriptions.ended.body"
        defaultMessage="Browsing on-demand has been disabled and all links have been deactivated. Contact support to renew your subscription and approve outstanding requests."
        description="Body text for the alert when all subscriptions have ended."
      />,
    );
  }

  const hasAvailableLicenses = nonExpiredSubscriptions.some(
    subscription => subscription.licenses.unassigned > 0,
  );

  if (!hasAvailableLicenses) {
    return renderAlert(
      <FormattedMessage
        id="admin.portal.manage.request.no.available.licenses.banner.not.enough.licenses.heading"
        defaultMessage="Not enough licenses"
        description="Heading for the alert when there are not enough licenses left."
      />,
      <FormattedMessage
        id="admin.portal.manage.request.no.available.licenses.banner.not.enough.licenses.body"
        defaultMessage="You do not have any licenses left in your subscriptions. Contact support to get additional licenses and approve outstanding requests."
        description="Body text for the alert when there are not enough licenses left."
      />,
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
