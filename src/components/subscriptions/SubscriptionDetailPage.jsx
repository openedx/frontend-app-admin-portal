import React from 'react';
import PropTypes from 'prop-types';
import SubscriptionExpirationBanner from './expiration/SubscriptionExpirationBanner';
import SubscriptionExpirationModal from './expiration/SubscriptionExpirationModal';
import SubscriptionDetails from './SubscriptionDetails';
import LicenseAllocationDetails from './licenses/LicenseAllocationDetails';
import SubscriptionDetailContextProvider from './SubscriptionDetailContextProvider';
import { useSubscriptionFromParams } from './data/contextHooks';

import { NotFound } from '../NotFoundPage';
import SubscriptionDetailsSkeleton from './SubscriptionDetailsSkeleton';

const SubscriptionDetailPage = ({ match }) => {
  const [subscription, loadingSubscription] = useSubscriptionFromParams({ match });
  if (!subscription && !loadingSubscription) {
    return (
      <NotFound />
    );
  }

  if (loadingSubscription) {
    return (
      <SubscriptionDetailsSkeleton />
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
