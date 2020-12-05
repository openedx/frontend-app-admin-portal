import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Route } from 'react-router';

import Hero from '../Hero';
import SubscriptionDetailData from './SubscriptionDetailData';
import SubscriptionDetails from './SubscriptionDetails';
import SubscriptionExpirationBanner from './expiration/SubscriptionExpirationBanner';
import SubscriptionExpirationModal from './expiration/SubscriptionExpirationModal';
import LicenseAllocationDetails from './licenses/LicenseAllocationDetails';
import MultipleSubscriptionsPage from './MultipleSubscriptionsPage';

const PAGE_TITLE = 'Subscription Management';

function SubscriptionManagementPage({ enterpriseId }) {
  return (
    <>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <main role="main" className="manage-subscription">
        <Route
          key="subscription-list"
          exact
          path="/:enterpriseSlug/admin/subscriptions"
          component={MultipleSubscriptionsPage}
        />
        <Route
          key="subscription-detail"
          exact
          path="/:enterpriseSlug/admin/subscriptions/:uuid"
          render={() => (
            <>
              <SubscriptionDetailData enterpriseId={enterpriseId}>
                <SubscriptionExpirationBanner />
                <SubscriptionExpirationModal />
                <SubscriptionDetails />
                <LicenseAllocationDetails />
              </SubscriptionDetailData>
            </>
          )}
        />
      </main>
    </>
  );
}

SubscriptionManagementPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SubscriptionManagementPage);
