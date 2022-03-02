import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { Container, Tabs, Tab } from '@edx/paragon';
import {
  Switch,
  Route,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import moment from 'moment';

import Hero from '../Hero';
import SubscriptionData from './SubscriptionData';
import MultipleSubscriptionsPage from './MultipleSubscriptionsPage';
import SubscriptionDetailPage from './SubscriptionDetailPage';
import SubscriptionSubsidyRequests from './SubscriptionSubsidyRequests';
import { ROUTE_NAMES } from '../EnterpriseApp/constants';

const PAGE_TITLE = 'Subscription Management';

function SubscriptionManagementPage({ enterpriseId, enterpriseSlug }) {
  const routesByTabKey = {
    requests: `/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/enrollment-requests`,
    default: `/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}`,
  };
  const history = useHistory();
  const requestsTabMatch = useRouteMatch(routesByTabKey.requests);
  const initialTabKey = requestsTabMatch ? 'requests' : 'default';

  const [tabKey, setTabKey] = React.useState(initialTabKey);

  useEffect(() => {
    if (requestsTabMatch) {
      setTabKey('requests');
    } else {
      setTabKey('default');
    }
  }, [requestsTabMatch]);

  const handleTabSelect = (key) => {
    setTabKey(key);
    switch (key) {
      case 'requests': {
        history.push(`/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}/enrollment-requests`);
        break;
      }
      case 'default': {
        // history.push(`/${enterpriseSlug}/admin/${ROUTE_NAMES.subscriptionManagement}`);
        break;
      }
      default:
        break;
    }
  };

  return (
    <SubscriptionData enterpriseId={enterpriseId}>
      <Helmet title={PAGE_TITLE} />
      <Hero title={PAGE_TITLE} />
      <main role="main" className="manage-subscription">
        <Container className="py-3" fluid>
          <Switch>
            <Tabs
              id="controlled-tab-example"
              activeKey={tabKey}
              onSelect={handleTabSelect}
            >
              <Tab eventKey="default" title="Manage Learners" className="pt-4">
                {tabKey === 'default' && (
                  <>
                    <Route
                      path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}`}
                      render={routeProps => (
                        <MultipleSubscriptionsPage
                          {...routeProps}
                          createActions={(subscription) => {
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
                  </>
                )}
              </Tab>
              <Tab eventKey="requests" title="Manage Requests" className="pt-4">
                {tabKey === 'requests' && (
                  <Route
                    path={`/:enterpriseSlug/admin/${ROUTE_NAMES.subscriptionManagement}/enrollment-requests`}
                    component={SubscriptionSubsidyRequests}
                    exact
                  />
                )}
              </Tab>
            </Tabs>
          </Switch>
        </Container>
      </main>
    </SubscriptionData>
  );
}

SubscriptionManagementPage.propTypes = {
  enterpriseId: PropTypes.string.isRequired,
  enterpriseSlug: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  enterpriseId: state.portalConfiguration.enterpriseId,
  enterpriseSlug: state.portalConfiguration.enterpriseSlug,
});

export default connect(mapStateToProps)(SubscriptionManagementPage);
