import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import SubscriptionExpirationBanner from './expiration/SubscriptionExpirationBanner';
import SubscriptionExpirationModal from './expiration/SubscriptionExpirationModal';
import SubscriptionDetails from './SubscriptionDetails';
import LicenseAllocationDetails from './licenses/LicenseAllocationDetails';
import SubscriptionDetailContextProvider from './SubscriptionDetailContextProvider';
import { SubscriptionContext } from './SubscriptionData';
import { NotFound } from '../NotFoundPage';

const SubscriptionDetailPage = ({ match }) => {
  // Use UUID to find matching subscription plan in SubscriptionContext, return 404 if not found
  const { params: { subscriptionUUID } } = match;
  const { data: subscriptions } = useContext(SubscriptionContext);
  const subscription = Object.values(subscriptions.results).filter(sub => sub.uuid === subscriptionUUID)[0];
  if (!subscriptions?.count || !subscription) {
    return (
      <NotFound />
    );
  }
  return (
    <SubscriptionDetailContextProvider subscription={subscription}>
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
