import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Container } from '@edx/paragon';

import { Switch, Route } from 'react-router-dom';
import moment from 'moment';
import Hero from '../Hero';
import { MultipleSubscriptionsPage, SubscriptionData } from '../subscriptions';
import CourseSearch from './CourseSearch';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';

function BulkEnrollmentPage({ enterpriseId }) {
  return (
    <div className="container-fluid bulk-enrollment">
      <Hero title="Subscription Enrollment" />
      <SubscriptionData enterpriseId={enterpriseId}>
        <main role="main" className="manage-subscription">
          <Switch>
            <Route
              path={`/:enterpriseSlug/admin/${ROUTE_NAMES.bulkEnrollment}`}
              component={routeProps => (
                <Container className="py-3" fluid>
                  <MultipleSubscriptionsPage
                    {...routeProps}
                    redirectPage={ROUTE_NAMES.bulkEnrollment}
                    useCatalog
                    leadText="Choose a subscription to enroll your learners in courses"
                    createActions={(subscription) => {
                      const { params: { enterpriseSlug } } = routeProps.match;
                      const isExpired = moment().isAfter(subscription.expirationDate);
                      const actions = [];

                      if (!isExpired) {
                        actions.push({
                          variant: 'primary',
                          to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.bulkEnrollment}/${subscription.uuid}`,
                          buttonText: 'Enroll learners',
                        });
                      }

                      return actions;
                    }}
                  />
                </Container>
              )}
              exact
            />
            <Route
              path={`/:enterpriseSlug/admin/${ROUTE_NAMES.bulkEnrollment}/:subscriptionUUID`}
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
