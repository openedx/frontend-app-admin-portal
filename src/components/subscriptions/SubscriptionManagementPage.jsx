import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Container } from '@edx/paragon';

import Hero from '../Hero';
import SubscriptionData from './SubscriptionData';
import SubscriptionRoutes from './SubscriptionRoutes';

const PAGE_TITLE = 'Subscription Management';

const SubscriptionManagementPage = ({ enterpriseId }) => (
  <SubscriptionData enterpriseId={enterpriseId}>
    <Helmet title={PAGE_TITLE} />
    <Hero title={PAGE_TITLE} />
    <main role="main" className="manage-subscription">
      <Container className="py-3" fluid>
        <SubscriptionRoutes />
      </Container>
    </main>
  </SubscriptionData>
);

SubscriptionManagementPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(SubscriptionManagementPage);
