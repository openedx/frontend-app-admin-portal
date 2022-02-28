import React, { useState } from 'react';
import { Alert } from '@edx/paragon';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import moment from 'moment';
import ContactCustomerSupportButton from '../ContactCustomerSupportButton';

export const NoAvailableCodesBanner = ({ couponsData }) => {
  const [showBanner, setShowBanner] = useState(true);

  const dismissBanner = () => {
    setShowBanner(false);
  };

  const coupons = couponsData?.results || [];

  if (!(coupons.length > 0)) {
    return null;
  }

  const now = moment();
  const allCouponsExpired = coupons.every(coupon => moment(coupon.endDate) <= now);

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

  if (allCouponsExpired) {
    return renderAlert(
      'All code batches expired',
      'Browsing on-demand has been disabled and all links have been deactivated. Contact support to get new code batches and approve outstanding requests.',
    );
  }

  const allCodesAssigned = coupons.every(coupon => coupon.numUnassigned === 0);

  if (allCodesAssigned) {
    return renderAlert(
      'Not enough codes',
      'You don’t have any codes left. Contact support to get additional codes and approve outstanding requests.',
    );
  }

  return null;
};

NoAvailableCodesBanner.propTypes = {
  couponsData: PropTypes.shape({
    results: PropTypes.arrayOf(PropTypes.shape({
      endDate: PropTypes.string.isRequired,
      numUnassigned: PropTypes.number.isRequired,
    })),
  }),
};

NoAvailableCodesBanner.defaultProps = {
  couponsData: null,
};

const mapStateToProps = state => ({
  couponsData: camelCaseObject(state.coupons.data),
});

export default connect(mapStateToProps)(NoAvailableCodesBanner);
