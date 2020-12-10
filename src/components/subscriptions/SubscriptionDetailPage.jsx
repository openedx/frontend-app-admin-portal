import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import SubscriptionExpirationBanner from './expiration/SubscriptionExpirationBanner';
import SubscriptionExpirationModal from './expiration/SubscriptionExpirationModal';
import SubscriptionDetails from './SubscriptionDetails';
import LicenseAllocationDetails from './licenses/LicenseAllocationDetails';
import { SubscriptionContext } from './SubscriptionData';
import SubscriptionDetailContextProvider from './SubscriptionDetailContextProvider';
import { NotFound } from '../NotFoundPage';

const SubscriptionDetailPage = ({ match }) => {
  const { params: { subscriptionUUID } } = match;
  const { data: subscriptions } = useContext(SubscriptionContext);
  if (!subscriptions?.count) {
    return (
      <NotFound />
    );
  }
  const hasMultipleSubscriptions = subscriptions.count > 1;
  const subscription = Object.values(subscriptions.results).filter(sub => sub.uuid === subscriptionUUID)[0];
  return (
    <SubscriptionDetailContextProvider
      subscription={subscription}
      hasMultipleSubscriptions={hasMultipleSubscriptions}
    >
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
