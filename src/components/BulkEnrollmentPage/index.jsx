import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Container } from '@edx/paragon';

import { Switch, Route } from 'react-router-dom';
import Hero from '../Hero';
import { MultipleSubscriptionsPage, SubscriptionData } from '../subscriptions';
import CourseSearch from './CourseSearch';

function BulkEnrollmentPage({ enterpriseId }) {
  return (
    <div className="container-fluid bulk-enrollment">
      <Hero title="Catalog Management" />
      <SubscriptionData enterpriseId={enterpriseId}>
        <main role="main" className="manage-subscription">
          <Switch>
            <Route
              path="/:enterpriseSlug/admin/catalog_management"
              component={routeProps => (
                <Container className="py-3" fluid>
                  <MultipleSubscriptionsPage
                    {...routeProps}
                    redirectPage="catalog_management"
                    useCatalog
                    leadText="Choose a subscription to enroll your learners in courses"
                    buttonText="Enroll learners"
                  />
                </Container>
              )}
              exact
            />
            <Route
              path="/:enterpriseSlug/admin/catalog_management/:subscriptionUUID"
              component={CourseSearch}
              exact
            />
          </Switch>
        </main>
      </SubscriptionData>
    </div>
  );
}

BulkEnrollmentPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
});

export default connect(mapStateToProps)(BulkEnrollmentPage);
