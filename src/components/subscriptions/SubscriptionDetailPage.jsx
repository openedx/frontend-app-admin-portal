import React from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import SubscriptionExpirationModals from './expiration/SubscriptionExpirationModals';
import SubscriptionDetails from './SubscriptionDetails';
import LicenseAllocationDetails from './licenses/LicenseAllocationDetails';
import SubscriptionDetailContextProvider from './SubscriptionDetailContextProvider';
import { useSubscriptionFromParams } from './data/contextHooks';
import SubscriptionDetailsSkeleton from './SubscriptionDetailsSkeleton';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';
import { MANAGE_LEARNERS_TAB } from './data/constants';

export const SubscriptionDetailPage = ({ enterpriseSlug, match }) => {
  const [subscription, loadingSubscription] = useSubscriptionFromParams({ match });

  if (!subscription && !loadingSubscription) {
    return (
      <Redirect
        to={`/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${MANAGE_LEARNERS_TAB}`}
      />
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
    }).isRequired,
  }).isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(SubscriptionDetailPage);
