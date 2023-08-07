import React, { useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Alert } from '@edx/paragon';

import ContactCustomerSupportButton from '../ContactCustomerSupportButton';

export const NoAvailableCodesBanner = ({ coupons }) => {
  const [showBanner, setShowBanner] = useState(true);

  const dismissBanner = () => {
    setShowBanner(false);
  };

  if (coupons.length === 0) {
    return null;
  }

  const now = dayjs();
  const nonExpiredCoupons = coupons.filter(coupon => dayjs(coupon.endDate) > now);

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

  if (nonExpiredCoupons.length === 0) {
    return renderAlert(
      'All code batches expired',
      'Browsing on-demand has been disabled and all links have been deactivated. Contact support to get new code batches and approve outstanding requests.',
    );
  }

  const hasAvailableCodes = nonExpiredCoupons.some(
    coupon => coupon.numUnassigned > 0,
  );

  if (!hasAvailableCodes) {
    return renderAlert(
      'Not enough codes',
      'You don’t have any codes left. Contact support to get additional codes and approve outstanding requests.',
    );
  }

  return null;
};

NoAvailableCodesBanner.propTypes = {
  coupons: PropTypes.arrayOf(PropTypes.shape({
    endDate: PropTypes.string.isRequired,
    numUnassigned: PropTypes.number.isRequired,
  })).isRequired,
};

export default NoAvailableCodesBanner;
