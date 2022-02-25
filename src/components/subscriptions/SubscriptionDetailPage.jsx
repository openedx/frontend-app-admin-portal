import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';

import SubscriptionExpirationModals from './expiration/SubscriptionExpirationModals';
import SubscriptionDetails from './SubscriptionDetails';
import LicenseAllocationDetails from './licenses/LicenseAllocationDetails';
import SubscriptionDetailContextProvider from './SubscriptionDetailContextProvider';
import { useSubscriptionFromParams } from './data/contextHooks';

import SubscriptionDetailsSkeleton from './SubscriptionDetailsSkeleton';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';

const SubscriptionDetailPage = ({ match }) => {
  const [subscription, loadingSubscription] = useSubscriptionFromParams({ match });
  if (!subscription && !loadingSubscription) {
    const { params: { enterpriseSlug } } = match;
    return (
      <Redirect to={`/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}`} />
    );
  }

  if (loadingSubscription) {
    return (
      <SubscriptionDetailsSkeleton data-testid="skelly" />
    );
  }
  return (
    <SubscriptionDetailContextProvider subscription={subscription}>
      <SubscriptionExpirationModals />
      <SubscriptionDetails />
      <LicenseAllocationDetails />
    </SubscriptionDetailContextProvider>
  );
};

SubscriptionDetailPage.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      subscriptionUUID: PropTypes.string.isRequired,
      enterpriseSlug: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default SubscriptionDetailPage;
