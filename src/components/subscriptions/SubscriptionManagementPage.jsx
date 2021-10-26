import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Route, Switch } from 'react-router-dom';
import {
  Container,
} from '@edx/paragon';

import moment from 'moment';
import Hero from '../Hero';
import SubscriptionData from './SubscriptionData';
import MultipleSubscriptionsPage from './MultipleSubscriptionsPage';
import SubscriptionDetailPage from './SubscriptionDetailPage';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';

const PAGE_TITLE = 'Subscription Management';

function SubscriptionManagementPage({ enterpriseId }) {
  return (
    <SubscriptionData enterpriseId={enterpriseId}>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <main role="main" className="manage-subscription">
        <Container className="py-3" fluid>
          <Switch>
            <Route
              path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}`}
              render={routeProps => (
                <MultipleSubscriptionsPage
                  {...routeProps}
                  createActions={(subscription) => {
                    const { params: { enterpriseSlug } } = routeProps.match;
                    const now = moment();
                    const isScheduled = now.isBefore(subscription.startDate);
                    const isExpired = now.isAfter(subscription.expirationDate);
                    const buttonText = `${isExpired ? 'View' : 'Manage'} learners`;
                    const buttonVariant = isExpired ? 'outline-primary' : 'primary';

                    const actions = [];

                    if (!isScheduled) {
                      actions.push({
                        variant: buttonVariant,
                        to: `/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/${subscription.uuid}`,
                        buttonText,
                      });
                    }

                    return actions;
                  }}
                />
              )}
              exact
            />
            <Route
              path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}/:subscriptionUUID`}
              component={SubscriptionDetailPage}
              exact
            />
          </Switch>
        </Container>
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
