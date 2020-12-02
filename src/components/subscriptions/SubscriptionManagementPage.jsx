import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';

import Hero from '../Hero';
import SubscriptionData from './SubscriptionData';
import SubscriptionDetails from './SubscriptionDetails';
import SubscriptionExpirationBanner from './expiration/SubscriptionExpirationBanner';
import SubscriptionExpirationModal from './expiration/SubscriptionExpirationModal';
import LicenseAllocationDetails from './LicenseAllocationDetails';
import MultipleSubscriptionsPage from './MultipleSubscriptionsPage';

const PAGE_TITLE = 'Subscription Management';

function SubscriptionManagementPage({ enterpriseId }) {
  const dummy = false;
  return (
    <React.Fragment>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <SubscriptionData enterpriseId={enterpriseId}>
        <SubscriptionExpirationBanner />
        <SubscriptionExpirationModal />
        <main role="main" className="manage-subscription">
          {dummy && <MultipleSubscriptionsPage />}
          <React.Fragment>
            <SubscriptionDetails />
            <LicenseAllocationDetails />
          </React.Fragment>
        </main>
      </SubscriptionData>
    </React.Fragment>
  );
}

SubscriptionManagementPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SubscriptionManagementPage);
