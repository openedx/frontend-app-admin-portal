import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Route } from 'react-router';

import Hero from '../Hero';
import SubscriptionData from './SubscriptionData';
import MultipleSubscriptionsPage from './MultipleSubscriptionsPage';
import SubscriptionDetailPage from './SubscriptionDetailPage';

const PAGE_TITLE = 'Subscription Management';

function SubscriptionManagementPage({ enterpriseId }) {
  return (
    <SubscriptionData enterpriseId={enterpriseId}>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <main role="main" className="manage-subscription">
        <div className="container-fluid">
          <Route
            key="subscription-list"
            exact
            path="/:enterpriseSlug/admin/subscriptions"
            component={MultipleSubscriptionsPage}
          />
          <Route
            key="subscription-detail"
            exact
            path="/:enterpriseSlug/admin/subscriptions/:subscriptionUUID"
            component={SubscriptionDetailPage}
          />
        </div>
      </main>
    </SubscriptionData>
  );
}

SubscriptionManagementPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SubscriptionManagementPage);
