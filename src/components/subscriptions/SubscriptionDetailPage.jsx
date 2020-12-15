import React from 'react';
import PropTypes from 'prop-types';
import SubscriptionExpirationBanner from './expiration/SubscriptionExpirationBanner';
import SubscriptionExpirationModal from './expiration/SubscriptionExpirationModal';
import SubscriptionDetails from './SubscriptionDetails';
import LicenseAllocationDetails from './licenses/LicenseAllocationDetails';
import SubscriptionDetailContextProvider from './SubscriptionDetailContextProvider';

const SubscriptionDetailPage = ({ match }) => {
  const { params: { subscriptionUUID } } = match;
  return (
    <SubscriptionDetailContextProvider subscriptionUUID={subscriptionUUID}>
      <SubscriptionExpirationBanner />
      <SubscriptionExpirationModal />
      <SubscriptionDetails />
      <LicenseAllocationDetails />
    </SubscriptionDetailContextProvider>
  );
};

SubscriptionDetailPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      subscriptionUUID: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default SubscriptionDetailPage;
