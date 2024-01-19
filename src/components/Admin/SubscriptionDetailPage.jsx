import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { useParams } from 'react-router-dom';
import SubscriptionExpirationModals from '../subscriptions/expiration/SubscriptionExpirationModals';
import SubscriptionDetails from './SubscriptionDetails';
import LicenseAllocationDetails from './licenses/LicenseAllocationDetails';
import SubscriptionDetailContextProvider from '../subscriptions/SubscriptionDetailContextProvider';
import { useSubscriptionFromParams } from '../subscriptions/data/contextHooks';
import SubscriptionDetailsSkeleton from '../subscriptions/SubscriptionDetailsSkeleton';
import { LPR_SUBSCRIPTION_PAGE_SIZE } from '../subscriptions/data/constants';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const SubscriptionDetailPage = ({ enterpriseSlug }) => {
  const { subscriptionUUID } = useParams();
  const [subscription, loadingSubscription] = useSubscriptionFromParams({ subscriptionUUID });

  if (!subscription && !loadingSubscription) {
    return (
      <div>No subscription available</div>
    );
  }

  if (loadingSubscription) {
    return (
      <SubscriptionDetailsSkeleton data-testid="skelly" />
    );
  }
  return (
    <SubscriptionDetailContextProvider
      key={subscription.uuid}
      subscription={subscription}
      pageSize={LPR_SUBSCRIPTION_PAGE_SIZE}
      lprSubscriptionPage
    >
      <SubscriptionExpirationModals />
      <SubscriptionDetails />
      <LicenseAllocationDetails key={subscription.uuid} subscriptionUUID={subscription.uuid} />
    </SubscriptionDetailContextProvider>
  );
};

SubscriptionDetailPage.propTypes = {
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(SubscriptionDetailPage);
